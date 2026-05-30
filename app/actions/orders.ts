'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

interface OrderItemPayload {
  product_id: string;
  quantity: number;
}

/**
 * Helper to build Supabase Client in Server Actions
 */
async function getSupabaseClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Handled server component write limitation gracefully
        }
      },
    },
  });
}

/**
 * Place Order Server Action
 * Links directly to PL/pgSQL transaction and triggers
 */
export async function createOrderAction(prevState: any, formData: FormData) {
  const customerId = formData.get('customerId') as string;
  const shippingCity = formData.get('shippingCity') as string;
  const shippingLatRaw = formData.get('shippingLat') as string;
  const shippingLngRaw = formData.get('shippingLng') as string;
  const itemsRaw = formData.get('items') as string; // JSON Stringified array [{product_id, quantity}]
  const shippingPhone = formData.get('shippingPhone') as string;

  if (!shippingCity || !shippingLatRaw || !shippingLngRaw || !itemsRaw) {
    return { error: 'Please enter a complete shipping address.' };
  }

  const shippingLat = parseFloat(shippingLatRaw);
  const shippingLng = parseFloat(shippingLngRaw);
  let itemsList: OrderItemPayload[] = [];

  try {
    itemsList = JSON.parse(itemsRaw);
  } catch (err) {
    return { error: 'Invalid cart data.' };
  }

  if (itemsList.length === 0) {
    return { error: 'Your shopping cart is empty.' };
  }

  const supabase = await getSupabaseClient();

  // Insert order record. This synchronous SQL execution triggers 'optimize_order_warehouse_and_stock'
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId || '00000000-0000-0000-0000-000000000000', // Supports guest or authenticated
      shipping_city: shippingCity,
      shipping_lat: shippingLat,
      shipping_lng: shippingLng,
      items: itemsList,
      shipping_phone: shippingPhone || null,
      status: 'pending'
    })
    .select('id, warehouse_id')
    .single();

  if (error) {
    console.error('Order creation failed on PostgreSQL level:', error);

    // Capture custom SQLSTATE exception identifiers raised by our PL/pgSQL database trigger
    if (error.message.includes('ERR_STOCK_UNAVAILABLE')) {
      return { 
        errorCode: 'STOCK_UNAVAILABLE',
        error: 'One or more items in your cart are currently sold out or have insufficient warehouse stock.' 
      };
    }
    
    if (error.message.includes('ERR_STOCK_SPLIT_REQUIRED')) {
      return { 
        errorCode: 'STOCK_SPLIT',
        error: 'The stock for your items is available, but split across different warehouses in Riyadh and Dubai. Please separate your orders.' 
      };
    }

    return { error: `Checkout Error: ${error.message}` };
  }

  return { 
    success: true, 
    orderId: order.id, 
    warehouseId: order.warehouse_id 
  };
}

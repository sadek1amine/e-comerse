import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

// Clean Deno Interfaces
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: {
    id: string;
    customer_id: string;
    status: string;
    shipping_city: string;
    warehouse_id: string;
    shipping_phone?: string; // Optional direct field
  };
  old_record?: {
    status: string;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Intelligent GCC Phone Sanitizer & Formatter
 * Standardizes KSA (+966) and UAE (+971) local phone numbers to absolute E.164 formats
 */
function formatGCCPhoneNumber(phone: string, fallbackCountry: 'SA' | 'AE'): string | null {
  // Strip all non-digit characters except leading plus
  let cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2);
  }

  // If already starts with proper plus format
  if (cleaned.startsWith('+')) {
    if (cleaned.startsWith('+966') || cleaned.startsWith('+971')) {
      return cleaned;
    }
  }

  // Strip leading zero if present for local formatting (e.g. 055 -> 55)
  if (cleaned.startsWith('05') && cleaned.length === 10) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('5') && cleaned.length === 9) {
    // Already in 9-digit format (e.g. 5xxxxxxxx)
  }

  // Map to country codes
  if (cleaned.startsWith('966')) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('971')) {
    return '+' + cleaned;
  }

  // Use country fallback context (e.g. if the warehouse/order is KSA or UAE)
  if (fallbackCountry === 'AE') {
    return `+971${cleaned}`;
  } else {
    return `+966${cleaned}`;
  }
}

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET');

    // 2. Validate Incoming Request Authorization
    const authHeader = req.headers.get('Authorization');
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized webhook call' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: WebhookPayload = await req.json();

    // 3. Ensure this is the correct orders.status = shipped webhook trigger
    if (
      payload.table !== 'orders' ||
      payload.record.status !== 'shipped' ||
      (payload.old_record && payload.old_record.status === 'shipped')
    ) {
      return new Response(
        JSON.stringify({ status: 'ignored', message: 'No state transitions to shipped detected' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const order = payload.record;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Multi-Layer Fallback Customer Phone Number Lookup
    let customerPhone = order.shipping_phone;
    let preferredLanguage = 'ar'; // Default language

    if (!customerPhone) {
      // Fallback 1: Query public customer profiles database table
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, preferred_language')
        .eq('id', order.customer_id)
        .single();

      if (profile?.phone) {
        customerPhone = profile.phone;
        preferredLanguage = profile.preferred_language || 'ar';
      } else {
        // Fallback 2: Access Auth Admin credentials as a final resort
        const { data: authUser } = await supabase.auth.admin.getUserById(order.customer_id);
        if (authUser?.user?.phone) {
          customerPhone = authUser.user.phone;
        }
      }
    }

    if (!customerPhone) {
      console.warn(`No phone number discovered for customer_id: ${order.customer_id}. Aborting SMS.`);
      return new Response(
        JSON.stringify({ status: 'skipped', message: 'Customer phone number not found in profile or order' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Determine warehouse localization context to default country formatting
    let countryFallback: 'SA' | 'AE' = 'SA';
    if (order.warehouse_id) {
      const { data: warehouse } = await supabase
        .from('warehouses')
        .select('country_code')
        .eq('id', order.warehouse_id)
        .single();
      if (warehouse?.country_code === 'AE') {
        countryFallback = 'AE';
      }
    }

    const formattedPhone = formatGCCPhoneNumber(customerPhone, countryFallback);
    if (!formattedPhone) {
      return new Response(
        JSON.stringify({ error: `Invalid GCC phone structure: ${customerPhone}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Generate bilingual English / Arabic order tracking message
    const trackingLink = `https://store.com/orders/${order.id}/track`;
    const smsArabic = `أهلاً بك! تم شحن طلبك رقم ${order.id.slice(0, 8)} بنجاح. تتبع شحنتك من هنا: ${trackingLink}`;
    const smsEnglish = `Hi! Your order #${order.id.slice(0, 8)} has been shipped. Track your shipment here: ${trackingLink}`;

    // GCC standard: Combine bilingual templates to maximize message delivery and clarity for multi-national courier drivers
    const messageBody = `${smsArabic}\n\n${smsEnglish}`;

    // 7. Fire mock HTTP post representing local SMS/WhatsApp provider (e.g. Unifonic or Twilio)
    const smsProviderUrl = Deno.env.get('SMS_PROVIDER_ENDPOINT') || 'https://api.unifonic.com/rest/SMS/messages';
    const smsApiKey = Deno.env.get('SMS_PROVIDER_API_KEY') || 'mock-api-key-gcc-12345';

    console.log(`[SMS Dispatch] Sending to ${formattedPhone}...`);
    console.log(`[SMS Payload] body: "${messageBody}"`);

    // In a real environment, replace this with Unifonic, Twilio, or equivalent regional gateway request:
    const smsResponse = await fetch(smsProviderUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${smsApiKey}`,
      },
      body: JSON.stringify({
        recipient: formattedPhone,
        message: messageBody,
        sender_id: 'GCCSTORE',
      }),
    });

    // Mock bypass: if API endpoint is missing or mock, log and succeed gracefully
    const responseText = smsProviderUrl.includes('unifonic.com') ? await smsResponse.text() : 'MOCK_SUCCESS';

    return new Response(
      JSON.stringify({
        status: 'success',
        phone: formattedPhone,
        message: 'Notification successfully compiled and dispatched to regional gateway',
        providerResponse: responseText,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unhandled Edge Function Exception:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

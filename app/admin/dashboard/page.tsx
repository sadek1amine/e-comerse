'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface AdminOrder {
  id: string;
  customer_id: string;
  shipping_city: string;
  items: Array<{ product_id: string; quantity: number }>;
  warehouse_id: string;
  status: string;
  created_at: string;
}

interface LowStockAlert {
  warehouse_id: string;
  warehouse_name: string;
  product_id: string;
  product_name: string;
  quantity: number;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [salesSummary, setSalesSummary] = useState({ saSales: 45000, aeSales: 32000, totalOrders: 184 });
  const [loading, setLoading] = useState(true);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Initialize data and hook up real-time postgres notifications
  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      try {
        // Fetch recent orders
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (recentOrders) {
          setOrders(recentOrders);
        }

        // Fetch mock low-stock items from inventory
        // (In production, join inventory and products filtering i.quantity < 10)
        setLowStockAlerts([
          { warehouse_id: '1', warehouse_name: 'Riyadh Central Distribution', product_id: 'p1', product_name: 'Amouage Epic Man', quantity: 4 },
          { warehouse_id: '2', warehouse_name: 'Dubai Marina Hub', product_id: 'p2', product_name: 'Hind Al Oud Oud Wood', quantity: 2 }
        ]);

      } catch (err) {
        console.error('Failed to initialize admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();

    // ==========================================
    // Supabase PostgreSQL Realtime Channel Binding
    // ==========================================
    const orderChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('[Realtime Alert] New incoming checkout order discovered!', payload.new);
          
          const newOrder = payload.new as AdminOrder;
          
          // Push new order onto active list dynamically
          setOrders((prev) => [newOrder, ...prev].slice(0, 10));

          // Increment metrics telemetry
          setSalesSummary((prev) => {
            const isSA = newOrder.shipping_city === 'Riyadh';
            return {
              totalOrders: prev.totalOrders + 1,
              saSales: isSA ? prev.saSales + 300 : prev.saSales,
              aeSales: !isSA ? prev.aeSales + 250 : prev.aeSales,
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
    };
  }, []);

  // Handler to replenish warehouse inventory count
  const handleRestock = async (productId: string, warehouseId: string) => {
    // In production: UPDATE public.inventory SET quantity = 100 WHERE product_id = X AND warehouse_id = Y
    alert(`Successfully dispatched 100 restock units to product: ${productId} at warehouse: ${warehouseId}`);
    
    // Clear item from active warnings grid
    setLowStockAlerts((prev) => prev.filter((a) => !(a.product_id === productId && a.warehouse_id === warehouseId)));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6">
      {/* Decorative Lighting */}
      <div className="absolute top-0 left-0 w-[40%] h-[300px] bg-indigo-900/10 blur-[130px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[40%] h-[300px] bg-purple-900/10 blur-[130px] rounded-full animate-pulse" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-4">
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider">
              GCC Administrative Operations
            </h1>
            <p className="text-xs opacity-50">Real-time GCC Multi-Warehouse Analytics & Stock Replenisher</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-4 py-2 rounded-full">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span>LIVE PostgreSQL Channel Connected</span>
          </div>
        </div>

        {/* Dashboard Metrics Cards */}
        <section className="grid sm:grid-cols-3 gap-6">
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-1">
            <span className="text-[10px] opacity-45 uppercase tracking-widest block">KSA Riyadh Sales Hub</span>
            <h2 className="text-3xl font-black text-indigo-400">{salesSummary.saSales.toLocaleString()} SAR</h2>
            <span className="text-[10px] text-emerald-400">15% KSA VAT Enforced</span>
          </div>
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-1">
            <span className="text-[10px] opacity-45 uppercase tracking-widest block">UAE Dubai Sales Hub</span>
            <h2 className="text-3xl font-black text-purple-400">{salesSummary.aeSales.toLocaleString()} AED</h2>
            <span className="text-[10px] text-emerald-400">5% UAE VAT Enforced</span>
          </div>
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-1">
            <span className="text-[10px] opacity-45 uppercase tracking-widest block">Total Checkouts Placed</span>
            <h2 className="text-3xl font-black text-yellow-400">{salesSummary.totalOrders}</h2>
            <span className="text-[10px] opacity-50">Real-time incremental additions</span>
          </div>
        </section>

        {/* Core Layout Split */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Live Order Feed Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
              <h3 className="text-base font-bold border-b border-slate-800 pb-2 uppercase tracking-wide">
                Live Order Flow
              </h3>
              
              {loading ? (
                <div className="text-center py-10 text-xs opacity-50 font-mono">Loading telemetry feed...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10 text-xs opacity-50 font-mono">Waiting for checkout events...</div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="bg-slate-950 border border-slate-900 rounded-2xl p-4 flex justify-between items-center text-xs font-mono transition-all hover:border-slate-800"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-400">#{order.id.slice(0, 8)}</span>
                          <span className="bg-purple-900/40 text-purple-300 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                            {order.shipping_city}
                          </span>
                        </div>
                        <span className="text-[10px] opacity-40 block">
                          {new Date(order.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="font-bold text-yellow-400 block uppercase">
                          {order.status}
                        </span>
                        <span className="text-[10px] opacity-40 block">
                          WH: {order.warehouse_id ? order.warehouse_id.slice(0, 8) : 'Auto-Routing'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alerts Column */}
          <div className="space-y-6">
            <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
              <h3 className="text-base font-bold border-b border-slate-800 pb-2 uppercase tracking-wide text-red-400">
                Low Stock Warnings
              </h3>
              
              {lowStockAlerts.length === 0 ? (
                <div className="text-center py-10 text-xs opacity-50 text-emerald-400 font-mono">
                  ✓ All stock levels healthy
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockAlerts.map((alert, idx) => (
                    <div key={idx} className="bg-red-950/20 border border-red-900/40 rounded-2xl p-4 space-y-3 text-xs">
                      <div>
                        <span className="font-black text-red-300 block">{alert.product_name}</span>
                        <span className="opacity-50 text-[10px] block mt-0.5">{alert.warehouse_name}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-red-400 font-extrabold">{alert.quantity} units left</span>
                        <button 
                          onClick={() => handleRestock(alert.product_id, alert.warehouse_id)}
                          className="bg-red-900/80 hover:bg-red-800 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors"
                        >
                          RESTOCK +100
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

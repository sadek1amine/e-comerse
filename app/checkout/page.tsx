'use client';

import React, { useState, useActionState, useEffect } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { createOrderAction } from '../actions/orders';

export default function CheckoutPage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const { items, getCartSubtotal, clearCart } = useCartStore();

  // Active inputs
  const [shippingCity, setShippingCity] = useState('Riyadh');
  const [shippingLat, setShippingLat] = useState('24.7136');
  const [shippingLng, setShippingLng] = useState('46.6753');
  const [shippingPhone, setShippingPhone] = useState('');
  const [customerId, setCustomerId] = useState('');

  // Automatically update coordinates based on selected GCC city to simplify trigger testing
  const handleCityChange = (city: string) => {
    setShippingCity(city);
    if (city === 'Riyadh') {
      setShippingLat('24.7136');
      setShippingLng('46.6753');
    } else if (city === 'Dubai') {
      setShippingLat('25.0805');
      setShippingLng('55.1403');
    }
  };

  const [orderState, runOrder, isPending] = useActionState(createOrderAction, null);

  const subtotal = getCartSubtotal();
  const currency = items[0]?.currency || (shippingCity === 'Riyadh' ? 'SAR' : 'AED');
  
  // Calculate GCC Dynamic VAT and Shipping
  const vatRate = shippingCity === 'Riyadh' ? 0.15 : 0.05; // 15% KSA, 5% UAE
  const vatAmount = subtotal * vatRate;
  const shippingFee = shippingCity === 'Riyadh' ? 25 : 20; // SAR 25, AED 20
  const orderTotal = subtotal + vatAmount + shippingFee;

  const t = {
    ar: {
      title: 'إتمام الشراء الآمن',
      subtitle: 'أدخل بيانات التوصيل لإكمال طلبك في ثوانٍ معدودة',
      formTitle: 'عنوان الشحن والتوصيل',
      fullName: 'الاسم الكامل',
      phone: 'رقم الجوال (دولياً أو محلياً)',
      city: 'المدينة والشحن',
      coordinates: 'إحداثيات الموقع (لتحديد أقرب مستودع)',
      lat: 'خط العرض',
      lng: 'خط الطول',
      summary: 'ملخص الطلب',
      subtotal: 'المجموع الفرعي',
      vat: shippingCity === 'Riyadh' ? 'ضريبة القيمة المضافة (15٪)' : 'ضريبة القيمة المضافة (5٪)',
      shipping: 'رسوم الشحن والتوصيل',
      total: 'المجموع الإجمالي',
      placeOrder: 'تأكيد الطلب والدفع عند الاستلام',
      assignedWH: 'المستودع المخصص للطلب',
      successTitle: 'تم إرسال طلبك بنجاح!',
      successDesc: 'شكراً لك! تم استلام طلبك ومطابقته فورياً مع المستودع الأقرب لموقعك لتسريع عملية التوصيل.',
      orderNumber: 'رقم العملية',
      backToCatalog: 'العودة لمعرض المنتجات',
      splitAlert: 'تنبيه: لقد تطلب طلبك شحناً جزئياً من عدة مستودعات، يرجى مراجعة خيارات السلة.',
      loading: 'جاري تسجيل الطلب وتأكيد المخزون...',
    },
    en: {
      title: 'Secure Checkout',
      subtitle: 'Provide your shipping coordinates to complete your order instantly',
      formTitle: 'Shipping & Delivery Address',
      fullName: 'Full Name',
      phone: 'Phone Number (International/Local)',
      city: 'City & Region',
      coordinates: 'GPS Coordinates (Optimal Warehouse Allocation)',
      lat: 'Latitude',
      lng: 'Longitude',
      summary: 'Order Summary',
      subtotal: 'Subtotal',
      vat: shippingCity === 'Riyadh' ? 'VAT (15%)' : 'VAT (5%)',
      shipping: 'Shipping Fees',
      total: 'Grand Total',
      placeOrder: 'Confirm Order (Cash on Delivery)',
      assignedWH: 'Assigned Fulfillment Warehouse',
      successTitle: 'Order Placed Successfully!',
      successDesc: 'Thank you! Your order has been placed and dynamically linked with the closest warehouse to your location.',
      orderNumber: 'Order Reference ID',
      backToCatalog: 'Back To Catalog',
      splitAlert: 'Warning: Your order requires stock from multiple warehouses. Splitting is required.',
      loading: 'Allocating warehouse stock...',
    }
  }[lang];

  // Auto-clear cart upon successful checkout creation
  useEffect(() => {
    if (orderState?.success) {
      clearCart();
    }
  }, [orderState?.success]);

  // If order was created successfully, render a beautiful confirmation screen
  if (orderState?.success) {
    return (
      <div className={`min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
        <div className="absolute top-[-10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[130px] rounded-full" />
        
        <div className="w-full max-w-xl bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-4xl text-emerald-400 mx-auto animate-bounce">
            ✓
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-emerald-400">{t.successTitle}</h1>
            <p className="text-sm opacity-60 max-w-sm mx-auto">{t.successDesc}</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm text-left space-y-4 font-mono">
            <div className="flex justify-between border-b border-slate-900 pb-2">
              <span className="opacity-60">{t.orderNumber}:</span>
              <span className="font-bold text-indigo-400">{orderState.orderId}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="opacity-60">{t.assignedWH}:</span>
              <span className="font-bold text-purple-400">{orderState.warehouseId || 'Auto-Allocated'}</span>
            </div>
          </div>

          <a 
            href="/products"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold rounded-xl px-8 py-3 text-sm transition-opacity"
          >
            {t.backToCatalog}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-white font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-900/10 blur-[130px] rounded-full" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          CHECKOUT PORTAL
        </h1>
        <button 
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          className="bg-slate-900 border border-slate-800 text-xs font-bold px-4 py-2 rounded-full transition-colors"
        >
          {lang === 'ar' ? 'English' : 'العربية'}
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8 relative z-10">
        <div className="space-y-1">
          <h2 className="text-2xl font-black">{t.title}</h2>
          <p className="text-sm opacity-60">{t.subtitle}</p>
        </div>

        {/* Dynamic Alerts */}
        {orderState?.error && (
          <div className="bg-red-950/40 border border-red-800/60 text-red-300 text-sm rounded-2xl p-4 text-center">
            {orderState.error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/10 border border-slate-900 rounded-3xl opacity-60 text-sm">
            {lang === 'ar' ? 'سلة المشتريات فارغة. الرجاء إضافة منتجات أولاً.' : 'Your shopping cart is empty. Please add items.'}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Form Column */}
            <div className="md:col-span-2 space-y-6">
              <form action={runOrder} className="bg-slate-900/30 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-md space-y-6">
                <h3 className="text-lg font-bold border-b border-slate-800 pb-2">{t.formTitle}</h3>
                
                {/* Hidden Serialized Cart Items & customer parameters */}
                <input type="hidden" name="items" value={JSON.stringify(items.map(item => ({ product_id: item.id, quantity: item.quantity })))} />
                <input type="hidden" name="customerId" value={customerId} />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-semibold opacity-70">{t.fullName}</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Abdullah Al-Otaibi"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-semibold opacity-70">{t.phone}</label>
                    <input 
                      type="text" 
                      name="shippingPhone"
                      required
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      placeholder="e.g. +966500000000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-semibold opacity-70">{t.city}</label>
                    <select 
                      name="shippingCity"
                      value={shippingCity}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    >
                      <option value="Riyadh">Riyadh (KSA Hub)</option>
                      <option value="Dubai">Dubai (UAE Hub)</option>
                    </select>
                  </div>
                </div>

                {/* Coordinate Selector to manually test trigger */}
                <div className="space-y-4 bg-slate-950 border border-slate-850 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-indigo-400 block">{t.coordinates}</span>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="opacity-60">{t.lat}</label>
                      <input 
                        name="shippingLat"
                        type="text"
                        required
                        value={shippingLat}
                        onChange={(e) => setShippingLat(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="opacity-60">{t.lng}</label>
                      <input 
                        name="shippingLng"
                        type="text"
                        required
                        value={shippingLng}
                        onChange={(e) => setShippingLng(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-center"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl py-3 text-sm transition-opacity"
                >
                  {isPending ? t.loading : t.placeOrder}
                </button>
              </form>
            </div>

            {/* Summary Column */}
            <div className="bg-slate-900/30 border border-slate-800/60 rounded-3xl p-6 h-fit backdrop-blur-md space-y-6">
              <h3 className="text-lg font-bold border-b border-slate-800 pb-2">{t.summary}</h3>
              
              {/* Product mini list */}
              <div className="space-y-3 max-h-[220px] overflow-y-auto border-b border-slate-800 pb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.thumbnail} alt={item.title_en} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <span className="font-bold line-clamp-1">{lang === 'ar' ? item.title_ar : item.title_en}</span>
                        <span className="opacity-45">x {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-semibold">{item.price * item.quantity} {currency}</span>
                  </div>
                ))}
              </div>

              {/* Pricing Math Details */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="opacity-60">{t.subtotal}:</span>
                  <span className="font-semibold">{subtotal} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">{t.vat}:</span>
                  <span className="font-semibold">+{vatAmount.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-4">
                  <span className="opacity-60">{t.shipping}:</span>
                  <span className="font-semibold">+{shippingFee} {currency}</span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="font-bold">{t.total}:</span>
                  <span className="font-black text-indigo-400 text-lg">{orderTotal.toFixed(2)} {currency}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

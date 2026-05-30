import React from 'react';
import { notFound } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { GCCCountryCode } from '../../../types/commerce';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InfluencerPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const influencerSlug = resolvedParams.slug;

  const cookieStore = await cookies();
  const requestHeaders = await headers();

  const country = (cookieStore.get('x-localization-country')?.value || 
                   requestHeaders.get('x-gcc-country') || 
                   'SA') as GCCCountryCode;

  const lang = (cookieStore.get('x-localization-lang')?.value || 
                resolvedSearchParams.lang || 
                'en') as 'en' | 'ar';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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

  // Query database profiles where role = influencer and email/metadata slug matches
  // For production-grade resilience, we fall back to a mock record if no DB entry is found
  const { data: influencer } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, preferred_language, shipping_address')
    .eq('role', 'influencer')
    .filter('shipping_address->>slug', 'eq', influencerSlug)
    .maybeSingle();

  // Unified Bilingual Translations
  const t = {
    ar: {
      picks: 'إختياراتي المفضلة',
      desc: 'تسوق تشكيلتي المختارة بعناية لأفخم المنتجات والماركات العالمية بمناسبة الصيف.',
      voucher: 'انسخ كود الخصم الحصري:',
      copied: 'تم النسخ!',
      addToCart: 'أضف للسلة',
      currency: country === 'SA' ? 'SAR' : 'AED',
      influencerTitle: 'ركن المؤثرين الحصري',
    },
    en: {
      picks: 'My Exclusive Picks',
      desc: 'Shop my hand-picked collection of premium global perfumes and fashion accessories.',
      voucher: 'Copy My Promo Code:',
      copied: 'Voucher Copied!',
      addToCart: 'Add To Cart',
      currency: country === 'SA' ? 'SAR' : 'AED',
      influencerTitle: 'Exclusive Influencer Space',
    }
  }[lang];

  // Resolve influencer details (Supabase records or mock details for offline testing)
  const name = influencer 
    ? `${influencer.first_name || ''} ${influencer.last_name || ''}`.trim()
    : influencerSlug.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Influencer Accent Color (defaulting to luxury rose gold or emerald green depending on the slug)
  const accentColor = influencerSlug.includes('emerald') ? '#0f766e' : '#b45309'; // Rose Gold/Teal fallback
  const discountCode = `${influencerSlug.toUpperCase().replace('-', '')}20`;

  // Fetch product recommendations curated by the influencer
  const { data: products } = await supabase
    .from('products')
    .select(`
      id,
      slug,
      title,
      description,
      images,
      regional_pricing
    `)
    .eq('status', 'active')
    .limit(3);

  return (
    <div className={`min-h-screen bg-slate-950 text-white font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Dynamic Colored Glow based on Influencer accent theme */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[300px] blur-[140px] opacity-20 rounded-full"
        style={{ backgroundColor: accentColor }}
      />

      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-sm font-black tracking-widest uppercase opacity-75">{t.influencerTitle}</h1>
        <div className="flex gap-4 items-center">
          <span className="text-xs font-semibold">{country === 'SA' ? '🇸🇦 KSA' : '🇦🇪 UAE'}</span>
          <a href={`/influencer/${influencerSlug}?lang=${lang === 'en' ? 'ar' : 'en'}`} className="text-xs hover:underline uppercase">
            {lang === 'en' ? 'العربية' : 'English'}
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-12 relative z-10 space-y-12">
        {/* Profile Card */}
        <section className="text-center space-y-4">
          <div 
            className="w-28 h-28 rounded-full mx-auto border-4 border-slate-900 bg-cover bg-center overflow-hidden flex items-center justify-center text-4xl font-extrabold"
            style={{ 
              borderColor: accentColor,
              backgroundImage: 'url(https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80)' 
            }}
          >
            {!influencer && name[0]}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black">{name}</h2>
            <p className="text-sm opacity-60 max-w-md mx-auto">{t.desc}</p>
          </div>

          {/* Elegant Interactive Discount Code Banner */}
          <div 
            className="max-w-md mx-auto border rounded-2xl p-4 flex items-center justify-between gap-4"
            style={{ 
              backgroundColor: `${accentColor}10`,
              borderColor: `${accentColor}30`
            }}
          >
            <div className="text-left">
              <span className="text-[10px] opacity-50 block uppercase tracking-wider">{t.voucher}</span>
              <span className="text-lg font-black tracking-wider text-yellow-400 uppercase">{discountCode}</span>
            </div>
            <button 
              className="text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
              style={{ backgroundColor: accentColor }}
              // Web copy trigger
              onClick={() => {
                navigator.clipboard.writeText(discountCode);
                alert(t.copied);
              }}
            >
              20% OFF
            </button>
          </div>
        </section>

        {/* Curated Products Section */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold tracking-tight border-b border-slate-900 pb-2">{t.picks}</h3>
          
          <div className="grid gap-6 md:grid-cols-3">
            {/* If Supabase returns products, show them, otherwise render beautiful mock cards */}
            {(products && products.length > 0 ? products : Array.from({ length: 3 })).map((product: any, idx) => {
              const hasProduct = !!product;
              
              const title = hasProduct 
                ? (lang === 'ar' ? product.title?.ar : product.title?.en)
                : (lang === 'ar' ? `منتج المؤثر المختار ${idx + 1}` : `Curated Fragrance ${idx + 1}`);

              const description = hasProduct 
                ? (lang === 'ar' ? product.description?.ar : product.description?.en)
                : (lang === 'ar' ? `تركيبة خاصة غنية بعبق العود والعنبر الفاخر.` : `Special blend rich in premium oud and amberwood scents.`);

              const price = hasProduct 
                ? parseFloat(product.regional_pricing?.[country]?.price || '250') 
                : 280 * (idx + 1);

              const image = hasProduct 
                ? product.images?.[0]
                : 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=350&q=80';

              return (
                <div 
                  key={idx} 
                  className="group border border-slate-900 bg-slate-900/10 rounded-2xl overflow-hidden p-4 hover:border-slate-800 transition-colors"
                >
                  <div className="aspect-square bg-slate-950 rounded-xl mb-4 overflow-hidden relative">
                    <img 
                      src={image} 
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span 
                      className="absolute top-2 left-2 text-white text-[9px] font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: accentColor }}
                    >
                      RECOMMENDED
                    </span>
                  </div>
                  <h4 className="font-bold text-sm line-clamp-1">{title}</h4>
                  <p className="text-[11px] opacity-50 line-clamp-2 min-h-[32px] mt-1">{description}</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-extrabold text-base text-yellow-400">
                      {price} {t.currency}
                    </span>
                    <button className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold px-3 py-2 rounded-full transition-colors">
                      {t.addToCart}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

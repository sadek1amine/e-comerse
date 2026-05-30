'use client';

import React, { useState, useEffect } from 'react';

interface ProductHit {
  id: string;
  slug: string;
  sku: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  brand_name: string;
  category_name_en: string;
  category_name_ar: string;
  thumbnail: string;
  price: number;
  comparePrice?: number;
  currency: string;
}

export default function ProductsPage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [hits, setHits] = useState<ProductHit[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [minPrice, setMinPrice] = useState('0');
  const [maxPrice, setMaxPrice] = useState('1000');
  const [loading, setLoading] = useState(false);

  // Read country cookie for display fallback
  const [country, setCountry] = useState('SA');

  const t = {
    ar: {
      title: 'معرض المنتجات الفاخرة',
      subtitle: 'تصفح تشكيلتنا الحصرية من أفخر الماركات العالمية',
      searchPlaceholder: 'ابحث عن عطور، ملابس، ماركات...',
      filters: 'تصفية النتائج',
      category: 'التصنيف',
      brand: 'العلامة التجارية',
      priceRange: 'نطاق السعر',
      min: 'الحد الأدنى',
      max: 'الحد الأقصى',
      allCategories: 'جميع التصنيفات',
      allBrands: 'جميع الماركات',
      empty: 'لم يتم العثور على أي منتجات مطابقة.',
      addToCart: 'أضف للسلة',
      currency: country === 'SA' ? 'ر.س' : 'د.إ',
      loading: 'جاري التحميل...',
    },
    en: {
      title: 'Luxury Products Exhibition',
      subtitle: 'Browse our exclusive collection of premium global brands',
      searchPlaceholder: 'Search perfumes, fashion, brands...',
      filters: 'Filters',
      category: 'Category',
      brand: 'Brand',
      priceRange: 'Price Range',
      min: 'Min Price',
      max: 'Max Price',
      allCategories: 'All Categories',
      allBrands: 'All Brands',
      empty: 'No matching products discovered.',
      addToCart: 'Add To Cart',
      currency: country === 'SA' ? 'SAR' : 'AED',
      loading: 'Loading catalog...',
    }
  }[lang];

  useEffect(() => {
    // Read local cookie to match UI formatting
    const cookies = document.cookie.split('; ');
    const countryCookie = cookies.find(row => row.startsWith('x-localization-country='));
    if (countryCookie) {
      setCountry(countryCookie.split('=')[1]);
    }
  }, []);

  // Fetch catalog hits based on filter settings
  const fetchHits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: search,
        category,
        brand,
        minPrice,
        maxPrice
      });
      const response = await fetch(`/api/products/search?${params.toString()}`);
      const data = await response.json();
      
      // Meilisearch hits structure slightly differs from postgres fallback, align them:
      const alignedHits = (data.hits || []).map((hit: any) => ({
        id: hit.id,
        slug: hit.slug,
        sku: hit.sku,
        title_en: hit.title_en || hit.title?.en || '',
        title_ar: hit.title_ar || hit.title?.ar || '',
        description_en: hit.description_en || hit.description?.en || '',
        description_ar: hit.description_ar || hit.description?.ar || '',
        brand_name: hit.brand_name || hit.brands?.name || '',
        category_name_en: hit.category_name_en || hit.categories?.name?.en || '',
        category_name_ar: hit.category_name_ar || hit.categories?.name?.ar || '',
        thumbnail: hit.thumbnail || hit.images?.[0] || 'https://via.placeholder.com/250',
        price: hit.price || hit.regional_pricing?.[country]?.price || 0,
        comparePrice: hit.comparePrice || hit.regional_pricing?.[country]?.compareAtPrice || 0,
        currency: country === 'SA' ? 'SAR' : 'AED'
      }));

      setHits(alignedHits);
    } catch (err) {
      console.error('Failed to load products index:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search fetch trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHits();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category, brand, minPrice, maxPrice]);

  return (
    <div className={`min-h-screen bg-slate-950 text-white font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Sleek Decorative Lighting */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-900/10 blur-[130px] rounded-full" />
      <div className="absolute top-1/2 left-0 w-[40%] h-[40%] bg-purple-900/10 blur-[130px] rounded-full" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent uppercase">
            GCC HEADLESS RETAIL
          </h1>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-sm font-semibold">{country === 'SA' ? '🇸🇦 KSA' : '🇦🇪 UAE'}</span>
          <button 
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold px-4 py-2 rounded-full transition-colors"
          >
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-black">{t.title}</h2>
          <p className="text-sm opacity-60">{t.subtitle}</p>
        </div>

        {/* Real-time Search Input */}
        <div className="w-full">
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-indigo-500 transition-colors backdrop-blur-md"
          />
        </div>

        {/* Sidebar & Products grid */}
        <div className="grid md:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="bg-slate-900/30 border border-slate-800/60 rounded-3xl p-6 h-fit backdrop-blur-md space-y-6">
            <h3 className="text-lg font-bold border-b border-slate-800 pb-2">{t.filters}</h3>
            
            {/* Category facet */}
            <div className="space-y-2">
              <label className="text-xs font-semibold opacity-70 uppercase tracking-wider">{t.category}</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              >
                <option value="">{t.allCategories}</option>
                <option value="perfumes">{lang === 'ar' ? 'العطور الفاخرة' : 'Luxury Perfumes'}</option>
                <option value="fashion">{lang === 'ar' ? 'الملابس الراقية' : 'Fashion Wear'}</option>
              </select>
            </div>

            {/* Brand facet */}
            <div className="space-y-2">
              <label className="text-xs font-semibold opacity-70 uppercase tracking-wider">{t.brand}</label>
              <select 
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              >
                <option value="">{t.allBrands}</option>
                <option value="amouage">Amouage</option>
                <option value="hind-al-oud">Hind Al Oud</option>
              </select>
            </div>

            {/* Price limits */}
            <div className="space-y-3">
              <label className="text-xs font-semibold opacity-70 uppercase tracking-wider">{t.priceRange}</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] opacity-50 block mb-1">{t.min}</span>
                  <input 
                    type="number" 
                    value={minPrice} 
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] opacity-50 block mb-1">{t.max}</span>
                  <input 
                    type="number" 
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-center"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Grid Area */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="text-center py-20 text-sm font-semibold opacity-60">
                {t.loading}
              </div>
            ) : hits.length === 0 ? (
              <div className="text-center py-20 text-sm font-semibold opacity-60">
                {t.empty}
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
                {hits.map((product) => {
                  const title = lang === 'ar' ? product.title_ar : product.title_en;
                  const category = lang === 'ar' ? product.category_name_ar : product.category_name_en;

                  return (
                    <div 
                      key={product.id}
                      className="group border border-slate-900 rounded-2xl overflow-hidden bg-slate-900/10 backdrop-blur-md p-4 transition-all hover:border-slate-800 hover:shadow-lg"
                    >
                      {/* Thumbnail Container */}
                      <div className="aspect-square bg-slate-950 rounded-xl mb-4 overflow-hidden relative border border-slate-900">
                        <img 
                          src={product.thumbnail} 
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-2.5 right-2.5 bg-indigo-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {product.brand_name || 'Brand'}
                        </span>
                      </div>

                      {/* Details Area */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest block">
                          {category}
                        </span>
                        <h4 className="font-bold text-sm tracking-tight line-clamp-1">
                          {title}
                        </h4>
                        <p className="text-[11px] opacity-50 line-clamp-2 min-h-[32px]">
                          {lang === 'ar' ? product.description_ar : product.description_en}
                        </p>
                      </div>

                      {/* Pricing Footer */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                          <span className="font-black text-base text-purple-400">
                            {product.price} {t.currency}
                          </span>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <span className="text-[10px] opacity-40 line-through">
                              {product.comparePrice} {t.currency}
                            </span>
                          )}
                        </div>
                        <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-[10px] font-bold px-3 py-2 rounded-full hover:opacity-90 transition-opacity">
                          {t.addToCart}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MeiliSearch } from 'meilisearch';

/**
 * High-Throughput Search API with Meilisearch to PostgreSQL Fallback
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';
  const brandSlug = searchParams.get('brand') || '';
  const minPrice = parseFloat(searchParams.get('minPrice') || '0');
  const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
  
  // Read localized GCC country from headers (injected by our middleware) or cookies
  const country = (
    request.headers.get('x-gcc-country') || 
    request.cookies.get('x-localization-country')?.value || 
    'SA'
  ).toUpperCase();

  const meilisearchHost = process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700';
  const meilisearchApiKey = process.env.MEILISEARCH_MASTER_KEY || '';

  // Attempt Meilisearch connection
  if (meilisearchApiKey) {
    try {
      const meiliClient = new MeiliSearch({ host: meilisearchHost, apiKey: meilisearchApiKey });
      const index = meiliClient.index('products');

      // Build structured filters for Meilisearch
      const filterArray: string[] = [];
      if (categorySlug) filterArray.push(`category_slug = "${categorySlug}"`);
      if (brandSlug) filterArray.push(`brand_slug = "${brandSlug}"`);
      
      // Select appropriate GCC price key
      const priceKey = country === 'AE' ? 'price_ae' : 'price_sa';
      filterArray.push(`${priceKey} >= ${minPrice}`);
      filterArray.push(`${priceKey} <= ${maxPrice}`);

      const results = await index.search(q, {
        filter: filterArray.join(' AND '),
        sort: [`created_at:desc`],
        limit: 20
      });

      return NextResponse.json({
        source: 'meilisearch',
        country,
        hits: results.hits
      });
    } catch (meiliError) {
      console.warn('Meilisearch query failed, falling back to PostgreSQL:', meiliError);
    }
  }

  // ==========================================
  // Fallback: Query Supabase PostgreSQL directly
  // ==========================================
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  let query = supabase
    .from('products')
    .select(`
      id,
      slug,
      sku,
      title,
      description,
      images,
      regional_pricing,
      status,
      created_at,
      brands ( name, slug ),
      categories ( name, slug )
    `)
    .eq('status', 'active');

  // Filter category
  if (categorySlug) {
    query = query.filter('categories.slug', 'eq', categorySlug);
  }

  // Filter brand
  if (brandSlug) {
    query = query.filter('brands.slug', 'eq', brandSlug);
  }

  const { data: rawProducts, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Localized filtering and structural mapping
  let products = (rawProducts || []).map((prod: any) => {
    const regional = prod.regional_pricing?.[country] || {};
    return {
      id: prod.id,
      slug: prod.slug,
      sku: prod.sku,
      title_en: prod.title?.en || '',
      title_ar: prod.title?.ar || '',
      description_en: prod.description?.en || '',
      description_ar: prod.description?.ar || '',
      brand_name: prod.brands?.name || '',
      category_name_en: prod.categories?.name?.en || '',
      category_name_ar: prod.categories?.name?.ar || '',
      thumbnail: prod.images?.[0] || '',
      price: parseFloat(regional.price) || 0,
      comparePrice: parseFloat(regional.compareAtPrice) || 0,
      currency: country === 'SA' ? 'SAR' : 'AED',
    };
  });

  // Apply search filtering on title/descriptions
  if (q) {
    const searchRegex = new RegExp(q, 'i');
    products = products.filter(
      (p) =>
        searchRegex.test(p.title_en) ||
        searchRegex.test(p.title_ar) ||
        searchRegex.test(p.brand_name) ||
        searchRegex.test(p.sku)
    );
  }

  // Apply Price boundaries
  products = products.filter((p) => p.price >= minPrice && p.price <= maxPrice);

  return NextResponse.json({
    source: 'postgresql_fallback',
    country,
    hits: products
  });
}

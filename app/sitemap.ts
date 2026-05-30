import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

/**
 * Dynamic Next.js 15+ Sitemap Generator
 * Auto-indexes products, dynamic categories, and influencer portals for search crawlers
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://store.com';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Define base structural static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    // 2. Fetch active dynamic categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, created_at');

    const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
      url: `${baseUrl}/${cat.slug}`,
      lastModified: new Date(cat.created_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // 3. Fetch active dynamic products
    const { data: products } = await supabase
      .from('products')
      .select('slug, created_at')
      .eq('status', 'active');

    const productRoutes: MetadataRoute.Sitemap = (products || []).map((prod) => ({
      url: `${baseUrl}/products/${prod.slug}`,
      lastModified: new Date(prod.created_at),
      changeFrequency: 'daily',
      priority: 0.7,
    }));

    // 4. Combine all maps
    return [...staticRoutes, ...categoryRoutes, ...productRoutes];

  } catch (err) {
    console.warn('Sitemap dynamic crawler query failed. Falling back to static mappings:', err);
    return staticRoutes;
  }
}

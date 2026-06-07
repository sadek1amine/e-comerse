import { createClient } from '@supabase/supabase-js';
import { MeiliSearch } from 'meilisearch';

/**
 * Meilisearch Sync and Configuration Script
 * Grounded for GCC Headless E-commerce Scale
 */
async function syncDatabaseToMeilisearch() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const meilisearchHost = process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700';
  const meilisearchApiKey = process.env.MEILISEARCH_MASTER_KEY || 'mock-meili-key-123';

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase keys missing. Sync aborted.');
    return;
  }

  console.log('Connecting to Supabase and Meilisearch databases...');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const meiliClient = new MeiliSearch({ host: meilisearchHost, apiKey: meilisearchApiKey });

  // 1. Fetch active products with categories and brand associations
  const { data: products, error } = await supabase
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

  if (error) {
    console.error('Error retrieving products from Supabase:', error.message);
    return;
  }

  if (!products || products.length === 0) {
    console.log('No active products discovered to index.');
    return;
  }

  console.log(`Fetched ${products.length} products. Restructuring records for search engine...`);

  // 2. Flatten nested relational and regional JSONB attributes for optimal indexing
  const indexDocuments = products.map((product: any) => {
    const saPricing = product.regional_pricing?.SA || {};
    const aePricing = product.regional_pricing?.AE || {};

    return {
      id: product.id,
      slug: product.slug,
      sku: product.sku,
      // Bilingual title indexing
      title_en: product.title?.en || '',
      title_ar: product.title?.ar || '',
      description_en: product.description?.en || '',
      description_ar: product.description?.ar || '',
      // Relation mappings
      brand_name: product.brands?.name || '',
      brand_slug: product.brands?.slug || '',
      category_name_en: product.categories?.name?.en || '',
      category_name_ar: product.categories?.name?.ar || '',
      category_slug: product.categories?.slug || '',
      // Image resolution
      thumbnail: product.images?.[0] || '',
      // Flatten regional pricing parameters to support facets and numeric sorting ranges
      price_sa: parseFloat(saPricing.price) || 0,
      price_ae: parseFloat(aePricing.price) || 0,
      compare_price_sa: parseFloat(saPricing.compareAtPrice) || 0,
      compare_price_ae: parseFloat(aePricing.compareAtPrice) || 0,
      created_at: new Date(product.created_at).getTime(),
    };
  });

  // 3. Initialize/Reset the 'products' search index
  const indexName = 'products';
  console.log(`Configuring index settings for: ${indexName}...`);
  const index = meiliClient.index(indexName);

  // 4. Update indexing rules for sub-millisecond faceting and sorting operations
  await index.updateSettings({
    searchableAttributes: [
      'title_ar',
      'title_en',
      'brand_name',
      'category_name_ar',
      'category_name_en',
      'sku',
      'description_ar',
      'description_en',
    ],
    filterableAttributes: [
      'brand_name',
      'brand_slug',
      'category_slug',
      'price_sa',
      'price_ae',
    ],
    sortableAttributes: [
      'price_sa',
      'price_ae',
      'created_at',
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ],
  });

  console.log('Index rules applied. Dispatching document packets to search engine...');
  const task = await index.addDocuments(indexDocuments);
  
  console.log(`Sync task successfully created. Meilisearch Task ID: ${task.taskUid}`);
  console.log('Synchronization completed successfully.');
}

// Execute sync
syncDatabaseToMeilisearch().catch((err) => {
  console.error('Fatal synchronization error:', err);
});

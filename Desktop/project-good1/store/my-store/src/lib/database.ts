import { supabase } from "./supabase";
import type {
  Store,
  Category,
  Product,
  CreateStoreInput,
  CreateProductInput,
  UpdateStoreInput,
  UpdateProductInput,
} from "@/types";

// ─── Stores ──────────────────────────────────────────────

export async function getStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getStoreById(id: string): Promise<Store | null> {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getUserStores(userId: string): Promise<Store[]> {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createStore(
  userId: string,
  input: CreateStoreInput
): Promise<Store> {
  const { data, error } = await supabase
    .from("stores")
    .insert({ user_id: userId, ...input })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateStore(
  id: string,
  input: UpdateStoreInput
): Promise<Store> {
  const { data, error } = await supabase
    .from("stores")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStore(id: string): Promise<void> {
  const { error } = await supabase.from("stores").delete().eq("id", id);
  if (error) throw error;
}

// ─── Categories ──────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

// ─── Products ────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, store:stores(*), category:categories(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, store:stores(*), category:categories(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getStoreProducts(storeId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getUserProducts(userId: string): Promise<Product[]> {
  // Get all products where the store belongs to the user
  const { data, error } = await supabase
    .from("products")
    .select("*, store:stores!inner(*), category:categories(*)")
    .eq("store.user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

// ─── Stats ───────────────────────────────────────────────

export async function getUserStats(userId: string) {
  const stores = await getUserStores(userId);
  const storeIds = stores.map((s) => s.id);

  let productCount = 0;
  if (storeIds.length > 0) {
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .in("store_id", storeIds);
    if (!error && count !== null) productCount = count;
  }

  return {
    storeCount: stores.length,
    productCount,
  };
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, store:stores(*), category:categories!inner(*)")
    .eq("category.slug", categorySlug)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCategoryProductCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("products")
    .select("category_id");
  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    if (row.category_id) {
      counts[row.category_id] = (counts[row.category_id] || 0) + 1;
    }
  }
  return counts;
}

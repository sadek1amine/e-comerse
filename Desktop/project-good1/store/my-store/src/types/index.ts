// S-Mahalat Marketplace Types

export interface Store {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  image: string;
  created_at: string;
  // Joined fields (optional, from queries)
  store?: Store;
  category?: Category;
}

export interface UserProfile {
  id: string;
  email: string;
}

// Form types
export interface CreateStoreInput {
  name: string;
  description: string;
}

export interface CreateProductInput {
  store_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface UpdateStoreInput {
  name?: string;
  description?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  category_id?: string;
}

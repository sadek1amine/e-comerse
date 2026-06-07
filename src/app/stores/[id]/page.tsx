"use client";

import { use, useEffect, useState } from "react";
import { getStoreById, getStoreProducts } from "@/lib/database";
import type { Store, Product } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ArrowLeft, Store as StoreIcon, ShoppingBag } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PublicStoreDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const storeId = resolvedParams.id;

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoreAndProducts() {
      try {
        const storeData = await getStoreById(storeId);
        setStore(storeData);

        if (storeData) {
          const productsData = await getStoreProducts(storeId);
          setProducts(productsData);
        }
      } catch (err) {
        console.error("Error loading public store details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStoreAndProducts();
  }, [storeId]);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Store Not Found</h2>
        <p className="text-muted-foreground">The store you are looking for does not exist or has been removed.</p>
        <Link href="/stores" className="inline-flex text-primary hover:underline items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Stores
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12 animate-fadeIn">
      {/* Back navigation */}
      <Link
        href="/stores"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Stores
      </Link>

      {/* Store Header Banner */}
      <div className="relative rounded-3xl border border-border/40 bg-card p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

        <div className="flex items-start md:items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
            <StoreIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground font-sans">
              {store.name}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Launched {new Date(store.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Store stats banner */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border/40 text-sm font-medium text-foreground">
          <ShoppingBag className="w-4 h-4 text-primary" />
          <span>{products.length} active listings</span>
        </div>
      </div>

      {/* Store description block */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About the Store</h2>
        <p className="text-base text-foreground leading-relaxed max-w-3xl">
          {store.description}
        </p>
      </div>

      {/* Store Products */}
      <div className="space-y-6 pt-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground font-sans">
          Products from {store.name}
        </h2>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={{ ...product, store }} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border/60 rounded-2xl bg-card/20 text-muted-foreground text-sm">
            This merchant hasn't listed any products yet.
          </div>
        )}
      </div>
    </div>
  );
}

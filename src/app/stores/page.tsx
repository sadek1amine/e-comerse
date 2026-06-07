"use client";

import { useEffect, useState } from "react";
import { getStores } from "@/lib/database";
import type { Store } from "@/types";
import { StoreCard } from "@/components/stores/StoreCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Store as StoreIcon } from "lucide-react";

export default function PublicStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStores() {
      try {
        const data = await getStores();
        setStores(data);
      } catch (err) {
        console.error("Error fetching public stores:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStores();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8 animate-fadeIn">
      {/* Page header */}
      <div className="border-b border-border/40 pb-6 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-sans">
          Store Directory
        </h1>
        <p className="text-muted-foreground mt-2">
          Discover unique brands, local merchants, and premium digital store fronts.
        </p>
      </div>

      {/* Stores grid */}
      {stores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 py-20 rounded-2xl border border-dashed border-border/60 bg-card/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary mb-4">
            <StoreIcon className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1 font-sans">No stores launched yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Be the pioneer! Create an account and register your first store.
          </p>
        </div>
      )}
    </div>
  );
}

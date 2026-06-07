"use client";

import { useEffect, useState } from "react";
import { getCategories, getCategoryProductCounts } from "@/lib/database";
import type { Category } from "@/types";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ArrowRight, Tag } from "lucide-react";
import Link from "next/link";

export default function PublicCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoriesData() {
      try {
        const [allCategories, productCounts] = await Promise.all([
          getCategories(),
          getCategoryProductCounts(),
        ]);
        setCategories(allCategories);
        setCounts(productCounts);
      } catch (err) {
        console.error("Error loading categories overview:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoriesData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8 animate-fadeIn">
      {/* Page header */}
      <div className="border-b border-border/40 pb-6 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-sans">
          Browse Categories
        </h1>
        <p className="text-muted-foreground mt-2">
          Discover products indexed by global classifications.
        </p>
      </div>

      {/* Grid listing */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const count = counts[category.id] || 0;
            return (
              <Link key={category.id} href={`/products?category=${category.slug}`} className="group">
                <Card hover className="flex flex-col justify-between h-36 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <Tag className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-base text-foreground font-sans block group-hover:text-primary transition-colors duration-300">
                      {category.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-muted-foreground">
                      {count} {count === 1 ? "product" : "products"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                      Browse
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border/60 rounded-2xl bg-card/25 text-muted-foreground text-sm">
          No categories found. Categories must be seeded in Supabase SQL editor.
        </div>
      )}
    </div>
  );
}

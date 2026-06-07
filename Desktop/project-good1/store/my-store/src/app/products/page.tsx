"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProducts, getCategories } from "@/lib/database";
import type { Product, Category } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Search, Tag, X } from "lucide-react";

function ProductsListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const selectedCategorySlug = searchParams.get("category") || "";

  useEffect(() => {
    async function loadData() {
      try {
        const [allProducts, allCategories] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(allProducts);
        setCategories(allCategories);
      } catch (err) {
        console.error("Error loading products catalogue:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCategorySelect = (slug: string) => {
    if (slug === selectedCategorySlug) {
      // Toggle off
      router.push("/products");
    } else {
      router.push(`/products?category=${slug}`);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    router.push("/products");
  };

  // Filter products client-side for immediate responsive feel
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategorySlug === "" ||
        (product.category && product.category.slug === selectedCategorySlug);

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategorySlug]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10 animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/40 pb-6">
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-sans">
            Products Catalogue
          </h1>
          <p className="text-muted-foreground mt-2">
            Explore items listed by our vendors. Use filters to find exactly what you need.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Category selector tags */}
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
          Filter by Category
        </span>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategorySlug === category.slug;
            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.slug)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-primary border-primary text-white"
                    : "bg-card border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                {category.name}
              </button>
            );
          })}
          
          {(selectedCategorySlug || searchQuery) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Showing {filteredProducts.length} products</span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 py-20 rounded-2xl border border-dashed border-border/60 bg-card/30">
            <h3 className="text-base font-bold text-foreground mb-1 font-sans">No products found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Try adjusting your query or filters, or explore a different category.
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-secondary px-4 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PublicProductsPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <ProductsListContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getStores, getProducts, getCategories } from "@/lib/database";
import type { Store, Product, Category } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";
import { StoreCard } from "@/components/stores/StoreCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Store as StoreIcon, ShieldCheck, Zap, Globe, Heart } from "lucide-react";

export default function HomePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [allStores, allProducts, allCategories] = await Promise.all([
          getStores(),
          getProducts(),
          getCategories(),
        ]);
        setStores(allStores.slice(0, 3));
        setProducts(allProducts.slice(0, 6));
        setCategories(allCategories.slice(0, 4));
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="flex flex-col gap-20 pb-20 overflow-hidden">
      {/* ─── Hero Section ─── */}
      <section className="relative pt-10 md:pt-20 lg:pt-32 pb-16 md:pb-24">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse duration-5000" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse duration-7000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider"
          >
            <Zap className="w-3.5 h-3.5" />
            Next-Gen Multi-Vendor Marketplace
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground font-sans max-w-4xl mx-auto leading-[1.1]"
          >
            Launch Your Store. <br />
            <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-500">
              Showcase Products.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            S-Mahalat is a premium SaaS marketplace. Create digital storefronts instantly, seed custom product listings, and connect directly with shoppers worldwide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-white hover:bg-primary/95 transition-colors shadow-lg shadow-primary/25 gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Explore Products
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-8 text-sm font-semibold text-foreground hover:bg-secondary hover:border-border/80 transition-colors gap-2"
            >
              <StoreIcon className="w-4 h-4 text-muted-foreground" />
              Launch Your Store
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Platform Features ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-border/40 bg-card/50 flex flex-col gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground font-sans">Secure & Scalable</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Powered by Supabase RLS and JWT authentication. Your storefront data belongs solely to you.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/40 bg-card/50 flex flex-col gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground font-sans">Instant Setup</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No merchant code or approvals required. Spin up stores and publish inventory in seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/40 bg-card/50 flex flex-col gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground font-sans">Global Indexing</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your items automatically populate category search filters and public store indexes globally.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Global Categories ─── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
                Browse Categories
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Select a global category to filter active products.
              </p>
            </div>
            <Link
              href="/categories"
              className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 self-start sm:self-auto"
            >
              All categories
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="flex items-center justify-between p-5 rounded-2xl border border-border bg-card/40 hover:bg-secondary transition-all hover:border-primary group"
              >
                <span className="font-bold text-sm text-foreground block group-hover:text-primary transition-colors">
                  {category.name}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── Featured Products Section ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
              Featured Products
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Top picks listed recently from our verified merchants.
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            View all products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-border/60 rounded-2xl bg-card/20 text-muted-foreground">
            No products listed yet in the marketplace.
          </div>
        )}
      </section>

      {/* ─── Featured Stores Section ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
              Explore Active Stores
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Discover unique brands and verified vendor storefronts.
            </p>
          </div>
          <Link
            href="/stores"
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            View all stores
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {stores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-border/60 rounded-2xl bg-card/20 text-muted-foreground">
            No stores created yet. Be the first to launch!
          </div>
        )}
      </section>

      {/* ─── Promotional Callout ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 to-indigo-500/10 p-8 md:p-16 text-center space-y-6 overflow-hidden">
          {/* Ambient Glows inside CTA */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -z-10" />

          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground font-sans max-w-xl mx-auto leading-tight">
            Ready to turn your products into revenue?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            Launch S-Mahalat seller account now. List items in categories and connect with buyers immediately. No coding required.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-white hover:bg-primary/95 transition-colors gap-2"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

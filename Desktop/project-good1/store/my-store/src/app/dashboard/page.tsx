"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserStats, getUserStores, getUserProducts } from "@/lib/database";
import type { Store, Product } from "@/types";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import { Plus, Store as StoreIcon, ShoppingBag, Eye, ArrowUpRight } from "lucide-react";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ storeCount: number; productCount: number } | null>(null);
  const [recentStores, setRecentStores] = useState<Store[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadDashboardData() {
      try {
        const [userStats, stores, products] = await Promise.all([
          getUserStats(user!.id),
          getUserStores(user!.id),
          getUserProducts(user!.id),
        ]);

        setStats(userStats);
        setRecentStores(stores.slice(0, 3));
        setRecentProducts(products.slice(0, 3));
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-sans">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Manage your stores, products, and sales from S-Mahalat dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <StoreIcon className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm font-semibold text-muted-foreground block uppercase tracking-wider">
              My Stores
            </span>
            <span className="text-3xl font-bold text-foreground font-sans mt-0.5 block">
              {stats?.storeCount ?? 0}
            </span>
          </div>
        </Card>

        <Card className="flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm font-semibold text-muted-foreground block uppercase tracking-wider">
              My Products
            </span>
            <span className="text-3xl font-bold text-foreground font-sans mt-0.5 block">
              {stats?.productCount ?? 0}
            </span>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground font-sans">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/stores/new"
            className="flex items-center justify-between p-5 rounded-2xl border border-border bg-card/50 hover:bg-secondary transition-all hover:border-primary group"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Plus className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-foreground block">
                  Create a New Store
                </span>
                <span className="text-xs text-muted-foreground">
                  Launch a new store category and name
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href={stats?.storeCount && stats.storeCount > 0 ? "/dashboard/products/new" : "/dashboard/stores/new"}
            className="flex items-center justify-between p-5 rounded-2xl border border-border bg-card/50 hover:bg-secondary transition-all hover:border-primary group"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Plus className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-foreground block">
                  Add a New Product
                </span>
                <span className="text-xs text-muted-foreground">
                  {stats?.storeCount && stats.storeCount > 0
                    ? "List a new product in one of your stores"
                    : "Create a store first to add products"}
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Recent Stores */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-foreground font-sans">Recent Stores</h2>
            {stats?.storeCount && stats.storeCount > 0 ? (
              <Link
                href="/dashboard/stores"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all stores
              </Link>
            ) : null}
          </div>

          <div className="space-y-3">
            {recentStores.length > 0 ? (
              recentStores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card hover:bg-card/85 transition-colors"
                >
                  <div>
                    <span className="font-bold text-sm text-foreground block">
                      {store.name}
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs sm:max-w-md">
                      {store.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/stores/${store.id}`}
                      className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
                      title="View Public Page"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/dashboard/stores/${store.id}`}
                      className="text-xs font-semibold text-primary px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary hover:text-white transition-all"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center rounded-xl border border-dashed border-border/60 bg-card/20 text-sm text-muted-foreground">
                No stores created yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-foreground font-sans">Recent Products</h2>
            {stats?.productCount && stats.productCount > 0 ? (
              <Link
                href="/dashboard/products"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all products
              </Link>
            ) : null}
          </div>

          <div className="space-y-3">
            {recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card hover:bg-card/85 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {product.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover bg-secondary"
                      />
                    )}
                    <div>
                      <span className="font-bold text-sm text-foreground block">
                        {product.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.store?.name ? `Store: ${product.store.name} • ` : ""}
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
                      title="View Public Page"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/dashboard/products"
                      className="text-xs font-semibold text-indigo-500 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center rounded-xl border border-dashed border-border/60 bg-card/20 text-sm text-muted-foreground">
                No products listed yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

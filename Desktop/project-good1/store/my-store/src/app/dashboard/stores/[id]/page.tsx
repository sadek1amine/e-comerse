"use client";

import { use, useEffect, useState } from "react";
import { getStoreById, updateStore, getStoreProducts, deleteProduct } from "@/lib/database";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import { StoreForm } from "@/components/stores/StoreForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import type { Store, Product } from "@/types";
import Link from "next/link";
import { ArrowLeft, Settings, ShoppingBag, Plus, Eye, Trash2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DashboardStoreDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const storeId = resolvedParams.id;

  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "settings">("products");

  // Product delete confirmation state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadStoreData() {
      try {
        const storeData = await getStoreById(storeId);
        if (!storeData || storeData.user_id !== user!.id) {
          showToast("Store not found or access denied", "error");
          router.push("/dashboard/stores");
          return;
        }
        setStore(storeData);

        const productsData = await getStoreProducts(storeId);
        setProducts(productsData);
      } catch (err) {
        console.error("Error loading store detail data:", err);
        showToast("Error fetching store data", "error");
      } finally {
        setLoading(false);
      }
    }

    loadStoreData();
  }, [storeId, user, router, showToast]);

  const handleUpdateStore = async (data: { name: string; description: string }) => {
    try {
      const updated = await updateStore(storeId, data);
      setStore(updated);
      showToast("Store updated successfully!", "success");
    } catch (err) {
      console.error("Error updating store:", err);
      showToast("Failed to update store settings", "error");
    }
  };

  const handleProductDelete = async () => {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      await deleteProduct(productToDelete.id);
      showToast(`Product "${productToDelete.name}" deleted successfully`, "success");
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (err) {
      console.error("Error deleting product:", err);
      showToast("Failed to delete product", "error");
    } finally {
      setIsDeletingProduct(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!store) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back button & Title */}
      <div className="space-y-4">
        <Link
          href="/dashboard/stores"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stores
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-sans">
              {store.name}
            </h1>
            <p className="text-muted-foreground mt-1 line-clamp-1 max-w-xl">
              {store.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/stores/${store.id}`}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-secondary transition-colors gap-2"
            >
              <Eye className="w-4 h-4" />
              View Storefront
            </Link>
            {activeTab === "products" && (
              <Link
                href={`/dashboard/products/new?storeId=${store.id}`}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/95 transition-colors gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border/40 gap-6">
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "products"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "settings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="w-4 h-4" />
          Store Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "settings" && (
          <div className="p-6 sm:p-8 rounded-2xl border border-border/40 bg-card max-w-2xl">
            <StoreForm
              initialData={{ name: store.name, description: store.description }}
              onSubmit={handleUpdateStore}
              submitLabel="Save Changes"
            />
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-4">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="flex flex-col justify-between p-4 min-h-[220px]">
                    <div>
                      {product.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-xl bg-secondary mb-3"
                        />
                      )}
                      <h4 className="font-bold text-base text-foreground font-sans line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-4">
                      <span className="text-sm font-bold text-foreground">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/products/${product.id}`}
                          className="inline-flex h-7 px-2.5 items-center justify-center rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Link>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-border/60 bg-card/25 rounded-2xl flex flex-col items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground mb-3" />
                <h3 className="text-sm font-bold text-foreground mb-1">No products listed</h3>
                <p className="text-xs text-muted-foreground max-w-xs mb-6">
                  Add products to this store to showcase them in the marketplace.
                </p>
                <Link
                  href={`/dashboard/products/new?storeId=${store.id}`}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-xs font-semibold text-white hover:bg-primary/95 transition-colors gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add First Product
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Product Confirmation Modal */}
      <Modal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Delete Product"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-bold text-foreground">"{productToDelete?.name}"</span>?
            This action is permanent and cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <button
              onClick={() => setProductToDelete(null)}
              disabled={isDeletingProduct}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleProductDelete}
              disabled={isDeletingProduct}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-destructive px-4 text-sm font-semibold text-white hover:bg-destructive/95 transition-colors cursor-pointer"
            >
              {isDeletingProduct ? "Deleting..." : "Delete Product"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserProducts, deleteProduct, getUserStores } from "@/lib/database";
import type { Product, Store } from "@/types";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import { Plus, ShoppingBag, Trash2, Eye } from "lucide-react";

export default function DashboardProductsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [hasStores, setHasStores] = useState(false);
  const [loading, setLoading] = useState(true);

  // Deletion modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      const [userProducts, userStores] = await Promise.all([
        getUserProducts(user.id),
        getUserStores(user.id),
      ]);
      setProducts(userProducts);
      setHasStores(userStores.length > 0);
    } catch (err) {
      console.error("Error loading products page data:", err);
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      showToast(`Product "${productToDelete.name}" deleted successfully`, "success");
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (err) {
      console.error("Error deleting product:", err);
      showToast("Failed to delete product", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-sans">
            My Products
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage product listings across all your active storefronts.
          </p>
        </div>
        {products.length > 0 && (
          <Link
            href="/dashboard/products/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/95 gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        )}
      </div>

      {/* Products list */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col justify-between p-4 min-h-[260px]">
              <div>
                {product.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-36 object-cover rounded-xl bg-secondary mb-3.5"
                  />
                )}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-foreground font-sans line-clamp-1">
                    {product.name}
                  </h3>
                  <span className="text-sm font-bold text-foreground shrink-0">
                    ${Number(product.price).toFixed(2)}
                  </span>
                </div>
                {product.store && (
                  <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider block mt-1">
                    Store: {product.store.name}
                  </span>
                )}
                {product.category && (
                  <span className="text-xs text-muted-foreground block">
                    Category: {product.category.name}
                  </span>
                )}
                <p className="text-xs text-muted-foreground mt-2.5 line-clamp-2">
                  {product.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-4">
                <Link
                  href={`/products/${product.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Public view
                </Link>
                <button
                  onClick={() => setProductToDelete(product)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title={hasStores ? "No Products Listed" : "Create Store First"}
          description={
            hasStores
              ? "You haven't listed any products yet. Add products to start making sales."
              : "You need to create a store before you can add products to it."
          }
          actionLabel={hasStores ? "Add Product" : "Create Store"}
          actionHref={hasStores ? "/dashboard/products/new" : "/dashboard/stores/new"}
        />
      )}

      {/* Delete Confirmation Modal */}
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
              disabled={isDeleting}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-destructive px-4 text-sm font-semibold text-white hover:bg-destructive/95 transition-colors cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserStores, deleteStore } from "@/lib/database";
import type { Store } from "@/types";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import { Plus, Store as StoreIcon, Trash2, Edit, Eye } from "lucide-react";

export default function DashboardStoresPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Deletion modal state
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStores = async () => {
    if (!user) return;
    try {
      const data = await getUserStores(user.id);
      setStores(data);
    } catch (err) {
      console.error("Error fetching stores:", err);
      showToast("Failed to load stores", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [user]);

  const handleDeleteConfirm = async () => {
    if (!storeToDelete) return;
    setIsDeleting(true);
    try {
      await deleteStore(storeToDelete.id);
      showToast(`Store "${storeToDelete.name}" deleted successfully`, "success");
      setStores((prev) => prev.filter((s) => s.id !== storeToDelete.id));
      setStoreToDelete(null);
    } catch (err) {
      console.error("Error deleting store:", err);
      showToast("Failed to delete store. Make sure it contains no products first if restricted.", "error");
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
            My Stores
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your stores or create a new store front.
          </p>
        </div>
        {stores.length > 0 && (
          <Link
            href="/dashboard/stores/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/95 gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create Store
          </Link>
        )}
      </div>

      {/* Stores List */}
      {stores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map((store) => (
            <Card key={store.id} hover className="flex flex-col justify-between min-h-[180px]">
              <div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <StoreIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground font-sans line-clamp-1">
                      {store.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      Created on {new Date(store.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                  {store.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-border/40 mt-4">
                <Link
                  href={`/stores/${store.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Public view
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/stores/${store.id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Edit Store"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setStoreToDelete(store)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Delete Store"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={StoreIcon}
          title="No Stores Yet"
          description="Create your first digital storefront to start showcasing and selling your products."
          actionLabel="Create Store"
          actionHref="/dashboard/stores/new"
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!storeToDelete}
        onClose={() => setStoreToDelete(null)}
        title="Delete Store"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-bold text-foreground">"{storeToDelete?.name}"</span>?
            This action is permanent and will delete all associated products as well.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <button
              onClick={() => setStoreToDelete(null)}
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
              {isDeleting ? "Deleting..." : "Delete Store"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

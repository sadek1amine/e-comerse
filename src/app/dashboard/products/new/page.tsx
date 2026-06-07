"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { getUserStores, getCategories, createProduct } from "@/lib/database";
import { ProductForm } from "@/components/products/ProductForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Store, Category, CreateProductInput } from "@/types";

function NewProductPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const storeIdParam = searchParams.get("storeId");

  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadFormData() {
      try {
        const [userStores, globalCategories] = await Promise.all([
          getUserStores(user!.id),
          getCategories(),
        ]);
        setStores(userStores);
        setCategories(globalCategories);

        if (userStores.length === 0) {
          showToast("Please create a store first before listing products", "info");
          router.push("/dashboard/stores/new");
        }
      } catch (err) {
        console.error("Error loading product form options:", err);
        showToast("Failed to load categories/stores", "error");
      } finally {
        setLoading(false);
      }
    }

    loadFormData();
  }, [user, router, showToast]);

  const handleSubmit = async (data: CreateProductInput) => {
    try {
      await createProduct(data);
      showToast("Product listed successfully!", "success");
      
      // Redirect back to either specific store detail page or products list page
      if (storeIdParam) {
        router.push(`/dashboard/stores/${storeIdParam}`);
      } else {
        router.push("/dashboard/products");
      }
      router.refresh();
    } catch (err) {
      console.error("Error listing product:", err);
      showToast("Failed to list product. Try again.", "error");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Double check that we have stores
  if (stores.length === 0) {
    return null;
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fadeIn">
      {/* Back button & Title */}
      <div className="space-y-4">
        <Link
          href={storeIdParam ? `/dashboard/stores/${storeIdParam}` : "/dashboard/products"}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-sans">
            Add Product
          </h1>
          <p className="text-muted-foreground mt-1">
            List a new item for sale in one of your stores.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border/40 bg-card">
        <ProductForm
          stores={stores}
          categories={categories}
          preselectedStoreId={storeIdParam}
          onSubmit={handleSubmit}
          submitLabel="List Product"
        />
      </div>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NewProductPageContent />
    </Suspense>
  );
}

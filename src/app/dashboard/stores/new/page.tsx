"use client";

import { createStore } from "@/lib/database";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { StoreForm } from "@/components/stores/StoreForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewStorePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (data: { name: string; description: string }) => {
    if (!user) return;
    try {
      await createStore(user.id, data);
      showToast("Store created successfully!", "success");
      router.push("/dashboard/stores");
      router.refresh();
    } catch (err) {
      console.error("Error creating store:", err);
      showToast("Failed to create store. Try again.", "error");
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fadeIn">
      {/* Back button & Title */}
      <div className="space-y-4">
        <Link
          href="/dashboard/stores"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stores
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-sans">
            Create Store
          </h1>
          <p className="text-muted-foreground mt-1">
            Setup a new storefront to list your products.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border/40 bg-card">
        <StoreForm onSubmit={handleSubmit} submitLabel="Create Store" />
      </div>
    </div>
  );
}

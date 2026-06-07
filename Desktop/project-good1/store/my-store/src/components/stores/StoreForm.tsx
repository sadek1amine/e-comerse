"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface StoreFormProps {
  initialData?: {
    name: string;
    description: string;
  };
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
  submitLabel?: string;
}

export function StoreForm({
  initialData,
  onSubmit,
  submitLabel = "Save Store",
}: StoreFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = "Store name is required";
    } else if (name.length < 3) {
      newErrors.name = "Store name must be at least 3 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Store description is required";
    } else if (description.length < 10) {
      newErrors.description = "Store description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ name, description });
    } catch (err) {
      console.error("Store form submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Store Name"
        id="store-name"
        placeholder="Enter your store name (e.g. Pixel Gear)"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
        }}
        error={errors.name}
        disabled={isSubmitting}
      />

      <Textarea
        label="Description"
        id="store-description"
        placeholder="Describe what your store sells and what makes it special..."
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          if (errors.description)
            setErrors((prev) => ({ ...prev, description: undefined }));
        }}
        error={errors.description}
        rows={4}
        disabled={isSubmitting}
      />

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

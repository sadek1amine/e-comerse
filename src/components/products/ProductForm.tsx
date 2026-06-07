"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import type { Store, Category, CreateProductInput } from "@/types";

interface ProductFormProps {
  stores: Store[];
  categories: Category[];
  preselectedStoreId?: string | null;
  initialData?: {
    name: string;
    description: string;
    price: number;
    image: string;
    store_id: string;
    category_id: string;
  };
  onSubmit: (data: CreateProductInput) => Promise<void>;
  submitLabel?: string;
}

export function ProductForm({
  stores,
  categories,
  preselectedStoreId,
  initialData,
  onSubmit,
  submitLabel = "Save Product",
}: ProductFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [priceStr, setPriceStr] = useState(initialData?.price ? String(initialData.price) : "");
  const [image, setImage] = useState(
    initialData?.image ??
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60"
  );
  const [storeId, setStoreId] = useState(
    preselectedStoreId || initialData?.store_id || (stores.length > 0 ? stores[0].id : "")
  );
  const [categoryId, setCategoryId] = useState(
    initialData?.category_id || (categories.length > 0 ? categories[0].id : "")
  );

  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    price?: string;
    image?: string;
    storeId?: string;
    categoryId?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!description.trim()) {
      newErrors.description = "Product description is required";
    } else if (description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    const priceNum = parseFloat(priceStr);
    if (!priceStr) {
      newErrors.price = "Price is required";
    } else if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    if (!image.trim()) {
      newErrors.image = "Image URL is required";
    } else if (!image.startsWith("http://") && !image.startsWith("https://")) {
      newErrors.image = "Please enter a valid HTTP(S) image URL";
    }

    if (!storeId) {
      newErrors.storeId = "Please select a store";
    }

    if (!categoryId) {
      newErrors.categoryId = "Please select a category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        description,
        price: parseFloat(priceStr),
        image,
        store_id: storeId,
        category_id: categoryId,
      });
    } catch (err) {
      console.error("Product form submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const storeOptions = stores.map((s) => ({ value: s.id, label: s.name }));
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Selection */}
        {preselectedStoreId ? (
          <div className="w-full flex flex-col gap-1.5 opacity-70">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Selected Store
            </label>
            <div className="flex h-11 w-full items-center rounded-xl border border-border bg-muted px-4 text-sm font-medium text-muted-foreground">
              {stores.find((s) => s.id === storeId)?.name ?? "Selected Store"}
            </div>
          </div>
        ) : (
          <Select
            label="Select Store"
            id="product-store"
            options={storeOptions}
            value={storeId}
            onChange={(e) => {
              setStoreId(e.target.value);
              if (errors.storeId) setErrors((prev) => ({ ...prev, storeId: undefined }));
            }}
            error={errors.storeId}
            disabled={isSubmitting}
          />
        )}

        {/* Category Selection */}
        <Select
          label="Category"
          id="product-category"
          options={categoryOptions}
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: undefined }));
          }}
          error={errors.categoryId}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <Input
          label="Product Name"
          id="product-name"
          placeholder="e.g. Wireless Headset"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={errors.name}
          disabled={isSubmitting}
        />

        {/* Price */}
        <Input
          label="Price ($)"
          id="product-price"
          type="number"
          step="0.01"
          placeholder="99.99"
          value={priceStr}
          onChange={(e) => {
            setPriceStr(e.target.value);
            if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
          }}
          error={errors.price}
          disabled={isSubmitting}
        />
      </div>

      {/* Image URL */}
      <Input
        label="Product Image URL"
        id="product-image"
        placeholder="Enter Unsplash or other external image URL (must configure domains in Next.js)"
        value={image}
        onChange={(e) => {
          setImage(e.target.value);
          if (errors.image) setErrors((prev) => ({ ...prev, image: undefined }));
        }}
        error={errors.image}
        disabled={isSubmitting}
      />

      {/* Preview Image if valid */}
      {image && (image.startsWith("http://") || image.startsWith("https://")) && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            Image Preview
          </span>
          <div className="w-40 h-28 border border-border rounded-xl overflow-hidden bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Preview" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Description */}
      <Textarea
        label="Product Description"
        id="product-description"
        placeholder="Provide high-quality technical specs, benefits, and instructions..."
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          if (errors.description)
            setErrors((prev) => ({ ...prev, description: undefined }));
        }}
        error={errors.description}
        rows={5}
        disabled={isSubmitting}
      />

      {/* Action Button */}
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

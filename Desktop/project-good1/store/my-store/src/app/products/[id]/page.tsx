"use client";

import { use, useEffect, useState } from "react";
import { getProductById, getStoreProducts } from "@/lib/database";
import type { Product } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Tag, Store, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PublicProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProductDetails() {
      try {
        const productData = await getProductById(productId);
        setProduct(productData);

        if (productData) {
          const storeProducts = await getStoreProducts(productData.store_id);
          // Filter out the current product itself
          setRelatedProducts(
            storeProducts.filter((p) => p.id !== productId).slice(0, 3)
          );
        }
      } catch (err) {
        console.error("Error loading public product details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProductDetails();
  }, [productId]);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="text-muted-foreground">The product you are looking for does not exist or has been removed.</p>
        <Link href="/products" className="inline-flex text-primary hover:underline items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12 animate-fadeIn">
      {/* Back button */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      {/* Main product view grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left Column: Image Card */}
        <div className="w-full">
          <Card className="p-2 border border-border/40 overflow-hidden bg-card rounded-3xl aspect-video lg:aspect-square flex items-center justify-center relative">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span className="text-muted-foreground">No Image</span>
            )}
          </Card>
        </div>

        {/* Right Column: Metadata & Details */}
        <div className="flex flex-col justify-between py-2 space-y-8">
          <div className="space-y-4">
            {/* Meta Tags */}
            <div className="flex flex-wrap gap-2 text-xs">
              {product.category && (
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Tag className="w-3.5 h-3.5" />
                  {product.category.name}
                </Link>
              )}
              {product.store && (
                <Link
                  href={`/stores/${product.store_id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                >
                  <Store className="w-3.5 h-3.5" />
                  {product.store.name}
                </Link>
              )}
            </div>

            {/* Title & Price */}
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground font-sans">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-foreground">
                ${Number(product.price).toFixed(2)}
              </p>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-border/40 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product Description</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Checkout CTA simulation */}
          <div className="pt-6 border-t border-border/40">
            <button
              onClick={() => alert("This is a frontend demonstration. Checkout flow is not in MVP scope.")}
              className="w-full inline-flex h-12 items-center justify-center rounded-xl bg-primary text-white font-semibold hover:bg-primary/95 transition-colors gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              Purchase from {product.store?.name ?? "Merchant"}
            </button>
          </div>
        </div>
      </div>

      {/* Related Products from same store */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-border/40">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground font-sans">
              More from {product.store?.name ?? "this merchant"}
            </h2>
            <p className="text-muted-foreground text-xs mt-1">
              Check out other active listings under the same store.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={{ ...p, store: product.store }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

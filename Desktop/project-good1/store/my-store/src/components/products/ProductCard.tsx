import type { Product } from "@/types";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { ArrowRight, Tag, Store } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card hover className="flex flex-col justify-between overflow-hidden p-0 group">
      <div>
        {/* Product Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-secondary">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          {/* Price Tag Badge */}
          <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/40 shadow-sm">
            <span className="text-sm font-bold text-foreground">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-foreground font-sans line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            
            {/* Meta badges */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              {product.category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground">
                  <Tag className="w-3 h-3" />
                  {product.category.name}
                </span>
              )}
              {product.store && (
                <Link
                  href={`/stores/${product.store_id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                >
                  <Store className="w-3 h-3" />
                  {product.store.name}
                </Link>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </div>
      </div>

      {/* Action footer */}
      <div className="px-5 pb-5 pt-3 border-t border-border/40 flex justify-end">
        <Link
          href={`/products/${product.id}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:text-primary/80 transition-colors"
        >
          View Details
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </Card>
  );
}

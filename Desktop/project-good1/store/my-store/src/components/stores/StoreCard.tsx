import type { Store } from "@/types";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { ArrowRight, Store as StoreIcon } from "lucide-react";

interface StoreCardProps {
  store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
  return (
    <Card hover className="flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
      {/* Decorative Gradient Background overlay */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-indigo-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
      
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            <StoreIcon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-foreground font-sans line-clamp-1">
            {store.name}
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
          {store.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border/40 mt-6">
        <span className="text-xs text-muted-foreground">
          Launched {new Date(store.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
        </span>
        <Link
          href={`/stores/${store.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Visit Store
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </Card>
  );
}

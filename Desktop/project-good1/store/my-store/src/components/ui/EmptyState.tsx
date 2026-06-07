import * as React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-16 rounded-2xl border border-dashed border-border/60 bg-card/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-1 font-sans">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {actionLabel}
        </Link>
      )}

      {!actionHref && actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

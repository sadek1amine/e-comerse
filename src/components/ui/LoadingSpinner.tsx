import * as React from "react";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

export function LoadingSpinner({ size = "md", fullPage = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  const spinner = (
    <div
      className={`animate-spin rounded-full border-t-primary border-r-transparent border-b-transparent border-l-transparent ${sizeClasses[size]}`}
      style={{ borderColor: "var(--primary) transparent transparent transparent" }}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{spinner}</div>;
}

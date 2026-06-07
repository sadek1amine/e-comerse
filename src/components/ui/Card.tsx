import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-2xl border border-border/40 bg-card p-6 text-card-foreground shadow-sm transition-all duration-300 ${
          hover ? "hover:-translate-y-1 hover:shadow-md hover:border-border/80" : ""
        } ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export { Card };

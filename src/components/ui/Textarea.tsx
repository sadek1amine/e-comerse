import * as React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </label>
        )}
        <textarea
          className={`flex min-h-[100px] w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground ring-offset-background transition-all placeholder:text-muted-foreground hover:border-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
          } ${className}`}
          ref={ref}
          {...props}
        />
        {error && (
          <span className="text-xs text-destructive font-medium animate-fadeIn">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };

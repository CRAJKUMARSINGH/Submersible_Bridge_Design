import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-card-border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6 border-b border-card-border", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-6", className)} {...props} />;
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono text-primary",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-xs font-medium uppercase tracking-wider text-muted-foreground", className)}
      {...props}
    />
  );
}

type BadgeVariant = "default" | "success" | "destructive" | "warning";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: BadgeVariant }) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-muted text-foreground",
    success: "bg-success/20 text-success border border-success/30",
    destructive: "bg-destructive/20 text-destructive border border-destructive/30",
    warning: "bg-primary/20 text-primary border border-primary/30",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function FormulaTrace({
  expression,
  result,
  unit,
}: {
  expression: React.ReactNode;
  result: number;
  unit: string;
}) {
  return (
    <div className="mt-2 rounded-md bg-background/50 border border-card-border p-3 text-sm font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 overflow-x-auto">
      <div className="text-muted-foreground whitespace-nowrap">{expression}</div>
      <div className="text-primary font-bold whitespace-nowrap">
        = {result.toFixed(2)} <span className="text-muted-foreground text-xs">{unit}</span>
      </div>
    </div>
  );
}

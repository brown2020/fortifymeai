import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      secondary: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      outline: "bg-transparent text-slate-300 border-slate-600",
      success: "bg-green-500/10 text-green-400 border-green-500/20",
      warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";




import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50 rounded-lg";

    const variants = {
      primary:
        "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 focus-visible:ring-emerald-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40",
      secondary:
        "bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:ring-slate-500 border border-slate-700",
      outline:
        "border border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-slate-500",
      ghost:
        "text-slate-300 hover:bg-slate-800/50 hover:text-white focus-visible:ring-slate-500",
      danger:
        "bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-rose-600 hover:to-red-600 focus-visible:ring-rose-500 shadow-lg shadow-rose-500/25",
      link:
        "text-emerald-400 underline-offset-4 hover:underline hover:text-emerald-300",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10",
    };

    const classes = cn(baseStyles, variants[variant], sizes[size], className);

    if (asChild && React.isValidElement(children)) {
      const childClassName = (children.props as { className?: string }).className;
      return React.cloneElement(children, {
        className: cn(classes, childClassName),
      } as Partial<typeof children.props>);
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

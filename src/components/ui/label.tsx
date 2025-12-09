import { LabelHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "block text-sm font-medium text-slate-300 mb-1.5",
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";

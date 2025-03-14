"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl",
  secondary:
    "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-xs hover:shadow-md",
  outline:
    "bg-transparent text-blue-600 hover:bg-blue-50 border border-blue-200",
  ghost: "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2",
  lg: "px-8 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition duration-150 ease-in-out transform hover:-translate-y-0.5";
  const styles = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}

"use client";

import { ReactNode } from "react";
import { COLORS } from "../../lib/constants";
import { cn } from "../../lib/utils";

type ColorType = "primary" | "secondary" | "success";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({
  children,
  className = "",
  hover = true,
}: CardProps) {
  const baseStyles =
    "bg-white rounded-2xl p-8 shadow-lg border border-gray-100";
  const hoverStyles = hover
    ? "hover:shadow-xl transition-shadow duration-300"
    : "";

  return (
    <div className={cn(baseStyles, hoverStyles, className)}>{children}</div>
  );
}

export function CardIcon({
  icon: Icon,
  color = "primary",
}: {
  icon: React.ElementType;
  color?: ColorType;
}) {
  return (
    <div
      className={cn(
        `${COLORS[color].light} w-14 h-14 rounded-xl flex items-center justify-center mb-6`
      )}
    >
      <Icon className="w-7 h-7" />
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{children}</h3>
  );
}

export function CardDescription({ children }: { children: ReactNode }) {
  return <p className="text-gray-600 leading-relaxed">{children}</p>;
}

export function CardList({ children }: { children: ReactNode }) {
  return <ul className="mt-6 space-y-2">{children}</ul>;
}

export function CardListItem({
  children,
  color = "primary",
}: {
  children: ReactNode;
  color?: ColorType;
}) {
  return (
    <li className="flex items-center text-sm text-gray-600">
      <span
        className={cn(`w-1.5 h-1.5 ${COLORS[color].accent} rounded-full mr-2`)}
      />
      {children}
    </li>
  );
}

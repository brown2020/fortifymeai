"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FlaskConical,
  BookOpen,
  Heart,
  BarChart3,
  Calendar,
} from "lucide-react";
import { Button } from "./ui/button";
import { ROUTES } from "../lib/constants";
import { cn } from "@/lib/utils";

const authenticatedLinks = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.supplements, label: "Supplements", icon: FlaskConical },
  { href: ROUTES.health, label: "Health", icon: Heart },
  { href: ROUTES.analytics, label: "Analytics", icon: BarChart3 },
  { href: ROUTES.calendar, label: "Calendar", icon: Calendar },
  { href: ROUTES.research, label: "Research", icon: BookOpen },
] as const;

export function NavbarAuthLinks({
  pathname,
  variant,
  onNavigate,
}: {
  pathname: string;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  return (
    <>
      {authenticatedLinks.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href;
        if (variant === "desktop") {
          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 text-slate-400 hover:text-white hover:bg-slate-800/50",
                  active && "bg-slate-800/80 text-white"
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-emerald-400")} />
                {link.label}
              </Button>
            </Link>
          );
        }
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
              active
                ? "bg-slate-800/80 text-white"
                : "text-slate-300 hover:bg-slate-800/50"
            )}
          >
            <Icon className={cn("h-4 w-4", active && "text-emerald-400")} />
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

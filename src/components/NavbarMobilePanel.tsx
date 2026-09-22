"use client";

import Link from "next/link";
import { LogOut, Sparkles, User } from "lucide-react";
import type { User as FirebaseUser } from "firebase/auth";
import { ROUTES } from "../lib/constants";
import { cn } from "@/lib/utils";
import { NavbarAuthLinks } from "./NavbarAuthLinks";

export function NavbarMobilePanel({
  user,
  loading,
  pathname,
  onClose,
  onLogout,
}: {
  user: FirebaseUser | null;
  loading: boolean;
  pathname: string;
  onClose: () => void;
  onLogout: () => void;
}) {
  if (loading) {
    return (
      <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
        <div className="px-4 py-4 text-sm text-slate-500">Loading…</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
        <div className="px-4 py-4 space-y-1">
          <NavbarAuthLinks pathname={pathname} variant="mobile" onNavigate={onClose} />
          <div className="pt-2 mt-2 border-t border-slate-700/50">
            <Link
              href={ROUTES.profile}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                pathname === ROUTES.profile
                  ? "bg-slate-800/80 text-white"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <User className="h-5 w-5" />
              Account
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
      <div className="px-4 py-4 space-y-2">
        <Link
          href={ROUTES.login}
          onClick={onClose}
          className="block px-4 py-3 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href={ROUTES.signup}
          onClick={onClose}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white transition-colors"
        >
          <Sparkles className="h-5 w-5" />
          Get Started
        </Link>
      </div>
    </div>
  );
}

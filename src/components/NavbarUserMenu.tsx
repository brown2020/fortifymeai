"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LogOut, User } from "lucide-react";
import { ROUTES } from "../lib/constants";

export function NavbarUserMenu({
  displayName,
  email,
  safePhotoUrl,
  initial,
  isOpen,
  setIsOpen,
  onLogout,
}: {
  displayName: string;
  email?: string | null;
  safePhotoUrl: string | null;
  initial: string;
  isOpen: boolean;
  setIsOpen: (open: boolean | ((v: boolean) => boolean)) => void;
  onLogout: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-slate-300 hover:bg-slate-800/50 hover:text-white"
        aria-expanded={isOpen}
        aria-label="Open account menu"
      >
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 text-sm font-semibold text-emerald-200">
          {safePhotoUrl ? (
            <Image
              src={safePhotoUrl}
              alt=""
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-slate-700/70 bg-slate-900/95 p-2 shadow-xl shadow-black/30 backdrop-blur-xl">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-white">{displayName}</p>
            {email ? <p className="truncate text-xs text-slate-500">{email}</p> : null}
          </div>
          <Link
            href={ROUTES.profile}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/70 hover:text-white"
          >
            <User className="h-4 w-4" />
            Account
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-300 hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

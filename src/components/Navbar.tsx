"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../lib/store/auth-store";
import {
  Pill,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { NavbarAuthLinks } from "./NavbarAuthLinks";
import { NavbarMobilePanel } from "./NavbarMobilePanel";
import { NavbarUserMenu } from "./NavbarUserMenu";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { APP_NAME, ROUTES } from "../lib/constants";


export default function Navbar() {
  const { user, loading, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
      await logout();
      window.location.href = ROUTES.home;
    } catch {
      // Logout failed — user stays on current page
    }
  };

  // Close account menu on outside click / Escape
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isUserMenuOpen]);

  const displayName = user?.displayName || user?.email || "Account";
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";
  const safePhotoUrl = user?.photoURL?.startsWith("https://lh3.googleusercontent.com/")
    ? user.photoURL
    : null;

  return (
    <nav className="fixed w-full top-0 z-50 glass-card border-b border-slate-700/50 rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={ROUTES.home} className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 
                border border-emerald-500/20 group-hover:border-emerald-500/40 transition-[color,background-color,border-color,transform,box-shadow,opacity]">
                <Pill className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-xl font-bold gradient-text">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {!loading && user ? (
              <>
                <NavbarAuthLinks pathname={pathname} variant="desktop" />
                <div
                  ref={userMenuRef}
                  className="relative ml-2 pl-2 border-l border-slate-700/50"
                >
                  <NavbarUserMenu
                    displayName={displayName}
                    email={user.email}
                    safePhotoUrl={safePhotoUrl}
                    initial={initial}
                    isOpen={isUserMenuOpen}
                    setIsOpen={setIsUserMenuOpen}
                    onLogout={handleLogout}
                  />
                </div>
              </>
            ) : !loading ? (
              <div className="flex items-center gap-2">
                <Link href={ROUTES.login}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-slate-300 hover:text-white hover:bg-slate-800/50"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href={ROUTES.signup}>
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 
                      hover:from-emerald-600 hover:to-teal-600 text-white gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Get Started
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg 
                text-slate-400 hover:text-white hover:bg-slate-800/50 
                focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">
                {isMenuOpen ? "Close menu" : "Open menu"}
              </span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <NavbarMobilePanel
          user={user}
          loading={loading}
          pathname={pathname}
          onClose={() => setIsMenuOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../lib/store/auth-store";
import { 
  Pill, 
  Menu, 
  X, 
  LayoutDashboard, 
  FlaskConical, 
  BookOpen, 
  User,
  LogOut,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { APP_NAME, ROUTES } from "../lib/constants";
import { cn } from "@/lib/utils";

// Navigation links configuration
const navLinks = {
  authenticated: [
    { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
    { href: ROUTES.supplements, label: "Supplements", icon: FlaskConical },
    { href: ROUTES.research, label: "Research", icon: BookOpen },
    { href: ROUTES.profile, label: "Profile", icon: User },
  ],
};

export default function Navbar() {
  const { user, loading, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = ROUTES.home;
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed w-full top-0 z-50 glass-card border-b border-slate-700/50 rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={ROUTES.home} className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 
                border border-emerald-500/20 group-hover:border-emerald-500/40 transition-all">
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
                {navLinks.authenticated.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
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
                })}
                <div className="ml-2 pl-2 border-l border-slate-700/50">
                  <Button 
                    onClick={handleLogout} 
                    variant="ghost" 
                    size="sm"
                    className="gap-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
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
        <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {!loading && user ? (
              <>
                {navLinks.authenticated.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                        active 
                          ? "bg-slate-800/80 text-white" 
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", active && "text-emerald-400")} />
                      {link.label}
                    </Link>
                  );
                })}
                <div className="pt-2 mt-2 border-t border-slate-700/50">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium 
                      text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign out
                  </button>
                </div>
              </>
            ) : !loading ? (
              <div className="space-y-2">
                <Link
                  href={ROUTES.login}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-base font-medium 
                    text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href={ROUTES.signup}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-medium 
                    bg-gradient-to-r from-emerald-500 to-teal-500 text-white transition-colors"
                >
                  <Sparkles className="h-5 w-5" />
                  Get Started
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}

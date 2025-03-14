"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { Pill, Menu, X } from "lucide-react";
import { useState } from "react";
import Button from "./ui/Button";
import { APP_NAME, ROUTES } from "../lib/constants";

// Define types for navigation links
type NavLinkAuthenticated = {
  href: string;
  label: string;
};

type NavLinkUnauthenticated = {
  href: string;
  label: string;
  variant: "primary" | "secondary" | "outline" | "ghost";
};

// Navigation links configuration for DRY code
const navLinks = {
  authenticated: [
    { href: ROUTES.dashboard, label: "Dashboard" },
    { href: ROUTES.supplements, label: "My Supplements" },
    { href: ROUTES.research, label: "Research" },
    { href: ROUTES.profile, label: "Profile" },
  ] as NavLinkAuthenticated[],
  unauthenticated: [
    { href: ROUTES.login, label: "Sign in", variant: "ghost" },
    { href: ROUTES.signup, label: "Sign up", variant: "primary" },
  ] as NavLinkUnauthenticated[],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <nav className="bg-white shadow-xs fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={ROUTES.home} className="flex items-center">
              <Pill className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                {navLinks.authenticated.map((link) => (
                  <Button
                    key={link.href}
                    href={link.href}
                    variant="ghost"
                    size="sm"
                  >
                    {link.label}
                  </Button>
                ))}
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  Sign out
                </Button>
              </>
            ) : (
              <>
                {navLinks.unauthenticated.map((link) => (
                  <Button
                    key={link.href}
                    href={link.href}
                    variant={link.variant}
                    size="sm"
                  >
                    {link.label}
                  </Button>
                ))}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-blue-500"
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
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {user ? (
              <>
                {navLinks.authenticated.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                {navLinks.unauthenticated.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

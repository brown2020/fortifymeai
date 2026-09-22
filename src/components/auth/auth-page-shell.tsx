import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export function AuthBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="floating-orb floating-orb-1" />
      <div className="floating-orb floating-orb-2" />
    </div>
  );
}

export function AuthBackLink() {
  return (
    <Link
      href={ROUTES.home}
      className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Home
    </Link>
  );
}

export function AuthPageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pt-20 pb-12 page-transition">
      <AuthBackground />
      <div className="relative max-w-md w-full mx-auto px-4 pt-8">{children}</div>
    </div>
  );
}

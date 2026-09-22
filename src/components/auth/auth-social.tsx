"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export function AuthDivider({ label = "Or continue with" }: { label?: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-700" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-transparent text-slate-500">{label}</span>
      </div>
    </div>
  );
}

export function GoogleSignInButton({
  onClick,
  disabled,
  label = "Sign in with Google",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant="outline"
      disabled={disabled}
      className="w-full gap-2"
    >
      <Image
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        width={20}
        height={20}
      />
      {label}
    </Button>
  );
}

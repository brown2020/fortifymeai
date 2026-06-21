"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";

export function HardSignOutButton() {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuthStore();

  const handleHardSignOut = async () => {
    try {
      setLoading(true);
      await logout();
    } finally {
      window.location.href = ROUTES.home;
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      isLoading={loading}
      onClick={handleHardSignOut}
      className="gap-2 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10"
    >
      <LogOut className="h-4 w-4" />
      Hard sign out
    </Button>
  );
}

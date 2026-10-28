import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

/** Shown when the server session is valid but the Firebase client user never arrives. */
export function ClientSessionNotice() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-lg mx-auto glass-card p-8 text-center">
        <h1 className="text-2xl font-semibold text-white mb-2">Still connecting your account</h1>
        <p className="text-slate-400 mb-6">
          This page needs your signed-in browser session. Refresh, or sign in again.
        </p>
        <Link href={ROUTES.login}>
          <Button>Sign in</Button>
        </Link>
      </div>
    </div>
  );
}

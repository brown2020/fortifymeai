import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
      </div>
      
      <div className="relative text-center">
        <div className="p-4 rounded-2xl bg-slate-800/50 w-fit mx-auto mb-4">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
        </div>
        <p className="text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

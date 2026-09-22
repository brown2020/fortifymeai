export function PageBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="floating-orb floating-orb-1" />
      <div className="floating-orb floating-orb-2" />
    </div>
  );
}

export function FullPageSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <PageBackground />
      <div className="relative text-center">
        <div className="p-4 rounded-2xl bg-slate-800/50 w-fit mx-auto mb-4">
          <div
            className="h-8 w-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"
            aria-hidden
          />
        </div>
        <p className="text-slate-400">{label}</p>
      </div>
    </div>
  );
}

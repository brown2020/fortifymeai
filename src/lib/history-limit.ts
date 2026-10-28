export function clampHistoryLimit(limit: number | undefined): number {
  if (typeof limit !== "number" || !Number.isFinite(limit)) return 20;
  return Math.min(50, Math.max(1, Math.floor(limit)));
}

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export type HealthPayload = {
  ok: boolean;
  service: "fortifymeai";
  timestamp: string;
  checks: {
    firebase_public: boolean;
    firebase_admin: boolean;
  };
};

type EnvLike = Record<string, string | undefined>;

/** Pure readiness checks for unit tests and the public probe. */
export function evaluateHealth(env: EnvLike = process.env): HealthPayload {
  const firebase_public = Boolean(
    env.NEXT_PUBLIC_FIREBASE_API_KEY && env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
  const firebase_admin = Boolean(
    env.FIREBASE_PROJECT_ID &&
      env.FIREBASE_CLIENT_EMAIL &&
      env.FIREBASE_PRIVATE_KEY
  );

  return {
    ok: firebase_public,
    service: "fortifymeai",
    timestamp: new Date().toISOString(),
    checks: { firebase_public, firebase_admin },
  };
}

/**
 * Public liveness/readiness probe for monitoring.
 * Does not leak secrets — only boolean configuration presence.
 */
export async function GET() {
  const body = evaluateHealth();
  return NextResponse.json(body, {
    status: body.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}

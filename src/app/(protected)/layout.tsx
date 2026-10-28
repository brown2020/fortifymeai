import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, ROUTES } from "@/lib/constants";
import { verifySessionToken } from "@/lib/session";
import { sessionAccess } from "@/lib/session-access";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    redirect(ROUTES.login);
  }

  const session = await verifySessionToken(sessionToken);
  const access = sessionAccess(session);

  if (access === "unauthorized") {
    redirect(ROUTES.login);
  }

  if (access === "unverified") {
    redirect(ROUTES.verifyEmail);
  }

  return <>{children}</>;
}

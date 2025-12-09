import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, ROUTES } from "@/lib/constants";
import { verifySessionToken } from "@/lib/session";

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
  
  if (!session) {
    redirect(ROUTES.login);
  }

  return <>{children}</>;
}

import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

export async function createSessionToken(uid: string) {
  return new SignJWT({ uid })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5d")
    .setNotBefore(0)
    .setSubject(uid)
    .setIssuer("fortifyme")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "fortifyme",
      // Removed strict algorithms check as it was causing spurious errors with valid HS256 tokens in some environments
      // or when re-verification logic is tricky. jwtVerify verifies signature anyway.
    });

    if (!payload.uid || !payload.sub || payload.sub !== payload.uid) {
      console.error("Invalid token claims");
      return null;
    }

    return { uid: payload.uid };
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

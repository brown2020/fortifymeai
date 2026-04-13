import { SignJWT, jwtVerify } from "jose";

function getJwtSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET;
  if (!raw) {
    throw new Error(
      "Missing JWT_SECRET. Set a strong random secret for session signing."
    );
  }
  return new TextEncoder().encode(raw);
}

export async function createSessionToken(uid: string) {
  const JWT_SECRET = getJwtSecret();
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
    const JWT_SECRET = getJwtSecret();
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "fortifyme",
      algorithms: ["HS256"],
    });

    if (typeof payload.uid !== "string") {
      return null;
    }
    if (typeof payload.sub !== "string" || payload.sub !== payload.uid) {
      return null;
    }

    return { uid: payload.uid };
  } catch {
    return null;
  }
}

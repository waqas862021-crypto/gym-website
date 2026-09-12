import { SignJWT, jwtVerify } from "jose";
import type { AppRole } from "@/lib/roles";

// jose (not jsonwebtoken) specifically because this needs to run inside
// middleware, which executes on the Edge runtime.
export const SESSION_COOKIE = "session";
const SESSION_DURATION = "7d";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET environment variable is not set.");
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  email: string;
  role: AppRole;
};

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret());
}

// A stale role in an existing session token won't reflect a role change
// made after login until the user logs in again — acceptable for now given
// role changes are rare and manual (see the build plan's Phase 2 notes).
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

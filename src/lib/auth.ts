import { SignJWT, jwtVerify } from "jose";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "genesis-token";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const JWT_EXPIRES_IN = "7d";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export async function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({ sub: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRES_IN)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return compare(password, hashed);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Forbidden");
  return user;
}

export async function getUserProfile(userId: string) {
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  return profile ?? null;
}

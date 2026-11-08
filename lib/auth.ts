import { createHmac, randomBytes } from "node:crypto";
import { Role, type User } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/http";
import { hashPassword, verifyPassword } from "@/lib/password";

export { hashPassword, verifyPassword } from "@/lib/password";

const cookieName = "lernwerk_session";
const sessionDays = 14;

function tokenHash(token: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must have at least 32 characters");
  return createHmac("sha256", secret).update(token).digest("hex");
}

export async function startSession(userId: string, response: NextResponse): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { userId, tokenHash: tokenHash(token), expiresAt } });
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

function cookieValue(request: Request): string | null {
  const item = request.headers.get("cookie")?.split(";").map((s) => s.trim())
    .find((s) => s.startsWith(`${cookieName}=`));
  if (!item) return null;
  try { return decodeURIComponent(item.slice(cookieName.length + 1)); } catch { return null; }
}

export async function currentUser(request: Request): Promise<User | null> {
  const token = cookieValue(request);
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: tokenHash(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt <= new Date()) return null;
  return session.user;
}

export async function requireUser(request: Request, roles?: Role[]): Promise<User> {
  const user = await currentUser(request);
  if (!user) throw new HttpError(401, "Anmeldung erforderlich");
  if (roles && !roles.includes(user.role)) throw new HttpError(403, "Keine Berechtigung");
  return user;
}

export async function endSession(request: Request, response: NextResponse): Promise<void> {
  const token = cookieValue(request);
  if (token) await db.session.deleteMany({ where: { tokenHash: tokenHash(token) } });
  response.cookies.set(cookieName, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}

export function safeUser(user: User) {
  return { id: user.id, email: user.email, displayName: user.displayName, role: user.role, avatarColor: user.avatarColor, createdAt: user.createdAt };
}

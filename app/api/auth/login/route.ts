import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { safeUser, startSession, verifyPassword } from "@/lib/auth";
import { assertSameOrigin, errorResponse, HttpError, readJson } from "@/lib/http";

const inputSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const input = inputSchema.parse(await readJson(request));
    const user = await db.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new HttpError(401, "Anmeldedaten ungültig");
    }
    const response = NextResponse.json({ user: safeUser(user) });
    await startSession(user.id, response);
    return response;
  } catch (error) { return errorResponse(error); }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, safeUser, startSession } from "@/lib/auth";
import { assertSameOrigin, errorResponse, HttpError, readJson } from "@/lib/http";

const inputSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(10).max(128),
  displayName: z.string().trim().min(2).max(80),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const input = inputSchema.parse(await readJson(request));
    const email = input.email.toLowerCase();
    if (await db.user.findUnique({ where: { email } })) throw new HttpError(409, "E-Mail-Adresse bereits vergeben");
    const user = await db.user.create({ data: { email, displayName: input.displayName, passwordHash: await hashPassword(input.password) } });
    const response = NextResponse.json({ user: safeUser(user) }, { status: 201 });
    await startSession(user.id, response);
    return response;
  } catch (error) { return errorResponse(error); }
}

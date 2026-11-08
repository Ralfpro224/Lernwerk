import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, requireUser, safeUser } from "@/lib/auth";
import { assertSameOrigin, errorResponse, readJson } from "@/lib/http";

const schema = z.object({ email: z.string().email(), displayName: z.string().min(2).max(80), password: z.string().min(10).max(128), role: z.nativeEnum(Role) });

export async function GET(request: Request) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const users = await db.user.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ users: users.map(safeUser) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireUser(request, [Role.ADMIN]);
    const data = schema.parse(await readJson(request));
    const user = await db.user.create({ data: { email: data.email.toLowerCase(), displayName: data.displayName, role: data.role, passwordHash: await hashPassword(data.password) } });
    return NextResponse.json({ user: safeUser(user) }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}

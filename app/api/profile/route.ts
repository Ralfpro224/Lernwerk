import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, safeUser } from "@/lib/auth";
import { assertSameOrigin, errorResponse, readJson } from "@/lib/http";

const schema = z.object({ displayName: z.string().trim().min(2).max(80), avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/) });

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const data = schema.parse(await readJson(request));
    const updated = await db.user.update({ where: { id: user.id }, data });
    return NextResponse.json({ user: safeUser(updated) });
  } catch (error) { return errorResponse(error); }
}

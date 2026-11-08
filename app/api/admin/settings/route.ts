import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin, errorResponse, readJson } from "@/lib/http";

const schema = z.object({ key: z.string().regex(/^[a-z][a-z0-9._-]{1,79}$/), value: z.unknown() });

export async function GET(request: Request) {
  try {
    await requireUser(request, [Role.ADMIN]);
    return NextResponse.json({ settings: await db.siteSetting.findMany({ orderBy: { key: "asc" } }) });
  } catch (error) { return errorResponse(error); }
}

export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    await requireUser(request, [Role.ADMIN]);
    const { key, value } = schema.parse(await readJson(request));
    const item = await db.siteSetting.upsert({ where: { key }, create: { key, value: value as object }, update: { value: value as object } });
    return NextResponse.json({ item });
  } catch (error) { return errorResponse(error); }
}

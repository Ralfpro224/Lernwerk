import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin, errorResponse, HttpError, readJson } from "@/lib/http";

const schema = z.object({ joinCode: z.string().trim().min(6).max(20) });

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { joinCode } = schema.parse(await readJson(request));
    const classroom = await db.classroom.findUnique({ where: { joinCode: joinCode.toUpperCase() } });
    if (!classroom) throw new HttpError(404, "Klasse nicht gefunden");
    await db.classMember.upsert({ where: { classId_userId: { classId: classroom.id, userId: user.id } }, create: { classId: classroom.id, userId: user.id }, update: {} });
    return NextResponse.json({ classroom: { id: classroom.id, name: classroom.name } });
  } catch (error) { return errorResponse(error); }
}

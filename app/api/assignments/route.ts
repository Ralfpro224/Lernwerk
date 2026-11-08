import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin, errorResponse, HttpError, readJson } from "@/lib/http";

const schema = z.object({ classId: z.string().min(1), lessonId: z.string().min(1), dueAt: z.string().datetime().nullable().optional() });

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const where = user.role === Role.ADMIN ? {} : user.role === Role.TEACHER ? { classroom: { teacherId: user.id } } : { classroom: { members: { some: { userId: user.id } } } };
    const assignments = await db.assignment.findMany({ where, include: { classroom: { select: { id: true, name: true } }, lesson: { select: { id: true, title: true } } }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ assignments });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request, [Role.TEACHER, Role.ADMIN]);
    const input = schema.parse(await readJson(request));
    const classroom = await db.classroom.findUnique({ where: { id: input.classId } });
    if (!classroom || (user.role !== Role.ADMIN && classroom.teacherId !== user.id)) throw new HttpError(403, "Keine Berechtigung");
    const lesson = await db.lesson.findUnique({ where: { id: input.lessonId } });
    if (!lesson || !lesson.published) throw new HttpError(404, "Lektion nicht gefunden");
    const assignment = await db.assignment.create({ data: { classId: input.classId, lessonId: input.lessonId, dueAt: input.dueAt ? new Date(input.dueAt) : null } });
    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}

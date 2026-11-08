import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin, errorResponse, readJson } from "@/lib/http";

const schema = z.object({ name: z.string().trim().min(2).max(100), teacherId: z.string().optional() });

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const where = user.role === Role.ADMIN ? {} : user.role === Role.TEACHER ? { teacherId: user.id } : { members: { some: { userId: user.id } } };
    const classes = await db.classroom.findMany({ where, orderBy: { createdAt: "desc" },
      include: { teacher: { select: { id: true, displayName: true } }, _count: { select: { members: true, assignments: true } } } });
    if (user.role === Role.STUDENT) {
      return NextResponse.json({ classes: classes.map(({ joinCode: _joinCode, ...item }) => item) });
    }
    return NextResponse.json({ classes });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request, [Role.TEACHER, Role.ADMIN]);
    const input = schema.parse(await readJson(request));
    const teacherId = user.role === Role.ADMIN && input.teacherId ? input.teacherId : user.id;
    const teacher = await db.user.findUnique({ where: { id: teacherId } });
    if (!teacher || !([Role.TEACHER, Role.ADMIN] as Role[]).includes(teacher.role)) return NextResponse.json({ error: "Lehrkraft nicht gefunden" }, { status: 400 });
    const joinCode = randomBytes(5).toString("hex").toUpperCase();
    const classroom = await db.classroom.create({ data: { name: input.name, teacherId, joinCode } });
    return NextResponse.json({ classroom }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}

import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin, errorResponse, HttpError, readJson } from "@/lib/http";

type Context = { params: Promise<{ id: string }> };
const schema = z.object({ name: z.string().trim().min(2).max(100) });

async function accessible(request: Request, id: string, write: boolean) {
  const user = await requireUser(request);
  const classroom = await db.classroom.findUnique({ where: { id }, include: {
    teacher: { select: { id: true, displayName: true } },
    members: { include: { user: { select: { id: true, displayName: true, email: true } } } },
    assignments: { include: { lesson: { select: { id: true, title: true } } } },
  } });
  if (!classroom) throw new HttpError(404, "Klasse nicht gefunden");
  const owner = user.role === Role.ADMIN || classroom.teacherId === user.id;
  if (!owner && (write || !classroom.members.some((item) => item.userId === user.id))) throw new HttpError(403, "Keine Berechtigung");
  return { classroom, owner };
}

export async function GET(request: Request, context: Context) {
  try {
    const { classroom, owner } = await accessible(request, (await context.params).id, false);
    if (!owner) {
      // Students see class names and assignments, not classmates' email addresses or join code.
      return NextResponse.json({ classroom: { id: classroom.id, name: classroom.name, teacher: classroom.teacher, assignments: classroom.assignments } });
    }
    return NextResponse.json({ classroom });
  } catch (error) { return errorResponse(error); }
}

export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const id = (await context.params).id;
    await accessible(request, id, true);
    const input = schema.parse(await readJson(request));
    return NextResponse.json({ classroom: await db.classroom.update({ where: { id }, data: input }) });
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const id = (await context.params).id;
    await accessible(request, id, true);
    await db.classroom.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) { return errorResponse(error); }
}

import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin, errorResponse, HttpError } from "@/lib/http";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request, [Role.TEACHER, Role.ADMIN]);
    const { id } = await context.params;
    const item = await db.assignment.findUnique({ where: { id }, include: { classroom: true } });
    if (!item) throw new HttpError(404, "Auftrag nicht gefunden");
    if (user.role !== Role.ADMIN && item.classroom.teacherId !== user.id) throw new HttpError(403, "Keine Berechtigung");
    await db.assignment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) { return errorResponse(error); }
}

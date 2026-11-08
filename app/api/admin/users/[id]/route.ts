import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, requireUser, safeUser } from "@/lib/auth";
import { assertSameOrigin, errorResponse, HttpError, readJson } from "@/lib/http";

const schema = z.object({ displayName: z.string().min(2).max(80).optional(), role: z.nativeEnum(Role).optional(), password: z.string().min(10).max(128).optional() });
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, [Role.ADMIN]);
    const { id } = await context.params;
    const data = schema.parse(await readJson(request));
    if (id === actor.id && data.role && data.role !== Role.ADMIN) throw new HttpError(400, "Eigene Adminrolle kann nicht entfernt werden");
    const user = await db.user.update({ where: { id }, data: { displayName: data.displayName, role: data.role, ...(data.password ? { passwordHash: await hashPassword(data.password) } : {}) } });
    if (data.password) await db.session.deleteMany({ where: { userId: id } });
    return NextResponse.json({ user: safeUser(user) });
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, [Role.ADMIN]);
    const { id } = await context.params;
    if (actor.id === id) throw new HttpError(400, "Eigenes Konto kann nicht gelöscht werden");
    await db.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) { return errorResponse(error); }
}

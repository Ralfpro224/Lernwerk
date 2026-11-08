import { NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin, errorResponse, readJson } from "@/lib/http";
import { contentEntity, parseContent } from "@/lib/admin-content";

type Context = { params: Promise<{ entity: string; id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    await requireUser(request, [Role.ADMIN]);
    const { entity: rawEntity, id } = await context.params;
    const entity = contentEntity(rawEntity);
    const raw = await readJson(request);
    let item;
    switch (entity) {
      case "subjects": item = await db.subject.update({ where: { id }, data: parseContent(entity, raw, true) as Prisma.SubjectUpdateInput }); break;
      case "topics": item = await db.topic.update({ where: { id }, data: parseContent(entity, raw, true) as Prisma.TopicUncheckedUpdateInput }); break;
      case "lessons": item = await db.lesson.update({ where: { id }, data: parseContent(entity, raw, true) as Prisma.LessonUncheckedUpdateInput }); break;
      case "questions": item = await db.question.update({ where: { id }, data: parseContent(entity, raw, true) as Prisma.QuestionUncheckedUpdateInput }); break;
    }
    return NextResponse.json({ item });
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    await requireUser(request, [Role.ADMIN]);
    const { entity: rawEntity, id } = await context.params;
    const entity = contentEntity(rawEntity);
    switch (entity) {
      case "subjects": await db.subject.delete({ where: { id } }); break;
      case "topics": await db.topic.delete({ where: { id } }); break;
      case "lessons": await db.lesson.delete({ where: { id } }); break;
      case "questions": await db.question.delete({ where: { id } }); break;
    }
    return NextResponse.json({ ok: true });
  } catch (error) { return errorResponse(error); }
}

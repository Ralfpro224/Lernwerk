import { NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin, errorResponse, readJson } from "@/lib/http";
import { contentEntity, parseContent } from "@/lib/admin-content";

type Context = { params: Promise<{ entity: string }> };

export async function GET(request: Request, context: Context) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const entity = contentEntity((await context.params).entity);
    const items = entity === "subjects" ? await db.subject.findMany({ orderBy: { sortOrder: "asc" } })
      : entity === "topics" ? await db.topic.findMany({ orderBy: { sortOrder: "asc" } })
      : entity === "lessons" ? await db.lesson.findMany({ orderBy: { sortOrder: "asc" } })
      : await db.question.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    await requireUser(request, [Role.ADMIN]);
    const entity = contentEntity((await context.params).entity);
    const raw = await readJson(request);
    let item;
    switch (entity) {
      case "subjects": item = await db.subject.create({ data: parseContent(entity, raw) as Prisma.SubjectCreateInput }); break;
      case "topics": item = await db.topic.create({ data: parseContent(entity, raw) as Prisma.TopicUncheckedCreateInput }); break;
      case "lessons": item = await db.lesson.create({ data: parseContent(entity, raw) as Prisma.LessonUncheckedCreateInput }); break;
      case "questions": item = await db.question.create({ data: parseContent(entity, raw) as Prisma.QuestionUncheckedCreateInput }); break;
    }
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}

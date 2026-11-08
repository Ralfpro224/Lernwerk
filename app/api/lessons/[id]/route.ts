import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { errorResponse, HttpError } from "@/lib/http";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const lesson = await db.lesson.findUnique({
      where: { id },
      include: {
        topic: { include: { subject: true } },
        questions: { where: { published: true }, orderBy: { sortOrder: "asc" },
          select: { id: true, type: true, prompt: true, config: true, points: true, sortOrder: true } },
      },
    });
    if (!lesson || !lesson.published || !lesson.topic.published || !lesson.topic.subject.published) throw new HttpError(404, "Lektion nicht gefunden");
    const user = await currentUser(request);
    const progress = user ? await db.lessonProgress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: id } } }) : null;
    return NextResponse.json({ lesson, progress }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}

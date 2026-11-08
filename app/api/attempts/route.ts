import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { evaluateAnswer } from "@/lib/question-engine";
import { assertSameOrigin, errorResponse, HttpError, readJson } from "@/lib/http";

const inputSchema = z.object({ questionId: z.string().min(1), response: z.unknown().refine((value) => value !== undefined && value !== null, "Antwort erforderlich") });

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const input = inputSchema.parse(await readJson(request));
    const question = await db.question.findUnique({ where: { id: input.questionId }, include: { lesson: { include: { topic: { include: { subject: true } } } } } });
    if (!question || !question.published || !question.lesson.published || !question.lesson.topic.published || !question.lesson.topic.subject.published) {
      throw new HttpError(404, "Aufgabe nicht gefunden");
    }
    const verdict = evaluateAnswer(question.type, question.answer, input.response);
    const result = await db.$transaction(async (tx) => {
      const attempt = await tx.attempt.create({ data: { userId: user.id, questionId: question.id, response: input.response as object, correct: verdict.correct, points: 0 } });
      let earned = 0;
      if (verdict.correct) {
        const reward = await tx.rewardEntry.createMany({ data: [{ userId: user.id, questionId: question.id, amount: question.points, reason: "Richtige Antwort" }], skipDuplicates: true });
        earned = reward.count ? question.points : 0;
        if (earned) await tx.attempt.update({ where: { id: attempt.id }, data: { points: earned } });
      }
      const questions = await tx.question.findMany({ where: { lessonId: question.lessonId, published: true }, select: { id: true } });
      const ids = questions.map((item) => item.id);
      const attempts = await tx.attempt.findMany({ where: { userId: user.id, questionId: { in: ids } }, select: { questionId: true, correct: true } });
      const answered = new Set(attempts.map((item) => item.questionId)).size;
      const correct = new Set(attempts.filter((item) => item.correct).map((item) => item.questionId)).size;
      const total = await tx.rewardEntry.aggregate({ where: { userId: user.id, questionId: { in: ids } }, _sum: { amount: true } });
      const completedAt = ids.length > 0 && correct === ids.length ? new Date() : null;
      const progress = await tx.lessonProgress.upsert({ where: { userId_lessonId: { userId: user.id, lessonId: question.lessonId } },
        create: { userId: user.id, lessonId: question.lessonId, answered, correct, points: total._sum.amount ?? 0, completedAt },
        update: { answered, correct, points: total._sum.amount ?? 0, completedAt } });
      return { earned, progress };
    });
    return NextResponse.json({ ...verdict, earned: result.earned, progress: result.progress });
  } catch (error) { return errorResponse(error); }
}

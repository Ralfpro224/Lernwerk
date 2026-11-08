import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { errorResponse } from "@/lib/http";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const [progress, rewards] = await Promise.all([
      db.lessonProgress.findMany({ where: { userId: user.id }, include: { lesson: { select: { title: true, topic: { select: { title: true, subject: { select: { title: true } } } } } } }, orderBy: { updatedAt: "desc" } }),
      db.rewardEntry.aggregate({ where: { userId: user.id }, _sum: { amount: true } }),
    ]);
    return NextResponse.json({ progress, points: rewards._sum.amount ?? 0 }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}

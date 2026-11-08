import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { errorResponse } from "@/lib/http";

export async function GET() {
  try {
    const subjects = await db.subject.findMany({
      where: { published: true }, orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: { topics: { where: { published: true }, orderBy: [{ grade: "asc" }, { sortOrder: "asc" }],
        include: { lessons: { where: { published: true }, orderBy: { sortOrder: "asc" },
          select: { id: true, title: true, description: true, sortOrder: true, _count: { select: { questions: { where: { published: true } } } } } } } } },
    });
    return NextResponse.json({ subjects }, { headers: { "Cache-Control": "public, max-age=30" } });
  } catch (error) { return errorResponse(error); }
}

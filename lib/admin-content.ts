import { QuestionType } from "@prisma/client";
import { z } from "zod";
import { HttpError } from "@/lib/http";

const common = { sortOrder: z.number().int().min(0).default(0), published: z.boolean().default(false) };
const schemas = {
  subjects: z.object({ slug: z.string().regex(/^[a-z0-9-]+$/).max(80), title: z.string().min(2).max(100), description: z.string().max(500).default(""), icon: z.string().min(1).max(10).default("✦"), color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#2876df"), ...common }),
  topics: z.object({ subjectId: z.string().min(1), title: z.string().min(2).max(120), description: z.string().max(500).default(""), grade: z.number().int().min(0).max(13), ...common }),
  lessons: z.object({ topicId: z.string().min(1), title: z.string().min(2).max(120), description: z.string().max(500).default(""), ...common }),
  questions: z.object({ lessonId: z.string().min(1), type: z.nativeEnum(QuestionType), prompt: z.string().min(3).max(1000), config: z.unknown(), answer: z.unknown(), points: z.number().int().min(1).max(100).default(10), ...common }),
};

export type ContentEntity = keyof typeof schemas;
export function contentEntity(value: string): ContentEntity {
  if (!(value in schemas)) throw new HttpError(404, "Bereich nicht gefunden");
  return value as ContentEntity;
}

export function parseContent(entity: ContentEntity, value: unknown, partial = false) {
  const schema = schemas[entity];
  return (partial ? schema.partial() : schema).parse(value);
}

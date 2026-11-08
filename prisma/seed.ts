import { PrismaClient, QuestionType, Role } from "@prisma/client";
import { hashPassword } from "../lib/password";

const db = new PrismaClient();

const subjects = [
  { id: "seed-subject-math", slug: "mathematik", title: "Mathematik", description: "Entdecke Zahlen, Formen und Muster.", icon: "✳", color: "#2876df", sortOrder: 1, published: true },
  { id: "seed-subject-language", slug: "sprache", title: "Sprache", description: "Wörter, Sätze und Geschichten verstehen.", icon: "✎", color: "#e87c65", sortOrder: 2, published: true },
  { id: "seed-subject-science", slug: "natur", title: "Natur & Welt", description: "Beobachte unsere Umwelt und stelle Fragen.", icon: "◈", color: "#41a983", sortOrder: 3, published: true },
];

const topics = [
  { id: "seed-topic-math-4", subjectId: "seed-subject-math", title: "Zahlen und Formen", description: "Rechnen und Muster erkennen", grade: 4, sortOrder: 1, published: true },
  { id: "seed-topic-language-4", subjectId: "seed-subject-language", title: "Wörter und Sätze", description: "Sprache spielerisch üben", grade: 4, sortOrder: 1, published: true },
  { id: "seed-topic-science-5", subjectId: "seed-subject-science", title: "Forschen im Alltag", description: "Entdeckungen rund um Natur und Technik", grade: 5, sortOrder: 1, published: true },
];

const lessons = [
  { id: "seed-lesson-math", topicId: "seed-topic-math-4", title: "Zahlenwerkstatt", description: "Neun kurze Aufgaben mit verschiedenen Formaten.", sortOrder: 1, published: true },
  { id: "seed-lesson-language", topicId: "seed-topic-language-4", title: "Wörterdetektive", description: "Wörter und Satzbau verstehen.", sortOrder: 1, published: true },
  { id: "seed-lesson-science", topicId: "seed-topic-science-5", title: "Natur entdecken", description: "Beobachtungen ordnen und erklären.", sortOrder: 1, published: true },
];

const questions: Array<{ id: string; lessonId: string; type: QuestionType; prompt: string; config: object; answer: unknown; points: number; sortOrder: number; published: boolean }> = [
  { id: "seed-q-single", lessonId: "seed-lesson-math", type: "SINGLE_CHOICE", prompt: "Was ist 8 + 7?", config: { choices: [{ id: "a", label: "14" }, { id: "b", label: "15" }, { id: "c", label: "16" }] }, answer: "b", points: 10, sortOrder: 1, published: true },
  { id: "seed-q-multiple", lessonId: "seed-lesson-math", type: "MULTIPLE_CHOICE", prompt: "Welche Zahlen sind gerade? Wähle alle passenden Antworten.", config: { choices: [{ id: "a", label: "3" }, { id: "b", label: "4" }, { id: "c", label: "6" }, { id: "d", label: "9" }] }, answer: ["b", "c"], points: 10, sortOrder: 2, published: true },
  { id: "seed-q-math", lessonId: "seed-lesson-math", type: "MATH", prompt: "Ein Quadrat hat Seiten von 3 cm. Wie groß ist sein Umfang?", config: { unit: "cm" }, answer: { value: 12, tolerance: 0 }, points: 10, sortOrder: 3, published: true },
  { id: "seed-q-matching", lessonId: "seed-lesson-math", type: "MATCHING", prompt: "Ordne jede Rechnung ihrem Ergebnis zu.", config: { left: [{ id: "l1", label: "2 + 5" }, { id: "l2", label: "3 × 4" }], right: [{ id: "r1", label: "12" }, { id: "r2", label: "7" }] }, answer: { l1: "r2", l2: "r1" }, points: 10, sortOrder: 4, published: true },
  { id: "seed-q-order", lessonId: "seed-lesson-math", type: "ORDERING", prompt: "Bringe die Zahlen in aufsteigende Reihenfolge.", config: { items: [{ id: "n8", label: "8" }, { id: "n2", label: "2" }, { id: "n5", label: "5" }] }, answer: ["n2", "n5", "n8"], points: 10, sortOrder: 5, published: true },
  { id: "seed-q-interactive", lessonId: "seed-lesson-math", type: "INTERACTIVE", prompt: "Markiere die Zahl 7 auf dem Zahlenstrahl.", config: { min: 0, max: 10 }, answer: "7", points: 10, sortOrder: 6, published: true },
  { id: "seed-q-text", lessonId: "seed-lesson-language", type: "TEXT", prompt: "Welches Wort ist das Gegenteil von ‚laut‘?", config: { placeholder: "Deine Antwort" }, answer: ["leise", "still"], points: 10, sortOrder: 1, published: true },
  { id: "seed-q-cloze", lessonId: "seed-lesson-language", type: "CLOZE", prompt: "Ergänze die fehlenden Wörter: Die Sonne ___ am Himmel und der Wind ___.", config: { blanks: [{ id: "a", label: "Die Sonne ..." }, { id: "b", label: "Der Wind ..." }] }, answer: { a: "scheint", b: "weht" }, points: 10, sortOrder: 2, published: true },
  { id: "seed-q-image", lessonId: "seed-lesson-science", type: "IMAGE", prompt: "Welche Form hat drei Ecken?", config: { choices: [{ id: "triangle", label: "Dreieck", shape: "triangle" }, { id: "circle", label: "Kreis", shape: "circle" }, { id: "square", label: "Quadrat", shape: "square" }] }, answer: "triangle", points: 10, sortOrder: 1, published: true },
];

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password && password.length >= 10) {
    const existing = await db.user.findUnique({ where: { email } });
    if (!existing) await db.user.create({ data: { email, displayName: "Administration", passwordHash: await hashPassword(password), role: Role.ADMIN } });
  }
  for (const item of subjects) if (!(await db.subject.findUnique({ where: { id: item.id } }))) await db.subject.create({ data: item });
  for (const item of topics) if (!(await db.topic.findUnique({ where: { id: item.id } }))) await db.topic.create({ data: item });
  for (const item of lessons) if (!(await db.lesson.findUnique({ where: { id: item.id } }))) await db.lesson.create({ data: item });
  for (const item of questions) if (!(await db.question.findUnique({ where: { id: item.id } }))) await db.question.create({ data: item as Parameters<typeof db.question.create>[0]["data"] });
  console.log("Originale Lerninhalte bereitgestellt; vorhandene Änderungen bleiben erhalten.");
}

main().finally(() => db.$disconnect());

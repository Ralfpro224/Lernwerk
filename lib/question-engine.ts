import { QuestionType } from "@prisma/client";

export type AnswerResult = { correct: boolean; feedback: string };

function normalized(value: unknown): string {
  return String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("de");
}

function array(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

/** Evaluates an answer stored privately on the server. No correct answer is sent by the lesson API. */
export function evaluateAnswer(type: QuestionType, expected: unknown, submitted: unknown): AnswerResult {
  let correct = false;
  switch (type) {
    case "SINGLE_CHOICE":
    case "IMAGE":
      correct = normalized(submitted) === normalized(expected);
      break;
    case "MULTIPLE_CHOICE": {
      const a = [...new Set(array(expected))].sort();
      const b = [...new Set(array(submitted))].sort();
      correct = a.length > 0 && a.length === b.length && a.every((v, i) => v === b[i]);
      break;
    }
    case "TEXT": {
      const accepted = Array.isArray(expected) ? expected : [expected];
      correct = accepted.some((v) => normalized(v) === normalized(submitted));
      break;
    }
    case "CLOZE":
    case "MATCHING": {
      const a = record(expected);
      const b = record(submitted);
      const keys = Object.keys(a);
      correct = keys.length > 0 && keys.length === Object.keys(b).length &&
        keys.every((key) => normalized(a[key]) === normalized(b[key]));
      break;
    }
    case "ORDERING": {
      const a = array(expected);
      const b = array(submitted);
      correct = a.length > 0 && a.length === b.length && a.every((v, i) => v === b[i]);
      break;
    }
    case "MATH": {
      const spec = typeof expected === "number" ? { value: expected, tolerance: 0 } : record(expected);
      const value = Number(String(submitted).replace(",", "."));
      correct = String(submitted).trim() !== "" && Number.isFinite(value) &&
        typeof spec.value === "number" && Math.abs(value - spec.value) <= Number(spec.tolerance ?? 0);
      break;
    }
    case "INTERACTIVE":
      correct = normalized(submitted) === normalized(expected);
      break;
  }
  return { correct, feedback: correct ? "Richtig! Gut gemacht." : "Noch nicht richtig. Versuch es erneut." };
}

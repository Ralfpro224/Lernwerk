import { describe, expect, it } from "vitest";
import { QuestionType } from "@prisma/client";
import { evaluateAnswer } from "../lib/question-engine";

describe("answer evaluation", () => {
  it.each([
    [QuestionType.SINGLE_CHOICE, "b", "b", true],
    [QuestionType.MULTIPLE_CHOICE, ["b", "c"], ["c", "b"], true],
    [QuestionType.TEXT, ["leise", "still"], " LEISE ", true],
    [QuestionType.CLOZE, { a: "scheint", b: "weht" }, { a: "Scheint", b: "weht" }, true],
    [QuestionType.MATCHING, { left: "right" }, { left: "right" }, true],
    [QuestionType.ORDERING, ["a", "b"], ["a", "b"], true],
    [QuestionType.MATH, { value: 12, tolerance: 0 }, "12", true],
    [QuestionType.IMAGE, "triangle", "triangle", true],
    [QuestionType.INTERACTIVE, "7", "7", true],
  ])("accepts valid %s", (type, expected, submitted, correct) => {
    expect(evaluateAnswer(type, expected, submitted).correct).toBe(correct);
  });

  it("rejects missing multiple choice answers", () => {
    expect(evaluateAnswer(QuestionType.MULTIPLE_CHOICE, ["a", "b"], ["a"]).correct).toBe(false);
  });
  it("rejects reordered sequence", () => {
    expect(evaluateAnswer(QuestionType.ORDERING, ["a", "b"], ["b", "a"]).correct).toBe(false);
  });
  it("rejects invalid math input", () => {
    expect(evaluateAnswer(QuestionType.MATH, { value: 12, tolerance: 0 }, "abc").correct).toBe(false);
  });
  it("honors numeric tolerance", () => {
    expect(evaluateAnswer(QuestionType.MATH, { value: 3.14, tolerance: 0.01 }, "3,145").correct).toBe(true);
  });
});

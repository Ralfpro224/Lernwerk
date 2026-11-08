import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../lib/password";

describe("password storage", () => {
  it("uses unique salts and verifies only the right password", async () => {
    const first = await hashPassword("correct long password");
    const second = await hashPassword("correct long password");
    expect(first).not.toBe(second);
    expect(await verifyPassword("correct long password", first)).toBe(true);
    expect(await verifyPassword("wrong password", first)).toBe(false);
  });
});

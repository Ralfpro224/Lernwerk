import { test, expect } from "@playwright/test";

test("registration, lesson, validation, persistence and logout", async ({ page, request }, testInfo) => {
  const email = `learner-${Date.now()}-${testInfo.project.name}@example.test`;
  await page.goto("/register");
  await page.getByLabel("Dein Name").fill("Test Lernende");
  await page.getByLabel("E-Mail-Adresse").fill(email);
  await page.getByLabel("Passwort").fill("a strong test password");
  await page.getByRole("button", { name: "Konto erstellen" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: "Hallo, Test Lernende!" })).toBeVisible();
  if (testInfo.project.name === "mobile") await page.getByRole("button", { name: "Menü öffnen" }).click();
  await page.getByRole("link", { name: /Fächer/ }).first().click();
  await page.getByRole("link", { name: /Mathematik/ }).first().click();
  await page.getByRole("link", { name: /Zahlenwerkstatt/ }).first().click();
  await expect(page.getByText("Was ist 8 + 7?")).toBeVisible();
  const lesson = await request.get("/api/lessons/seed-lesson-math");
  const body = await lesson.json();
  expect(JSON.stringify(body)).not.toContain('"answer"');
  await page.getByRole("button", { name: "15" }).click();
  await page.getByRole("button", { name: "Antwort prüfen" }).click();
  await expect(page.getByText(/Richtig! Gut gemacht/)).toBeVisible();
  await page.getByRole("button", { name: /Nächste Aufgabe/ }).click();
  if (testInfo.project.name === "mobile") await page.getByRole("button", { name: "Menü öffnen" }).click();
  await page.getByRole("link", { name: "Fortschritt" }).first().click();
  await expect(page.getByText("Zahlenwerkstatt")).toBeVisible();
  await expect(page.getByText(/10 Punkte/).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText("Zahlenwerkstatt")).toBeVisible();
  if (testInfo.project.name === "mobile") await page.getByRole("button", { name: "Menü öffnen" }).click();
  await page.getByRole("button", { name: "Abmelden" }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/login");
  await page.getByLabel("E-Mail-Adresse").fill(email);
  await page.getByLabel("Passwort").fill("a strong test password");
  await page.getByRole("button", { name: "Anmelden" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});

test("unauthorized admin API is denied and bad credentials are rejected", async ({ request }) => {
  const denied = await request.get("/api/admin/subjects");
  expect(denied.status()).toBe(401);
  const login = await request.post("/api/auth/login", { data: { email: "missing@example.test", password: "wrong" } });
  expect(login.status()).toBe(401);
});

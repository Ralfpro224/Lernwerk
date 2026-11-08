import { test, expect } from "@playwright/test";

test("admin creates and publishes a subject through the UI", async ({ page }) => {
  test.skip(!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD, "No seeded admin credentials");
  const slug = `e2e-${Date.now()}`;
  await page.goto("/login");
  await page.getByLabel("E-Mail-Adresse").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("Passwort").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Anmelden" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Verwaltung" })).toBeVisible();
  await page.getByRole("button", { name: "+ Neu" }).click();
  await page.getByLabel("Fachname").fill("E2E Wissenslabor");
  await page.getByLabel("URL-Kürzel").fill(slug);
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByText("E2E Wissenslabor")).toBeVisible();
  await page.goto("/subjects");
  await expect(page.getByText("E2E Wissenslabor")).toBeVisible();
  await page.goto("/admin");
  const item = page.getByText("E2E Wissenslabor").locator("..").locator("..");
  page.once("dialog", (dialog) => dialog.accept());
  await item.getByRole("button", { name: "Löschen" }).click();
  await expect(page.getByText("E2E Wissenslabor")).toHaveCount(0);
});

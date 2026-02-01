import { test, expect } from "@playwright/test";

test.describe("Smoke", () => {
  test("home loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /aurelia/i })).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("sanctuary loads", async ({ page }) => {
    await page.goto("/sanctuary");
    await expect(page.getByRole("heading", { name: /sanctuary/i })).toBeVisible();
  });

  test("cosmos loads", async ({ page }) => {
    await page.goto("/cosmos");
    await expect(page.getByLabel(/cosmos 3d view/i)).toBeVisible();
  });

  test("studio loads", async ({ page }) => {
    await page.goto("/studio");
    await expect(page.getByRole("heading", { name: /studio/i })).toBeVisible();
  });

  test("studio new project", async ({ page }) => {
    await page.goto("/studio/new");
    await expect(page.getByRole("heading", { name: /new project/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /lyrics/i })).toBeVisible();
  });

  test("command palette opens with Cmd+K", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Meta+k");
    await expect(page.getByPlaceholder(/search or run/i)).toBeVisible();
  });
});

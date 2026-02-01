import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test("updates appearance preferences", async ({ page }) => {
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: "Settings" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Aurora" }).click();
    await page.getByRole("checkbox", { name: "High contrast" }).check();

    const reduceMotion = page.getByRole("checkbox", {
      name: "Reduce motion",
    });
    await reduceMotion.check();
    await expect(reduceMotion).toBeChecked();
  });
});

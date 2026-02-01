import { test, expect } from "@playwright/test";

function modShortcut(key: string) {
  return process.platform === "darwin" ? `Meta+${key}` : `Control+${key}`;
}

test.describe("Shortcuts", () => {
  test("command palette opens with shortcut", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press(modShortcut("k"));
    await expect(page.getByPlaceholder(/search or run/i)).toBeVisible();
  });

  test("help overlay opens with shortcut", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Shift+?");
    await expect(
      page.getByRole("heading", { name: "Keyboard shortcuts" })
    ).toBeVisible();
  });
});

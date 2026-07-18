import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Summa AI")).toBeInViewport();
  });

  test("chat page loads", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.locator("text=Chat")).toBeInViewport();
  });

  test("progress page loads", async ({ page }) => {
    await page.goto("/progress");
    await expect(page.locator("text=Progress")).toBeInViewport();
  });

  test("concept map page loads", async ({ page }) => {
    await page.goto("/concept-map");
    await expect(page.locator("text=Concept Map")).toBeInViewport();
  });

  test("study timeline page loads", async ({ page }) => {
    await page.goto("/study-timeline");
    await expect(page.locator("text=Study Timeline")).toBeInViewport();
  });
});

import { expect, test } from "@playwright/test";

/** Skip first-visit how-to modal so it doesn't block interactions. */
async function seedStorage(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("hmmm-howto-seen", "1");
      localStorage.setItem("hmmm-install-dismissed", "1");
    } catch {
      /* ignore */
    }
  });
}

async function waitForEditor(page: import("@playwright/test").Page) {
  await expect(page.getByRole("textbox", { name: "Quote" })).toBeVisible({ timeout: 30_000 });
  // If how-to still appears, dismiss it
  const gotIt = page.getByRole("button", { name: /got it/i });
  if (await gotIt.isVisible().catch(() => false)) {
    await gotIt.click();
  }
}

test.describe("Hmmm editor", () => {
  test.beforeEach(async ({ page }) => {
    await seedStorage(page);
  });

  test("boots past loading into the workspace", async ({ page }) => {
    await page.goto("/");
    await waitForEditor(page);
    await expect(page.getByRole("button", { name: /download/i })).toBeVisible();
    await expect(page.getByLabel("Canvas")).toBeVisible();
  });

  test("live preview reflects quote text", async ({ page }) => {
    await page.goto("/");
    await waitForEditor(page);

    const quote = page.getByRole("textbox", { name: "Quote" });
    await quote.fill("Integration test quote line");
    await expect(
      page.locator(".quote-preview").getByText("Integration test quote line"),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("deep link prefills quote and author on /create", async ({ page }) => {
    const q = encodeURIComponent("Deep link quote");
    const author = encodeURIComponent("Ada Lovelace");
    await page.goto(`/create?q=${q}&author=${author}`);
    await waitForEditor(page);

    await expect(page.getByRole("textbox", { name: "Quote" })).toHaveValue("Deep link quote");
    await expect(page.getByRole("textbox", { name: "Author" })).toHaveValue("Ada Lovelace");
    await expect(page.locator(".quote-preview").getByText("Deep link quote")).toBeVisible();
  });

  test("layout picker switches aspect ratio chrome", async ({ page }) => {
    await page.goto("/");
    await waitForEditor(page);

    await page.getByRole("button", { name: /9:16/i }).click();
    await expect(page.locator(".stage-dots").getByText("9:16")).toBeVisible();
  });
});

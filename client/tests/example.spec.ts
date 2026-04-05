import { test } from "@playwright/test";

test("sign in", async ({ page }) => {
  await page.goto("/activities");
});

import { test } from "@playwright/test";

test("test upload activity", async ({ page }) => {
  await page.goto("/activities");
  await page.waitForSelector("h1:has-text('Mes activités')");

  const filePath = "tests/fixtures/activity.fit";
  const length = await page.getByRole("link").count();
  await page.setInputFiles('input[type="file"]', filePath);

  await page
    .getByRole("button", { name: "Ajouter une activité" })
    .getByText("Ajouter une activité")
    .click();

  await page.waitForTimeout(2000);
  const newLength = await page.getByRole("link").count();
  expect(newLength).toBeGreaterThan(length);
});

test("test activity list", async ({ page }) => {
  await page.goto("/activities");
  await page.waitForSelector("h1:has-text('Mes activités')");

  const activity = page.getByRole("link").first();
  const title = await activity.innerText();
  activity.click();
  await page.waitForTimeout(2000);
  await page.waitForSelector(`h1:has-text('${title}')')`);
});

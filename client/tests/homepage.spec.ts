import { expect, test } from "@playwright/test";

// Run without auth so we see the signed-out homepage
test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("hero section", () => {
  test("renders headline", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "in one place",
    );
  });

  test("renders GPS tag line", async ({ page }) => {
    await expect(page.getByText("GPS · STRAVA · FIT · KML")).toBeVisible();
  });

  test("shows Sign In and Sign Up buttons when signed out", async ({
    page,
  }) => {
    await expect(
      page.getByRole("button", { name: /sign in/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign up/i }).first(),
    ).toBeVisible();
  });

  test("does not show My Activities link when signed out", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /my activities/i }),
    ).toHaveCount(0);
  });
});

test.describe("feature strip", () => {
  test("renders all three numbered features", async ({ page }) => {
    for (const label of ["01", "02", "03"]) {
      await expect(page.getByText(label)).toBeVisible();
    }
  });

  test("renders feature titles", async ({ page }) => {
    await expect(page.getByText(/upload fit files/i)).toBeVisible();
    await expect(page.getByText(/sync with strava/i)).toBeVisible();
    await expect(page.getByText(/explore your tracks/i)).toBeVisible();
  });
});

test.describe("screenshots section", () => {
  test("renders three screenshot images", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await expect(page.getByAltText("3D terrain map view")).toBeVisible();
    await expect(page.getByAltText("400+ activities overview")).toBeVisible();
    await expect(page.getByAltText("Activity list")).toBeVisible();
  });

  test("renders image captions", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await expect(page.getByText(/3d terrain map/i)).toBeVisible();
    await expect(page.getByText(/400\+ activities/i)).toBeVisible();
    await expect(page.getByText(/activity list/i)).toBeVisible();
  });
});

test.describe("footer CTA", () => {
  test("renders start logging text", async ({ page }) => {
    await expect(page.getByText(/start logging/i)).toBeVisible();
  });

  test("renders create account button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /create account/i }),
    ).toBeVisible();
  });
});

test.describe("mobile viewport", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("hero renders on mobile", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign up/i })).toBeVisible();
  });

  test("feature strip visible on mobile", async ({ page }) => {
    for (const label of ["01", "02", "03"]) {
      await expect(page.getByText(label)).toBeVisible();
    }
  });
});

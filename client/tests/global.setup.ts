import {
  clerk,
  clerkSetup,
  setupClerkTestingToken,
} from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";
import path from "path";

// Ensures that Clerk setup is done before any tests run
setup.describe.configure({
  mode: "serial",
});

setup("global setup", async () => {
  await clerkSetup();
  if (
    !process.env.CLERK_TEST_USER_EMAIL ||
    !process.env.CLERK_TEST_USER_PASSWORD
  ) {
    throw new Error(
      "Please provide CLERK_TEST_USER_EMAIL and CLERK_TEST_USER_PASSWORD environment variables.",
    );
  }
});

// Define the path to the storage file, which is `user.json`
const authFile = path.join(__dirname, "../playwright/.clerk/user.json");

setup("authenticate and save state to storage", async ({ page }) => {
  await page.goto("/sign-in");

  await page
    .getByLabel("Email address", { exact: true })
    .fill(process.env.CLERK_TEST_USER_EMAIL!);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.CLERK_TEST_USER_PASSWORD!);
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  await page.waitForTimeout(1000);

  await page.goto("/activities");
  // Ensure the user has successfully accessed the protected page
  // by checking an element on the page that only the authenticated user can access
  await page.waitForSelector("h1:has-text('Mes activités')");

  await page.context().storageState({ path: authFile });
});

import { expect, test } from "@playwright/test";

test("preserves the application draft through adaptive review and return", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.getByRole("link", { name: "Explore Dashboard" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("link", { name: "Financial Application" }).first().click();
  await expect(page).toHaveURL(/\/application$/);

  await page.getByLabel("Allow privacy-safe interaction tracking").check();
  await page.getByLabel("Full name").fill("Playwright Applicant");
  await page.getByLabel("Email address").fill("applicant@example.test");

  const submitButton = page.getByRole("button", {
    name: "Validate application",
  });
  await submitButton.click();
  await submitButton.click();
  await submitButton.click();

  await expect(page.getByText(/guided layout help/i)).toBeVisible();
  await page.getByRole("button", { name: "Simplify my form" }).click();
  await expect(page).toHaveURL(/\/simplified$/);

  await expect(page.getByLabel("Full name")).toHaveValue(
    "Playwright Applicant"
  );
  await expect(page.getByLabel("Email address")).toHaveValue(
    "applicant@example.test"
  );
  await page.getByLabel("Phone number").fill("4155550100");
  await page.getByLabel("Date of birth").fill("1988-01-12");
  await page
    .getByLabel("Residential address")
    .fill("123 Example Street, Test City");

  await page.getByRole("button", { name: "Continue" }).click();
  const financialHeading = page.getByRole("heading", {
    name: "Financial information",
  });
  await expect(financialHeading).toBeFocused();
  await page.getByRole("button", { name: "Continue" }).click();

  await page
    .getByLabel("Application purpose")
    .fill("Testing draft preservation through the review step.");
  await page
    .getByLabel("I agree to the terms and conditions")
    .check();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(
    page.getByRole("heading", { name: "Review your application" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Validate application" }).click();
  await page.getByRole("link", { name: "Back to Complex Form" }).click();
  await expect(page).toHaveURL(/\/application$/);
  await expect(page.getByLabel("Full name")).toHaveValue(
    "Playwright Applicant"
  );
  await expect(page.getByLabel("Email address")).toHaveValue(
    "applicant@example.test"
  );
});

test("shows live charts, accessibility preferences, and responsive layouts", async ({
  page,
}) => {
  await page.goto("/analytics");
  const charts = page
    .getByRole("region", { name: "Session signals over time" })
    .getByRole("img");
  await expect(charts).toHaveCount(4);

  await page.getByLabel("Font size").selectOption("large");
  await page.getByLabel("Theme").selectOption("dark");
  await page.getByLabel("High contrast").check();
  await expect(page.locator(".a11y-large")).toHaveCount(1);
  await expect(page.locator(".a11y-dark")).toHaveCount(1);
  await expect(page.locator(".a11y-high-contrast")).toHaveCount(1);

  const exportLink = page.getByRole("link", {
    name: "Export before/after CSV",
  });
  await expect(exportLink).toHaveAttribute(
    "download",
    "auragen-before-after-metrics.csv"
  );
  await expect(exportLink).toHaveAttribute(
    "href",
    /^data:text\/csv;charset=utf-8,/
  );
  const downloadPromise = page.waitForEvent("download");
  await exportLink.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(
    "auragen-before-after-metrics.csv"
  );

  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(horizontalOverflow).toBe(false);
  }
});

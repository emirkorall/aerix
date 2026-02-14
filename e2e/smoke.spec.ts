import { test, expect } from "@playwright/test";

test.describe("Dashboard auth guard", () => {
  test("redirects unauthenticated users to /login", async ({ page }) => {
    const response = await page.goto("/dashboard");
    // Middleware redirects to /login with returnTo param
    expect(page.url()).toContain("/login");
    expect(page.url()).toContain("returnTo");
    expect(response?.status()).toBeLessThan(400);
  });
});

test.describe("Pricing page", () => {
  test("renders plan cards with CTAs", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("h1")).toContainText("Simple pricing");

    // Three plan headings
    await expect(page.getByText("Free", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Starter", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Pro", { exact: true }).first()).toBeVisible();

    // CTA buttons
    await expect(page.getByRole("link", { name: "Get Started" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Subscribe" }).first()
    ).toBeVisible();
  });
});

test.describe("Training page", () => {
  test("redirects unauthenticated users to /login", async ({ page }) => {
    const response = await page.goto("/training");
    expect(page.url()).toContain("/login");
    expect(page.url()).toContain("returnTo");
    expect(response?.status()).toBeLessThan(400);
  });
});

test.describe("Homepage", () => {
  test("shows Sign in link for unauthenticated users", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Train together/i })
    ).toBeVisible();
  });
});

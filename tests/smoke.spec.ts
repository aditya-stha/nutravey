import { test, expect, type Page } from "@playwright/test";

/* Money-path smoke tests. Pre-launch mode is the default (NEXT_PUBLIC_PRE_LAUNCH
   unset), so /shop is the reservation exhibition and checkout is offline. */

/** The splash overlay intercepts pointer events for ~2.1s after load. */
async function splashGone(page: Page) {
  await expect(
    page.getByRole("status", { name: "Loading Nutravey" }),
  ).toHaveCount(0, { timeout: 10_000 });
}

test("home renders the brand hero", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Nutravey/);
  await splashGone(page);
  await expect(page.locator("main")).toBeVisible();
});

test("product page shows name and price", async ({ page }) => {
  await page.goto("/products/strawberry-surge");
  await expect(page).toHaveTitle(/Strawberry Surge/);
  await expect(
    page.getByRole("heading", { name: /Strawberry Surge/i }).first(),
  ).toBeVisible();
  await expect(page.getByText("$42").first()).toBeVisible();
});

test("shop shows the pre-launch reservation exhibition", async ({ page }) => {
  await page.goto("/shop");
  await expect(
    page.getByRole("heading", { name: /Reserve Your Ritual/i }),
  ).toBeVisible();
  await expect(page.locator("#email-input")).toBeAttached();
});

test("cart page renders the pre-launch notice", async ({ page }) => {
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Cart" })).toBeVisible();
  await expect(page.getByText(/pre-launch reservation phase/i)).toBeVisible();
});

test("waitlist API accepts a valid reservation", async ({ request }) => {
  const res = await request.post("/api/waitlist", {
    data: {
      name: "Smoke Test",
      email: `smoke-${Date.now()}@example.com`,
      item: "strawberry",
    },
  });
  expect(res.ok()).toBe(true);
  const json = await res.json();
  expect(json.ok).toBe(true);
  expect(json.id).toMatch(/^NVY-/);
});

test("waitlist API rejects a bad payload", async ({ request }) => {
  const res = await request.post("/api/waitlist", {
    data: { name: "", email: "not-an-email", item: "nope" },
  });
  expect(res.status()).toBe(400);
});

test("unknown routes get the branded 404", async ({ page }) => {
  const response = await page.goto("/products/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Nothing formulated here.")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /The Collection/ }),
  ).toBeVisible();
});

import { test, expect, type Page } from "@playwright/test";
import { createHmac } from "node:crypto";

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

test("waitlist API accepts a reservation and issues a working pass link", async ({
  request,
  page,
}) => {
  const res = await request.post("/api/waitlist", {
    // Unique client IP per run so repeated local runs against a reused dev
    // server don't trip the per-IP rate limit.
    headers: { "x-forwarded-for": `10.1.${Date.now() % 250}.${process.pid % 250}` },
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
  expect(json.passUrl).toContain("/pass?t=");

  // The signed link renders the private pass with ticket + countdown.
  await page.goto(json.passUrl);
  await expect(page.getByText("RITUAL PASS · VERIFIED")).toBeVisible();
  await expect(page.getByText(json.id)).toBeVisible();
  await expect(page.getByText("LAUNCH IN")).toBeVisible();
});

test("a tampered pass token is rejected", async ({ page }) => {
  await page.goto("/pass?t=forged-token.invalid");
  await expect(page.getByText("This pass isn't valid.")).toBeVisible();
});

test("waitlist API rejects a bad payload", async ({ request }) => {
  const res = await request.post("/api/waitlist", {
    headers: { "x-forwarded-for": `10.2.${Date.now() % 250}.${process.pid % 250}` },
    data: { name: "", email: "not-an-email", item: "nope" },
  });
  expect(res.status()).toBe(400);
});

test("shopify webhook accepts a signed order and rejects a forged one", async ({
  request,
}) => {
  const body = JSON.stringify({
    id: 987654321,
    total_price: "108.00",
    currency: "USD",
    line_items: [{ quantity: 1 }],
  });
  const hmac = createHmac("sha256", "smoke-test-webhook-secret")
    .update(body, "utf8")
    .digest("base64");

  const signed = await request.post("/api/webhooks/shopify", {
    headers: {
      "Content-Type": "application/json",
      "x-shopify-topic": "orders/create",
      "x-shopify-hmac-sha256": hmac,
    },
    data: body,
  });
  expect(signed.status()).toBe(200);

  const forged = await request.post("/api/webhooks/shopify", {
    headers: {
      "Content-Type": "application/json",
      "x-shopify-topic": "orders/create",
      "x-shopify-hmac-sha256": "Zm9yZ2VkLXNpZ25hdHVyZQ==",
    },
    data: body,
  });
  expect(forged.status()).toBe(401);
});

test("unknown routes get the branded 404", async ({ page }) => {
  const response = await page.goto("/products/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Nothing formulated here.")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /The Collection/ }),
  ).toBeVisible();
});

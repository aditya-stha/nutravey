import { test, expect, type Page } from "@playwright/test";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

/* NEXT_PUBLIC_PRE_LAUNCH is inlined at build time from .env.local, so the
   suite reads the same file to know which storefront mode it is testing.
   No .env.local (CI) = pre-launch, matching the app default. */
const envLocal = (() => {
  try {
    return readFileSync(".env.local", "utf8");
  } catch {
    return "";
  }
})();
const preLaunch = !/^NEXT_PUBLIC_PRE_LAUNCH=false/m.test(envLocal);

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

test("shop renders the mode-appropriate storefront", async ({ page }) => {
  await page.goto("/shop");
  if (preLaunch) {
    await expect(
      page.getByRole("heading", { name: /Reserve Your Ritual/i }),
    ).toBeVisible();
    await expect(page.locator("#email-input")).toBeAttached();
  } else {
    await expect(
      page.getByRole("heading", { name: /The Collection/i }),
    ).toBeVisible();
  }
});

test("cart page renders the mode-appropriate state", async ({ page }) => {
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Cart" })).toBeVisible();
  if (preLaunch) {
    await expect(
      page.getByText(/pre-launch reservation phase/i),
    ).toBeVisible();
  } else {
    // Live mode without Shopify credentials: honest unconfigured notice.
    await expect(
      page.getByText(/storefront isn.t connected|Your cart is empty/i),
    ).toBeVisible();
  }
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
  await expect(page.getByText(json.id).first()).toBeVisible();
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

test("batch ritual page verifies a known lot and warns on unknown", async ({
  page,
}) => {
  await page.goto("/ritual/NVY-ST-2606");
  await expect(page.getByText("This box is genuine.")).toBeVisible();
  await expect(page.getByText("NVY-ST-2606").first()).toBeVisible();
  await expect(page.getByText("Heavy metals")).toBeVisible();

  await page.goto("/ritual/NVY-FAKE-99999");
  await expect(page.getByText("This lot isn't recognized.")).toBeVisible();
});

test("standards batch lookup resolves a lot number", async ({ page }) => {
  await page.goto("/standards");
  await page.fill("#lot-input", "nvy-ly-2606");
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page.getByText("NVY-LY-2606").first()).toBeVisible();
  await expect(
    page.getByText("Label accuracy", { exact: true }),
  ).toBeVisible();
});

test("PDP shows the FAQ", async ({ page }) => {
  await page.goto("/products/lemon-zest");
  await expect(page.getByText("Before you trust it.")).toBeVisible();
  const q = page.getByText("Does L-theanine make you drowsy?");
  await expect(q).toBeVisible();
});

test("unknown routes get the branded 404", async ({ page }) => {
  const response = await page.goto("/products/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Nothing formulated here.")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /The Collection/ }),
  ).toBeVisible();
});

test("referral link sets the cookie and forwards to the shop", async ({
  request,
}) => {
  const res = await request.get("/r/NVY-ST-12345", {
    maxRedirects: 0,
  });
  expect(res.status()).toBe(307);
  expect(res.headers()["location"]).toContain("/shop");
  expect(res.headers()["set-cookie"]).toContain("nvy-ref=NVY-ST-12345");
});

test("order page verifies signed tokens and rejects forgeries", async ({
  page,
}) => {
  // Signed with the secret injected into the test server (see playwright.config).
  const { createHmac: hmac } = await import("node:crypto");
  const payload = Buffer.from(
    JSON.stringify({
      num: "#1001",
      name: "Smoke",
      email: "smoke@example.com",
      total: "42.00",
      currency: "USD",
      items: ["Electrolytes Powder Mix"],
      statusUrl: "https://nutravey.myshopify.com/orders/abc",
      ts: Date.now(),
    }),
  );
  const sig = hmac("sha256", "smoke-test-pass-secret")
    .update(payload)
    .digest();
  const token = `${payload.toString("base64url")}.${sig.toString("base64url")}`;

  await page.goto(`/order?t=${token}`);
  await expect(page.getByText("#1001 · Confirmed")).toBeVisible();
  await expect(page.getByText("Electrolytes Powder Mix")).toBeVisible();

  await page.goto("/order?t=forged.token");
  await expect(page.getByText("This order link isn't valid.")).toBeVisible();
});

test("account page renders its unconfigured state", async ({ page }) => {
  await page.goto("/account");
  await expect(
    page.getByText(/Accounts open with the store|Your rituals, on record|Sign-in opens once/),
  ).toBeVisible();
});

test("PDP renders the reviews section", async ({ page }) => {
  await page.goto("/products/strawberry-surge");
  await expect(page.getByText("From the people living it.")).toBeVisible();
  await expect(page.getByText(/No reviews yet|Verified buyer/)).toBeVisible();
});

test("review submission requires a verified customer session", async ({
  request,
}) => {
  const res = await request.post("/api/reviews", {
    data: { product: "strawberry-surge", rating: 5, body: "bot attempt" },
  });
  expect(res.status()).toBe(403);
});

test("order requests require a customer session", async ({ request }) => {
  const res = await request.post("/api/order-request", {
    data: { order: "#1001", kind: "cancel", message: "" },
  });
  expect(res.status()).toBe(401);
});

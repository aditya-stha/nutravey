import type { Metadata } from "next";
import {
  customerAccountsEnabled,
  CUSTOMER_CLIENT_ID,
  getCustomer,
  getShopId,
} from "@/lib/customer-account";
import { isPreLaunch } from "@/lib/shopify-config";
import SignIn from "@/components/account/SignIn";
import SignOut from "@/components/account/SignOut";
import OrderActions from "@/components/account/OrderActions";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account — Nutravey",
  robots: { index: false },
};

// Session cookie decides what renders — always per-request.
export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="content-rail section-padding">
      <p
        className="mono-label"
        style={{ color: "var(--color-ink)", opacity: 0.5, marginBottom: "12px" }}
      >
        Account
      </p>
      {children}
    </div>
  );
}

const h1Style = {
  fontFamily: "var(--font-display)",
  fontWeight: 500,
  fontSize: "clamp(40px, 6vw, 72px)",
  letterSpacing: "-0.025em" as const,
  lineHeight: 1,
  color: "var(--color-ink)",
  marginBottom: "24px",
};

export default async function AccountPage() {
  if (!customerAccountsEnabled) {
    return (
      <Shell>
        <h1 style={h1Style}>
          {isPreLaunch
            ? "Accounts open with the store."
            : "Sign-in is being connected."}
        </h1>
        <p
          className="mono-body"
          style={{
            fontSize: "15px",
            lineHeight: 1.7,
            color: "var(--color-ink-muted)",
            maxWidth: "460px",
            marginBottom: "32px",
          }}
        >
          {isPreLaunch
            ? "Order history and saved details arrive at launch. Until then, your Ritual Pass link is your record — and reservations need no account at all."
            : "Customer sign-in is one configuration step away (Customer Account API client id). Your orders are safe with Shopify meanwhile — the confirmation email holds your order link and live tracking."}
        </p>
        <Link href="/shop" className="mono-cta" style={{ color: "var(--color-ink)" }}>
          {isPreLaunch ? "Reserve your ritual →" : "Back to the collection →"}
        </Link>
      </Shell>
    );
  }

  const customer = await getCustomer();

  if (!customer) {
    const shopId = await getShopId();
    return (
      <Shell>
        <h1 style={h1Style}>Your rituals, on record.</h1>
        <p
          className="mono-body"
          style={{
            fontSize: "15px",
            lineHeight: 1.7,
            color: "var(--color-ink-muted)",
            maxWidth: "460px",
            marginBottom: "40px",
          }}
        >
          Sign in with your email — Shopify sends a one-time code, no password
          to remember. Your orders and details live here.
        </p>
        {shopId ? (
          <SignIn clientId={CUSTOMER_CLIENT_ID} shopId={shopId} />
        ) : (
          <p className="mono-body" style={{ color: "var(--color-ink-faint)" }}>
            Sign-in is briefly unavailable — try again in a moment.
          </p>
        )}
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 style={h1Style}>Welcome back, {customer.firstName}.</h1>
      <p
        className="mono-body"
        style={{
          fontSize: "13px",
          color: "var(--color-ink-muted)",
          marginBottom: "48px",
        }}
      >
        {customer.email}
      </p>

      <p
        className="mono-label"
        style={{ color: "var(--color-ink)", opacity: 0.5, marginBottom: "16px" }}
      >
        Orders
      </p>
      {customer.orders.length === 0 ? (
        <p
          className="mono-body"
          style={{ fontSize: "14px", color: "var(--color-ink-muted)", marginBottom: "40px" }}
        >
          No orders yet — the first ritual awaits.
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: "0 0 40px",
            padding: 0,
            maxWidth: "720px",
            borderTop: "0.4px solid var(--color-rule)",
          }}
        >
          {customer.orders.map((o) => {
            const status = (o.fulfillmentStatus ?? "").toUpperCase();
            const shipped = ["SUCCESS", "FULFILLED", "DELIVERED"].some((s) =>
              status.includes(s),
            );
            return (
              <li
                key={o.name}
                style={{
                  padding: "20px 0",
                  borderBottom: "0.4px solid var(--color-rule)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "24px",
                    flexWrap: "wrap",
                    marginBottom: "6px",
                  }}
                >
                  <span className="mono-cta" style={{ color: "var(--color-ink)" }}>
                    {o.name}
                  </span>
                  <span
                    className="mono-label"
                    style={{
                      fontSize: "10px",
                      color: shipped ? "var(--color-ink)" : "var(--color-ink-faint)",
                      border: "0.4px solid var(--color-rule)",
                      borderRadius: "var(--radius-chip)",
                      padding: "3px 10px",
                    }}
                  >
                    {shipped ? "Out for delivery" : "Preparing"}
                  </span>
                  <span
                    className="mono-body"
                    style={{ fontSize: "12px", color: "var(--color-ink-faint)" }}
                  >
                    {o.processedAt.slice(0, 10)}
                  </span>
                  <span className="mono-body" style={{ fontSize: "13px", color: "var(--color-ink)" }}>
                    {o.total} {o.currency}
                  </span>
                </div>

                {o.items.length > 0 && (
                  <p
                    className="mono-body"
                    style={{
                      fontSize: "12px",
                      color: "var(--color-ink-muted)",
                      marginBottom: "10px",
                    }}
                  >
                    {o.items.join(" · ")}
                  </p>
                )}

                {o.tracking?.url && (
                  <p style={{ marginBottom: "10px" }}>
                    <a
                      href={o.tracking.url}
                      className="mono-cta"
                      style={{ fontSize: "11px", color: "var(--color-ink)", textDecoration: "underline" }}
                    >
                      Track shipment{o.tracking.number ? ` · ${o.tracking.number}` : ""} →
                    </a>
                  </p>
                )}

                <OrderActions order={o.name} />
              </li>
            );
          })}
        </ul>
      )}

      <p style={{ marginBottom: "32px" }}>
        <Link
          href="/cart"
          className="mono-cta"
          style={{ color: "var(--color-ink)" }}
        >
          Your current cart →
        </Link>
      </p>

      <SignOut />
    </Shell>
  );
}

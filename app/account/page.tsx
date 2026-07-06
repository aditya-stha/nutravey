import type { Metadata } from "next";
import Link from "next/link";
import {
  customerAccountsEnabled,
  CUSTOMER_CLIENT_ID,
  getCustomer,
  getShopId,
} from "@/lib/customer-account";
import SignIn from "@/components/account/SignIn";
import SignOut from "@/components/account/SignOut";

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
        <h1 style={h1Style}>Accounts open with the store.</h1>
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
          Order history and saved details arrive at launch. Until then, your
          Ritual Pass link is your record — and reservations need no account
          at all.
        </p>
        <Link href="/shop" className="mono-cta" style={{ color: "var(--color-ink)" }}>
          Reserve your ritual →
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
            maxWidth: "640px",
            borderTop: "0.4px solid var(--color-rule)",
          }}
        >
          {customer.orders.map((o) => (
            <li
              key={o.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: "24px",
                padding: "16px 0",
                borderBottom: "0.4px solid var(--color-rule)",
              }}
            >
              <span className="mono-cta" style={{ color: "var(--color-ink)" }}>
                {o.name}
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
            </li>
          ))}
        </ul>
      )}
      <SignOut />
    </Shell>
  );
}

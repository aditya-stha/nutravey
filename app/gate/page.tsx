import type { Metadata } from "next";
import SystemPage from "@/components/SystemPage";
import { unlockSite } from "./actions";

/* ─── /gate — pre-launch password screen ────────────────────────────────────
   The only page proxy.ts leaves reachable while DEV_GATE_PASSWORD is set.
   Set like the 404: system shell, one input, one action. */

export const metadata: Metadata = {
  title: "Access — Nutravey",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  wrong: "That key isn't right.",
  slow: "Too many attempts. Wait a few minutes.",
};

export default async function GatePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; e?: string }>;
}) {
  const { from = "/", e } = await searchParams;
  const error = e ? ERRORS[e] : undefined;

  return (
    <SystemPage
      eyebrow="Access — Pre-launch"
      heading="Not open yet."
      copy="Nutravey is still being formulated. If you're on the team, enter the access key."
    >
      <form action={unlockSite} className="gate-form">
        <input type="hidden" name="from" value={from} />
        <input
          className="gate-input"
          name="password"
          type="password"
          placeholder="Access key"
          aria-label="Access key"
          autoComplete="current-password"
          autoFocus
          required
        />
        <button type="submit" className="system-retry mono-label">
          Enter
        </button>
      </form>
      <p className="mono-body gate-error" role="alert">
        {error ?? " "}
      </p>
      <style>{`
        .gate-form {
          display: flex;
          align-items: stretch;
          gap: 16px;
          flex-wrap: wrap;
          max-width: 560px;
        }
        .gate-input {
          flex: 1 1 260px;
          background: transparent;
          border: none;
          border-bottom: 0.4px solid var(--color-rule);
          border-radius: 0;
          padding: 18px 0;
          font-family: var(--font-mono);
          font-size: 14px;
          letter-spacing: 0.04em;
          color: var(--color-ink);
          outline: none;
          transition: border-color 200ms ease;
        }
        .gate-input::placeholder { color: var(--color-ink-faint); }
        .gate-input:focus { border-bottom-color: var(--color-ink); }
        .gate-error {
          font-size: 12px;
          color: var(--color-ink-muted);
          margin-top: 20px;
        }
      `}</style>
    </SystemPage>
  );
}

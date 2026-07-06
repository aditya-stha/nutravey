"use client";

/* Per-order request actions: cancellation or change, sent through the
   verified pipeline (/api/order-request). Inline form, no modal. */

import { useState } from "react";

export default function OrderActions({ order }: { order: string }) {
  const [kind, setKind] = useState<"cancel" | "change" | null>(null);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  if (state === "sent") {
    return (
      <p className="mono-body" style={{ fontSize: "12px", color: "var(--color-ink-muted)" }}>
        Request received — we&rsquo;ll reply to your account email within a day.
      </p>
    );
  }

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kind || state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/order-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order, kind, message }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "24px" }}>
        <button
          type="button"
          className="mono-cta order-action-link"
          onClick={() => setKind(kind === "cancel" ? null : "cancel")}
        >
          Request cancellation
        </button>
        <button
          type="button"
          className="mono-cta order-action-link"
          onClick={() => setKind(kind === "change" ? null : "change")}
        >
          Request a change
        </button>
      </div>

      {kind && (
        <form onSubmit={send} style={{ marginTop: "14px", maxWidth: "440px" }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              kind === "cancel"
                ? "Anything we should know? (optional)"
                : "What should change? Address, flavour, quantity…"
            }
            rows={3}
            maxLength={1000}
            required={kind === "change"}
            className="mono-body"
            style={{
              display: "block",
              width: "100%",
              padding: "10px 14px",
              fontSize: "13px",
              color: "var(--color-ink)",
              background: "var(--color-surface)",
              border: "0.4px solid var(--color-rule)",
              marginBottom: "10px",
              resize: "vertical",
            }}
          />
          {state === "error" && (
            <p role="alert" className="mono-body" style={{ fontSize: "12px", color: "var(--color-strawberry)", marginBottom: "8px" }}>
              Couldn&rsquo;t send — try again.
            </p>
          )}
          <button
            type="submit"
            disabled={state === "sending"}
            className="mono-cta"
            style={{
              padding: "10px 24px",
              background: "var(--color-ink)",
              color: "var(--color-surface)",
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.08em",
            }}
          >
            {state === "sending"
              ? "Sending…"
              : kind === "cancel"
                ? "Send cancellation request"
                : "Send change request"}
          </button>
        </form>
      )}

      <style>{`
        .order-action-link {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-size: 11px;
          color: var(--color-ink-faint);
          transition: color 200ms ease;
        }
        .order-action-link:hover { color: var(--color-ink); }
      `}</style>
    </div>
  );
}

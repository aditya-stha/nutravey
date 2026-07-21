"use client";

/* ─── Set-your-password form for /account/activate and /account/reset ───────
   Redeems the Shopify activation/reset URL (carried in the page's ?t= param)
   against our session route, which validates the URL's origin and swaps it
   plus the chosen password for a signed-in session. */

import { useState } from "react";
import { useRouter } from "next/navigation";

const COPY = {
  activate: { cta: "Activate account →", payloadKey: "activationUrl" },
  reset: { cta: "Set new password →", payloadKey: "resetUrl" },
} as const;

export default function SetPasswordForm({
  mode,
  url,
}: {
  mode: "activate" | "reset";
  url: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "busy") return;
    if (password !== confirm) {
      setError("Passwords don't match.");
      setState("error");
      return;
    }
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/customer/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, [COPY[mode].payloadKey]: url, password }),
      });
      const json: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Try again.");
        setState("error");
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Connection hiccup — try again.");
      setState("error");
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: "420px" }}>
      <Field
        id={`${mode}-password`}
        label="Choose a password"
        value={password}
        onChange={setPassword}
      />
      <Field
        id={`${mode}-confirm`}
        label="Confirm password"
        value={confirm}
        onChange={setConfirm}
      />

      {error && (
        <p
          role="alert"
          className="mono-body"
          style={{
            fontSize: "12px",
            color: "var(--color-strawberry)",
            marginBottom: "16px",
          }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "busy"}
        className="mono-cta"
        style={{
          width: "100%",
          padding: "16px 28px",
          background: "var(--color-ink)",
          color: "var(--color-surface)",
          border: "none",
          cursor: "pointer",
          letterSpacing: "0.08em",
        }}
      >
        {state === "busy" ? "One moment…" : COPY[mode].cta}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        htmlFor={id}
        className="mono-label"
        style={{
          display: "block",
          fontSize: "10px",
          color: "var(--color-ink-muted)",
          marginBottom: "8px",
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type="password"
        required
        minLength={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        className="mono-body"
        style={{
          display: "block",
          width: "100%",
          padding: "13px 16px",
          fontSize: "14px",
          color: "var(--color-ink)",
          background: "var(--color-surface)",
          border: "0.4px solid var(--color-rule)",
        }}
      />
    </div>
  );
}

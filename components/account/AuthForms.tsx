"use client";

/* ─── Sign in / create account / recover — fully on-domain ─────────────────
   Classic customer auth through our own forms; the server route holds the
   Storefront mutations and the httpOnly cookie. No redirects, no hosted
   pages. */

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register" | "recover";

export default function AuthForms() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<
    "idle" | "busy" | "recover-sent" | "error"
  >("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "busy") return;
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/customer/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, email, password, firstName }),
      });
      const json: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Try again.");
        setState("error");
        return;
      }
      if (mode === "recover") {
        setState("recover-sent");
        return;
      }
      router.refresh(); // server re-renders /account with the session cookie
    } catch {
      setError("Connection hiccup — try again.");
      setState("error");
    }
  };

  if (state === "recover-sent") {
    return (
      <p className="mono-body" style={{ fontSize: "14px", color: "var(--color-ink-muted)", maxWidth: "420px" }}>
        If that email has an account, a reset link is on its way. Check your
        inbox, then sign in with the new password.
      </p>
    );
  }

  const tabs: Array<{ id: Mode; label: string }> = [
    { id: "login", label: "Sign in" },
    { id: "register", label: "Create account" },
    { id: "recover", label: "Forgot password" },
  ];

  return (
    <div style={{ maxWidth: "420px" }}>
      <div
        role="tablist"
        aria-label="Account access"
        style={{
          display: "flex",
          gap: "24px",
          borderBottom: "0.4px solid var(--color-rule)",
          marginBottom: "28px",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={mode === t.id}
            onClick={() => {
              setMode(t.id);
              setError("");
              setState("idle");
            }}
            className="mono-cta"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 0 12px",
              fontSize: "12px",
              color: mode === t.id ? "var(--color-ink)" : "var(--color-ink-faint)",
              borderBottom:
                mode === t.id
                  ? "1px solid var(--color-ink)"
                  : "1px solid transparent",
              marginBottom: "-0.7px",
              borderRadius: 0,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit}>
        {mode === "register" && (
          <Field
            id="auth-name"
            label="First name"
            type="text"
            value={firstName}
            onChange={setFirstName}
            autoComplete="given-name"
          />
        )}
        <Field
          id="auth-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        {mode !== "recover" && (
          <Field
            id="auth-password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        )}

        {error && (
          <p role="alert" className="mono-body" style={{ fontSize: "12px", color: "var(--color-strawberry)", marginBottom: "16px" }}>
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
          {state === "busy"
            ? "One moment…"
            : mode === "login"
              ? "Sign in →"
              : mode === "register"
                ? "Create account →"
                : "Send reset link →"}
        </button>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
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
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
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

"use client";

/* Verified-buyer review form. Asks the server whether this session may
   review (signed in + paid + shipped order with this product); anything
   less renders the honest explanation instead of a form. */

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ReviewForm({
  slug,
  accent,
}: {
  slug: string;
  accent: string;
}) {
  const [state, setState] = useState<
    | { phase: "loading" }
    | { phase: "blocked"; reason: string }
    | { phase: "ready" }
    | { phase: "sending" }
    | { phase: "done"; live: boolean }
    | { phase: "error"; message: string }
  >({ phase: "loading" });
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/reviews?product=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((j: { eligible?: boolean; reason?: string }) => {
        if (cancelled) return;
        setState(
          j.eligible
            ? { phase: "ready" }
            : { phase: "blocked", reason: j.reason ?? "Sign in to review." },
        );
      })
      .catch(() => {
        if (!cancelled) setState({ phase: "blocked", reason: "Sign in to review." });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state.phase === "loading") return null;

  if (state.phase === "blocked") {
    return (
      <p className="mono-body" style={{ fontSize: "12px", color: "var(--color-ink-faint)", maxWidth: "440px" }}>
        {state.reason}{" "}
        <Link href="/account" style={{ color: "var(--color-ink)", textDecoration: "underline" }}>
          Your account →
        </Link>
      </p>
    );
  }

  if (state.phase === "done") {
    return (
      <p className="mono-body" style={{ fontSize: "13px", color: "var(--color-ink-muted)", maxWidth: "440px" }}>
        {state.live
          ? "Published — thank you for the honest word."
          : "Received — your review publishes after a quick check."}
      </p>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || state.phase === "sending") return;
    setState({ phase: "sending" });
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: slug, rating, title, body }),
      });
      const json: { ok?: boolean; live?: boolean; error?: string } =
        await res.json();
      if (!res.ok || !json.ok) {
        setState({ phase: "error", message: json.error ?? "Try again." });
        return;
      }
      setState({ phase: "done", live: Boolean(json.live) });
    } catch {
      setState({ phase: "error", message: "Connection hiccup — try again." });
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: "560px" }}>
      <p className="mono-label" style={{ color: "var(--color-ink)", opacity: 0.5, marginBottom: "16px" }}>
        Write a review — verified buyer
      </p>

      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "22px",
              padding: "2px",
              color: n <= rating ? accent : "var(--color-ink-faint)",
            }}
          >
            ★
          </button>
        ))}
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        maxLength={80}
        className="mono-body"
        style={{
          display: "block",
          width: "100%",
          padding: "12px 16px",
          fontSize: "14px",
          color: "var(--color-ink)",
          background: "var(--color-surface)",
          border: "0.4px solid var(--color-rule)",
          marginBottom: "12px",
        }}
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="How has the ritual been?"
        required
        rows={4}
        maxLength={800}
        className="mono-body"
        style={{
          display: "block",
          width: "100%",
          padding: "12px 16px",
          fontSize: "14px",
          lineHeight: 1.6,
          color: "var(--color-ink)",
          background: "var(--color-surface)",
          border: "0.4px solid var(--color-rule)",
          marginBottom: "16px",
          resize: "vertical",
        }}
      />

      {state.phase === "error" && (
        <p role="alert" className="mono-body" style={{ fontSize: "12px", color: "var(--color-strawberry)", marginBottom: "12px" }}>
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={state.phase === "sending"}
        className="mono-cta"
        style={{
          padding: "14px 32px",
          background: accent,
          color: slug === "lemon-zest" ? "var(--color-oxblood)" : "#FAFAFA",
          border: "none",
          cursor: "pointer",
          letterSpacing: "0.08em",
        }}
      >
        {state.phase === "sending" ? "Publishing…" : "Publish review"}
      </button>
    </form>
  );
}

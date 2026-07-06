"use client";

/* ─── Customer sign-in (PKCE) ───────────────────────────────────────────────
   Public OAuth client: generates verifier/challenge in the browser, stashes
   the verifier for the callback page, and hands off to Shopify's hosted
   login (passwordless email code). No password ever touches our site. */

import { useState } from "react";

function b64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export default function SignIn({
  clientId,
  shopId,
}: {
  clientId: string;
  shopId: string;
}) {
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    const verifierBytes = crypto.getRandomValues(new Uint8Array(32));
    const verifier = b64url(verifierBytes);
    const challenge = b64url(
      new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(verifier),
        ),
      ),
    );
    const state = b64url(crypto.getRandomValues(new Uint8Array(16)));
    sessionStorage.setItem("nvy-pkce-verifier", verifier);
    sessionStorage.setItem("nvy-pkce-state", state);

    const url = new URL(
      `https://shopify.com/authentication/${shopId}/oauth/authorize`,
    );
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("response_type", "code");
    url.searchParams.set(
      "redirect_uri",
      `${location.origin}/account/callback`,
    );
    url.searchParams.set(
      "scope",
      "openid email customer-account-api:full",
    );
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("state", state);
    location.href = url.toString();
  };

  return (
    <button
      type="button"
      onClick={signIn}
      disabled={busy}
      className="mono-cta"
      style={{
        display: "inline-block",
        padding: "18px 40px",
        background: "var(--color-ink)",
        color: "var(--color-surface)",
        border: "none",
        cursor: "pointer",
        letterSpacing: "0.08em",
      }}
    >
      {busy ? "Opening Shopify…" : "Sign in with email →"}
    </button>
  );
}

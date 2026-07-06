"use client";

/* OAuth callback: recovers the PKCE verifier, exchanges the code via our
   server route (which sets the httpOnly session cookie), then lands on
   /account. Client page because the verifier lives in sessionStorage. */

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Deferred so the effect never sets state synchronously (lint rule).
    const fail = (msg: string) =>
      requestAnimationFrame(() => setError(msg));

    const code = params.get("code");
    const state = params.get("state");
    const verifier = sessionStorage.getItem("nvy-pkce-verifier");
    const expectedState = sessionStorage.getItem("nvy-pkce-state");

    if (!code || !verifier || !state || state !== expectedState) {
      fail("Sign-in was interrupted. Try again from your account page.");
      return;
    }
    sessionStorage.removeItem("nvy-pkce-verifier");
    sessionStorage.removeItem("nvy-pkce-state");

    fetch("/api/customer/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, verifier }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        router.replace("/account");
      })
      .catch(() => {
        fail("Couldn't complete sign-in. Try again in a moment.");
      });
  }, [params, router]);

  return (
    <div className="content-rail section-padding" style={{ textAlign: "center" }}>
      <p className="mono-label" style={{ opacity: 0.5 }}>
        {error ?? "Signing you in…"}
      </p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  );
}

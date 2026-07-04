"use client";

/* Route-level error boundary. Renders inside the root layout, so Header /
   Footer and theme stay intact — the failure reads as a composed page, not
   a blank screen. `unstable_retry` re-renders the failed segment. */

import { useEffect } from "react";
import Link from "next/link";
import SystemPage from "@/components/SystemPage";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Surfaces in the browser console and session replay tooling once added.
    console.error("[nutravey] route error:", error);
  }, [error]);

  return (
    <SystemPage
      eyebrow="Unexpected Error"
      heading="Something went wrong."
      copy="The page hit an error while rendering. A retry usually clears it — if it doesn't, the rest of the site is unaffected."
    >
      <div className="system-actions">
        <button
          type="button"
          className="system-retry mono-cta"
          onClick={() => unstable_retry()}
        >
          Try again
        </button>
        <Link href="/" className="system-home-link mono-cta">
          Go home →
        </Link>
      </div>
      {error.digest && <p className="system-ref">Ref {error.digest}</p>}
    </SystemPage>
  );
}

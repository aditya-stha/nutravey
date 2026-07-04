"use client";

/* Last-resort boundary: replaces the root layout when the layout itself
   crashes, so it must supply its own <html>/<body> and import global styles
   directly. Header/Footer are unavailable here by definition — keep it to
   the brand's typographic minimum. */

import { useEffect } from "react";
import "./globals.css";
import SystemPage from "@/components/SystemPage";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[nutravey] fatal error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <SystemPage
          eyebrow="Nutravey — Unexpected Error"
          heading="Something went wrong."
          copy="The site hit an error while loading. A retry usually clears it."
        >
          <div className="system-actions">
            <button
              type="button"
              className="system-retry mono-cta"
              onClick={() => unstable_retry()}
            >
              Try again
            </button>
            {/* Plain <a>: the root layout (and router) just crashed — a full
                page load is the only reliable way out. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="system-home-link mono-cta">
              Go home →
            </a>
          </div>
          {error.digest && <p className="system-ref">Ref {error.digest}</p>}
        </SystemPage>
      </body>
    </html>
  );
}

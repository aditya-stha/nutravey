/* ─── Client analytics ──────────────────────────────────────────────────────
   One call site per business event, two sinks:
   1. GA4 (when NEXT_PUBLIC_GA_ID is set and the tag loaded) — dashboards.
   2. /api/events — first-party structured log the business owns, immune to
      ad blockers for same-origin requests and kept even if GA is swapped out.
   Event names follow the GA4 ecommerce schema (view_item, add_to_cart,
   begin_checkout, generate_lead) so GA reports work out of the box. */

export type EventParams = Record<string, string | number | boolean | undefined>;

export function track(event: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;

  (window as { gtag?: (...args: unknown[]) => void }).gtag?.(
    "event",
    event,
    params,
  );

  try {
    const body = JSON.stringify({ event, params, path: location.pathname });
    // sendBeacon survives the page unloading (e.g. begin_checkout right
    // before navigating to Shopify checkout).
    const sent = navigator.sendBeacon?.(
      "/api/events",
      new Blob([body], { type: "application/json" }),
    );
    if (!sent) {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Analytics must never break the storefront.
  }
}

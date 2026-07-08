// lib/unlock-store.ts
export async function unlockAndCheckout(checkoutUrl: string) {
  await fetch("/api/unlock", { method: "POST" });
  window.location.href = checkoutUrl;
}

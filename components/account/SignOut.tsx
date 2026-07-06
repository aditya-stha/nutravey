"use client";

import { useRouter } from "next/navigation";

export default function SignOut() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="mono-cta"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        color: "var(--color-ink-faint)",
        transition: "opacity 200ms ease",
      }}
      onClick={async () => {
        await fetch("/api/customer/token", { method: "DELETE" });
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}

"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "nutravey-theme";

/* The <html data-theme> attribute IS the source of truth — it's set
   pre-paint by the inline script in app/layout.tsx, persisted to
   localStorage, and watched here via MutationObserver. This avoids
   the read-on-mount + setState pattern that React 19 flags. */
function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function subscribe(callback: () => void) {
  const obs = new MutationObserver(callback);
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => obs.disconnect();
}

function setTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {}
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      title={isDark ? "Light" : "Dark"}
      className="transition-opacity duration-200 hover:opacity-50"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        background: "transparent",
        border: "none",
        borderRadius: 0,
        padding: 0,
        cursor: "pointer",
        color: "var(--color-ink)",
        lineHeight: 0,
      }}
      suppressHydrationWarning
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16.5 12.5A6.5 6.5 0 0 1 7.5 3.5 6.5 6.5 0 1 0 16.5 12.5Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="3.2" />
      <path d="M10 1.6V3.6 M10 16.4V18.4 M3.6 10H1.6 M18.4 10H16.4 M4.7 4.7L3.3 3.3 M16.7 16.7L15.3 15.3 M4.7 15.3L3.3 16.7 M16.7 3.3L15.3 4.7" />
    </svg>
  );
}

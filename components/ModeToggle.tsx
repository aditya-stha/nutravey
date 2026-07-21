"use client";

import { usePreLaunch } from "@/components/providers/PreLaunchProvider";
import { PRE_LAUNCH_COOKIE } from "@/lib/pre-launch";

/* Floating preview control — flips the whole site between pre-launch and live
   by writing the nv_mode cookie and reloading. The cookie overrides the
   NEXT_PUBLIC_PRE_LAUNCH default per session, so two browsers can view both
   modes off the same deployment. Rendered only in dev or while the dev gate
   is active (see app/layout.tsx); remove at public launch. */
export default function ModeToggle() {
  const preLaunch = usePreLaunch();

  function setMode(mode: "prelaunch" | "live") {
    document.cookie = `${PRE_LAUNCH_COOKIE}=${mode}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }

  return (
    <div className="nv-mode" role="group" aria-label="Preview mode">
      <span className="nv-mode-tag">Mode</span>
      <button
        type="button"
        className="nv-mode-btn"
        data-active={preLaunch}
        aria-pressed={preLaunch}
        onClick={() => setMode("prelaunch")}
      >
        Pre-launch
      </button>
      <button
        type="button"
        className="nv-mode-btn"
        data-active={!preLaunch}
        aria-pressed={!preLaunch}
        onClick={() => setMode("live")}
      >
        Live
      </button>

      <style>{`
        .nv-mode {
          position: fixed;
          left: 16px;
          bottom: 16px;
          z-index: 90;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 5px 6px 5px 12px;
          border-radius: 999px;
          background: rgba(26, 7, 20, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
          -webkit-backdrop-filter: blur(6px);
          backdrop-filter: blur(6px);
          font-family: var(--font-mono);
        }
        .nv-mode-tag {
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          margin-right: 5px;
        }
        .nv-mode-btn {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.62);
          background: transparent;
          border: 0;
          border-radius: 999px;
          padding: 5px 11px;
          cursor: pointer;
          transition: color 0.15s ease, background-color 0.15s ease;
        }
        .nv-mode-btn:hover { color: #fff; }
        .nv-mode-btn[data-active="true"] {
          color: #fff;
          background: #C41B4A;
        }
      `}</style>
    </div>
  );
}

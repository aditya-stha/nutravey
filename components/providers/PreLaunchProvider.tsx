"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { PRE_LAUNCH_COOKIE, envPreLaunch, resolvePreLaunch } from "@/lib/pre-launch";

/* Client-side effective mode. SSR and the first client render use the env
   default (so static/SSG pages hydrate without a mismatch); after mount we
   reconcile to any `nv_mode` cookie override. Kept out of the root layout's
   server render on purpose — reading the cookie there would force every page
   dynamic and forfeit static generation. */

const PreLaunchContext = createContext<boolean>(envPreLaunch());

function readModeCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${PRE_LAUNCH_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function PreLaunchProvider({ children }: { children: ReactNode }) {
  const [preLaunch, setPreLaunch] = useState<boolean>(envPreLaunch());

  useEffect(() => {
    setPreLaunch(resolvePreLaunch(readModeCookie()));
  }, []);

  return (
    <PreLaunchContext.Provider value={preLaunch}>
      {children}
    </PreLaunchContext.Provider>
  );
}

export function usePreLaunch(): boolean {
  return useContext(PreLaunchContext);
}

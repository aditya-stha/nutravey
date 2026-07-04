import type { Instrumentation } from "next";
import { log } from "@/lib/log";

/* Server observability entry point. Every uncaught server error (render,
   route handler, server action) lands here as one structured log line —
   alertable from the Vercel dashboard today. When a Sentry account exists,
   initialize @sentry/nextjs in register() and forward from onRequestError;
   the call sites don't change. */

export function register() {
  // Reserved for APM/Sentry init.
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const err = error as { message?: string; digest?: string };
  log.error("server_error", {
    message: err.message,
    digest: err.digest,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  });
};

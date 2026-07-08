import { NextResponse } from "next/server";

export async function POST() {
  const password = process.env.SHOPIFY_STORE_PASSWORD;
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  const res = await fetch(`https://${domain}/password`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `form_type=storefront_password&utf8=✓&password=${encodeURIComponent(password!)}`,
    redirect: "manual",
  });

  const cookie = res.headers.get("set-cookie");
  const response = NextResponse.json({ ok: true });

  if (cookie) {
    response.headers.set("set-cookie", cookie);
  }

  return response;
}

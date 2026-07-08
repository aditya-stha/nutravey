import "server-only";
import { log } from "@/lib/log";

/* ─── Transactional email via Resend ────────────────────────────────────────
   Env-gated like every integration: without RESEND_API_KEY the send is
   skipped and logged, and the reserver still gets their pass link in the
   UI. RESEND_FROM must be a sender on a domain verified in Resend. */

/* Reservation names arrive user-controlled and length-checked only — left
   unescaped they'd let anyone send our-domain-branded HTML to any inbox. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendPassEmail({
  to,
  name,
  flavor,
  id,
  passUrl,
}: {
  to: string;
  name: string;
  flavor: string;
  id: string;
  passUrl: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) {
    log.warn("pass_email_skipped", { id, reason: "resend not configured" });
    return false;
  }

  const html = `
  <div style="margin:0;padding:40px 16px;background:#FAFAFA;font-family:'Courier New',monospace;color:#3D1322;">
    <div style="max-width:480px;margin:0 auto;">
      <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.6;margin:0 0 24px;">Nutravey — Ritual Pass</p>
      <div style="background:#1A0518;color:#FAFAFA;padding:28px;border-top:1px solid #5EF0FF;">
        <p style="font-size:10px;letter-spacing:0.2em;color:rgba(255,255,255,0.5);margin:0 0 4px;">RITUAL PASS</p>
        <p style="font-size:18px;font-weight:600;margin:0 0 24px;">NUTRAVEY</p>
        <p style="font-size:10px;letter-spacing:0.12em;color:rgba(255,255,255,0.4);margin:0 0 2px;">ALLOCATED SLATE</p>
        <p style="font-size:15px;margin:0 0 16px;">${esc(flavor)}</p>
        <p style="font-size:10px;letter-spacing:0.12em;color:rgba(255,255,255,0.4);margin:0 0 2px;">RESERVED FOR</p>
        <p style="font-size:15px;margin:0 0 16px;">${esc(name)}</p>
        <p style="font-size:10px;letter-spacing:0.12em;color:rgba(255,255,255,0.4);margin:0 0 2px;">SLOT ID</p>
        <p style="font-size:14px;letter-spacing:0.2em;margin:0;">${esc(id)}</p>
      </div>
      <p style="font-size:13px;line-height:1.7;margin:28px 0;">
        Your slot in the first batch is reserved — no payment until launch.
        Your pass lives at the private link below; it shows your card and the
        countdown to launch. Keep it to yourself.
      </p>
      <a href="${passUrl}" style="display:inline-block;background:#3D1322;color:#FAFAFA;padding:14px 28px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;">View your pass →</a>
      <p style="font-size:11px;opacity:0.5;margin-top:36px;">You received this because you reserved a launch slot at Nutravey. Reply to this email to cancel your reservation.</p>
    </div>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `Your Ritual Pass — ${id}`,
        html,
      }),
    });
    if (!res.ok) {
      log.error("pass_email_failed", { id, status: res.status });
      return false;
    }
    log.info("pass_email_sent", { id });
    return true;
  } catch (err) {
    log.error("pass_email_failed", { id, message: String(err) });
    return false;
  }
}


/** Branded order confirmation with the owned /order status link. */
export async function sendOrderEmail({
  to,
  name,
  orderNum,
  total,
  currency,
  orderUrl,
}: {
  to: string;
  name: string;
  orderNum: string;
  total: string;
  currency: string;
  orderUrl: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) {
    log.warn("order_email_skipped", { orderNum, reason: "resend not configured" });
    return false;
  }

  const html = `
  <div style="margin:0;padding:40px 16px;background:#FAFAFA;font-family:'Courier New',monospace;color:#3D1322;">
    <div style="max-width:480px;margin:0 auto;">
      <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.6;margin:0 0 24px;">Nutravey — Order Confirmed</p>
      <p style="font-size:22px;font-weight:600;margin:0 0 16px;">The ritual is on its way, ${esc(name)}.</p>
      <p style="font-size:13px;line-height:1.7;margin:0 0 24px;">
        Order ${esc(orderNum)} — ${esc(total)} ${esc(currency)} — is confirmed. Your order page
        below has the summary and live tracking as it ships.
      </p>
      <a href="${orderUrl}" style="display:inline-block;background:#3D1322;color:#FAFAFA;padding:14px 28px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;">View your order →</a>
      <p style="font-size:11px;opacity:0.5;margin-top:36px;">Questions? Just reply to this email.</p>
    </div>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: `Order confirmed — ${orderNum}`, html }),
    });
    if (!res.ok) {
      log.error("order_email_failed", { orderNum, status: res.status });
      return false;
    }
    log.info("order_email_sent", { orderNum });
    return true;
  } catch (err) {
    log.error("order_email_failed", { orderNum, message: String(err) });
    return false;
  }
}

/** Tells a referrer their code was used and delivers their reward code. */
export async function sendRewardEmail({
  to,
  firstName,
  rewardCode,
  percent,
}: {
  to: string;
  firstName: string;
  rewardCode: string;
  percent: number;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) {
    log.warn("reward_email_skipped", { rewardCode, reason: "resend not configured" });
    return false;
  }

  const html = `
  <div style="margin:0;padding:40px 16px;background:#FAFAFA;font-family:'Courier New',monospace;color:#3D1322;">
    <div style="max-width:480px;margin:0 auto;">
      <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.6;margin:0 0 24px;">Nutravey — Referral Reward</p>
      <p style="font-size:22px;font-weight:600;margin:0 0 16px;">A friend just ordered with your code, ${esc(firstName)}.</p>
      <p style="font-size:13px;line-height:1.7;margin:0 0 24px;">
        As promised: ${percent}% off your next order. One use, yours alone.
      </p>
      <p style="font-size:18px;letter-spacing:0.2em;border:1px solid #3D1322;display:inline-block;padding:12px 24px;margin:0 0 24px;">${rewardCode}</p>
      <p style="font-size:11px;opacity:0.5;margin-top:16px;">Enter it at checkout. Every friend who orders with your referral code earns you another.</p>
    </div>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: `Your ${percent}% referral reward`, html }),
    });
    if (!res.ok) {
      log.error("reward_email_failed", { rewardCode, status: res.status });
      return false;
    }
    log.info("reward_email_sent", { rewardCode });
    return true;
  } catch (err) {
    log.error("reward_email_failed", { rewardCode, message: String(err) });
    return false;
  }
}

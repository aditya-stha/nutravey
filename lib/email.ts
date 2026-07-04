import "server-only";
import { log } from "@/lib/log";

/* ─── Transactional email via Resend ────────────────────────────────────────
   Env-gated like every integration: without RESEND_API_KEY the send is
   skipped and logged, and the reserver still gets their pass link in the
   UI. RESEND_FROM must be a sender on a domain verified in Resend. */

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
        <p style="font-size:15px;margin:0 0 16px;">${flavor}</p>
        <p style="font-size:10px;letter-spacing:0.12em;color:rgba(255,255,255,0.4);margin:0 0 2px;">RESERVED FOR</p>
        <p style="font-size:15px;margin:0 0 16px;">${name}</p>
        <p style="font-size:10px;letter-spacing:0.12em;color:rgba(255,255,255,0.4);margin:0 0 2px;">SLOT ID</p>
        <p style="font-size:14px;letter-spacing:0.2em;margin:0;">${id}</p>
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

# Nutravey — Development Roadmap

Benchmark: [humantra.co.uk](https://humantra.co.uk/) (audited 2026-07-05) — a stock
Shopify storefront whose strength is commerce mechanics + accumulated social
proof, not design or engineering. Strategy: **beat them on design and trust
depth, neutralize their mechanics, extend our architecture lead.** Don't try to
out-social-proof 5,000 reviews at launch; time and a reviews program are the
only way across that moat.

Legend: `[x]` shipped · `[ ]` to build · `(you)` = founder-side, not code.

## 1 — Design (their weakest front)

- [x] Distinctive editorial system — LEMONMILK typographic identity, mono
      labels, hairlines, canvas/glow language, corner-radius tokens
- [x] Holo Ritual Pass artifact (shop + PDP + /pass)
- [ ] **Real photography** (you) — powder-in-water macro, hands, ritual
      moments. The one place Humantra visibly outclasses us; highest-priority
      spend.
- [ ] Flavour-world art direction per PDP (accent system is the skeleton)
- [ ] One signature interactive moment per page; no template genericism
      (their testimonial carousel / circular flavour chips)

## 2 — Commerce mechanics (neutralize; mostly Shopify config + surfacing)

- [x] **Subscriptions** — Shopify Selling Plans on PDPs: one-time vs
      subscribe toggle, % savings, frequency picker (their entire pricing
      psychology is built on Subscribe & Save 20%; biggest structural gap)
- [x] Bundle — The Curation wired to live commerce ($108 / compare-at $126)
- [ ] Build-your-own bundle picker (post-launch)
- [ ] Launch offer = reservation list: honor the 15% VIP promise as the
      starter-pack equivalent of their 40%-off pack
- [x] Referral loop: slot ID = referral code (5% friend / 5% reward via
      webhook + Admin API), /r/<code> share links, cart auto-apply
- [ ] Gift-with-purchase threshold mechanic (their "2+ boxes → free bottle")
      — decide the Nutravey equivalent (you)

## 3 — Trust depth (leapfrog their badge-level trust)

- [x] Evidence-based /standards: per-batch third-party COAs (vs their single
      Informed Sport badge)
- [x] Batch lookup: lot number → lab results, production date, facility
- [x] /ritual/[batch] QR experience: box → verification, batch COA,
      flavour-matched ritual guidance, one-tap refill
- [ ] Reviews program from day one (you: pick Judge.me / Shopify reviews;
      seed from reservation customers post-launch)
- [x] PDP FAQ content in brand voice (calories, fasting, caffeine, vegan —
      they answer these; we should too)

## 4 — Architecture lead (keep doing what a theme can't)

- [x] Next.js static/ISR storefront; Shopify only for commerce truth
- [x] First-party analytics event log + GA4 ecommerce funnel
- [x] HMAC webhook receiver: server-side purchase records, instant
      price/stock revalidation
- [x] Signed pass system (no-database capability URLs) + launch countdown
- [x] Security headers, branded error surfaces, structured server logging,
      CI with money-path smoke tests
- [x] Owned post-purchase: webhook-driven branded confirmation email +
      signed /order status page

## Launch blockers (accounts/credentials — all you)

- [x] Shopify store connected: Electrolytes Powder Mix (3 variants, $42,
      USD) + Headless channel public token; live add-to-cart verified
- [ ] Automatic discount "The Curation — Save $18" ($6 off each of the 3
      variants, min qty 3) — the bundle page promises it at checkout
- [ ] Subscribe & Save: install the free "Shopify Subscriptions" app and
      create a selling plan group on the Electrolytes product — the PDP
      selector appears automatically
- [ ] Bogus Gateway test order (card `1` at checkout) — verify order lands
      in admin
- [ ] Vercel project + env vars (copy from .env.local + the rest of
      .env.local.example)
- [ ] Webhook subscription (orders/create, products/update →
      https://<domain>/api/webhooks/shopify) + SHOPIFY_WEBHOOK_SECRET —
      needs the deployed URL, so after first deploy
- [ ] SHOPIFY_ADMIN_CLIENT_SECRET (Dev Dashboard app) — waitlist leads →
      tagged customers (leads only logged until then)
- [ ] PASS_SIGNING_SECRET (openssl rand -hex 32) — REQUIRED in production
- [ ] Resend account + verified domain (reservation emails)
- [ ] Real NEXT_PUBLIC_LAUNCH_DATE
- [ ] Decide: honor 15% VIP discount copy (promised on the reservation
      form + pass page); create the launch discount for the pre-launch
      customer segment
- [ ] Launch day: flip NEXT_PUBLIC_PRE_LAUNCH=false in Vercel, email the
      pre-launch list, remove Shopify store password
- [ ] Real batch/COA data: replace pilot placeholders in lib/batches.ts,
      drop COA PDFs in /public/coa/, print QR (/ritual/<lot>) on packaging

- [x] Customer accounts (Customer Account API, env-gated): PKCE sign-in,
      /account order history — register /account/callback as callback URI
      and set NEXT_PUBLIC_SHOPIFY_CUSTOMER_CLIENT_ID to activate

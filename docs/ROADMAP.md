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
- [ ] Referral loop: "give a friend priority access" on the pass page —
      the pass link is already a shareable artifact
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
- [ ] Owned post-purchase experience: order-confirmed page/email that carries
      the brand past Shopify checkout (theirs is stock Shopify)

## Launch blockers (accounts/credentials — all you)

- [ ] Vercel project + env vars (see .env.local.example)
- [ ] Shopify: 4 products (incl. `the-curation`), Storefront + Admin tokens,
      webhook subscriptions + secret
- [ ] PASS_SIGNING_SECRET (openssl rand -hex 32)
- [ ] Resend account + domain (reservation emails)
- [ ] Real NEXT_PUBLIC_LAUNCH_DATE
- [ ] Decide: honor 15% VIP discount copy (currently promised on the form)

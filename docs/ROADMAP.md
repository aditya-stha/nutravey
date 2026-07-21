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
      spend. (2026-07-08: renders reorganized/optimized to webp under
      /images/products — still renders, not photography.)
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
- [x] Automatic discount "The Curation — Save $18" ($6 off each of the 3
      variants, min qty 3) — live-verified ACTIVE 2026-07-21, matches the
      bundle page's checkout promise exactly
- [x] Subscribe & Save: "Shopify Subscriptions" app installed, "Ritual
      Subscription" selling plan group created on the Electrolytes product
      (live-verified 2026-07-21 via Admin API — covers all 3 flavour
      variants since they're one product) — PDP selector should now appear
      automatically
- [x] Bogus Gateway test order — active; order chain verified through the
      confirmation email (2026-07-15)
- [x] Vercel deploy — live at nutravey.vercel.app (nutravey.com DNS split
      still pending: root → Vercel, shop.nutravey.com → Shopify primary)
- [ ] Vercel env vars — audit against .env.local.example; **PASS_SIGNING_SECRET
      is now HARD-REQUIRED in production** (token signing fails closed:
      reservations 500 without it)
- [x] Dev Dashboard app scopes: granted and live-verified 2026-07-21 —
      root cause was that releasing a new app version doesn't push scopes
      to an already-installed app; reinstalling via the Installs tab did.
      orders/discounts/customers/sellingPlanGroups queries all resolve now
      (note: the reinstall granted the full scope tree, broader than the
      6 actually used — worth trimming later for least privilege). Waitlist
      tagging, referral codes, reward lookups, order stamping, and live
      order tracking are unblocked.
- [x] Webhook subscription + SHOPIFY_WEBHOOK_SECRET — live (admin-created,
      so invisible to the app's webhookSubscriptions query; proven by the
      confirmation email firing on Bogus test orders)
- [x] SHOPIFY_ADMIN_CLIENT_SECRET (Dev Dashboard app) — set
- [ ] PASS_SIGNING_SECRET (openssl rand -hex 32) — REQUIRED in production
- [x] Resend account + verified domain — delivering (order confirmation
      emails confirmed working 2026-07-15)
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

## Visual session (2026-07-22)

Shipped:
- [x] Sachet product renders integrated — cleaned transparent cutouts
      (strawberry/lychee/lemon, dark edge-halo removed) under
      /images/sachets/*-cutout.png, wired via `sachetImage` in lib/products.ts
- [x] PDP sachet spotlight — the single sachet shown large (height-matched to
      the usage text block, not towering) beside "One sachet, one moment.";
      always-on ambient flavour glow + brighter hover glow (scoped canvas-glow,
      no drop-shadow per brand rule)
- [x] Active-formulation infographic (IngredientGrid) rebuilt from scratch to
      the approved V2 spec — exact tile sizes, deep-plum panel (#321027),
      two-colour scheme (plum + gradient-swirl tiles, per-tile randomized
      swirl), JetBrains Mono symbols, tooltip clipping fixed (swirl clipped in
      an inner layer so the tile stays overflow-visible for the tooltip)

Remaining (visual):
- [ ] Infographic mobile treatment — desktop-first only right now; a narrow
      viewport scrolls the 900px card horizontally rather than reflowing
- [ ] Sachet spotlight is on the flavour PDPs only — not yet on /shop or the
      curation/bundle page
- [ ] Broader design items still open above in §1 (real photography,
      flavour-world art direction, one signature interactive moment per page)

## Infrastructure notes (2026-07-08 session)

- [x] Shared signed-token machinery — production fails closed without
      PASS_SIGNING_SECRET (no forgeable links issued or honored)
- [x] Shared per-IP rate limiter with recency eviction (auth, waitlist,
      reviews)
- [x] /api/unlock: server-side store-password pass-through so checkout
      works while the store is password-protected (needs
      SHOPIFY_STORE_PASSWORD env)
- [x] Email HTML-escaping; webhook failure isolation; deterministic
      referral reward codes
- [x] Splash plays once per session; asset tree consolidated under
      /images as webp
- [ ] Shopify notification templates (reference/notifications): welcome +
      password-reset Liquid customized, site_url now www.nutravey.com —
      paste both into Shopify Admin → Settings → Notifications (the reset
      one routes recovery through our /account/reset page); port remaining
      templates. NOTE: store must stay on LEGACY customer accounts — new
      customer accounts hijack the reset link into Shopify's passwordless
      hosted flow (this was the 2026-07-16 reset bug)
- [ ] JetBrains Mono woff2 staged in /public/fonts — self-hosting swap
      (drop the Google Fonts dependency) not wired yet

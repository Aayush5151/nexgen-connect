# v16 launch checklist

Tier-1 external services that need credentials. Each row is a 5-min
signup + a `vercel env add` away from flipping the corresponding
surface from mock to real.

The boot-time `reportLaunchReadiness()` (`web/src/lib/launch-
readiness.ts`) logs a `[launch-readiness] group=X` line on every
production cold start for any missing group, so Vercel deploy logs
are the canonical truth for "what's still mock."

## How to read this

Each block is one signup + a sequence of `vercel env add` commands.
Run from the repo root. The CLI prompts paste each value; flag
`production` so the var lands on the right environment.

```bash
echo "<VALUE>" | vercel env add <KEY> production
```

Then trigger a redeploy:

```bash
git commit --allow-empty -m "chore(deploy): pick up <X> env" \
  && git push origin main
```

---

## 1. Meta WhatsApp Cloud — primary OTP channel

**Sign up:** Meta Business → WhatsApp Business → API Setup. Get a
permanent system-user token, a phone number ID, and pre-approve an
**AUTHENTICATION-category template** with `{{otp}}` body + button.

```bash
echo "<phone-number-id>" | vercel env add META_WA_PHONE_NUMBER_ID production
echo "<system-user-permanent-token>" | vercel env add META_WA_ACCESS_TOKEN production
echo "<approved-template-name>" | vercel env add META_WA_TEMPLATE_NAME production
echo "en" | vercel env add META_WA_TEMPLATE_LANGUAGE production
# Switch primary channel back to WhatsApp:
vercel env rm OTP_PRIMARY_CHANNEL production --yes
echo "whatsapp" | vercel env add OTP_PRIMARY_CHANNEL production
```

**Flips on:** OTP via WhatsApp at ~₹0.115/msg. SMS becomes the
fallback when recipient isn't on WhatsApp.

## 2. MSG91 — SMS fallback

**Sign up:** msg91.com → Auth Key + a DLT-registered template with
`{{otp}}` length 6.

```bash
echo "<auth-key>" | vercel env add MSG91_AUTH_KEY production
echo "<template-id>" | vercel env add MSG91_TEMPLATE_ID production
# Already set: MSG91_SENDER_ID=NXGNCN
# Stop mocking:
vercel env rm MOCK_OTP production --yes
echo "false" | vercel env add MOCK_OTP production
```

**Flips on:** real SMS when WhatsApp recipient isn't on WA.

## 3. Razorpay — premium ₹999

**Sign up:** razorpay.com → Generate API keys + set up a webhook on
`/api/razorpay/webhook` with secret rotation.

```bash
echo "<rzp_live_xxx>" | vercel env add RAZORPAY_KEY_ID production
echo "<rzp_live_xxx>" | vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID production
echo "<key-secret>" | vercel env add RAZORPAY_KEY_SECRET production
echo "<webhook-secret>" | vercel env add RAZORPAY_WEBHOOK_SECRET production
```

**Flips on:** real ₹999 charges. Webhook fires `premium/order.paid`
Inngest event → durable job marks `user_premium` paid.

## 4. Resend — transactional email

**Sign up:** resend.com → API key. Verify a sender domain (or use
your Resend-account email until then).

```bash
echo "<re_xxx>" | vercel env add RESEND_API_KEY production
# Already set: RESEND_FROM_ADDRESS, ADMIN_EMAIL
```

**Flips on:** welcome email after phone OTP, parent-link magic link.

## 5. Cloudflare Turnstile — anti-bot on /signup

**Sign up:** dash.cloudflare.com → Turnstile → Add Site (managed
challenge).

```bash
echo "<0x4AAA...>" | vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY production
echo "<secret>" | vercel env add TURNSTILE_SECRET_KEY production
```

**Flips on:** anti-bot challenge on /signup. Currently the widget
shows "BOT-CHECK SKIPPED (DEV MODE)" because the site key is unset.

## 6. Cloudflare Images — admit-letter upload

**Sign up:** dash.cloudflare.com → Images → API tokens.

```bash
echo "<account-id>" | vercel env add CF_IMAGES_ACCOUNT_ID production
echo "<api-token>" | vercel env add CF_IMAGES_API_TOKEN production
echo "<delivery-domain>" | vercel env add CF_IMAGES_DELIVERY_URL production
echo "true" | vercel env add NEXT_PUBLIC_USE_REAL_CF_IMAGES production
```

**Flips on:** real admit-letter upload via direct-creator-upload URLs.

## 7. Inngest — durable jobs

**Sign up:** inngest.com → New App → Event key + signing key.

```bash
echo "<event-key>" | vercel env add INNGEST_EVENT_KEY production
echo "<signing-key>" | vercel env add INNGEST_SIGNING_KEY production
```

**Flips on:** four durable jobs start running:

- **razorpay-paid** — webhook → user_premium upsert + receipt email
- **ts-sla** — chat report → 4h delayed escalation
- **push-fanout** — chat message → web-push to corridor members
- **welcome-email** — phone OTP → Resend welcome + admin alert

`/api/inngest` stops returning 500.

## 8. Sentry — error tracking

**Sign up:** sentry.io → New Project (Next.js) → DSN.

```bash
echo "<dsn>" | vercel env add SENTRY_DSN production
echo "<dsn>" | vercel env add NEXT_PUBLIC_SENTRY_DSN production
```

**Flips on:** server + browser error capture. Replay (errors-only)
records the user's last 30s on every captured error.

## 9. PostHog — funnel analytics

**Sign up:** app.posthog.com → New Project → Project API Key.

```bash
echo "<phc_xxx>" | vercel env add NEXT_PUBLIC_POSTHOG_KEY production
echo "https://app.posthog.com" | vercel env add NEXT_PUBLIC_POSTHOG_HOST production
```

**Flips on:** the 25 events in `docs/v16-event-taxonomy.md` start
landing in dashboards. PII scrub already applied client-side.

---

## Verifying after each block

```bash
# Boot logs — should show one less [launch-readiness] line per block:
vercel logs --follow $(vercel ls --prod --json 2>/dev/null | jq -r '.[0].url')

# Live tRPC smoke (anonymous, hits the auth.requestOtp procedure):
curl https://nexgen-connect.vercel.app/api/trpc/auth.requestOtp \
  -X POST -H "content-type: application/json" \
  -d '{"phone":{"country":"IN","e164":"919876543210"}}' | jq

# Inngest health (after #7):
curl https://nexgen-connect.vercel.app/api/inngest | jq
# Expect: 200 with function list, not 500
```

---

## Tier-2 follow-ups (none block launch)

Tracked in `docs/v16-cross-cut-cleanups.md`:

- Drop `web/src/lib/msg91.ts` once `/admin/login` + legacy waitlist
  server-actions migrate through tRPC
- Replace hand-curated `packages/server/src/db/schema.ts` with
  `drizzle-kit pull` at staging cut-over (target end of June 2026)
- Lift `axe` a11y violations on the marketing surface to zero +
  remove `continue-on-error` from `web-a11y.yml`

v16 web pivot Bucket 4 follow-up.

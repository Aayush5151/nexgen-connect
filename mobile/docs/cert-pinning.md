# Cert pinning rotation runbook

Operational doc for rotating SPKI public-key pins in [`mobile/src/lib/security/cert-pinning.ts`](../src/lib/security/cert-pinning.ts).

Build Prompt §Bucket 3 / Certificate pinning:

> "Pin to public keys (not certs) with backup pins. Validate at every TLS handshake."

---

## Why public-key pinning, not cert pinning

A certificate is the leaf of a TLS chain — it changes every 90 days for Let's Encrypt-issued hosts and at varying cadences for commercial CAs. Pinning a cert means an app rebuild every rotation.

A **public-key pin** is the SHA-256 hash of the host's Subject Public Key Info (SPKI) field. It survives cert rotation as long as the underlying public/private key pair doesn't change — which for most production hosts is on the order of 1–2 years.

Each host gets at least **one backup pin** so a planned key rotation doesn't brick already-installed app builds. The mobile app accepts a connection if the host's current SPKI matches **any** pin in the list.

---

## Extracting an SPKI hash

Given a hostname, this command outputs the hash:

```bash
HOST=api.razorpay.com
echo | openssl s_client -connect "$HOST:443" -servername "$HOST" 2>/dev/null \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
# → e.g., "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
```

Wrap as `sha256/<base64>` when adding to the pin list:

```ts
publicKeyHashes: [
  "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", // primary
  "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=", // backup (next-rotation key)
],
```

**Backup pins are not optional.** A single-pin host is one cert-vendor outage away from a brick.

---

## Hosts that need pins

Per `cert-pinning.ts`:

1. **`nexgen-connect-api.vercel.app`** — our tRPC server. Highest priority.
2. **`api.razorpay.com`** — Premium ₹999 checkout.
3. **`api.digitallocker.gov.in`** — Aadhaar VID handshake. MITM here = identity-hash forgery.
4. **`*.supabase.co`** — Storage + Realtime.
5. **`api.twilio.com`** — Voice masked-number bridge.
6. **`api.stripe.com`** — Y1.5 EUR fallback.

---

## Initial extraction (after Bucket 4 deploy)

After the tRPC server deploys:

```bash
for HOST in nexgen-connect-api.vercel.app api.razorpay.com \
            api.digitallocker.gov.in api.twilio.com api.stripe.com; do
  echo "=== $HOST ==="
  echo | openssl s_client -connect "$HOST:443" -servername "$HOST" 2>/dev/null \
    | openssl x509 -pubkey -noout \
    | openssl pkey -pubin -outform der \
    | openssl dgst -sha256 -binary \
    | openssl enc -base64
done

# Supabase is wildcard — pick the project hostname:
HOST=<project-ref>.supabase.co
echo | openssl s_client -connect "$HOST:443" -servername "$HOST" 2>/dev/null \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

Drop the resulting hashes into `cert-pinning.ts`'s `publicKeyHashes` array per host.

---

## Backup pin strategy

For each host, request the **next** rotation key from the vendor:

| Vendor | How to request a future key |
|---|---|
| Vercel | Vercel rotates Let's Encrypt automatically; backup pin = the LE intermediate's SPKI. Pre-extract with `openssl s_client -showcerts` and pin the issuer's public key as backup. |
| Razorpay | Razorpay support → request the Y+1 production key SPKI hash. Email-only delivery. |
| DigiLocker | Government cycles less predictably. Pin the leaf + the UIDAI-CA's intermediate. |
| Supabase | Same as Vercel — LE rotation. Pin LE intermediate as backup. |
| Twilio | API Keys page exposes upcoming key. Extract its SPKI. |
| Stripe | Stripe rotates predictably; pin upcoming key from Stripe Dashboard → Developers → API keys. |

---

## Rotation procedure

When a vendor rotates their key:

1. **Confirm rotation date** with vendor support 30+ days ahead.
2. **Add the new key as an additional pin** in `cert-pinning.ts` (don't replace yet).
3. **Ship a mobile build** with both pins active. TestFlight / Play Internal Track for 7 days.
4. **On the rotation date**, vendor's host now serves the new key. App still validates because the new pin is in the list.
5. **2 weeks after rotation**, verify rollback is no longer needed (no users on the old build), then remove the old pin in the next mobile build.

The **two-pin overlap window** is non-negotiable. Skipping it = bricked installs.

---

## What to do if pinning fails in production

Symptom: users report "can't connect to NexGen" but DNS works.

1. **Confirm MITM vs vendor change**: from a clean network (cellular not WiFi), does `openssl s_client` against the host return a cert that matches an existing pin?
   - If yes: bug in the pinning code — file a Sentry issue.
   - If no: vendor rotated unexpectedly.
2. **Hot-fix path**: ship an OTA update that disables pinning (`PINNING_ENABLED = false`) only as a last resort. Pinning OFF is worse than pinning slightly stale, so prefer adding the new pin via OTA if possible.
3. **Permanent fix**: extract new SPKI, add to pins, ship a regular build, communicate to users.

OTA-updateable kill-switch lives at `cert-pinning.ts`'s `PINNING_ENABLED` constant; flip it via `eas update --channel production --message "kill-switch: pinning OFF for vendor rotation"`.

---

## Why dev mode disables pinning

`PINNING_ENABLED = !__DEV__` so:

- Hot-reload Metro bundler isn't pinned (it's localhost anyway).
- Charles / mitmproxy debugging works without uninstall-reinstall.
- Local proxies for testing don't break dev velocity.

Production builds (EAS production profile) ship with `__DEV__ === false` → pinning ON.

---

## Audit gate

Bucket 6 ships an integration test that hits a known-bad-cert endpoint and asserts the TLS handshake fails when pinning is on. This must pass before any production build promotes to `release/*` tag.

v15 BP §16 / v6 build §11 / Build Prompt Bucket 3 + 5.

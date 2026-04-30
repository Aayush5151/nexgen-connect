# EAS provisioning runbook

The exact steps Aayush runs once the credentials block clears. Until they do, every CI step that needs a credential is gated behind a secret-presence check and emits a `::warning::` instead of failing — see [build-prompt-decisions.md C1](./build-prompt-decisions.md).

---

## What's already wired

- [`mobile/eas.json`](../eas.json) — three build profiles (development / preview / production) and one submit profile.
- [`.github/workflows/mobile-pr.yml`](../../.github/workflows/mobile-pr.yml) — PR gate (no credentials needed).
- [`.github/workflows/mobile-main.yml`](../../.github/workflows/mobile-main.yml) — preview build on main merge (gated).
- [`.github/workflows/mobile-release.yml`](../../.github/workflows/mobile-release.yml) — production build on `release/*` tag (gated).

Until `EXPO_TOKEN` is set in repo secrets, the main + release workflows skip the build step and emit a `::notice::` line.

---

## Provisioning order (what to do, in this order)

### 1. Apple Developer Program ($99/yr, founder's identity)

1. Enrol at [developer.apple.com](https://developer.apple.com/programs/) using a personal Apple ID owned by the founder. Personal account only, NOT enterprise — that wedges App Store Connect.
2. After enrolment is complete (24–48h verification window):
   - Note the **Apple ID** (the email you enrolled with).
   - Note the **Team ID** (visible at developer.apple.com/account → Membership).

### 2. App Store Connect

1. At [appstoreconnect.apple.com](https://appstoreconnect.apple.com/) → My Apps → "+" → New App.
2. Bundle ID: **`app.nexgenconnect`** (per C1 of decisions doc; matches `mobile/app.json`'s ios.bundleIdentifier).
3. App name: **NexGen Connect**.
4. Primary language: English (U.K.).
5. SKU: `nexgen-connect-ios` (any unique string — never displayed).
6. After creation, note the **ASC App ID** (the numeric column on My Apps).

### 3. App Store Connect API key

1. App Store Connect → Users and Access → Keys → "+".
2. Name: `nexgen-connect-eas`.
3. Access: Admin (lower tiers don't have submit permission).
4. Download the `AuthKey_*.p8` file. **Cannot be re-downloaded.** Store immediately.
5. Note the **Key ID** (header of the row).
6. Note the **Issuer ID** (top of the Keys page, UUID format).

### 4. Google Play Console ($25 one-time)

1. Enrol at [play.google.com/console](https://play.google.com/console) (personal account).
2. After enrolment, create app: **NexGen Connect**, package name **`app.nexgenconnect`** (matches Android.package in `mobile/app.json`).
3. Default language: English (United Kingdom).

### 5. Google Play Service Account (for EAS Submit)

Per [Expo's official guide](https://docs.expo.dev/submit/android/):

1. [console.cloud.google.com](https://console.cloud.google.com/) → Select Play Console linked project (auto-created when you enrol).
2. IAM & Admin → Service Accounts → "+ Create Service Account".
3. Name: `nexgen-eas-submit`.
4. Role: none initially — Play Console grants the play.google.com permissions.
5. Keys tab → Add Key → JSON → Download. Save as `google-play-service-account.json`. **Never commit.**
6. Play Console → Users and Permissions → Invite Users → invite the service account email (from the JSON's `client_email` field). Permissions: Admin (all permissions).
7. Wait 24h for invitations + permissions to propagate. EAS Submit will fail before this.

### 6. Expo / EAS account ($99/yr Production tier)

1. [expo.dev](https://expo.dev) → Sign up with the same email used for App Store Connect (consistency reduces issues).
2. Settings → Access Tokens → "+ Create Token". Name: `nexgen-github-actions`. Scope: read+write.
3. Save the token immediately. Cannot be re-shown.
4. Subscribe to the Production tier on the Expo billing page (or first build will be queued indefinitely).

### 7. Sentry (optional but recommended for prod)

1. [sentry.io](https://sentry.io) → Create org `nexgen-connect`.
2. Create projects: `nexgen-mobile-ios`, `nexgen-mobile-android`, `nexgen-server`.
3. Note each DSN.
4. Settings → Auth Tokens → "+ Create New Token". Scopes: project:write, project:releases. Save.

### 8. PostHog (optional)

1. [posthog.com](https://posthog.com) → Create project per environment: `nexgen-dev`, `nexgen-preview`, `nexgen-production`.
2. Note each project's API key.

---

## GitHub secrets to set

After provisioning, add these to **github.com/Aayush5151/nexgen-connect → Settings → Secrets and variables → Actions**:

### Required for builds

| Secret | Source | Workflows that use it |
|---|---|---|
| `EXPO_TOKEN` | step 6 | `mobile-main.yml`, `mobile-release.yml` |

### Required for submit

| Secret | Source | Workflows that use it |
|---|---|---|
| `APPLE_ID` | step 1 (the email) | `mobile-release.yml` |
| `APPLE_TEAM_ID` | step 1 (the Team ID) | `mobile-release.yml` |
| `ASC_APP_ID` | step 2 | `mobile-release.yml` |

For iOS auth, EAS uses the App Store Connect API key file. Upload via:

```bash
cd mobile
eas credentials
# Choose iOS → App Store Connect API → Upload .p8 file from step 3
# EAS stores the key on its servers; CI uses EXPO_TOKEN to retrieve it.
```

For Android, place `google-play-service-account.json` from step 5 in the **monorepo root** (gitignored — never commit). EAS Build picks it up via the path declared in `mobile/eas.json` submit.production.android.serviceAccountKeyPath.

### Optional (Sentry source-map upload)

| Secret | Source |
|---|---|
| `SENTRY_AUTH_TOKEN` | step 7 |
| `SENTRY_ORG` | `nexgen-connect` |
| `SENTRY_PROJECT` | `nexgen-mobile-ios` (or matching) |

### Optional (PostHog per-environment)

These go into Vercel env vars (for the server) + EAS env vars (per build profile, baked into the bundle):

| EAS profile | EAS env var | Source |
|---|---|---|
| development | `EXPO_PUBLIC_POSTHOG_KEY` | step 8 dev key |
| preview | `EXPO_PUBLIC_POSTHOG_KEY` | step 8 preview key |
| production | `EXPO_PUBLIC_POSTHOG_KEY` | step 8 production key |

Set via `eas secret:create` per profile.

---

## Verification

Once all credentials are in place:

```bash
# 1. Verify EAS auth
cd mobile
eas whoami        # should print Aayush's username
eas build --profile development --platform ios --non-interactive   # smoke test

# 2. Test the main-merge flow
git push origin main    # CI should run mobile-main.yml and start a preview build

# 3. Test the release flow (once a stable version is ready)
git tag -a release/v0.1.0 -m "0.1.0 — first preview"
git push origin release/v0.1.0
# CI runs mobile-release.yml; production environment gate triggers manual approval
```

When the first `release/v0.1.0` build succeeds and uploads to TestFlight + Play Internal Track, **Aayush gets a notification via TestFlight to test** (per Build Prompt §Bucket 5).

---

## Cost summary

| Service | Cost | Frequency |
|---|---|---|
| Apple Developer Program | $99 | annual |
| Google Play Console | $25 | one-time |
| Expo Production tier | $99 | annual |
| Sentry team plan | $26+ | monthly (optional, can use free tier in Y1) |
| PostHog | $0 | (free tier sufficient until 1M events/month) |

**Y1 minimum: $99 + $25 + $99 = $223** plus Sentry if you want production crash visibility.

---

## What happens before credentials are provisioned

CI workflows run successfully but skip every step that needs a secret:

```
mobile-main.yml:
  ✓ Check EAS credentials available
  ::warning::EXPO_TOKEN secret missing. Skipping EAS Build.
  ::warning::See mobile/docs/eas-setup.md for provisioning steps.
  ✓ EAS Build · preview · SKIPPED (no credentials)
```

This is per **C1 of [build-prompt-decisions.md](./build-prompt-decisions.md)** — Bucket 5 ships dry-run mode; credentials are a separate provisioning step Aayush runs.

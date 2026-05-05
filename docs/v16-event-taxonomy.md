# v16 event taxonomy

This is the canonical list of analytics events that the web app
emits. The closed-union types in `web/src/lib/posthog.ts` enforce
this — any new track call that isn't in `EventName` + `EventProps`
will fail typecheck.

When adding a new event, update this file in the same PR.

## Funnel events

| Event | When | Properties |
|---|---|---|
| `signup_started` | Landing CTA → /signup first paint | `source?` |
| `otp_requested` | Phone form submitted | `channel`, `preferSms` |
| `otp_verified` | 6-digit code accepted | `channel`, `durationMs` |
| `otp_failed` | OTP rejected (E020-E022) | `errorCode`, `channel?` |
| `identity_started` | DigiLocker handshake started | — |
| `identity_completed` | DigiLocker callback success | — |
| `identity_failed` | DigiLocker callback failed | `reason` |
| `admit_uploaded` | Cloudflare Images sign-upload OK | `docId` |
| `admit_approved` | Admin marked admit approved | `docId`, `queueWaitMinutes` |
| `admit_rejected` | Admin marked admit rejected | `docId`, `reason`, `canResubmit` |
| `corridor_chosen` | User picked home/destination/intake | `homeCity`, `destination`, `intake`, `coldStart` |

## In-product events

| Event | When | Properties |
|---|---|---|
| `chat_message_sent` | Group chat send confirmed | `corridorId`, `layer` |
| `ts_report_filed` | Trust & Safety report submitted | `reasonCode` |
| `y6_check_in` | Arrival Y6 verified at destination | `destinationCity` |
| `group_apply_join` | User joined a group-apply pool | `groupId` |

## Premium / parent

| Event | When | Properties |
|---|---|---|
| `premium_checkout_started` | Razorpay order created | `orderId` |
| `premium_paid` | Razorpay webhook confirmed | `orderId`, `amountInr` |
| `premium_failed` | Razorpay declined | `orderId`, `reason` |
| `parent_link_sent` | Magic link emailed | — |
| `parent_link_verified` | Parent opened the link | — |

## Compliance

| Event | When | Properties |
|---|---|---|
| `consent_accepted` | Cookie banner / privacy accept | `policyVersion` |
| `consent_revoked` | User opted out | `policyVersion` |
| `erasure_requested` | User filed §17 erasure | — |

## PII discipline

The following keys are stripped on every track() call by
`scrubProperties` in `web/src/lib/posthog.ts`:

- `phone`, `phoneE164`, `e164`, `e_164`
- `aadhaar`, `aadhar`, `vid`, `otp`, `code`
- `email`
- `sessionToken`, `refreshToken`, `sb-access-token`, `sb-refresh-token`

User identification uses the internal `verified_user.id` UUID only.
Never `phone` / `email`.

v16 web pivot Bucket 4 follow-up (P3 work).

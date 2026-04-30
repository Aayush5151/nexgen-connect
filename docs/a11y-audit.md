# NexGen Connect — Accessibility (WCAG 2.1 AA) audit

**v6 build §19 a11y matrix.** Target: WCAG 2.1 AA on every committed
screen. This doc is the running checklist; check items off as they
land in P5 polish + per-screen audits.

## Foundation status (committed in P0 audit-fixes 2026-04)

- [x] `accessibilityRole` + `accessibilityLabel` on every `Pressable`
      across 9 onboarding + post-auth screens (P0 audit fix #7)
- [x] `accessibilityState={{ disabled, locked }}` on locked Premium
      action tiles
- [x] HN1 triage buttons sized to 80dp (largest tap targets in app
      per v6 §5.8)
- [x] `accessibilityHint` on locked actions explaining why disabled
- [x] Hydration-aware splash kills the auth-gate flicker (avoids
      screen-reader announcing the welcome screen for a frame on
      cold start of a verified user)
- [x] StepHeader back button has `accessibilityLabel="Go back"`

## Per-screen audit checklist

For every screen below, verify these 8 axes. Mark with date + tester
initials when audited.

```
Axes:
  T  text contrast (WCAG AA: 4.5:1 normal, 3:1 large)
  S  screen-reader landmarks (heading hierarchy, region labels)
  K  keyboard / external switch nav (focus order, escape paths)
  L  large-text mode (system font-scale up to 200%)
  M  motion-reduce respected (no vestibular triggers in animations)
  C  color-only signal avoided (icon + label, never color alone)
  H  hit-target ≥ 44x44pt (HN1 ≥ 80dp)
  E  error states announced via accessibilityLiveRegion
```

| Screen | T | S | K | L | M | C | H | E | Notes |
|---|---|---|---|---|---|---|---|---|---|
| O1 Welcome | _ | _ | _ | _ | _ | _ | _ | _ | atmospheric bg + halo CTA — verify motion-reduce kills halo pulse |
| O2 Phone | _ | _ | _ | _ | _ | _ | _ | _ | TextField a11y on 10-digit input |
| O3 OTP | _ | _ | _ | _ | _ | _ | _ | _ | OtpField multi-cell — verify single-input announcement |
| O3a Scared | _ | _ | _ | _ | _ | _ | _ | _ | 200-char free text — large-text mode test |
| O4 You | _ | _ | _ | _ | _ | _ | _ | _ | City picker FlatList — keyboard nav |
| O5 Corridor wizard | _ | _ | _ | _ | _ | _ | _ | _ | 5-step wizard — back nav + step announcement |
| O6 Preview | _ | _ | _ | _ | _ | _ | _ | _ | Animated counters — motion-reduce |
| O7 Identity | _ | _ | _ | _ | _ | _ | _ | _ | DigiLocker WebView — inherits OS a11y |
| O8 Admit intro | _ | _ | _ | _ | _ | _ | _ | _ | Trust contract list — heading hierarchy |
| O9 Admit upload | _ | _ | _ | _ | _ | _ | _ | _ | File picker — system a11y inherited |
| O10 Admit pending | _ | _ | _ | _ | _ | _ | _ | _ | Polling state — announce updates via LiveRegion |
| O11 Admit outcome | _ | _ | _ | _ | _ | _ | _ | _ | Success haptic + a11y announcement |
| O11a Hybrid warning | _ | _ | _ | _ | _ | _ | _ | _ | Two-card decision — verify equal weight |
| CH1 Corridor home | _ | _ | _ | _ | _ | _ | _ | _ | Modal sheets (CH3, CH4) — verify focus trap |
| CH2 Corridor stats | _ | _ | _ | _ | _ | _ | _ | _ | BigStat values — number formatting w/ grouping |
| CH5 Activity feed | _ | _ | _ | _ | _ | _ | _ | _ | Virtualised list — verify announce on scroll |
| CH6 Hometown thread | _ | _ | _ | _ | _ | _ | _ | _ | First-mover modal focus trap |
| CT1 Channel list | _ | _ | _ | _ | _ | _ | _ | _ | Unread badges — announce count |
| CT2 Channel chat | _ | _ | _ | _ | _ | _ | _ | _ | Message bubbles — author + time |
| Y1 Profile home | _ | _ | _ | _ | _ | _ | _ | _ | Identity card + verification pills |
| Y3 Settings | _ | _ | _ | _ | _ | _ | _ | _ | Toggles — Switch a11y |
| Y6 Arrival check-in | _ | _ | _ | _ | _ | _ | _ | _ | 7-day strip — announce day status |
| PR1 Premium | _ | _ | _ | _ | _ | _ | _ | _ | Glow CTA halo — motion-reduce |
| PV1 Parent passcode | _ | _ | _ | _ | _ | _ | _ | _ | Numeric keypad — confirm screen-reader OK |
| PV2 Parent dashboard | _ | _ | _ | _ | _ | _ | _ | _ | Read-only — verify no DM affordance leaks |
| HN1 Help triage | _ | _ | _ | _ | _ | _ | _ | _ | 80dp targets confirmed; verify VoiceOver order |
| TS1 Report | _ | _ | _ | _ | _ | _ | _ | _ | Category radio — group label |
| TS3 Report dialogue | _ | _ | _ | _ | _ | _ | _ | _ | Polling — announce advisor reply |
| GA1-4 Group-apply | _ | _ | _ | _ | _ | _ | _ | _ | Phase transitions — announce |

## Tooling

- **Manual tests**: VoiceOver (iOS), TalkBack (Android), keyboard-only
  on web preview.
- **Automated**: `react-native-accessibility-engine` for static
  contrast + label-presence checks. Integration in CI per v6 §24.
- **Color contrast**: theme tokens designed against AA already. Spot
  check any custom rgba in committed code.

## Open issues / known violations

Track any failures + remediation owner here.

_(none filed yet — file as audits run)_

# AuraGen — Self-Healing Adaptive UI

AuraGen is a frontend prototype that demonstrates how a complex financial
application can offer an optional, guided layout when users encounter
interaction friction. It uses Next.js 16, React 18, TypeScript, and Tailwind
CSS 3. The repository does not include a backend, database, authentication, or
LLM integration; the frontend runs with local mock behavior unless an optional
external Flask API is configured.

The cognitive-load score is a prototype heuristic, not a validated measure of
cognitive state.

## Features

- Validated three-section financial form with a shared in-memory draft.
- Consent-gated interaction signals and a configurable 0–100 prototype score.
- User-controlled adaptation to a Zod-validated wizard rendered from a fixed
  component registry; generated code is never executed.
- Wizard and one-question modes, review/edit, before/after comparison, and
  return to the original form with values preserved.
- Scripted `/demo` scenarios for normal, slow, repeated-click, validation-error,
  and high-load interactions.
- Session-only analytics charts and an aggregate before/after CSV export.
- Optional integration with an external Flask service for adaptive UI,
  rule-based or backend-generated insights, and aggregate metrics.
- Temporary font-size, high-contrast, and theme accessibility preferences.

## Routes

| Path | Description |
|---|---|
| `/` | Product overview |
| `/dashboard` | Illustrative operational examples and current session telemetry |
| `/application` | Complex financial form |
| `/simplified` | Guided, editable wizard with review |
| `/analytics` | Interaction charts, metrics export, and accessibility controls |
| `/demo` | Scripted interaction scenarios and layout transformation |

## Requirements and setup

Use Node.js and npm, then install the checked-in dependency versions:

```powershell
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Validation scripts

```powershell
npm run lint
npx tsc --noEmit
npm test
npm run test:e2e
npm run build
```

The Playwright suite reuses the development server on port 3000 (or starts it)
and checks the
dashboard-to-form-to-wizard preservation flow, keyboard focus on wizard step
changes, analytics controls, and desktop/tablet/mobile widths. If Chromium is
not installed, run `npx playwright install chromium`.

## Demo guide

1. Start at `/demo` or navigate from the dashboard.
2. Enable optional tracking in the consent banner; scenarios are not collected
   otherwise.
3. Select a scripted scenario and choose **Run scenario**. Scenarios generate
   only simulated event types and timings, never form values.
4. Enter a few demo values and choose **Simplify my form**.
5. Edit a value in the wizard, use **Continue** to reach review, then return to
   the original form and confirm the draft remains.
6. Visit `/analytics` to inspect session-only charts and export aggregate
   before/after metrics. Turn tracking off afterward to clear telemetry.

## Privacy and data boundaries

- Tracking is off until explicit consent. Opting out clears the current session
  event list and prevents new telemetry requests.
- With the optional backend configured, consented requests contain only an
  allowlisted prototype score and event type/timing fields, plus the reason,
  mode, and before/after scores when reporting an adapted outcome. Field
  identifiers, descriptions, typed values, and personal or financial form data
  are not included.
- Financial drafts stay in React memory and are never written to local storage
  or included in telemetry requests or exports.
- Dashboard operational activity is illustrative; demo scenario signals are
  simulated. Backend aggregate metrics are fetched only when the optional
  service is configured.
- Session state is lost on a full page reload.
- UI specifications are Zod-validated and rendered only through predefined
  controls. The frontend mock calls no LLM.

## Optional Flask API integration

The local mock is used by default. To enable the external Flask integration,
set `NEXT_PUBLIC_AURAGEN_ADAPTIVE_API_URL` to the service's adaptive UI endpoint
before starting Next.js:

```powershell
$env:NEXT_PUBLIC_AURAGEN_ADAPTIVE_API_URL = "http://127.0.0.1:4000/api/adaptive-ui"
npm run dev
```

The frontend uses that endpoint for adaptive UI requests and derives the API
base URL for `/api/insights`, `/api/metrics/summary`, and
`/api/metrics/outcome`. Insights and aggregate metrics are optional; when the
variable is unset, local adaptive UI behavior remains available and backend
insights/metrics are omitted. The public variable is not a place for secrets or
credentials. Telemetry payloads are allowlisted and validated before sending.
See [docs/api-contract.md](./docs/api-contract.md) for request and response
shapes.

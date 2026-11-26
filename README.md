# AuraGen — Self-Healing Adaptive UI

AuraGen is an AI-powered self-healing adaptive UI prototype that demonstrates how a complex financial application can observe client-side interaction signals (hesitations, repeated clicks, validation loops) and offer an optional, guided layout when users encounter friction—all while strictly preserving 100% of the user's form state.

The application is mock-first: it has no production backend, database, authentication, or real LLM integration. The cognitive-load score is a prototype heuristic, not a validated measure of cognitive state.

---

## 🌟 Features

- **Validated Financial Form**: Standard multi-section financial application with shared in-memory draft preservation.
- **Client-Side Friction Telemetry**: Consent-gated interaction signals and a configurable 0–100 prototype friction score.
- **Adaptive UI Transformation**: User-controlled adaptation to a Zod-validated wizard rendered from a fixed component registry; generated code is never executed.
- **Dual Guided Modes**: Standard multi-step wizard and one-question-at-a-time modes, with review/edit and before/after comparison.
- **Seamless State Preservation**: Return to the original form at any time with draft values completely intact.
- **Scripted Scenarios**: `/demo` scenarios for normal, slow, repeated-click, validation-error, and high-load interactions.
- **Session-Only Analytics**: Interactive telemetry charts and aggregate before/after CSV metrics export.
- **Accessibility Controls**: Temporary font-size, high-contrast, and dark mode accessibility preferences.

---

## 🗺️ Routes

| Path | Description |
|---|---|
| `/` | Product overview and SaaS landing page |
| `/dashboard` | Illustrative operational examples and current session telemetry |
| `/application` | Complex multi-section financial form |
| `/simplified` | Guided, editable wizard with review and mode toggling |
| `/analytics` | Interaction charts, metrics export, and accessibility controls |
| `/demo` | Scripted interaction scenarios and layout transformation |

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js (App Router)** | Modern React framework with server/client component boundaries |
| **React 18 & TypeScript** | Component-based UI with strict type safety |
| **Tailwind CSS** | Design system token styling and responsive layout utilities |
| **Motion (`framer-motion`)** | Smooth, restrained transitions between UI layouts and wizard steps |
| **React Hook Form & Zod** | Form state management and schema validation |
| **Lucide React** | Clean, accessible iconography |
| **Vitest & Playwright** | Unit and end-to-end browser automation suites |

---

## 🎨 Visual Identity & Design System

- **Palette**: Deep indigo/blue (`aura-600` / `#4f46e5`) primary accents on crisp neutral backgrounds (`slate-50` / `#f8fafc`).
- **Surface Elevation**: White cards with subtle borders (`border-slate-200/80`) and soft shadows (`shadow-card`, `shadow-elevated`).
- **Typography**: Clean, readable sans-serif typography using Inter.
- **Components**: Reusable, accessible `Button`, `ButtonLink`, `Card`, `Badge`, `ProgressBar`, `PageHeader`, `Navbar`, and `Sidebar`.

---

## 🚦 Requirements & Setup

Use Node.js and npm:

```powershell
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🧪 Validation Scripts

```powershell
npm run lint
npx tsc --noEmit
npm test
npm run test:e2e
npm run build
```

The Playwright suite reuses the development server on port 3000 (or starts it) and checks the dashboard-to-form-to-wizard preservation flow, keyboard focus on wizard step changes, analytics controls, and desktop/tablet/mobile widths. If Chromium is not installed, run `npx playwright install chromium`.

---

## 🧭 Demo Guide

1. Start at `/demo` or navigate from the dashboard.
2. Enable optional tracking in the consent banner; scenarios are not collected otherwise.
3. Select a scripted scenario and choose **Run scenario**. Scenarios generate only simulated event types and timings, never form values.
4. Enter a few demo values and choose **Simplify my form**.
5. Edit a value in the wizard, use **Continue** to reach review, then return to the original form and confirm the draft remains.
6. Visit `/analytics` to inspect session-only charts and export aggregate before/after metrics. Turn tracking off afterward to clear telemetry.

---

## 🔒 Privacy & Data Boundaries

- **Consent-Gated**: Tracking is off until explicit consent. Opting out clears the current session event list.
- **Zero Sensitive Data Capture**: Events contain types and timings only; field names, passwords, and typed values are not captured.
- **In-Memory Drafts**: Financial drafts stay in React memory and are never written to local storage or included in telemetry exports.
- **Isolated Prototype**: Dashboard operational totals/activity are illustrative; demo scenario signals are simulated. No backend data is connected.
- **Safe Rendering**: UI specifications are Zod-validated and rendered only through predefined controls. The mock service calls no LLM.

---

## 🔌 Adaptive API Configuration

The mock implementation is used by default. To select the fetch-based service, set `NEXT_PUBLIC_AURAGEN_ADAPTIVE_API_URL` to the backend endpoint before starting Next.js. The public variable is not a place for secrets or credentials. Requests contain only a prototype score and privacy-safe event types/timings; responses must satisfy the schema described in [docs/api-contract.md](./docs/api-contract.md).

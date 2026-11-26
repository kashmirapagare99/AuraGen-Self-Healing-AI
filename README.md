# AuraGen — Self-Healing Adaptive UI Platform

AuraGen is an AI-powered self-healing adaptive UI system designed to simplify complex web interfaces dynamically based on real-time friction detection. When users encounter friction on dense forms—such as hesitation spikes, validation errors, or repeated clicks—AuraGen automatically observes client-side telemetry signals and provides an optional, guided step-by-step layout with guaranteed zero form data loss.

The platform consists of two integrated components:
1. **Frontend (Next.js & React 18)**: High-performance, accessible client-side UI with in-memory draft preservation, friction tracking, and deterministic AST layout rendering.
2. **Backend (Python & Flask)**: Intelligent adaptive API that evaluates privacy-safe friction signals and generates tailored UI specifications using LLMs (Groq, Anthropic Claude) with automated fallback to rule-based layouts.

---

## 🌟 Key Features

### Frontend (Adaptive Client)
- **Validated Financial Form**: Standard multi-section financial application with shared in-memory draft preservation.
- **Client-Side Friction Telemetry**: Consent-gated interaction signals and a configurable 0–100 prototype friction score.
- **Dual Guided Modes**: Standard multi-step wizard and one-question-at-a-time modes, with review/edit and before/after comparison.
- **Seamless State Preservation**: Return to the original form at any time with draft values completely intact.
- **Scripted Scenarios**: `/demo` scenarios for normal, slow, repeated-click, validation-error, and high-load interactions.
- **Session-Only Analytics**: Interactive telemetry charts and aggregate before/after CSV metrics export.
- **Accessibility Controls**: Temporary font-size, high-contrast, and dark mode accessibility preferences.

### Backend (Adaptive Intelligence & Insights)
- **LLM-Powered UI Generation**: Integrates with Groq (`openai/gpt-oss-20b`) and Anthropic Claude to determine optimal field groupings and guidance based on detected friction causes.
- **Deterministic Validation**: Strict schema validation ensures LLM replies conform to predetermined UI constraints; arbitrary or unsanctioned code is never executed.
- **Automated Fallback**: Gracefully degrades to local rule-based layouts (`app/layouts.py`) if API keys are missing, quota is exceeded, or responses fail validation.
- **AI Session Insights**: `/api/insights` endpoint generates contextual UX suggestions from interaction metrics.
- **Real-Time WebSocket Support**: Real-time bidirectional telemetry streaming via `/ws`.
- **Zero-PII Storage**: SQLite database records anonymous outcome metrics (friction scores, event counts, layout modes) with zero form values, names, or IP addresses.

---

## 🚀 Tech Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | Next.js 14/16 (App Router) | Modern React architecture with client/server boundaries |
| **UI Library & Styling** | React 18, Tailwind CSS, Lucide Icons | Responsive design system tokens and accessible iconography |
| **Animation & Transitions**| Framer Motion | Smooth transitions between layouts and wizard steps |
| **Validation & Forms** | React Hook Form, Zod | Strict schema validation and form draft state management |
| **Frontend Testing** | Vitest, Playwright | Unit and cross-browser end-to-end integration tests |
| **Backend Framework** | Python 3, Flask, Flask-Sock | REST API and WebSocket gateway |
| **AI / LLM Providers** | Groq API, Anthropic Claude API | Contextual layout synthesis and UX insights |
| **Backend Testing** | Pytest | Comprehensive test suite for routes, schemas, and providers |
| **Storage & Limiting** | SQLite, In-Memory Rate Limiter | Anonymous metrics storage and abuse protection |

---

## 📂 Project Structure

```
c:\AuraGen/
├── src/                          # Next.js Frontend Application
│   ├── app/                      # App router pages & layouts
│   │   ├── page.tsx              # Product landing page
│   │   ├── dashboard/page.tsx    # Operations dashboard with session telemetry
│   │   ├── application/page.tsx  # Multi-section financial application
│   │   ├── simplified/page.tsx   # Guided adaptive wizard view
│   │   ├── analytics/page.tsx    # Friction telemetry & charts
│   │   └── demo/page.tsx         # Scripted interaction scenarios
│   ├── components/               # UI & layout component library
│   │   ├── accessibility/        # Accessibility controls
│   │   ├── adaptive/             # Dynamic UISpecRenderer
│   │   ├── form/                 # Form fields & validation components
│   │   ├── layout/               # Navbar, Sidebar, Footer, PageHeader
│   │   ├── telemetry/            # Consent banner, charts, cognitive indicators
│   │   └── ui/                   # Button, Card, Badge, ProgressBar
│   ├── contexts/                 # React contexts (AdaptiveUI, FormState, Telemetry, Accessibility)
│   ├── hooks/                    # useTelemetry, useCognitiveLoad
│   ├── services/                 # API & WebSocket client services
│   ├── types/                    # TypeScript interfaces & Zod schemas (form, ui-spec, friction)
│   └── utils/                    # Heuristic scoring, telemetry helpers, styling utilities
├── app/                          # Flask Backend Application
│   ├── __init__.py               # Flask application factory
│   ├── config.py                 # Configuration loader from environment variables
│   ├── schemas.py                # Request & response validation schemas
│   ├── layouts.py                # Built-in layout templates & friction cause analysis
│   ├── prompt.py                 # LLM prompts & JSON parsing utilities
│   ├── groq_provider.py          # Groq LLM integration
│   ├── claude_provider.py        # Anthropic Claude LLM integration
│   ├── providers.py              # Provider resolution (auto, groq, claude, rules)
│   ├── adaptive.py               # Adaptive UI selection controller
│   ├── insights.py               # Session insights generator
│   ├── routes.py                 # REST HTTP endpoints
│   ├── sockets.py                # WebSocket handler
│   ├── db.py                     # SQLite metrics storage
│   └── ratelimit.py              # Client IP rate limiter
├── tests/                        # Backend Pytest Suite & Frontend E2E Tests
├── docs/                         # Specifications & API Contract (api-contract.md)
├── requirements.txt              # Python dependencies
├── run.py                        # Backend application entry point
├── package.json                  # Frontend dependencies and scripts
└── tailwind.config.ts            # Tailwind design system configuration
```

---

## 🚦 Getting Started

### 1. Frontend Setup (Next.js)

```powershell
# Install frontend dependencies
npm ci

# Start the frontend development server
npm run dev
```

The frontend will run at [http://localhost:3000](http://localhost:3000).

### 2. Backend Setup (Flask API)

```powershell
# Create and activate a Python virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env

# Start the Flask backend server
python run.py
```

The backend server will listen at [http://localhost:4000](http://localhost:4000).

### 3. Connecting Frontend to the Backend

By default, the frontend runs in mock-first mode. To connect the Next.js frontend to the live Python backend, create or update `.env.local`:

```env
NEXT_PUBLIC_AURAGEN_ADAPTIVE_API_URL=http://localhost:4000/api/adaptive-ui
```

Restart `npm run dev` to apply the environment change.

---

## 📡 Backend Endpoints Reference

The backend implements the specification defined in [docs/api-contract.md](./docs/api-contract.md):

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Server status and active layout provider (`groq`, `claude`, or `rules`). |
| `POST` | `/api/adaptive-ui` | Accepts `{score, events}`, returns `{uiSpec, reason}`. Response header `X-Aura-Source` indicates `llm` or `rules`. |
| `POST` | `/api/insights` | Accepts `{score, events}`, returns `{summary, suggestions, source, provider}` for AI-driven UX recommendations. |
| `POST` | `/api/metrics/outcome` | Stores anonymous before/after metrics (`reason`, `mode`, `beforeScore`, `afterScore`). |
| `GET` | `/api/metrics/summary` | Returns aggregate conversion and score delta statistics. |
| `WS` | `/ws` | Bidirectional WebSocket channel (`{"type": "interaction_context", "payload": {...}}`). |

---

## 🧠 Adaptive Intelligence & LLM Configuration

Set keys in `.env` (which is excluded from version control):

| Variable | Description | Default |
|---|---|---|
| `LLM_PROVIDER` | Selection mode: `auto` (prefers Groq, then Claude), `groq`, `claude`, or `rules` | `auto` |
| `GROQ_API_KEY` | Groq Cloud API authentication key | *None* |
| `GROQ_MODEL` | Groq model identifier | `openai/gpt-oss-20b` |
| `ANTHROPIC_API_KEY` | Anthropic API key | *None* |
| `ANTHROPIC_MODEL` | Claude model identifier | `claude-3-5-sonnet-latest` |
| `PORT` | Backend port | `4000` |

### How Layouts Are Chosen
1. **Input Sanitization**: Request payload is strictly validated. Only numeric friction scores (0–100) and event primitives (types and durations) are accepted. Form values and PII are never accepted.
2. **Cause Extraction**: Primary friction cause is determined (`validation_errors`, `repeated_clicks`, `hesitation`, or `general`).
3. **Model Synthesis**: If configured, the active LLM proposes field groupings, labels, and contextual help text tailored to the cause. Layout mode is enforced (`one_question` for severe hesitation; `wizard` for multi-field friction).
4. **Resilient Fallback**: If LLM calls fail, time out, or produce invalid specs, the system automatically returns the pre-vetted rule layout from `app/layouts.py`.

---

## 🗺️ Application Routes

| Route | Purpose |
|---|---|
| `/` | Landing page explaining AuraGen architecture and value proposition |
| `/dashboard` | Operational dashboard with live session telemetry indicators and illustrative metrics |
| `/application` | Dense, multi-section financial application with real-time heuristic friction tracking |
| `/simplified` | Guided step-by-step wizard dynamically rendered with full draft state preservation |
| `/analytics` | Real-time session telemetry charts, before/after comparisons, and CSV export |
| `/demo` | Interactive scenario runner to test hesitation, repeated click, and validation error adaptations |

---

## 🧭 Interactive Demo Walkthrough

1. Open `/demo` or start from the dashboard.
2. Enable optional tracking via the **Consent Banner** (telemetry stays strictly in-memory).
3. Select a scripted friction scenario (e.g., *Repeated Validation Errors* or *Extended Hesitation*) and click **Run scenario**.
4. Enter application values in the form and trigger or click **Simplify my form**.
5. Edit values in the simplified wizard, progress through steps, and verify that returning to the standard form retains 100% of the draft data.
6. Navigate to `/analytics` to inspect interaction graphs and download an aggregate before/after adaptation CSV report.

---

## 🧪 Testing & Validation

### Frontend Verification

```powershell
npm run lint         # Run ESLint validation
npx tsc --noEmit     # Verify strict TypeScript types
npm test             # Run Vitest unit tests
npm run test:e2e     # Run Playwright end-to-end tests
npm run build        # Verify production Next.js build
```

### Backend Verification

```powershell
.venv\Scripts\activate
pytest               # Run pytest suite across API routes, providers, and schemas
```

---

## 🔒 Privacy, Security & Data Boundaries

- **Client-Side Telemetry Isolation**: Friction signals (click rates, hesitation timings, error counts) are computed strictly in browser memory.
- **Zero Sensitive Data Transmission**: Form field values, personal identifiable information (PII), and financial values are never serialized into telemetry payloads or passed to backend AI models.
- **Deterministic Rendering**: The dynamic UI renderer (`UISpecRenderer`) only instantiates pre-approved React components from a strict registry; generated code or arbitrary scripts are never executed.
- **Minimal Metric Persistence**: Backend SQLite metrics store only anonymized interaction totals (e.g. friction score deltas, adaptation reason); IP addresses, session cookies, and form values are never logged.

---

## 🎨 Visual Identity & Design System

- **Palette**: Deep indigo/blue (`aura-600` / `#4f46e5`) primary accents on crisp neutral backgrounds (`slate-50` / `#f8fafc`).
- **Surface Elevation**: Layered white cards with subtle borders (`border-slate-200/80`) and soft shadows (`shadow-card`, `shadow-elevated`).
- **Typography**: Clean, readable sans-serif typography utilizing Inter.
- **Accessibility**: Includes high-contrast support, scalable font sizing (`.a11y-large`), dark-mode styling (`.a11y-dark`), and prominent focus outlines (`*:focus-visible`).

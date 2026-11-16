# AuraGen-Self-Healing-AI

An AI-powered self-healing system designed to detect issues, analyze failures, and support intelligent automated recovery.

---

## 🌟 AuraGen Frontend – Self-Healing Generative UI

**AuraGen** is an AI-powered adaptive web application designed to simplify complex web interfaces dynamically based on user interaction patterns and friction detection.

Traditional web applications provide static, rigid interfaces even when users struggle with dense forms or complex dashboards. AuraGen addresses this by observing client-side interaction signals (hesitations, repeated clicks, validation loops), calculating a prototype friction score, and seamlessly offering a one-click transformation into a guided, step-by-step wizard—all while strictly preserving 100% of the user's form state.

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14 (App Router)** | Modern React framework with server/client component boundaries |
| **React 18 & TypeScript** | Component-based UI with strict type safety |
| **Tailwind CSS** | Design system token styling and responsive layout utilities |
| **Motion (`framer-motion`)** | Smooth, restrained transitions between UI layouts and wizard steps |
| **React Hook Form & Zod** | Form state management and schema validation |
| **Lucide React** | Clean, accessible iconography |

---

## 🎨 Visual Identity & Design System

- **Palette**: Deep indigo/blue (`aura-600` / `#4f46e5`) primary accents on crisp neutral backgrounds (`slate-50` / `#f8fafc`).
- **Surface Elevation**: White cards with subtle borders (`border-slate-200/80`) and soft shadows (`shadow-card`, `shadow-elevated`).
- **Typography**: Clean, readable sans-serif typography using Inter.
- **Components**: Reusable, accessible `Button`, `Card`, `Badge`, `ProgressBar`, `PageHeader`, `Navbar`, and `Sidebar`.

---

## 📂 Project Structure

```
c:\AuraGen/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with fonts & metadata
│   │   ├── globals.css            # Base Tailwind styling & variables
│   │   ├── page.tsx               # Professional SaaS landing page
│   │   ├── dashboard/page.tsx     # Operations dashboard with KPIs
│   │   ├── application/page.tsx   # Complex financial application view
│   │   ├── simplified/page.tsx    # Guided 4-step wizard view
│   │   └── analytics/page.tsx     # Interaction friction analytics
│   ├── components/
│   │   ├── layout/                # Navbar, Sidebar, PageHeader, Footer
│   │   └── ui/                    # Button, Card, Badge, ProgressBar
│   ├── types/
│   │   ├── form.ts                # Zod schema & types for Financial Form
│   │   ├── friction.ts            # Heuristics & telemetry types
│   │   └── index.ts               # Type exports
│   └── utils/
│       └── cn.ts                  # Class merging utility
├── tailwind.config.ts             # Tailwind configuration & custom color tokens
├── tsconfig.json                  # TypeScript compiler settings
└── package.json                   # Project manifest & scripts
```

---

## 🚦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Build and run production**:
   ```bash
   npm run build
   npm run start
   ```

4. **Access the application**:
   - Landing Page: [http://localhost:3000/](http://localhost:3000/)
   - Operations Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
   - Complex Financial Form: [http://localhost:3000/application](http://localhost:3000/application)
   - Simplified Wizard: [http://localhost:3000/simplified](http://localhost:3000/simplified)
   - Friction Analytics: [http://localhost:3000/analytics](http://localhost:3000/analytics)

---

## 🔒 Privacy & Security

- **Strict Client-Side Isolation**: Telemetry tracking is performed in-memory on the client.
- **Zero Sensitive Data Capture**: Form inputs, names, passwords, and numbers are excluded from event logs.
- **Safe Component Rendering**: Dynamic UI transformations utilize a pre-vetted component registry and schema validation (no `eval` or dynamic code execution).

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Activity,
  Layers,
  ShieldCheck,
  Sliders,
  Workflow,
  Wand2,
  FileSpreadsheet,
  Zap,
  BarChart2,
  HelpCircle,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export default function HomePage() {
  const valueProps = [
    {
      icon: Activity,
      title: "Real-Time Friction Detection",
      description:
        "Passively monitors hesitation, repeat clicks, and repeated validation failures on complex forms without transmitting sensitive form data.",
    },
    {
      icon: Wand2,
      title: "Dynamic Layout Adaptation",
      description:
        "Transforms dense multi-column interfaces into focused, bite-sized multi-step wizards when cognitive overload is detected.",
    },
    {
      icon: ShieldCheck,
      title: "Zero-Data-Loss Guarantee",
      description:
        "Seamlessly transfers 100% of partially filled form fields back and forth between standard and simplified views.",
    },
    {
      icon: Sliders,
      title: "Accessibility & Personalization",
      description:
        "Customizable sensory modes including high-contrast palettes, scalable font sizing, and assistive form field helpers.",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      name: "Complex Form Ingestion",
      desc: "User interacts with a dense, multi-section financial loan application.",
    },
    {
      step: "02",
      name: "Heuristic Signal Analysis",
      desc: "Client-side friction engine registers hesitation spikes and validation loops.",
    },
    {
      step: "03",
      name: "Dynamic Wizard Generation",
      desc: "Deterministic component generator offers an accessible, step-by-step layout.",
    },
    {
      step: "04",
      name: "Completion & Review",
      desc: "User completes application with higher conversion and lower abandonment.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-aura-100/50 via-aura-50/20 to-transparent blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            {/* Version Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-aura-200 bg-aura-50/80 text-aura-800 text-xs font-semibold shadow-subtle animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Sparkles className="w-3.5 h-3.5 text-aura-600" />
              <span>AuraGen Prototype 1.0 – Self-Healing Generative UI</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.12]">
              Web interfaces that{" "}
              <span className="bg-gradient-to-r from-aura-600 to-indigo-600 bg-clip-text text-transparent">
                adapt to user friction
              </span>{" "}
              in real-time.
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Detect user hesitation, validation errors, and repetitive interaction patterns. Automatically generate simplified, accessible guided workflows with guaranteed zero data loss.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <ButtonLink
                href="/dashboard"
                size="lg"
                variant="accent"
                className="w-full sm:w-auto font-semibold shadow-card"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Explore Dashboard
              </ButtonLink>
              <ButtonLink
                href="/application"
                size="lg"
                variant="outline"
                className="w-full sm:w-auto font-semibold"
                leftIcon={<FileSpreadsheet className="w-4 h-4 text-slate-500" />}
              >
                Try Complex Form
              </ButtonLink>
            </div>

            {/* Trust / Signal Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Server-Side Telemetry Leakage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Deterministic React AST Generation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Full State Preservation</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Engineered for High-Stakes Complexity
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Designed for enterprise lending, insurance underwriting, and regulated applications where drop-off rates directly hurt customer outcomes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {valueProps.map((prop, idx) => {
                const Icon = prop.icon;
                return (
                  <Card key={idx} hoverEffect className="flex flex-col justify-between">
                    <CardHeader>
                      <div className="w-10 h-10 rounded-xl bg-aura-50 border border-aura-100 flex items-center justify-center text-aura-600 mb-2">
                        <Icon className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-base">{prop.title}</CardTitle>
                      <CardDescription className="text-xs leading-relaxed pt-1">
                        {prop.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <Badge variant="indigo">Architecture Pipeline</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                From Friction Detection to Guided Resolution
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                A closed-loop client-side telemetry and generative layout pipeline operating securely in the browser.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {workflowSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-3 relative overflow-hidden"
                >
                  <div className="text-3xl font-black text-aura-100 select-none">
                    {step.step}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {step.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="py-16 bg-white border-t border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white shadow-elevated flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 text-center md:text-left">
                <Badge variant="indigo" className="bg-white/10 text-white border-white/20">
                  Ready to test?
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Experience self-healing UI in action
                </h3>
                <p className="text-slate-300 text-sm max-w-xl">
                  Try our interactive financial form and trigger client-side friction heuristics to see dynamic layout generation.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <ButtonLink
                  href="/application"
                  size="lg"
                  className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-card"
                >
                  Launch Financial Form
                </ButtonLink>
                <ButtonLink
                  href="/dashboard"
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-white border-white/20 hover:bg-white/10 font-medium"
                >
                  Open Dashboard
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

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
  MousePointerClick,
  Clock,
  AlertCircle
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export default function LandingPage() {
  const features = [
    {
      icon: Activity,
      title: "Real-Time Friction Detection",
      description:
        "Analyzes repeated clicks, input hesitation, validation error loops, and pause intervals to detect when users struggle.",
      color: "text-aura-600 bg-aura-50",
    },
    {
      icon: Wand2,
      title: "Self-Healing UI Transformation",
      description:
        "Dynamically transforms multi-section dense forms into progressive, step-by-step guided wizards without page refreshes.",
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      icon: Layers,
      title: "100% State Preservation",
      description:
        "All entered values, validation states, and draft inputs are preserved bidirectionally when switching between interfaces.",
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      icon: ShieldCheck,
      title: "Privacy-Preserving Telemetry",
      description:
        "Zero sensitive financial inputs or credentials are ever recorded. Tracking is purely local, client-side, and opt-in.",
      color: "text-amber-600 bg-amber-50",
    },
  ];

  const steps = [
    {
      step: "01",
      icon: MousePointerClick,
      title: "Observe Interaction Patterns",
      description:
        "As users navigate forms, client-side heuristics unobtrusively observe hesitation times, repeated clicks, and field errors.",
    },
    {
      step: "02",
      icon: Activity,
      title: "Calculate Friction Score",
      description:
        "A rule-based heuristic score (0–100) measures potential interaction difficulty in real-time.",
    },
    {
      step: "03",
      icon: AlertCircle,
      title: "Contextual Assistance Suggestion",
      description:
        "When friction crosses configured thresholds, AuraGen suggests simplifying the workflow rather than forcing sudden changes.",
    },
    {
      step: "04",
      icon: Workflow,
      title: "Guided Multi-Step Adaptation",
      description:
        "Users activate simplified mode with one click, transitioning seamlessly into a step-by-step guided wizard.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 border-b border-slate-200/60 bg-gradient-to-b from-white to-slate-50/50">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-aura-50 border border-aura-200/80 text-xs font-semibold text-aura-800 shadow-subtle">
              <Sparkles className="w-3.5 h-3.5 text-aura-600" />
              <span>Next-Generation Adaptive Web Platform</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Interfaces That <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-aura-700 via-aura-600 to-indigo-600">
                  Adapt to You.
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                AuraGen transforms complex user interfaces into simpler experiences by identifying interaction difficulties and adapting workflows dynamically.
              </p>
            </div>

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
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Data Loss on Mode Switch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Client-Side Privacy Architecture</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Validated Schema-Driven UI</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Overview */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="indigo">Architecture & Capabilities</Badge>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Built for Real-World Complexity
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              When users encounter friction in enterprise dashboards or dense multi-page forms, AuraGen acts as an empathetic co-pilot that simplifies navigation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} hoverEffect className="flex flex-col justify-between">
                  <CardHeader className="border-0 pb-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${feature.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 text-sm text-slate-500 leading-relaxed">
                    {feature.description}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white border-y border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <Badge variant="default">The Adaptation Lifecycle</Badge>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                How AuraGen Adapts in Real Time
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                A non-intrusive 4-step workflow that respects user autonomy while eliminating workflow bottlenecks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="relative flex flex-col space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-aura-700 shadow-subtle font-bold text-xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-2xl font-black text-slate-300 font-mono">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 pt-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Interactive Preview Callout */}
            <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-aura-900 via-indigo-950 to-slate-900 text-white shadow-elevated flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-aura-500/20 text-aura-300 text-xs font-medium border border-aura-400/30">
                  <Sparkles className="w-3.5 h-3.5" /> Live Demonstration Ready
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">
                  Experience the Adaptive Transformation
                </h3>
                <p className="text-slate-300 text-sm max-w-xl">
                  Test the complex financial form, trigger intentional friction events, and watch AuraGen automatically suggest a streamlined 4-step wizard.
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

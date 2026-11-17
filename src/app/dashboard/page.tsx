"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle,
  Clock,
  Activity,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Plus,
  Shield,
  Layers,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CognitiveLoadIndicator } from "@/components/telemetry/CognitiveLoadIndicator";
import { useTelemetryContext } from "@/contexts/TelemetryContext";

export default function DashboardPage() {
  const { events, trackingEnabled } = useTelemetryContext();
  const countEvents = (types: string[]) =>
    events.filter((event) => types.includes(event.type)).length;

  const metrics = [
    {
      title: "Applications (illustrative)",
      value: "148",
      change: "Sample operational total",
      icon: FileText,
      color: "text-aura-600 bg-aura-50",
    },
    {
      title: "Completed (illustrative)",
      value: "112",
      change: "Sample completion count",
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "In progress (illustrative)",
      value: "36",
      change: "Sample active count",
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      title: "Session telemetry events",
      value: String(events.length),
      status: trackingEnabled ? "Consent active" : "Tracking off",
      badgeVariant: trackingEnabled ? ("success" as const) : ("outline" as const),
      icon: Activity,
      color: "text-indigo-600 bg-indigo-50",
    },
  ];

  // Recent activity sample data
  const activities = [
    {
      id: "act-1",
      user: "Jordan Taylor",
      type: "Application Completed",
      mode: "Simplified Wizard",
      time: "12 mins ago",
      status: "Approved",
      statusVariant: "success" as const,
      friction: 25,
    },
    {
      id: "act-2",
      user: "Samantha Vance",
      type: "Adapted to Wizard",
      mode: "Self-Healing Triggered",
      time: "34 mins ago",
      status: "In Progress",
      statusVariant: "warning" as const,
      friction: 65,
    },
    {
      id: "act-3",
      user: "Marcus Chen",
      type: "Direct Submission",
      mode: "Complex Form",
      time: "2 hours ago",
      status: "Review Pending",
      statusVariant: "indigo" as const,
      friction: 18,
    },
    {
      id: "act-4",
      user: "Elena Rostova",
      type: "Application Started",
      mode: "Personal Loan ($25,000)",
      time: "4 hours ago",
      status: "Draft",
      statusVariant: "default" as const,
      friction: 10,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Adaptive Operations Dashboard"
          description="View illustrative operational samples and live, consent-gated interaction signals for this browser session."
          badge={
            <Badge variant="indigo" dot>
              System Online
            </Badge>
          }
          actions={
            <div className="flex items-center gap-3">
              <ButtonLink
                href="/analytics"
                variant="outline"
                size="sm"
                leftIcon={<Activity className="w-3.5 h-3.5 text-slate-500" />}
              >
                View Telemetry
              </ButtonLink>
              <ButtonLink
                href="/application"
                size="sm"
                variant="accent"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Start Application
              </ButtonLink>
            </div>
          }
        />

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-aura-900 via-aura-800 to-indigo-900 p-6 sm:p-8 text-white shadow-elevated">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-xs font-medium text-aura-200 backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-aura-300" />
              <span>AuraGen Friction Engine v1.0</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome back to AuraGen Studio
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed">
              Optional telemetry starts only after consent. Interaction events stay in memory in this browser; operational totals below are illustrative and are not connected to a backend.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <ButtonLink
                href="/application"
                size="sm"
                className="bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Launch Complex Application
              </ButtonLink>
              <ButtonLink
                href="/simplified"
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Preview Simplified Wizard
              </ButtonLink>
            </div>
          </div>
          {/* Subtle background decorative shapes */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title} hoverEffect className="relative overflow-hidden">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {metric.title}
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${metric.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">
                      {metric.value}
                    </div>
                    {metric.change && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span>{metric.change}</span>
                      </p>
                    )}
                    {metric.status && (
                      <div className="mt-1">
                        <Badge variant={metric.badgeVariant} dot className="text-[10px] px-2 py-0">
                          {metric.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <CognitiveLoadIndicator />

        {/* Two-Column Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Access Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-aura-600" />
                  <CardTitle className="text-base">Interface Switcher</CardTitle>
                </div>
                <CardDescription>
                  Switch between interfaces to test form state persistence.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">
                      Complex Financial Form
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      Full View
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    A dense, multi-section financial application with all personal, financial, and loan fields displayed.
                  </p>
                  <div className="pt-1">
                    <ButtonLink
                      href="/application"
                      variant="outline"
                      size="sm"
                      className="w-full justify-between"
                      rightIcon={<ChevronRight className="w-4 h-4 text-slate-400" />}
                    >
                      Open Complex Form
                    </ButtonLink>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-aura-200 bg-aura-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-aura-900">
                      Simplified 4-Step Wizard
                    </span>
                    <Badge variant="indigo" className="text-[10px]">
                      Adaptive
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    Guided multi-step layout with progressive disclosure, step validations, and review screen.
                  </p>
                  <div className="pt-1">
                    <ButtonLink
                      href="/simplified"
                      variant="primary"
                      size="sm"
                      className="w-full justify-between"
                      rightIcon={<ChevronRight className="w-4 h-4 text-white" />}
                    >
                      Open Guided Wizard
                    </ButtonLink>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Heuristic Indicator Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <CardTitle className="text-base">Friction Heuristics</CardTitle>
                  </div>
                  <Badge variant="success" dot className="text-[10px]">
                    Nominal
                  </Badge>
                </div>
                <CardDescription>
                  Consent-gated interaction signals from this session only.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase">Hesitations</span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {countEvents(["extended_hesitation", "long_pause"])} detected
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase">Repeated clicks</span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {countEvents(["repeated_click"])} detected
                    </span>
                  </div>
                  <div className="col-span-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase">Validation errors</span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {countEvents(["validation_error", "repeated_attempt"])} logged
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  {trackingEnabled
                    ? "Prototype heuristic; event records contain types and timings only."
                    : "Tracking is off. Enable optional consent to collect in-memory signals."}
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/analytics" className="text-xs font-semibold text-aura-600 hover:text-aura-700 flex items-center gap-1">
                  <span>Explore full telemetry analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Recent Activity Table */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col justify-between">
              <div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Recent Application Activity</CardTitle>
                      <CardDescription>
                        Fictional telemetry logs of recent simulated submissions and adaptations.
                      </CardDescription>
                    </div>
                    <Badge variant="default" className="text-xs">
                      4 Logs
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 overflow-x-auto">
                    {activities.map((act) => (
                      <div
                        key={act.id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors gap-4"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900 truncate">
                              {act.user}
                            </span>
                            <Badge variant={act.statusVariant} className="text-[10px] px-1.5 py-0">
                              {act.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span>{act.type}</span>
                            <span>•</span>
                            <span className="text-slate-400">{act.mode}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 space-y-1">
                          <span className="text-xs text-slate-400 block">{act.time}</span>
                          <span className={`text-[11px] font-medium ${
                            act.friction > 50 ? 'text-rose-600' : 'text-emerald-600'
                          }`}>
                            Friction: {act.friction}/100
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>

              <CardFooter>
                <span className="text-xs text-slate-500">
                  Showing prototype sample activity. Real data updates with form interactions.
                </span>
                <ButtonLink
                  href="/application"
                  size="sm"
                  variant="ghost"
                  className="text-aura-700 hover:text-aura-800"
                >
                  Open Form &rarr;
                </ButtonLink>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

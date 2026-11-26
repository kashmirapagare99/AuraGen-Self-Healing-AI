"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Plus,
  Activity,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  Layers,
  Wand2,
  FileSpreadsheet,
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

  const recentApplications = [
    {
      id: "APP-8941",
      name: "Marcus Vance",
      type: "Commercial Loan",
      amount: "$120,000",
      status: "Simplified Mode Used",
      frictionLevel: "Resolved (High)",
      date: "10 mins ago",
    },
    {
      id: "APP-8940",
      name: "Elena Rostova",
      type: "Equipment Financing",
      amount: "$45,000",
      status: "Standard Submission",
      frictionLevel: "Low Friction",
      date: "35 mins ago",
    },
    {
      id: "APP-8939",
      name: "Jordan Lee",
      type: "Personal Credit Line",
      amount: "$15,000",
      status: "In Progress",
      frictionLevel: "Active Hesitation",
      date: "1 hour ago",
    },
    {
      id: "APP-8938",
      name: "Sophia Martinez",
      type: "Mortgage Refinance",
      amount: "$320,000",
      status: "Simplified Mode Used",
      frictionLevel: "Resolved (Moderate)",
      date: "3 hours ago",
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

        {/* Welcome Announcement / Heuristic Status */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-aura-900 to-indigo-900 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-aura-300" />
              <span className="text-xs font-semibold uppercase tracking-wider text-aura-200">Adaptive UI Engine Active</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
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
                rightIcon={<ArrowRight className="w-3.5 h-3.5 text-slate-900" />}
              >
                Launch Financial Form
              </ButtonLink>
              <ButtonLink
                href="/simplified"
                size="sm"
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10 font-medium"
                rightIcon={<Wand2 className="w-3.5 h-3.5 text-aura-300" />}
              >
                Preview Guided Wizard
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Top KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title} hoverEffect className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {metric.title}
                  </span>
                  <div className={`p-2 rounded-xl ${metric.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
                  <div className="flex items-center gap-2 text-xs">
                    {metric.change && (
                      <span className="text-slate-500">{metric.change}</span>
                    )}
                    {metric.status && (
                      <Badge variant={metric.badgeVariant} size="sm">
                        {metric.status}
                      </Badge>
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
          {/* Left Column: Form Previews & Workflow Launchers */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Interactive Form Prototypes</CardTitle>
                    <CardDescription>
                      Experience client-side friction detection and real-time layout transformation.
                    </CardDescription>
                  </div>
                  <Badge variant="indigo">Dual-Mode Ready</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-subtle">
                    <FileSpreadsheet className="w-4 h-4 text-aura-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Standard Complex Form</h4>
                  <p className="text-xs text-slate-600">
                    Dense multi-section layout with real-time heuristic monitoring for hesitation and errors.
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
                  <div className="w-8 h-8 rounded-lg bg-white border border-aura-200 flex items-center justify-center text-aura-700 shadow-subtle">
                    <Wand2 className="w-4 h-4 text-aura-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Self-Healing Simplified Wizard</h4>
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

            {/* Illustrative Applications Audit Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Recent Application Activity</CardTitle>
                  <CardDescription>Illustrative records demonstrating adaptive mode resolution</CardDescription>
                </div>
                <Badge variant="outline" size="sm">Prototype Data</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50/80 border-y border-slate-200 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="px-5 py-3">Applicant / ID</th>
                        <th className="px-5 py-3">Type & Amount</th>
                        <th className="px-5 py-3">Friction Status</th>
                        <th className="px-5 py-3">Workflow State</th>
                        <th className="px-5 py-3 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-slate-900">
                            {app.name}
                            <span className="block text-[11px] text-slate-400 font-normal">{app.id}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-medium text-slate-800">{app.type}</span>
                            <span className="block text-[11px] text-slate-400">{app.amount}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              variant={
                                app.frictionLevel.includes("High")
                                  ? "danger"
                                  : app.frictionLevel.includes("Moderate")
                                  ? "warning"
                                  : app.frictionLevel.includes("Active")
                                  ? "warning"
                                  : "success"
                              }
                              size="sm"
                            >
                              {app.frictionLevel}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                              {app.status.includes("Simplified") && (
                                <Wand2 className="w-3 h-3 text-aura-600" />
                              )}
                              {app.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right text-slate-400">{app.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center py-3 border-t border-slate-100">
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

          {/* Right Column: Interaction Signals & Heuristics */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-aura-600" />
                    Session Telemetry
                  </CardTitle>
                  <Badge variant={trackingEnabled ? "success" : "outline"} dot>
                    {trackingEnabled ? "Tracking On" : "Tracking Off"}
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
                  <span>Open detailed analytics view</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-aura-600" />
                  Self-Healing Capabilities
                </CardTitle>
                <CardDescription>How AuraGen prevents workflow abandonment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Non-Destructive In-Memory Draft</span>
                    User inputs are synchronized in browser state and never lost across adaptations.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Deterministic Schema Constraints</span>
                    Form schema validated via Zod ensures strict field typing across all visual views.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Client-Side Privacy Boundary</span>
                    Zero transmission of sensitive field data in friction telemetry.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

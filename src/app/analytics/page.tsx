"use client";

import React from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Activity, ShieldCheck, ArrowRight, BarChart3, Clock, AlertTriangle, MousePointerClick } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Interaction Telemetry & Analytics"
          description="Prototype friction monitoring dashboard visualizing client-side interaction signals."
          badge={
            <Badge variant="indigo" dot>
              Real-time Heuristics
            </Badge>
          }
          actions={
            <Link href="/application">
              <Button size="sm" variant="accent" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Test in Financial Form
              </Button>
            </Link>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Current Friction Index
              </CardTitle>
              <CardDescription>Prototype friction scale (0 to 100)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-black text-slate-900">15 / 100</div>
              <ProgressBar value={15} max={100} variant="friction" size="md" />
              <div className="text-xs text-slate-500 pt-1">
                Threshold set at 50 for contextual assistance suggestions.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-aura-600" />
                Repeated Clicks
              </CardTitle>
              <CardDescription>Rapid clicks on identical elements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">0</div>
              <p className="text-xs text-slate-500 mt-2">Weighted at +10 points per detected cluster.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Validation Loops
              </CardTitle>
              <CardDescription>Consecutive form validation errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">0</div>
              <p className="text-xs text-slate-500 mt-2">Weighted at +15 points per repeated field error.</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Privacy & Telemetry Boundary</CardTitle>
                <CardDescription>Strict client-side isolation guarantee</CardDescription>
              </div>
              <Badge variant="success" dot className="text-xs">Consent Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>
              AuraGen operates under a zero-leakage privacy model:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-500">
              <li>Form field values, names, financial numbers, and addresses are never transmitted or serialized in telemetry logs.</li>
              <li>Only non-sensitive event primitives (e.g., control type, duration, error count) are calculated locally in the browser memory.</li>
              <li>Interaction scores are illustrative prototype heuristics designed for dynamic adaptation demonstrations.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FileSpreadsheet, ArrowRight, Wand2, ShieldCheck, Sparkles } from "lucide-react";

export default function ApplicationPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Complex Financial Application"
          description="Standard multi-section financial loan application form with real-time heuristic friction tracking."
          badge={
            <Badge variant="indigo" dot>
              Milestone 1 Ready
            </Badge>
          }
          actions={
            <Link href="/simplified">
              <Button variant="outline" size="sm" rightIcon={<Wand2 className="w-3.5 h-3.5 text-aura-600" />}>
                Switch to Simplified Wizard
              </Button>
            </Link>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-aura-600" />
                  <CardTitle>Financial Application Form (Section Previews)</CardTitle>
                </div>
                <CardDescription>
                  This container is architected for Milestone 2, where the full multi-section inputs (Personal Information, Financial Information, Application Details) will be assembled.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                  <h4 className="text-sm font-semibold text-slate-800">Section A – Personal Information</h4>
                  <p className="text-xs text-slate-500 mt-1">Full Name, Email Address, Phone Number, Date of Birth, Residential Address</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                  <h4 className="text-sm font-semibold text-slate-800">Section B – Financial Information</h4>
                  <p className="text-xs text-slate-500 mt-1">Employment Status, Employment Type, Monthly Income, Existing Obligations</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                  <h4 className="text-sm font-semibold text-slate-800">Section C – Application Details</h4>
                  <p className="text-xs text-slate-500 mt-1">Application Type, Requested Amount, Purpose, Additional Notes, Terms Agreement</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-aura-600" />
                  Adaptive Controller
                </CardTitle>
                <CardDescription>
                  Friction engine hooks and state preservation bindings will attach here in Milestone 2 & 4.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Client-side telemetry isolated</span>
                </div>
                <Link href="/dashboard" className="block pt-2">
                  <Button variant="secondary" size="sm" className="w-full">
                    Return to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Wand2, ArrowLeft, Layers, CheckCircle2 } from "lucide-react";

export default function SimplifiedPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Simplified Application Wizard"
          description="Guided 4-step workflow dynamically transformed from the complex financial form."
          badge={
            <Badge variant="indigo" dot>
              Adaptive Mode
            </Badge>
          }
          actions={
            <Link href="/application">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Complex Form
              </Button>
            </Link>
          }
        />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-aura-600" />
              <CardTitle>4-Step Guided Transformation Architecture</CardTitle>
            </div>
            <CardDescription>
              Step-by-step wizard shell ready for Milestone 3 Dynamic UI Renderer and Shared State connection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-aura-200 bg-aura-50/50">
                <span className="text-xs font-bold text-aura-600">STEP 1</span>
                <h4 className="text-sm font-semibold text-slate-900 mt-1">Personal Info</h4>
                <p className="text-xs text-slate-500 mt-1">Full Name, Email, Phone, DOB, Address</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-bold text-slate-400">STEP 2</span>
                <h4 className="text-sm font-semibold text-slate-700 mt-1">Financial Info</h4>
                <p className="text-xs text-slate-500 mt-1">Employment status, Monthly income</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-bold text-slate-400">STEP 3</span>
                <h4 className="text-sm font-semibold text-slate-700 mt-1">Loan Details</h4>
                <p className="text-xs text-slate-500 mt-1">Amount, Purpose, Options</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-bold text-slate-400">STEP 4</span>
                <h4 className="text-sm font-semibold text-slate-700 mt-1">Review & Submit</h4>
                <p className="text-xs text-slate-500 mt-1">Audit values, edit steps, confirm</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

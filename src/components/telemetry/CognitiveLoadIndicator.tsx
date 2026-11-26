"use client";

import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useCognitiveLoad } from "@/hooks/useCognitiveLoad";

export function CognitiveLoadIndicator() {
  const { score, level, trackingEnabled } = useCognitiveLoad();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Cognitive Load Score</CardTitle>
          <Badge variant={level === "high" ? "warning" : "indigo"} dot>
            {level}
          </Badge>
        </div>
        <CardDescription>
          Prototype heuristic, not a validated measure of cognitive state.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-3xl font-black text-slate-900">
          {score} <span className="text-base font-semibold text-slate-500">/ 100</span>
        </div>
        <ProgressBar value={score} max={100} variant="friction" size="md" />
        <p className="text-xs text-slate-500">
          {trackingEnabled
            ? "Calculated from opted-in interaction signals held in memory."
            : "Tracking is off; no interaction signals are included."}
        </p>
      </CardContent>
    </Card>
  );
}

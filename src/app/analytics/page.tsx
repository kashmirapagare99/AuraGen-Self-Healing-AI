"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Download, MousePointerClick } from "lucide-react";
import { AccessibilityControls } from "@/components/accessibility/AccessibilityControls";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { TelemetryChart } from "@/components/telemetry/TelemetryChart";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAdaptiveUI } from "@/contexts/AdaptiveUIContext";
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import { FrictionEvent, FrictionEventType } from "@/types/friction";
import { scoreCognitiveLoad } from "@/utils/cognitive-load";

const displayedEvents = 20;

function countEvents(
  events: readonly FrictionEvent[],
  types: readonly FrictionEventType[]
) {
  return events.filter((event) => types.includes(event.type)).length;
}

function toCsvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export default function AnalyticsPage() {
  const { events, trackingEnabled } = useTelemetryContext();
  const { beforeScore, adaptedAt } = useAdaptiveUI();

  const currentScore = useMemo(() => scoreCognitiveLoad(events).score, [events]);
  const visibleEvents = events.slice(-displayedEvents);
  const startIndex = events.length - visibleEvents.length;
  const clicks = countEvents(visibleEvents, ["repeated_click"]);
  const hesitations = countEvents(visibleEvents, [
    "extended_hesitation",
    "long_pause",
  ]);
  const errors = countEvents(visibleEvents, [
    "validation_error",
    "repeated_attempt",
  ]);

  const scorePoints = visibleEvents.map((_, index) => ({
    label: String(startIndex + index + 1),
    value: scoreCognitiveLoad(
      events.slice(0, startIndex + index + 1)
    ).score,
  }));
  const eventPoints = (
    types: readonly FrictionEventType[]
  ) =>
    visibleEvents.map((event, index) => ({
      label: String(startIndex + index + 1),
      value: types.includes(event.type) ? 1 : 0,
    }));

  const beforeEvents =
    adaptedAt === null
      ? []
      : events.filter((event) => event.timestamp < adaptedAt);
  const afterEvents =
    adaptedAt === null
      ? []
      : events.filter((event) => event.timestamp >= adaptedAt);

  const exportRows: (string | number)[][] = [
    ["Metric", "Before adaptation", "After adaptation"],
    [
      "Prototype heuristic score",
      beforeScore ?? "Not recorded",
      adaptedAt === null
        ? "Not available"
        : scoreCognitiveLoad(afterEvents).score,
    ],
    ["Telemetry event count", beforeEvents.length, afterEvents.length],
    [
      "Repeated clicks",
      countEvents(beforeEvents, ["repeated_click"]),
      countEvents(afterEvents, ["repeated_click"]),
    ],
    [
      "Hesitation signals",
      countEvents(beforeEvents, ["extended_hesitation", "long_pause"]),
      countEvents(afterEvents, ["extended_hesitation", "long_pause"]),
    ],
    [
      "Validation errors",
      countEvents(beforeEvents, ["validation_error", "repeated_attempt"]),
      countEvents(afterEvents, ["validation_error", "repeated_attempt"]),
    ],
  ];
  const csv = exportRows.map((row) => row.map(toCsvCell).join(",")).join("\r\n");
  const csvDownloadHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Interaction Telemetry & Analytics"
          description="Explore privacy-safe signals held in memory for this browser session."
          badge={
            <Badge variant={trackingEnabled ? "success" : "outline"} dot>
              {trackingEnabled ? "Tracking active" : "Tracking off"}
            </Badge>
          }
          actions={
            <div className="flex flex-wrap gap-2">
              <a
                href={csvDownloadHref}
                download="auragen-before-after-metrics.csv"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-subtle transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-aura-600"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Export before/after CSV
              </a>
              <ButtonLink
                href="/application"
                size="sm"
                variant="accent"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Test the form
              </ButtonLink>
            </div>
          }
        />

        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Prototype analytics only. Demo-route scenarios are scripted and
          simulated; no backend data is connected. Turning tracking off clears
          this session&apos;s telemetry.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-indigo-600" />
                Current prototype score
              </CardTitle>
              <CardDescription>
                Heuristic only; not a validated measure of cognitive state.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-black text-slate-900">
                {currentScore} / 100
              </p>
              <ProgressBar value={currentScore} max={100} variant="friction" />
            </CardContent>
          </Card>
          <MetricCard
            title="Repeated clicks"
            description="Detected rapid repeated clicks"
            value={clicks}
            icon={<MousePointerClick className="h-4 w-4 text-aura-600" />}
          />
          <MetricCard
            title="Hesitation signals"
            description="Long pauses or extended field interactions"
            value={hesitations}
            icon={<Activity className="h-4 w-4 text-amber-600" />}
          />
          <MetricCard
            title="Validation errors"
            description="Errors and repeated failed attempts"
            value={errors}
            icon={<Activity className="h-4 w-4 text-rose-600" />}
          />
        </div>

        <section aria-labelledby="telemetry-charts-heading" className="space-y-4">
          <div>
            <h2
              id="telemetry-charts-heading"
              className="text-lg font-semibold text-slate-900"
            >
              Session signals over time
            </h2>
            <p className="text-sm text-slate-500">
              Event sequence is shown for the latest {displayedEvents} events;
              scores are recomputed cumulatively.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard
              title="Repeated clicks"
              description="Click signal by event sequence"
              points={eventPoints(["repeated_click"])}
              color="#7c3aed"
            />
            <ChartCard
              title="Hesitation"
              description="Hesitation and long-pause signals by event sequence"
              points={eventPoints(["extended_hesitation", "long_pause"])}
              color="#d97706"
            />
            <ChartCard
              title="Validation errors"
              description="Validation error and repeated-attempt signals by event sequence"
              points={eventPoints(["validation_error", "repeated_attempt"])}
              color="#e11d48"
            />
            <ChartCard
              title="Prototype score over time"
              description="Cumulative heuristic score by event sequence"
              points={scorePoints}
              color="#2563eb"
            />
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Before/after adaptation</CardTitle>
            <CardDescription>
              Compares the score captured when the current adaptive layout was
              selected with events recorded afterward.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <MetricValue
              label="Before"
              value={beforeScore === null ? "Not recorded" : `${beforeScore} / 100`}
            />
            <MetricValue
              label="After"
              value={
                adaptedAt === null
                  ? "Not available"
                  : `${scoreCognitiveLoad(afterEvents).score} / 100`
              }
            />
            <p className="text-sm text-slate-600 sm:col-span-2">
              Before events: {beforeEvents.length}. After events:{" "}
              {afterEvents.length}. The export includes event counts and these
              heuristic scores, never form values.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accessibility preferences</CardTitle>
            <CardDescription>
              Adjust text size, contrast, and color theme for this open session.
              Preferences are not persisted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccessibilityControls />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Privacy boundary</CardTitle>
                <CardDescription>
                  Telemetry is consent-gated, session-only, and never includes
                  field names or values.
                </CardDescription>
              </div>
              <Badge variant={trackingEnabled ? "success" : "outline"}>
                {trackingEnabled ? "Consent active" : "Consent off"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Turning tracking off immediately clears in-memory interaction
            events. Financial draft values are held separately in React state
            and are never exported with telemetry.
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({
  title,
  description,
  value,
  icon,
}: {
  title: string;
  description: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-black text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  description,
  points,
  color,
}: {
  title: string;
  description: string;
  points: { label: string; value: number }[];
  color: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <TelemetryChart
          title={title}
          description={description}
          points={points}
          color={color}
        />
      </CardContent>
    </Card>
  );
}

function MetricValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

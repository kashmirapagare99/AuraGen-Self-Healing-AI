"use client";

import { useTelemetry } from "@/hooks/useTelemetry";

export function ConsentBanner() {
  const { trackingEnabled, events, setTrackingEnabled } = useTelemetry();

  return (
    <aside
      aria-labelledby="telemetry-consent-title"
      className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl space-y-1">
          <h2
            id="telemetry-consent-title"
            className="text-sm font-semibold text-slate-900"
          >
            Optional interaction tracking
          </h2>
          <p className="text-xs leading-relaxed text-slate-600">
            When enabled, AuraGen keeps interaction types and elapsed times in
            this browser session only. It never records typed values or sends
            telemetry to a server. Turning tracking off clears this session’s
            collected events.
          </p>
        </div>
        <label className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={trackingEnabled}
            onChange={(event) => setTrackingEnabled(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-aura-600 focus:ring-aura-500"
            aria-label="Allow privacy-safe interaction tracking"
          />
          Allow tracking
        </label>
      </div>
      <p className="mx-auto mt-2 max-w-7xl text-xs text-slate-500" aria-live="polite">
        {trackingEnabled
          ? `Tracking on. ${events.length} event records held in memory.`
          : "Tracking off. No interaction events are collected."}
      </p>
    </aside>
  );
}

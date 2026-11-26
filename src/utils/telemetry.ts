import { FrictionEvent, FrictionEventType } from "@/types/friction";

export const DEFAULT_TELEMETRY_THRESHOLDS = {
  clickWindowMs: 1_000,
  repeatedClickCount: 3,
  hesitationMs: 10_000,
  longPauseMs: 30_000,
} as const;

export function createTelemetryEvent(
  trackingEnabled: boolean,
  type: FrictionEventType,
  timestamp: number,
  durationMs?: number
): FrictionEvent | null {
  if (!trackingEnabled) return null;

  return {
    type,
    timestamp,
    ...(durationMs === undefined ? {} : { durationMs }),
  };
}

export interface ClickTrackerState {
  target: object;
  startedAt: number;
  lastClickedAt: number;
  clickCount: number;
}

export function observeControlClick(
  previous: ClickTrackerState | undefined,
  target: object,
  timestamp: number,
  thresholds = DEFAULT_TELEMETRY_THRESHOLDS
): { state: ClickTrackerState; repeatedClickDurationMs?: number } {
  const continuesCluster =
    previous !== undefined &&
    previous.target === target &&
    timestamp >= previous.lastClickedAt &&
    timestamp - previous.lastClickedAt <= thresholds.clickWindowMs;
  const clickCount = continuesCluster ? previous.clickCount + 1 : 1;
  const startedAt = continuesCluster ? previous.startedAt : timestamp;

  return {
    state: {
      target,
      startedAt,
      lastClickedAt: timestamp,
      clickCount,
    },
    ...(clickCount === thresholds.repeatedClickCount
      ? { repeatedClickDurationMs: timestamp - startedAt }
      : {}),
  };
}

export function getFieldTimeEventTypes(
  durationMs: number,
  thresholds = DEFAULT_TELEMETRY_THRESHOLDS
): FrictionEventType[] {
  const types: FrictionEventType[] = ["field_time"];

  if (durationMs >= thresholds.hesitationMs) {
    types.push("extended_hesitation");
  }
  if (durationMs >= thresholds.longPauseMs) {
    types.push("long_pause");
  }

  return types;
}

export function getValidationAttemptEventTypes(
  attemptNumber: number
): FrictionEventType[] {
  if (attemptNumber < 1) return [];
  return attemptNumber === 1
    ? ["validation_error"]
    : ["validation_error", "repeated_attempt"];
}

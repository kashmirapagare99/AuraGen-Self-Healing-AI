import { z } from "zod";
import { DEFAULT_ADAPTIVE_UI_SPEC, uiSpecSchema } from "../types/ui-spec";
import type { FrictionEvent, FrictionEventType } from "../types/friction";

const frictionEventSchema = z
  .object({
    type: z.enum([
      "repeated_click",
      "validation_error",
      "extended_hesitation",
      "field_time",
      "long_pause",
      "repeated_attempt",
      "repeated_interaction",
      "mode_toggle",
      "step_abandonment",
    ]),
    timestamp: z.number().finite().nonnegative(),
    durationMs: z.number().finite().nonnegative().optional(),
  })
  .strict();

export const interactionContextRequestSchema = z
  .object({
    score: z.number().int().min(0).max(100),
    events: z.array(frictionEventSchema).max(500),
  })
  .strict();

export const adaptiveUIReasonSchema = z.enum([
  "repeated_clicks",
  "validation_errors",
  "hesitation",
  "general",
]);

export const adaptiveUIResponseSchema = z
  .object({
    uiSpec: uiSpecSchema,
    reason: adaptiveUIReasonSchema,
  })
  .strict();

export type InteractionContextRequest = z.infer<
  typeof interactionContextRequestSchema
>;
export interface InteractionContextInput {
  score: number;
  events: readonly FrictionEvent[];
}

export function sanitizeInteractionContextRequest(
  request: InteractionContextInput
): InteractionContextRequest {
  const candidate = {
    score: request.score,
    events: request.events
      .slice(-500)
      .map(({ type, timestamp, durationMs }) => ({
        type,
        timestamp,
        ...(durationMs === undefined ? {} : { durationMs }),
      })),
  };
  const validatedRequest = interactionContextRequestSchema.safeParse(candidate);

  if (!validatedRequest.success) {
    throw new TypeError(
      `Invalid interaction context request: ${validatedRequest.error.issues
        .map((issue) => issue.message)
        .join("; ")}`
    );
  }

  return validatedRequest.data;
}

export type AdaptiveUIReason = z.infer<typeof adaptiveUIReasonSchema>;
export type AdaptiveUIResponse = z.infer<typeof adaptiveUIResponseSchema>;

const causeByEvent: Partial<Record<FrictionEventType, AdaptiveUIReason>> = {
  repeated_click: "repeated_clicks",
  validation_error: "validation_errors",
  repeated_attempt: "validation_errors",
  extended_hesitation: "hesitation",
  long_pause: "hesitation",
};

function chooseDominantReason(
  events: InteractionContextRequest["events"]
): AdaptiveUIReason {
  const counts: Partial<Record<AdaptiveUIReason, number>> = {};
  for (const event of events) {
    const reason = causeByEvent[event.type];
    if (reason) counts[reason] = (counts[reason] ?? 0) + 1;
  }

  return (
    (Object.entries(counts) as [AdaptiveUIReason, number][]).sort(
      ([reasonA, countA], [reasonB, countB]) =>
        countB - countA ||
        ["validation_errors", "repeated_clicks", "hesitation", "general"].indexOf(
          reasonA
        ) -
          ["validation_errors", "repeated_clicks", "hesitation", "general"].indexOf(
            reasonB
          )
    )[0]?.[0] ?? "general"
  );
}

export function createMockAdaptiveUIResponse(
  request: InteractionContextRequest
): AdaptiveUIResponse {
  const reason = chooseDominantReason(request.events);
  const mode = reason === "hesitation" ? "one_question" : "wizard";
  return adaptiveUIResponseSchema.parse({
    uiSpec: { ...DEFAULT_ADAPTIVE_UI_SPEC, mode },
    reason,
  });
}

export async function requestAdaptiveUI(
  request: InteractionContextInput
): Promise<AdaptiveUIResponse> {
  const validatedRequest = sanitizeInteractionContextRequest(request);

  const endpoint = process.env.NEXT_PUBLIC_AURAGEN_ADAPTIVE_API_URL;
  if (!endpoint) {
    return createMockAdaptiveUIResponse(validatedRequest);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedRequest),
  });
  if (!response.ok) {
    throw new Error(
      `Adaptive UI service request failed with status ${response.status}`
    );
  }

  const responseBody: unknown = await response.json();
  const validatedResponse = adaptiveUIResponseSchema.safeParse(responseBody);
  if (!validatedResponse.success) {
    throw new Error(
      `Adaptive UI service returned an invalid response: ${validatedResponse.error.issues
        .map((issue) => issue.message)
        .join("; ")}`
    );
  }

  return validatedResponse.data;
}

const baseApiUrl = process.env.NEXT_PUBLIC_AURAGEN_ADAPTIVE_API_URL?.replace(
  "/api/adaptive-ui",
  ""
);

const suggestionSchema = z.object({
  title: z.string().min(1).max(80),
  detail: z.string().min(1).max(300),
  priority: z.enum(["high", "medium", "low"]),
  category: z.enum(["form", "layout", "accessibility", "process"]),
  action: z.enum(["application", "simplified", "analytics", "demo", "none"]),
});

export const insightsResponseSchema = z.object({
  summary: z.string().min(1).max(300),
  suggestions: z.array(suggestionSchema).min(3).max(5),
  source: z.enum(["llm", "rules"]),
  provider: z.string(),
});

export type InsightsResponse = z.infer<typeof insightsResponseSchema>;

export async function requestInsights(
  request: InteractionContextInput,
  signal?: AbortSignal
): Promise<InsightsResponse | null> {
  if (!baseApiUrl) return null;

  const validatedRequest = sanitizeInteractionContextRequest(request);
  const response = await fetch(`${baseApiUrl}/api/insights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedRequest),
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Insights service request failed with status ${response.status}`
    );
  }

  const responseBody: unknown = await response.json();
  const validatedResponse = insightsResponseSchema.safeParse(responseBody);
  if (!validatedResponse.success) {
    throw new Error(
      `Insights service returned an invalid response: ${validatedResponse.error.issues
        .map((issue) => issue.message)
        .join("; ")}`
    );
  }

  return validatedResponse.data;
}

export const metricsSummarySchema = z.object({
  adaptations: z.object({
    total: z.number().int().nonnegative(),
    averageScore: z.number().nullable(),
    byReason: z.record(z.string(), z.number().int().nonnegative()),
    bySource: z.record(z.string(), z.number().int().nonnegative()),
  }),
  outcomes: z.object({
    total: z.number().int().nonnegative(),
    averageBeforeScore: z.number().nullable(),
    averageAfterScore: z.number().nullable(),
    improved: z.number().int().nonnegative(),
  }),
});

export type MetricsSummary = z.infer<typeof metricsSummarySchema>;

export async function requestMetricsSummary(
  signal?: AbortSignal
): Promise<MetricsSummary | null> {
  if (!baseApiUrl) return null;

  const response = await fetch(`${baseApiUrl}/api/metrics/summary`, { signal });
  if (!response.ok) {
    throw new Error(
      `Metrics summary request failed with status ${response.status}`
    );
  }

  const responseBody: unknown = await response.json();
  const validatedResponse = metricsSummarySchema.safeParse(responseBody);
  if (!validatedResponse.success) {
    throw new Error(
      `Metrics service returned an invalid summary: ${validatedResponse.error.issues
        .map((issue) => issue.message)
        .join("; ")}`
    );
  }

  return validatedResponse.data;
}

export const outcomeRequestSchema = z.object({
  reason: z.enum(["repeated_clicks", "validation_errors", "hesitation", "general"]),
  mode: z.enum(["wizard", "one_question"]),
  beforeScore: z.number().int().min(0).max(100),
  afterScore: z.number().int().min(0).max(100),
}).strict();

export type OutcomeRequest = z.infer<typeof outcomeRequestSchema>;

export async function reportOutcome(
  outcome: OutcomeRequest
): Promise<boolean> {
  if (!baseApiUrl) return false;

  const validatedOutcome = outcomeRequestSchema.safeParse({
    reason: outcome.reason,
    mode: outcome.mode,
    beforeScore: outcome.beforeScore,
    afterScore: outcome.afterScore,
  });
  if (!validatedOutcome.success) {
    throw new TypeError(
      `Invalid outcome request: ${validatedOutcome.error.issues
        .map((issue) => issue.message)
        .join("; ")}`
    );
  }

  const response = await fetch(`${baseApiUrl}/api/metrics/outcome`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedOutcome.data),
  });

  if (!response.ok) {
    throw new Error(
      `Outcome metrics request failed with status ${response.status}`
    );
  }

  return true;
}

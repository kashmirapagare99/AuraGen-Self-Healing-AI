import { z } from "zod";
import { DEFAULT_ADAPTIVE_UI_SPEC, uiSpecSchema } from "../types/ui-spec";
import { FrictionEventType } from "../types/friction";

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
  request: InteractionContextRequest
): Promise<AdaptiveUIResponse> {
  const validatedRequest = interactionContextRequestSchema.safeParse(request);
  if (!validatedRequest.success) {
    throw new TypeError(
      `Invalid adaptive UI request: ${validatedRequest.error.issues
        .map((issue) => issue.message)
        .join("; ")}`
    );
  }

  const endpoint = process.env.NEXT_PUBLIC_AURAGEN_ADAPTIVE_API_URL;
  if (!endpoint) {
    return createMockAdaptiveUIResponse(validatedRequest.data);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedRequest.data),
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

import { z } from "zod";
import { adaptiveUIResponseSchema } from "./api";

export const adaptiveWebSocketMessageSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("adaptive_ui"),
      payload: adaptiveUIResponseSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal("status"),
      payload: z
        .object({
          status: z.enum(["connected", "reconnecting", "closed"]),
        })
        .strict(),
    })
    .strict(),
]);

export type AdaptiveWebSocketMessage = z.infer<
  typeof adaptiveWebSocketMessageSchema
>;

export function parseAdaptiveWebSocketMessage(
  message: unknown
): AdaptiveWebSocketMessage {
  const parsed = adaptiveWebSocketMessageSchema.safeParse(message);
  if (!parsed.success) {
    throw new TypeError(
      `Invalid adaptive WebSocket message: ${parsed.error.issues
        .map((issue) => issue.message)
        .join("; ")}`
    );
  }
  return parsed.data;
}

export function createAdaptiveWebSocketStub() {
  const listeners = new Set<(message: AdaptiveWebSocketMessage) => void>();

  return {
    subscribe(listener: (message: AdaptiveWebSocketMessage) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    receive(message: unknown) {
      const validatedMessage = parseAdaptiveWebSocketMessage(message);
      listeners.forEach((listener) => listener(validatedMessage));
    },
    close() {
      listeners.clear();
    },
  };
}

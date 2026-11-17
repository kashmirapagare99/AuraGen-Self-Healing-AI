import { describe, expect, it } from "vitest";
import {
  createMockAdaptiveUIResponse,
  interactionContextRequestSchema,
} from "./api";

describe("adaptive UI mock service", () => {
  it("chooses one-question mode when hesitation is dominant", () => {
    const response = createMockAdaptiveUIResponse({
      score: 70,
      events: [
        { type: "long_pause", timestamp: 100, durationMs: 30_000 },
        { type: "extended_hesitation", timestamp: 200, durationMs: 10_000 },
        { type: "field_time", timestamp: 300, durationMs: 500 },
      ],
    });

    expect(response.reason).toBe("hesitation");
    expect(response.uiSpec.mode).toBe("one_question");
  });

  it("rejects requests containing form values or extra fields", () => {
    expect(
      interactionContextRequestSchema.safeParse({
        score: 50,
        events: [{ type: "validation_error", timestamp: 100 }],
        fullName: "Sensitive value",
      }).success
    ).toBe(false);
  });
});

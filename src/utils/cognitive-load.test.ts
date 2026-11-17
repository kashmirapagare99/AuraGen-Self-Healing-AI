import { describe, expect, it } from "vitest";
import { FrictionEvent } from "../types/friction";
import { scoreCognitiveLoad } from "./cognitive-load";

function eventsOfType(
  type: FrictionEvent["type"],
  count: number
): FrictionEvent[] {
  return Array.from({ length: count }, (_, index) => ({
    type,
    timestamp: index,
  }));
}

describe("scoreCognitiveLoad", () => {
  it("uses configured weights and thresholds", () => {
    expect(
      scoreCognitiveLoad(
        eventsOfType("validation_error", 2),
        {
          weights: { validationError: 20 },
          thresholds: { moderate: 25, high: 40 },
        }
      )
    ).toEqual({ score: 40, level: "high" });
  });

  it("clamps the score to 0 through 100", () => {
    expect(scoreCognitiveLoad(eventsOfType("validation_error", 20)).score).toBe(
      100
    );
  });

  it("ignores field timing events for the score", () => {
    expect(scoreCognitiveLoad(eventsOfType("field_time", 10))).toEqual({
      score: 0,
      level: "low",
    });
  });

  it("rejects thresholds that cannot classify scores consistently", () => {
    expect(() =>
      scoreCognitiveLoad([], { thresholds: { moderate: 70, high: 60 } })
    ).toThrow(RangeError);
  });
});

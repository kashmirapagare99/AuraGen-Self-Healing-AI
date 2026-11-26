import { describe, expect, it } from "vitest";
import { demoScenarioSignals } from "./demo-scenarios";
import { scoreCognitiveLoad } from "./cognitive-load";

describe("demo scenario signals", () => {
  it("offers a no-friction scenario and a high-load scenario that clamps", () => {
    expect(demoScenarioSignals.normal).toEqual([]);
    const highLoadEvents = demoScenarioSignals.high_load.map(
      ({ type, durationMs }, index) => ({
        type,
        timestamp: index,
        ...(durationMs === undefined ? {} : { durationMs }),
      })
    );

    expect(scoreCognitiveLoad(highLoadEvents).score).toBe(100);
  });
});

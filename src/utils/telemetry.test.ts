import { describe, expect, it } from "vitest";
import {
  createTelemetryEvent,
  getFieldTimeEventTypes,
  getValidationAttemptEventTypes,
  observeControlClick,
} from "./telemetry";

describe("createTelemetryEvent", () => {
  it("does not create events before consent and records only event type and timing", () => {
    expect(createTelemetryEvent(false, "field_time", 100, 25)).toBeNull();

    const event = createTelemetryEvent(true, "field_time", 100, 25);
    expect(event).toEqual({
      type: "field_time",
      timestamp: 100,
      durationMs: 25,
    });
    expect(Object.keys(event ?? {}).sort()).toEqual([
      "durationMs",
      "timestamp",
      "type",
    ]);
  });
});

describe("observeControlClick", () => {
  it("detects three rapid clicks on the same control", () => {
    const control = {};
    const first = observeControlClick(undefined, control, 100);
    const second = observeControlClick(first.state, control, 350);
    const third = observeControlClick(second.state, control, 600);

    expect(third.repeatedClickDurationMs).toBe(500);
  });

  it("starts a new cluster for a different control or an expired window", () => {
    const firstControl = {};
    const secondControl = {};
    const first = observeControlClick(undefined, firstControl, 100);
    const differentControl = observeControlClick(
      first.state,
      secondControl,
      200
    );
    const expiredWindow = observeControlClick(
      differentControl.state,
      secondControl,
      1_300
    );

    expect(differentControl.state.clickCount).toBe(1);
    expect(expiredWindow.state.clickCount).toBe(1);
    expect(expiredWindow.repeatedClickDurationMs).toBeUndefined();
  });
});

describe("getFieldTimeEventTypes", () => {
  it("records field time and adds hesitation and pause events at their thresholds", () => {
    expect(getFieldTimeEventTypes(5_000)).toEqual(["field_time"]);
    expect(getFieldTimeEventTypes(10_000)).toEqual([
      "field_time",
      "extended_hesitation",
    ]);
    expect(getFieldTimeEventTypes(30_000)).toEqual([
      "field_time",
      "extended_hesitation",
      "long_pause",
    ]);
  });
});

describe("getValidationAttemptEventTypes", () => {
  it("marks subsequent invalid submissions as repeated attempts", () => {
    expect(getValidationAttemptEventTypes(1)).toEqual(["validation_error"]);
    expect(getValidationAttemptEventTypes(2)).toEqual([
      "validation_error",
      "repeated_attempt",
    ]);
    expect(getValidationAttemptEventTypes(0)).toEqual([]);
  });
});

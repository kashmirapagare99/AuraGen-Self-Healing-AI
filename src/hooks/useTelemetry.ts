"use client";

import { useEffect, useRef } from "react";
import { FrictionEventType } from "@/types/friction";
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import {
  ClickTrackerState,
  getFieldTimeEventTypes,
  observeControlClick,
} from "@/utils/telemetry";

export function useTelemetry() {
  const {
    trackingEnabled,
    events,
    setTrackingEnabled,
    clearEvents,
    recordEvent,
  } = useTelemetryContext();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!trackingEnabled || !form) return;

    let clickState: ClickTrackerState | undefined;
    const focusStartedAt = new WeakMap<EventTarget, number>();

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const control = target.closest(
        "button, input, select, textarea, [role='button']"
      );
      if (!control) return;

      const timestamp = Date.now();
      const result = observeControlClick(clickState, control, timestamp);
      clickState = result.state;
      if (result.repeatedClickDurationMs !== undefined) {
        recordEvent("repeated_click", result.repeatedClickDurationMs);
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.matches("input, select, textarea")
      ) {
        focusStartedAt.set(target, Date.now());
      }
    };

    const handleFocusOut = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const startedAt = focusStartedAt.get(target);
      if (startedAt === undefined) return;

      focusStartedAt.delete(target);
      const durationMs = Math.max(0, Date.now() - startedAt);
      getFieldTimeEventTypes(durationMs).forEach((type: FrictionEventType) => {
        recordEvent(type, durationMs);
      });
    };

    form.addEventListener("click", handleClick);
    form.addEventListener("focusin", handleFocusIn);
    form.addEventListener("focusout", handleFocusOut);

    return () => {
      form.removeEventListener("click", handleClick);
      form.removeEventListener("focusin", handleFocusIn);
      form.removeEventListener("focusout", handleFocusOut);
    };
  }, [trackingEnabled, recordEvent]);

  return {
    trackingEnabled,
    events,
    setTrackingEnabled,
    clearEvents,
    recordEvent,
    formRef,
  };
}

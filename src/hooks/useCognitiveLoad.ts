"use client";

import { useMemo } from "react";
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import {
  CognitiveLoadConfig,
  DEFAULT_COGNITIVE_LOAD_CONFIG,
  scoreCognitiveLoad,
} from "@/utils/cognitive-load";

export function useCognitiveLoad(
  config: CognitiveLoadConfig = DEFAULT_COGNITIVE_LOAD_CONFIG
) {
  const { events, trackingEnabled } = useTelemetryContext();
  const result = useMemo(
    () => scoreCognitiveLoad(events, config),
    [events, config]
  );

  return { ...result, trackingEnabled };
}

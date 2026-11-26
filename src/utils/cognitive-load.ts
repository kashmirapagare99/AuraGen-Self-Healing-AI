import {
  DEFAULT_FRICTION_WEIGHTS,
  FrictionEvent,
  FrictionEventType,
  FrictionScoringWeights,
} from "../types/friction";

export type CognitiveLoadLevel = "low" | "moderate" | "high";

export interface CognitiveLoadThresholds {
  moderate: number;
  high: number;
}

export interface CognitiveLoadConfig {
  weights?: Partial<FrictionScoringWeights>;
  thresholds?: Partial<CognitiveLoadThresholds>;
}

export interface CognitiveLoadResult {
  score: number;
  level: CognitiveLoadLevel;
}

export const DEFAULT_COGNITIVE_LOAD_CONFIG = {
  weights: DEFAULT_FRICTION_WEIGHTS,
  thresholds: {
    moderate: 30,
    high: 60,
  },
} satisfies {
  weights: FrictionScoringWeights;
  thresholds: CognitiveLoadThresholds;
};

const eventWeight: Record<
  FrictionEventType,
  keyof FrictionScoringWeights | null
> = {
  repeated_click: "repeatedClick",
  validation_error: "validationError",
  extended_hesitation: "extendedHesitation",
  repeated_interaction: "repeatedInteraction",
  repeated_attempt: "repeatedInteraction",
  long_pause: "repeatedInteraction",
  field_time: null,
  mode_toggle: "repeatedInteraction",
  step_abandonment: "repeatedInteraction",
};

function assertConfigIsValid(
  weights: FrictionScoringWeights,
  thresholds: CognitiveLoadThresholds
) {
  if (
    !Number.isFinite(thresholds.moderate) ||
    !Number.isFinite(thresholds.high) ||
    thresholds.moderate < 0 ||
    thresholds.high > 100 ||
    thresholds.moderate >= thresholds.high
  ) {
    throw new RangeError(
      "Cognitive load thresholds must satisfy 0 <= moderate < high <= 100"
    );
  }

  if (Object.values(weights).some((weight) => !Number.isFinite(weight) || weight < 0)) {
    throw new RangeError("Cognitive load weights must be finite non-negative numbers");
  }
}

export function scoreCognitiveLoad(
  events: readonly FrictionEvent[],
  config: CognitiveLoadConfig = DEFAULT_COGNITIVE_LOAD_CONFIG
): CognitiveLoadResult {
  const weights: FrictionScoringWeights = {
    ...DEFAULT_FRICTION_WEIGHTS,
    ...config.weights,
  };
  const thresholds: CognitiveLoadThresholds = {
    ...DEFAULT_COGNITIVE_LOAD_CONFIG.thresholds,
    ...config.thresholds,
  };
  assertConfigIsValid(weights, thresholds);

  const rawScore = events.reduce((total, event) => {
    const weightKey = eventWeight[event.type];
    return weightKey ? total + weights[weightKey] : total;
  }, 0);
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));
  const level: CognitiveLoadLevel =
    score >= thresholds.high
      ? "high"
      : score >= thresholds.moderate
        ? "moderate"
        : "low";

  return { score, level };
}

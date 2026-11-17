export type FrictionEventType =
  | "repeated_click"
  | "validation_error"
  | "extended_hesitation"
  | "field_time"
  | "long_pause"
  | "repeated_attempt"
  | "repeated_interaction"
  | "mode_toggle"
  | "step_abandonment";

export interface FrictionEvent {
  type: FrictionEventType;
  timestamp: number;
  durationMs?: number;
}

export type FrictionLevel = "low" | "moderate" | "high";

export interface FrictionState {
  score: number;
  level: FrictionLevel;
  events: FrictionEvent[];
  repeatedClickCount: number;
  validationErrorCount: number;
  hesitationCount: number;
  repeatedInteractionCount: number;
  uiAdaptationCount: number;
  isAssistanceTriggered: boolean;
  isAssistanceDismissed: boolean;
  trackingConsent: boolean;
  threshold: number; // default e.g. 50 or 60
}

export interface FrictionScoringWeights {
  repeatedClick: number;
  validationError: number;
  extendedHesitation: number;
  repeatedInteraction: number;
}

export const DEFAULT_FRICTION_WEIGHTS: FrictionScoringWeights = {
  repeatedClick: 10,
  validationError: 15,
  extendedHesitation: 10,
  repeatedInteraction: 10,
};

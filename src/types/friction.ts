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
  id?: string;
  type: FrictionEventType;
  fieldId?: string;
  timestamp: number;
  weight?: number;
  description?: string;
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
  threshold: number;
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

export interface InteractionMetric {
  hesitationCount: number;
  repeatedClicksCount: number;
  validationErrorsCount: number;
  totalTimeSpentSeconds: number;
  estimatedFrictionScore: number;
}

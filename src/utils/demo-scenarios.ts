import { FrictionEventType } from "@/types/friction";

export type DemoScenario =
  | "normal"
  | "slow"
  | "repeated_clicks"
  | "validation_errors"
  | "high_load";

export interface DemoSignal {
  type: FrictionEventType;
  durationMs?: number;
}

export const demoScenarioOptions: {
  id: DemoScenario;
  label: string;
  description: string;
}[] = [
  {
    id: "normal",
    label: "Normal use",
    description: "No friction signals.",
  },
  {
    id: "slow",
    label: "Slow field interaction",
    description: "Simulates a 12-second field interaction.",
  },
  {
    id: "repeated_clicks",
    label: "Repeated clicks",
    description: "Simulates three repeated-click clusters.",
  },
  {
    id: "validation_errors",
    label: "Multiple validation errors",
    description: "Simulates repeated validation attempts.",
  },
  {
    id: "high_load",
    label: "High cognitive load",
    description: "Simulates a combination of friction signals.",
  },
];

const repeatedClicks: DemoSignal[] = Array.from({ length: 3 }, () => ({
  type: "repeated_click",
  durationMs: 500,
}));

const validationErrors: DemoSignal[] = [
  { type: "validation_error" },
  { type: "validation_error" },
  { type: "validation_error" },
  { type: "repeated_attempt" },
  { type: "repeated_attempt" },
];

export const demoScenarioSignals: Record<DemoScenario, readonly DemoSignal[]> = {
  normal: [],
  slow: [
    { type: "field_time", durationMs: 12_000 },
    { type: "extended_hesitation", durationMs: 12_000 },
  ],
  repeated_clicks: repeatedClicks,
  validation_errors: validationErrors,
  high_load: [
    ...validationErrors,
    ...repeatedClicks,
    { type: "extended_hesitation", durationMs: 30_000 },
    { type: "long_pause", durationMs: 30_000 },
  ],
};

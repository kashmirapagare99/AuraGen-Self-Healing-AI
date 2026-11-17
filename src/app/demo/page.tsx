"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CognitiveLoadIndicator } from "@/components/telemetry/CognitiveLoadIndicator";
import { useAdaptiveUI } from "@/contexts/AdaptiveUIContext";
import { useFormState } from "@/contexts/FormStateContext";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useCognitiveLoad } from "@/hooks/useCognitiveLoad";
import { requestAdaptiveUI } from "@/services/api";
import { DemoScenario, demoScenarioOptions, demoScenarioSignals } from "@/utils/demo-scenarios";
import { DEFAULT_ADAPTIVE_UI_SPEC } from "@/types/ui-spec";
import { DEFAULT_COGNITIVE_LOAD_CONFIG } from "@/utils/cognitive-load";

const demoFields = [
  { key: "fullName", label: "Full name", type: "text" },
  { key: "email", label: "Email address", type: "email" },
  { key: "applicationPurpose", label: "Application purpose", type: "textarea" },
] as const;

type DemoField = (typeof demoFields)[number];
type DemoFieldKey = DemoField["key"];

function updateDemoValue(
  key: DemoFieldKey,
  value: string,
  updateFormData: ReturnType<typeof useFormState>["updateFormData"]
) {
  switch (key) {
    case "fullName":
      updateFormData({ fullName: value });
      break;
    case "email":
      updateFormData({ email: value });
      break;
    case "applicationPurpose":
      updateFormData({ applicationPurpose: value });
      break;
  }
}

function DemoInput({
  field,
  value,
  onChange,
}: {
  field: DemoField;
  value: string;
  onChange: (value: string) => void;
}) {
  const controlClassName =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-aura-500 focus:outline-none focus:ring-2 focus:ring-aura-100";

  return (
    <div className="space-y-1.5">
      <label htmlFor={`demo-${field.key}`} className="text-sm font-medium text-slate-700">
        {field.label}
      </label>
      {field.type === "textarea" ? (
        <textarea
          id={`demo-${field.key}`}
          value={value}
          rows={3}
          className={controlClassName}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      ) : (
        <input
          id={`demo-${field.key}`}
          type={field.type}
          value={value}
          className={controlClassName}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      )}
    </div>
  );
}

export default function DemoPage() {
  const { formData, updateFormData } = useFormState();
  const {
    formRef,
    events,
    trackingEnabled,
    clearEvents,
    recordEvent,
  } = useTelemetry();
  const { score } = useCognitiveLoad();
  const { setAdaptation } = useAdaptiveUI();
  const [scenario, setScenario] = useState<DemoScenario>("normal");
  const [view, setView] = useState<"complex" | "simplified">("complex");
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [isAdapting, setIsAdapting] = useState(false);

  const runScenario = () => {
    if (!trackingEnabled) {
      setError("Enable optional interaction tracking before running a scenario.");
      return;
    }

    clearEvents();
    demoScenarioSignals[scenario].forEach(({ type, durationMs }) => {
      recordEvent(type, durationMs);
    });
    setError("");
    setView("complex");
    setStepIndex(0);
  };

  const simplifyDemo = async () => {
    setIsAdapting(true);
    setError("");
    try {
      const response = trackingEnabled
        ? await requestAdaptiveUI({ score, events })
        : { uiSpec: DEFAULT_ADAPTIVE_UI_SPEC, reason: "general" as const };
      setAdaptation(response.uiSpec, response.reason, score);
      setView("simplified");
      setStepIndex(0);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The demo layout could not be prepared."
      );
    } finally {
      setIsAdapting(false);
    }
  };

  const currentField = demoFields[stepIndex];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="AuraGen Interactive Demo"
          description="Try privacy-safe scripted scenarios and switch between the original and guided layouts."
          badge={
            <Badge variant="indigo" dot>
              Frontend demo
            </Badge>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Scripted interaction scenario</CardTitle>
            <CardDescription>
              Scenarios simulate event types and timings in memory. They do not
              read or record form values.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label className="space-y-1.5 text-sm font-medium text-slate-700">
                Choose scenario
                <select
                  value={scenario}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  onChange={(event) => {
                    const selected = demoScenarioOptions.find(
                      (option) => option.id === event.currentTarget.value
                    );
                    if (selected) setScenario(selected.id);
                  }}
                >
                  {demoScenarioOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end">
                <Button type="button" onClick={runScenario}>
                  Run scenario
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {demoScenarioOptions.find((option) => option.id === scenario)?.description}
            </p>
            {error && (
              <p role="alert" className="text-sm text-rose-700">
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        <CognitiveLoadIndicator />

        {score >= DEFAULT_COGNITIVE_LOAD_CONFIG.thresholds.high &&
          view === "complex" && (
            <Card role="status" aria-live="polite">
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-700">
                  This scenario reached a high prototype heuristic score. You
                  can try a guided layout if you choose.
                </p>
                <Button
                  type="button"
                  variant="accent"
                  isLoading={isAdapting}
                  onClick={() => void simplifyDemo()}
                >
                  Simplify my form
                </Button>
              </CardContent>
            </Card>
          )}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>
                  {view === "complex" ? "Original application preview" : "Simplified application preview"}
                </CardTitle>
                <CardDescription>
                  The same draft is used in both layouts and remains in memory.
                </CardDescription>
              </div>
              {view === "complex" ? (
                <Button
                  type="button"
                  variant="accent"
                  isLoading={isAdapting}
                  onClick={() => void simplifyDemo()}
                >
                  Simplify my form
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setView("complex")}
                >
                  Return to original layout
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              ref={formRef}
              onSubmit={(event) => event.preventDefault()}
              className="space-y-4"
            >
            {view === "complex" ? (
              <div className="grid gap-4 md:grid-cols-3">
                {demoFields.map((field) => (
                  <DemoInput
                    key={field.key}
                    field={field}
                    value={formData[field.key]}
                    onChange={(value) =>
                      updateDemoValue(field.key, value, updateFormData)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="max-w-xl space-y-4">
                <p className="text-sm text-slate-500">
                  Step {stepIndex + 1} of {demoFields.length}
                </p>
                {currentField && (
                  <DemoInput
                    field={currentField}
                    value={formData[currentField.key]}
                    onChange={(value) =>
                      updateDemoValue(currentField.key, value, updateFormData)
                    }
                  />
                )}
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={stepIndex === 0}
                    onClick={() =>
                      setStepIndex((current) => Math.max(0, current - 1))
                    }
                  >
                    Previous
                  </Button>
                  {stepIndex < demoFields.length - 1 ? (
                    <Button
                      type="button"
                      onClick={() =>
                        setStepIndex((current) =>
                          Math.min(demoFields.length - 1, current + 1)
                        )
                      }
                    >
                      Next
                    </Button>
                  ) : (
                    <Button type="button" onClick={() => setView("complex")}>
                      Review in original layout
                    </Button>
                  )}
                </div>
              </div>
            )}
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { UISpecRenderer } from "@/components/adaptive/UISpecRenderer";
import { useAdaptiveUI } from "@/contexts/AdaptiveUIContext";
import { AdaptiveUIReason } from "@/services/api";
import { useFormState } from "@/contexts/FormStateContext";
import { useTelemetry } from "@/hooks/useTelemetry";
import {
  defaultFormData,
  financialFormSchema,
  FinancialFormData,
  FinancialFormInput,
} from "@/types/form";
import { getValidationAttemptEventTypes } from "@/utils/telemetry";
import { scoreCognitiveLoad } from "@/utils/cognitive-load";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const adaptationReasonText: Record<AdaptiveUIReason, string> = {
  repeated_clicks: "repeated clicks on the same control",
  validation_errors: "repeated form validation errors",
  hesitation: "long pauses or extended field interactions",
  general: "your request to use a guided layout",
};

export default function SimplifiedPage() {
  const { formData, updateFormData, resetFormData } = useFormState();
  const {
    uiSpec: spec,
    reason,
    beforeScore,
    adaptedAt,
  } = useAdaptiveUI();
  const { formRef, events, trackingEnabled, recordEvent } = useTelemetry();
  const [oneQuestionMode, setOneQuestionMode] = useState(
    spec.mode === "one_question"
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const invalidAttemptCount = useRef(0);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousStepState = useRef({ stepIndex, oneQuestionMode });
  const methods = useForm<FinancialFormInput, unknown, FinancialFormData>({
    resolver: zodResolver(financialFormSchema),
    defaultValues: formData,
    mode: "onTouched",
  });
  const { handleSubmit, watch, trigger, reset, formState } = methods;
  const values = watch();

  useEffect(() => {
    const subscription = watch((updatedValues) => {
      updateFormData({
        ...updatedValues,
        additionalInformation: updatedValues.additionalInformation ?? "",
      });
      setSubmissionMessage("");
    });

    return () => subscription.unsubscribe();
  }, [updateFormData, watch]);

  const visibleSteps = useMemo(() => {
    if (!oneQuestionMode) return spec.steps;

    const reviewStep = spec.steps.find((step) => step.id === "review");
    const questions = spec.steps
      .filter((step) => step.id !== "review")
      .flatMap((step) =>
        step.fields.map((field) => ({
          id: `${step.id}-${field.key.toLowerCase()}`,
          title: field.label,
          fields: [field],
        }))
      );

    return reviewStep ? [...questions, reviewStep] : questions;
  }, [oneQuestionMode, spec]);
  const visibleSpec = useMemo(
    () => ({
      ...spec,
      mode: oneQuestionMode ? "one_question" : "wizard",
      steps: visibleSteps,
    }),
    [oneQuestionMode, spec, visibleSteps]
  );

  const currentStep = visibleSteps[stepIndex];
  const allFields = spec.steps.flatMap((step) => step.fields);
  const isReviewStep = currentStep?.id === "review";
  const postAdaptationEvents =
    adaptedAt === null
      ? []
      : events.filter((event) => event.timestamp >= adaptedAt);
  const postAdaptationScore = scoreCognitiveLoad(postAdaptationEvents).score;
  const selfHealingCheckReady =
    trackingEnabled &&
    beforeScore !== null &&
    postAdaptationEvents.length >= 3;

  useEffect(() => {
    const previous = previousStepState.current;
    if (
      previous.stepIndex !== stepIndex ||
      previous.oneQuestionMode !== oneQuestionMode
    ) {
      stepHeadingRef.current?.focus();
    }
    previousStepState.current = { stepIndex, oneQuestionMode };
  }, [oneQuestionMode, stepIndex]);

  const recordInvalidAttempt = () => {
    invalidAttemptCount.current += 1;
    getValidationAttemptEventTypes(invalidAttemptCount.current).forEach(
      (type) => recordEvent(type)
    );
  };

  const onValidSubmit = (data: FinancialFormData) => {
    invalidAttemptCount.current = 0;
    updateFormData(data);
    setSubmissionMessage(
      "Your application passed local validation. No information was sent."
    );
  };

  const onNext = async () => {
    if (!currentStep || isReviewStep) return;
    const fields = currentStep.fields.map((field) => field.key);
    if (!(await trigger(fields))) {
      recordInvalidAttempt();
      return;
    }

    setStepIndex((current) => Math.min(current + 1, visibleSteps.length - 1));
  };

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isReviewStep) {
      void handleSubmit(onValidSubmit, recordInvalidAttempt)();
    } else {
      void onNext();
    }
  };

  const onReset = () => {
    reset({ ...defaultFormData });
    resetFormData();
    setStepIndex(0);
    setSubmissionMessage("");
    invalidAttemptCount.current = 0;
  };

  const editSection = (sectionId: string) => {
    const section = spec.steps.find((step) => step.id === sectionId);
    if (!section) return;

    const index = visibleSteps.findIndex(
      (step) =>
        step.id === sectionId ||
        step.fields.some((field) =>
          section.fields.some((sectionField) => sectionField.key === field.key)
        )
    );
    if (index >= 0) setStepIndex(index);
  };

  const getDisplayValue = (fieldKey: (typeof allFields)[number]["key"]) => {
    const value = values[fieldKey];
    if (typeof value === "boolean") return value ? "Accepted" : "Not accepted";
    if (value === "" || value == null) return "Not provided";
    return String(value).replaceAll("_", " ");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Simplified Application Wizard"
          description="Complete the same in-memory application draft in a guided layout."
          badge={
            <Badge variant="indigo" dot>
              {oneQuestionMode ? "One question at a time" : "Adaptive mode"}
            </Badge>
          }
          actions={
            <ButtonLink
              href="/application"
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
            >
              Back to Complex Form
            </ButtonLink>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Why this layout?</CardTitle>
            <CardDescription>
              AuraGen offered this prototype layout based on{" "}
              {adaptationReasonText[reason]}. Only event types and timings are
              used; form values are not sent to the adaptive service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Compare the layouts
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Before — complex form
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Personal, financial, and application fields are presented
                  together on one page.
                </p>
              </div>
              <div className="rounded-xl border border-aura-200 bg-aura-50/50 p-4">
                <h3 className="text-sm font-semibold text-aura-900">
                  After — guided form
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {oneQuestionMode
                    ? "The same validated fields are shown one question at a time."
                    : "The same validated fields are grouped into guided steps."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {beforeScore !== null && (
          <Card role="status" aria-live="polite">
            <CardHeader>
              <CardTitle>Self-healing check</CardTitle>
              <CardDescription>
                Compare prototype heuristic scores before and after the layout
                change. This is not a validated measure of cognitive state.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selfHealingCheckReady ? (
                postAdaptationScore < beforeScore ? (
                  <p className="text-sm text-emerald-700">
                    The prototype score decreased from {beforeScore} to{" "}
                    {postAdaptationScore} after the adaptation.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-slate-700">
                      The prototype score did not improve ({beforeScore} before,
                      {` ${postAdaptationScore} after`}). You can revert or try
                      another layout.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setOneQuestionMode(true);
                          setStepIndex(0);
                        }}
                      >
                        Try one question at a time
                      </Button>
                      <ButtonLink href="/application" variant="secondary">
                        Return to complex form
                      </ButtonLink>
                    </div>
                  </>
                )
              ) : (
                <p className="text-sm text-slate-600">
                  {trackingEnabled
                    ? "Continue using this layout to collect a few privacy-safe interaction events before comparing scores."
                    : "Enable optional interaction tracking to measure the prototype score after adaptation."}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={oneQuestionMode}
                onChange={(event) => {
                  setOneQuestionMode(event.target.checked);
                  setStepIndex(0);
                }}
                className="h-4 w-4 rounded border-slate-300 text-aura-600 focus:ring-aura-500"
              />
              One question at a time
            </label>
            <p className="text-sm text-slate-500">
              Draft values are shared in memory with the complex form and are
              not saved to localStorage.
            </p>
          </CardContent>
        </Card>

        <form
          ref={formRef}
          className="space-y-6"
          noValidate
          onSubmit={onFormSubmit}
        >
          <FormProvider {...methods}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>
                    Step {stepIndex + 1} of {visibleSteps.length}
                  </CardTitle>
                  <span className="text-sm text-slate-500">
                    {currentStep?.title}
                  </span>
                </div>
                <ProgressBar
                  value={stepIndex + 1}
                  max={visibleSteps.length}
                  label="Wizard progress"
                />
              </CardHeader>
            </Card>

            {isReviewStep ? (
              <Card>
                <CardHeader>
                  <h2
                    ref={stepHeadingRef}
                    tabIndex={-1}
                    className="text-lg font-semibold tracking-tight text-slate-900"
                  >
                    Review your application
                  </h2>
                </CardHeader>
                <CardContent className="space-y-6">
                  {spec.steps
                    .filter((step) => step.id !== "review")
                    .map((section) => (
                      <section
                        key={section.id}
                        aria-labelledby={`${section.id}-review-title`}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h2
                            id={`${section.id}-review-title`}
                            className="text-sm font-semibold text-slate-900"
                          >
                            {section.title}
                          </h2>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => editSection(section.id)}
                          >
                            Edit
                          </Button>
                        </div>
                        <dl className="grid gap-3 sm:grid-cols-2">
                          {section.fields.map((field) => (
                            <div
                              key={field.key}
                              className="rounded-lg border border-slate-200 p-3"
                            >
                              <dt className="text-xs font-medium text-slate-500">
                                {field.label}
                              </dt>
                              <dd className="mt-1 break-words text-sm text-slate-900">
                                {getDisplayValue(field.key)}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </section>
                    ))}
                </CardContent>
              </Card>
            ) : (
              <UISpecRenderer
                spec={visibleSpec}
                stepIndex={stepIndex}
                headingRef={stepHeadingRef}
              />
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onReset}
                disabled={formState.isSubmitting}
              >
                Reset draft
              </Button>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                  onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                  disabled={stepIndex === 0 || formState.isSubmitting}
                >
                  Back
                </Button>
                {isReviewStep ? (
                  <Button
                    type="submit"
                    variant="accent"
                    disabled={formState.isSubmitting}
                  >
                    Validate application
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="accent"
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                    onClick={() => void onNext()}
                  >
                    Continue
                  </Button>
                )}
              </div>
            </div>
            <p aria-live="polite" role="status" className="text-sm text-emerald-700">
              {submissionMessage}
            </p>
          </FormProvider>
        </form>
      </div>
    </DashboardLayout>
  );
}

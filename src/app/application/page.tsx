"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CognitiveLoadIndicator } from "@/components/telemetry/CognitiveLoadIndicator";
import { useCognitiveLoad } from "@/hooks/useCognitiveLoad";
import { useFormState } from "@/contexts/FormStateContext";
import { useAdaptiveUI } from "@/contexts/AdaptiveUIContext";
import { useTelemetry } from "@/hooks/useTelemetry";
import { getValidationAttemptEventTypes } from "@/utils/telemetry";
import { requestAdaptiveUI } from "@/services/api";
import { DEFAULT_ADAPTIVE_UI_SPEC } from "@/types/ui-spec";
import {
  defaultFormData,
  financialFormSchema,
  FinancialFormData,
  FinancialFormInput,
  FormFieldKey,
} from "@/types/form";
import { DEFAULT_COGNITIVE_LOAD_CONFIG } from "@/utils/cognitive-load";
import { FileSpreadsheet, Wand2 } from "lucide-react";

const requiredFields: FormFieldKey[] = [
  "fullName",
  "email",
  "phone",
  "dateOfBirth",
  "residentialAddress",
  "employmentStatus",
  "employmentType",
  "monthlyIncome",
  "existingObligations",
  "applicationType",
  "requestedAmount",
  "applicationPurpose",
  "agreedToTerms",
];

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-aura-500 focus:ring-2 focus:ring-aura-100";

function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  if (!message) return null;

  return (
    <p id={`${id}-error`} className="text-xs text-rose-600" role="alert">
      {message}
    </p>
  );
}

export default function ApplicationPage() {
  const { formData, updateFormData, resetFormData } = useFormState();
  const { setAdaptation } = useAdaptiveUI();
  const { formRef, events, trackingEnabled, recordEvent } = useTelemetry();
  const router = useRouter();
  const { score } = useCognitiveLoad();
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [dismissedPromptScore, setDismissedPromptScore] = useState<number | null>(
    null
  );
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptationError, setAdaptationError] = useState("");
  const invalidAttemptCount = useRef(0);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FinancialFormInput, unknown, FinancialFormData>({
    resolver: zodResolver(financialFormSchema) as any,
    defaultValues: formData,
    mode: "onTouched",
  });
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

  const completedFields = requiredFields.filter((field) => {
    const value = values[field];
    return typeof value === "boolean" ? value : value !== "" && value != null;
  }).length;

  const onSubmit = (data: FinancialFormData) => {
    invalidAttemptCount.current = 0;
    updateFormData(data);
    setSubmissionMessage(
      "Your application passed local validation. No information was sent."
    );
  };

  const onInvalid = () => {
    invalidAttemptCount.current += 1;
    getValidationAttemptEventTypes(invalidAttemptCount.current).forEach(
      (type) => recordEvent(type)
    );
  };

  const onReset = () => {
    reset({ ...defaultFormData });
    resetFormData();
    setSubmissionMessage("");
    invalidAttemptCount.current = 0;
  };

  const simplifyForm = async () => {
    setIsAdapting(true);
    setAdaptationError("");
    try {
      const response = trackingEnabled
        ? await requestAdaptiveUI({ score, events })
        : { uiSpec: DEFAULT_ADAPTIVE_UI_SPEC, reason: "general" as const };
      setAdaptation(response.uiSpec, response.reason, score);
      router.push("/simplified");
    } catch (error) {
      setAdaptationError(
        error instanceof Error
          ? error.message
          : "The simplified layout could not be prepared."
      );
    } finally {
      setIsAdapting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Complex Financial Application"
          description="Complete the financial application. Your draft stays in this browser session and is not submitted to a server."
          badge={
            <Badge variant="indigo" dot>
              Local draft
            </Badge>
          }
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isAdapting}
              onClick={() => void simplifyForm()}
              rightIcon={<Wand2 className="h-3.5 w-3.5 text-aura-600" />}
            >
              Switch to Simplified Wizard
            </Button>
          }
        />

        <CognitiveLoadIndicator />

        {adaptationError && (
          <p role="alert" className="text-sm text-rose-700">
            {adaptationError}
          </p>
        )}

        {score >= DEFAULT_COGNITIVE_LOAD_CONFIG.thresholds.high &&
          dismissedPromptScore !== score && (
            <Card role="status" aria-live="polite">
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-700">
                  Your prototype heuristic score is {score}/100. Would a
                  guided layout help?
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="accent"
                    isLoading={isAdapting}
                    onClick={() => void simplifyForm()}
                  >
                    Simplify my form
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setDismissedPromptScore(score)}
                  >
                    Not now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        <form
          ref={formRef}
          className="space-y-6"
          noValidate
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          onChange={() => setSubmissionMessage("")}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-aura-600" />
                <CardTitle>Application progress</CardTitle>
              </div>
              <CardDescription>
                {completedFields} of {requiredFields.length} required fields
                completed.
              </CardDescription>
              <ProgressBar
                value={completedFields}
                max={requiredFields.length}
                label="Required fields"
                size="md"
              />
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Section A — Personal Information</CardTitle>
              <CardDescription>
                Provide the details needed to identify and contact you.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                  Full name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="fullName"
                  autoComplete="name"
                  className={inputClassName}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  {...register("fullName")}
                />
                <FieldError id="fullName" message={errors.fullName?.message} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email address <span aria-hidden="true">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={inputClassName}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  {...register("email")}
                />
                <FieldError id="email" message={errors.email?.message} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                  Phone number <span aria-hidden="true">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  className={inputClassName}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  {...register("phone")}
                />
                <FieldError id="phone" message={errors.phone?.message} />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="dateOfBirth"
                  className="text-sm font-medium text-slate-700"
                >
                  Date of birth <span aria-hidden="true">*</span>
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  autoComplete="bday"
                  className={inputClassName}
                  aria-invalid={Boolean(errors.dateOfBirth)}
                  aria-describedby={
                    errors.dateOfBirth ? "dateOfBirth-error" : undefined
                  }
                  {...register("dateOfBirth")}
                />
                <FieldError
                  id="dateOfBirth"
                  message={errors.dateOfBirth?.message}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label
                  htmlFor="residentialAddress"
                  className="text-sm font-medium text-slate-700"
                >
                  Residential address <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="residentialAddress"
                  autoComplete="street-address"
                  rows={2}
                  className={inputClassName}
                  aria-invalid={Boolean(errors.residentialAddress)}
                  aria-describedby={
                    errors.residentialAddress
                      ? "residentialAddress-error"
                      : undefined
                  }
                  {...register("residentialAddress")}
                />
                <FieldError
                  id="residentialAddress"
                  message={errors.residentialAddress?.message}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Section B — Financial Information</CardTitle>
              <CardDescription>
                Enter your current employment and monthly financial details.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="employmentStatus"
                  className="text-sm font-medium text-slate-700"
                >
                  Employment status <span aria-hidden="true">*</span>
                </label>
                <select
                  id="employmentStatus"
                  className={inputClassName}
                  aria-invalid={Boolean(errors.employmentStatus)}
                  aria-describedby={
                    errors.employmentStatus ? "employmentStatus-error" : undefined
                  }
                  {...register("employmentStatus")}
                >
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self-employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="retired">Retired</option>
                  <option value="student">Student</option>
                </select>
                <FieldError
                  id="employmentStatus"
                  message={errors.employmentStatus?.message}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="employmentType"
                  className="text-sm font-medium text-slate-700"
                >
                  Employment type <span aria-hidden="true">*</span>
                </label>
                <select
                  id="employmentType"
                  className={inputClassName}
                  aria-invalid={Boolean(errors.employmentType)}
                  aria-describedby={
                    errors.employmentType ? "employmentType-error" : undefined
                  }
                  {...register("employmentType")}
                >
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
                <FieldError
                  id="employmentType"
                  message={errors.employmentType?.message}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="monthlyIncome"
                  className="text-sm font-medium text-slate-700"
                >
                  Monthly income ($) <span aria-hidden="true">*</span>
                </label>
                <input
                  id="monthlyIncome"
                  type="number"
                  min="500"
                  step="0.01"
                  inputMode="decimal"
                  className={inputClassName}
                  aria-invalid={Boolean(errors.monthlyIncome)}
                  aria-describedby={
                    errors.monthlyIncome ? "monthlyIncome-error" : undefined
                  }
                  {...register("monthlyIncome", { valueAsNumber: true })}
                />
                <FieldError
                  id="monthlyIncome"
                  message={errors.monthlyIncome?.message}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="existingObligations"
                  className="text-sm font-medium text-slate-700"
                >
                  Existing monthly obligations ($){" "}
                  <span aria-hidden="true">*</span>
                </label>
                <input
                  id="existingObligations"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className={inputClassName}
                  aria-invalid={Boolean(errors.existingObligations)}
                  aria-describedby={
                    errors.existingObligations
                      ? "existingObligations-error"
                      : undefined
                  }
                  {...register("existingObligations", { valueAsNumber: true })}
                />
                <FieldError
                  id="existingObligations"
                  message={errors.existingObligations?.message}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Section C — Application Details</CardTitle>
              <CardDescription>
                Tell us what kind of application you are preparing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="applicationType"
                    className="text-sm font-medium text-slate-700"
                  >
                    Application type <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id="applicationType"
                    className={inputClassName}
                    aria-invalid={Boolean(errors.applicationType)}
                    aria-describedby={
                      errors.applicationType ? "applicationType-error" : undefined
                    }
                    {...register("applicationType")}
                  >
                    <option value="personal_loan">Personal loan</option>
                    <option value="business_credit">Business credit</option>
                    <option value="mortgage">Mortgage</option>
                    <option value="auto_refinance">Auto refinance</option>
                  </select>
                  <FieldError
                    id="applicationType"
                    message={errors.applicationType?.message}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="requestedAmount"
                    className="text-sm font-medium text-slate-700"
                  >
                    Requested amount ($) <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="requestedAmount"
                    type="number"
                    min="1000"
                    step="0.01"
                    inputMode="decimal"
                    className={inputClassName}
                    aria-invalid={Boolean(errors.requestedAmount)}
                    aria-describedby={
                      errors.requestedAmount ? "requestedAmount-error" : undefined
                    }
                    {...register("requestedAmount", { valueAsNumber: true })}
                  />
                  <FieldError
                    id="requestedAmount"
                    message={errors.requestedAmount?.message}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="applicationPurpose"
                  className="text-sm font-medium text-slate-700"
                >
                  Application purpose <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="applicationPurpose"
                  rows={3}
                  className={inputClassName}
                  aria-invalid={Boolean(errors.applicationPurpose)}
                  aria-describedby={
                    errors.applicationPurpose
                      ? "applicationPurpose-error"
                      : undefined
                  }
                  {...register("applicationPurpose")}
                />
                <FieldError
                  id="applicationPurpose"
                  message={errors.applicationPurpose?.message}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="additionalInformation"
                  className="text-sm font-medium text-slate-700"
                >
                  Additional information (optional)
                </label>
                <textarea
                  id="additionalInformation"
                  rows={3}
                  className={inputClassName}
                  aria-invalid={Boolean(errors.additionalInformation)}
                  aria-describedby={
                    errors.additionalInformation
                      ? "additionalInformation-error"
                      : undefined
                  }
                  {...register("additionalInformation")}
                />
                <FieldError
                  id="additionalInformation"
                  message={errors.additionalInformation?.message}
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-aura-600 focus:ring-aura-500"
                    aria-invalid={Boolean(errors.agreedToTerms)}
                    aria-describedby={
                      errors.agreedToTerms ? "agreedToTerms-error" : undefined
                    }
                    {...register("agreedToTerms")}
                  />
                  <span>
                    I agree to the terms and conditions{" "}
                    <span aria-hidden="true">*</span>
                  </span>
                </label>
                <FieldError
                  id="agreedToTerms"
                  message={errors.agreedToTerms?.message}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onReset}>
              Reset form
            </Button>
            <Button type="submit" variant="accent">
              Validate application
            </Button>
          </div>
          <p aria-live="polite" role="status" className="text-sm text-emerald-700">
            {submissionMessage}
          </p>
        </form>
      </div>
    </DashboardLayout>
  );
}

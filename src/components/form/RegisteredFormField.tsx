"use client";

import { ComponentType } from "react";
import {
  UseFormRegisterReturn,
  useFormContext,
} from "react-hook-form";
import { FinancialFormInput, FormFieldKey } from "@/types/form";
import { UISpecField } from "@/types/ui-spec";

type FieldComponent =
  | "text"
  | "email"
  | "tel"
  | "date"
  | "number"
  | "select"
  | "textarea"
  | "checkbox";

interface FieldDefinition {
  component: FieldComponent;
  required: boolean;
  autoComplete?: string;
  min?: number;
  step?: number;
  options?: readonly { value: string; label: string }[];
}

interface RegisteredControlProps {
  field: UISpecField;
  definition: FieldDefinition;
  registration: UseFormRegisterReturn<FormFieldKey>;
  error?: string;
  describedBy?: string;
}

const fieldRegistry: Record<FormFieldKey, FieldDefinition> = {
  fullName: { component: "text", required: true, autoComplete: "name" },
  email: { component: "email", required: true, autoComplete: "email" },
  phone: { component: "tel", required: true, autoComplete: "tel" },
  dateOfBirth: { component: "date", required: true, autoComplete: "bday" },
  residentialAddress: {
    component: "textarea",
    required: true,
    autoComplete: "street-address",
  },
  employmentStatus: {
    component: "select",
    required: true,
    options: [
      { value: "employed", label: "Employed" },
      { value: "self_employed", label: "Self-employed" },
      { value: "unemployed", label: "Unemployed" },
      { value: "retired", label: "Retired" },
      { value: "student", label: "Student" },
    ],
  },
  employmentType: {
    component: "select",
    required: true,
    options: [
      { value: "full_time", label: "Full-time" },
      { value: "part_time", label: "Part-time" },
      { value: "contract", label: "Contract" },
      { value: "freelance", label: "Freelance" },
    ],
  },
  monthlyIncome: { component: "number", required: true, min: 500, step: 0.01 },
  existingObligations: {
    component: "number",
    required: true,
    min: 0,
    step: 0.01,
  },
  applicationType: {
    component: "select",
    required: true,
    options: [
      { value: "personal_loan", label: "Personal loan" },
      { value: "business_credit", label: "Business credit" },
      { value: "mortgage", label: "Mortgage" },
      { value: "auto_refinance", label: "Auto refinance" },
    ],
  },
  requestedAmount: { component: "number", required: true, min: 1000, step: 0.01 },
  applicationPurpose: { component: "textarea", required: true },
  additionalInformation: { component: "textarea", required: false },
  agreedToTerms: { component: "checkbox", required: true },
};

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-aura-500 focus:ring-2 focus:ring-aura-100";

function TextControl({
  field,
  definition,
  registration,
  error,
  describedBy,
}: RegisteredControlProps) {
  return (
    <input
      id={field.key}
      type={definition.component}
      autoComplete={definition.autoComplete}
      min={definition.min}
      step={definition.step}
      inputMode={definition.component === "number" ? "decimal" : undefined}
      required={definition.required}
      className={inputClassName}
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy}
      {...registration}
    />
  );
}

function SelectControl({
  field,
  definition,
  registration,
  error,
  describedBy,
}: RegisteredControlProps) {
  return (
    <select
      id={field.key}
      required={definition.required}
      className={inputClassName}
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy}
      {...registration}
    >
      {definition.options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function TextareaControl({
  field,
  definition,
  registration,
  error,
  describedBy,
}: RegisteredControlProps) {
  return (
    <textarea
      id={field.key}
      autoComplete={definition.autoComplete}
      rows={3}
      required={definition.required}
      className={inputClassName}
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy}
      {...registration}
    />
  );
}

function CheckboxControl({
  field,
  definition,
  registration,
  error,
  describedBy,
}: RegisteredControlProps) {
  return (
    <label className="flex items-start gap-2 text-sm text-slate-700">
      <input
        id={field.key}
        type="checkbox"
        required={definition.required}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-aura-600 focus:ring-aura-500"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...registration}
      />
      <span>{field.label}</span>
    </label>
  );
}

const fieldComponentRegistry: Record<
  FieldComponent,
  ComponentType<RegisteredControlProps>
> = {
  text: TextControl,
  email: TextControl,
  tel: TextControl,
  date: TextControl,
  number: TextControl,
  select: SelectControl,
  textarea: TextareaControl,
  checkbox: CheckboxControl,
};

export function RegisteredFormField({ field }: { field: UISpecField }) {
  const {
    register,
    getFieldState,
  } = useFormContext<FinancialFormInput>();
  const definition = fieldRegistry[field.key];
  const error = getFieldState(field.key).error?.message;
  const registration = register(
    field.key,
    definition.component === "number" ? { valueAsNumber: true } : undefined
  );
  const Control = fieldComponentRegistry[definition.component];
  const helpId = `${field.key}-help`;
  const errorId = `${field.key}-error`;
  const describedBy = [
    field.helpText ? helpId : undefined,
    error ? errorId : undefined,
  ]
    .filter((id): id is string => id !== undefined)
    .join(" ");

  if (!definition) {
    throw new Error(`No registered form control for field "${field.key}"`);
  }

  return (
    <div className="space-y-1.5">
      {definition.component !== "checkbox" && (
        <label
          htmlFor={field.key}
          className="text-sm font-medium text-slate-700"
        >
          {field.label}
          {definition.required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      {field.helpText && (
        <p id={helpId} className="text-xs leading-relaxed text-slate-500">
          {field.helpText}
        </p>
      )}
      <Control
        field={field}
        definition={definition}
        registration={registration}
        error={error}
        describedBy={describedBy || undefined}
      />
      {error && (
        <p id={errorId} className="text-xs text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

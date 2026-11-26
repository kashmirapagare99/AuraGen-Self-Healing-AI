"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { RegisteredFormField } from "@/components/form/RegisteredFormField";
import { uiSpecSchema } from "@/types/ui-spec";
import { Ref } from "react";

interface UISpecRendererProps {
  spec: unknown;
  stepIndex: number;
  headingRef?: Ref<HTMLHeadingElement>;
}

export function UISpecRenderer({
  spec,
  stepIndex,
  headingRef,
}: UISpecRendererProps) {
  const result = uiSpecSchema.safeParse(spec);
  if (!result.success) {
    return (
      <p role="alert" className="text-sm text-rose-700">
        The requested form layout is invalid:{" "}
        {result.error.issues.map((issue) => issue.message).join("; ")}
      </p>
    );
  }

  if (!Number.isInteger(stepIndex) || !result.data.steps[stepIndex]) {
    return (
      <p role="alert" className="text-sm text-rose-700">
        The requested form step is unavailable.
      </p>
    );
  }

  const step = result.data.steps[stepIndex];

  return (
    <Card>
      <CardHeader>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          {step.title}
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {step.fields.map((field) => (
          <RegisteredFormField key={field.key} field={field} />
        ))}
      </CardContent>
    </Card>
  );
}

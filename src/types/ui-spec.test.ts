import { describe, expect, it } from "vitest";
import {
  DEFAULT_ADAPTIVE_UI_SPEC,
  uiSpecSchema,
} from "./ui-spec";

describe("uiSpecSchema", () => {
  it("accepts the predefined safe form layout", () => {
    expect(uiSpecSchema.safeParse(DEFAULT_ADAPTIVE_UI_SPEC).success).toBe(true);
  });

  it("accepts a one-question layout with one step per field", () => {
    const personalFields = DEFAULT_ADAPTIVE_UI_SPEC.steps
      .filter((step) => step.id !== "review")
      .flatMap((step) => step.fields);
    const oneQuestionSpec = {
      mode: "one_question",
      steps: [
        ...personalFields.map((field, index) => ({
          id: `question-${index + 1}`,
          title: field.label,
          fields: [field],
        })),
        DEFAULT_ADAPTIVE_UI_SPEC.steps.find((step) => step.id === "review"),
      ],
    };

    expect(uiSpecSchema.safeParse(oneQuestionSpec).success).toBe(true);
  });

  it("rejects unknown fields, duplicate field keys, and missing review steps", () => {
    const invalidSpec = {
      mode: "wizard",
      steps: [
        {
          id: "personal",
          title: "Personal information",
          fields: [
            { key: "fullName", label: "Full name", componentCode: "alert(1)" },
            { key: "fullName", label: "Repeated full name" },
          ],
        },
        { id: "details", title: "Details", fields: [] },
      ],
    };

    expect(uiSpecSchema.safeParse(invalidSpec).success).toBe(false);
  });
});

import { z } from "zod";
import { formFieldKeys } from "./form";

const uiFieldSchema = z
  .object({
    key: z.enum(formFieldKeys),
    label: z.string().trim().min(1).max(80),
    helpText: z.string().trim().max(300).optional(),
  })
  .strict();

const uiStepSchema = z
  .object({
    id: z.string().regex(/^[a-z][a-z0-9-]*$/).max(40),
    title: z.string().trim().min(1).max(80),
    fields: z.array(uiFieldSchema).max(formFieldKeys.length),
  })
  .strict();

export const uiSpecSchema = z
  .object({
    mode: z.enum(["wizard", "one_question"]),
    steps: z.array(uiStepSchema).min(2).max(formFieldKeys.length + 1),
  })
  .strict()
  .superRefine((spec, context) => {
    const stepIds = spec.steps.map((step) => step.id);
    if (new Set(stepIds).size !== stepIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Step IDs must be unique",
      });
    }

    if (!stepIds.includes("review")) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The UI specification must include a review step",
      });
    }

    const fieldKeys = spec.steps.flatMap((step) =>
      step.fields.map((field) => field.key)
    );
    if (new Set(fieldKeys).size !== fieldKeys.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A field can appear only once in a UI specification",
      });
    }
    if (fieldKeys.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The UI specification must contain at least one field",
      });
    }

    const missingFields = formFieldKeys.filter((key) => !fieldKeys.includes(key));
    if (missingFields.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `The UI specification is missing fields: ${missingFields.join(", ")}`,
      });
    }
  });

export type UISpecField = z.infer<typeof uiFieldSchema>;
export type UISpecStep = z.infer<typeof uiStepSchema>;
export type UISpec = z.infer<typeof uiSpecSchema>;

export const DEFAULT_ADAPTIVE_UI_SPEC = uiSpecSchema.parse({
  mode: "wizard",
  steps: [
    {
      id: "personal",
      title: "Personal information",
      fields: [
        { key: "fullName", label: "Full name" },
        {
          key: "email",
          label: "Email address",
          helpText: "Use an address where you can receive application updates.",
        },
        {
          key: "phone",
          label: "Phone number",
          helpText: "Include the area or country code if it applies.",
        },
        { key: "dateOfBirth", label: "Date of birth" },
        { key: "residentialAddress", label: "Residential address" },
      ],
    },
    {
      id: "financial",
      title: "Financial information",
      fields: [
        { key: "employmentStatus", label: "Employment status" },
        { key: "employmentType", label: "Employment type" },
        {
          key: "monthlyIncome",
          label: "Monthly income ($)",
          helpText: "Enter your income as a monthly amount before deductions.",
        },
        {
          key: "existingObligations",
          label: "Existing monthly obligations ($)",
          helpText: "Include recurring loan, credit, or support payments.",
        },
      ],
    },
    {
      id: "application",
      title: "Application details",
      fields: [
        { key: "applicationType", label: "Application type" },
        {
          key: "requestedAmount",
          label: "Requested amount ($)",
          helpText: "Enter the total amount you are requesting.",
        },
        {
          key: "applicationPurpose",
          label: "Application purpose",
          helpText: "Briefly describe how you plan to use the funds.",
        },
        {
          key: "additionalInformation",
          label: "Additional information (optional)",
        },
        { key: "agreedToTerms", label: "I agree to the terms and conditions" },
      ],
    },
    {
      id: "review",
      title: "Review your application",
      fields: [],
    },
  ],
});

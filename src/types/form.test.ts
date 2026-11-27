import { zodResolver } from "@hookform/resolvers/zod";
import { describe, expect, it } from "vitest";
import { defaultFormData, financialFormSchema } from "./form";

describe("financialFormSchema resolver", () => {
  it("returns Zod 4 validation issues as React Hook Form field errors", async () => {
    const resolve = zodResolver(financialFormSchema);
    const result = await resolve(defaultFormData, undefined, {
      criteriaMode: "firstError",
      fields: {},
      names: [],
      shouldUseNativeValidation: false,
    });

    expect(result).toMatchObject({
      errors: {
        fullName: { message: "Full name must be at least 2 characters" },
        agreedToTerms: {
          message: "You must accept the terms and conditions",
        },
      },
      values: {},
    });
  });

  it("preserves select-field validation messages and existing financial defaults", () => {
    const result = financialFormSchema.safeParse({
      ...defaultFormData,
      fullName: "Example Applicant",
      email: "applicant@example.test",
      phone: "4155550100",
      dateOfBirth: "1988-01-12",
      residentialAddress: "123 Example Street",
      employmentStatus: "invalid",
      employmentType: "invalid",
      applicationType: "invalid",
      applicationPurpose: "A valid application purpose",
      agreedToTerms: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual([
        "Please select an employment status",
        "Please select an employment type",
        "Please select an application type",
      ]);
    }
    expect(defaultFormData.existingObligations).toBe(800);
  });
});

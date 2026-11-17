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
});

import { z } from "zod";

export const financialFormSchema = z.object({
  // Section A: Personal Information
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().min(10, "Please provide a valid 10-digit phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  residentialAddress: z.string().min(5, "Please provide your residential address"),

  // Section B: Financial Information
  employmentStatus: z.enum(
    ["employed", "self_employed", "unemployed", "retired", "student"],
    { errorMap: () => ({ message: "Please select an employment status" }) }
  ),
  employmentType: z.enum(
    ["full_time", "part_time", "contract", "freelance"],
    { errorMap: () => ({ message: "Please select an employment type" }) }
  ),
  monthlyIncome: z.coerce.number().min(500, "Monthly income must be at least $500"),
  existingObligations: z.coerce.number().min(0, "Existing obligations cannot be negative"),

  // Section C: Application Details
  applicationType: z.enum(
    ["personal_loan", "business_credit", "mortgage", "auto_refinance"],
    { errorMap: () => ({ message: "Please select an application type" }) }
  ),
  requestedAmount: z.coerce.number().min(1000, "Requested amount must be at least $1,000"),
  applicationPurpose: z.string().min(10, "Please provide at least 10 characters explaining your purpose"),
  additionalInformation: z.string().optional().default(""),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type FinancialFormInput = z.input<typeof financialFormSchema>;
export type FinancialFormData = z.output<typeof financialFormSchema>;

export const defaultFormData: FinancialFormData = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  residentialAddress: "",
  employmentStatus: "employed",
  employmentType: "full_time",
  monthlyIncome: 5000,
  existingObligations: 500,
  applicationType: "personal_loan",
  requestedAmount: 15000,
  applicationPurpose: "",
  additionalInformation: "",
  agreedToTerms: false,
};

export type FormSectionKey = "personal" | "financial" | "application" | "review";

export const formFieldKeys = [
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
  "additionalInformation",
  "agreedToTerms",
] as const satisfies readonly (keyof FinancialFormData)[];

export type FormFieldKey = (typeof formFieldKeys)[number];

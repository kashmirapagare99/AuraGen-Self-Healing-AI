"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { defaultFormData, FinancialFormData } from "@/types/form";

interface FormStateContextValue {
  formData: FinancialFormData;
  updateFormData: (updates: Partial<FinancialFormData>) => void;
  resetFormData: () => void;
}

const FormStateContext = createContext<FormStateContextValue | null>(null);

export function FormStateProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FinancialFormData>(() => ({
    ...defaultFormData,
  }));

  const updateFormData = useCallback((updates: Partial<FinancialFormData>) => {
    setFormData((current) => ({ ...current, ...updates }));
  }, []);

  const resetFormData = useCallback(() => {
    setFormData({ ...defaultFormData });
  }, []);

  const value = useMemo(
    () => ({ formData, updateFormData, resetFormData }),
    [formData, updateFormData, resetFormData]
  );

  return (
    <FormStateContext.Provider value={value}>
      {children}
    </FormStateContext.Provider>
  );
}

export function useFormState() {
  const context = useContext(FormStateContext);
  if (!context) {
    throw new Error("useFormState must be used within a FormStateProvider");
  }
  return context;
}

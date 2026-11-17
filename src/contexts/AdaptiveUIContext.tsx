"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_ADAPTIVE_UI_SPEC,
  UISpec,
} from "@/types/ui-spec";
import { AdaptiveUIReason } from "@/services/api";

interface AdaptiveUIContextValue {
  uiSpec: UISpec;
  reason: AdaptiveUIReason;
  beforeScore: number | null;
  adaptedAt: number | null;
  setAdaptation: (
    uiSpec: UISpec,
    reason: AdaptiveUIReason,
    beforeScore: number
  ) => void;
}

const AdaptiveUIContext = createContext<AdaptiveUIContextValue | null>(null);

export function AdaptiveUIProvider({ children }: { children: ReactNode }) {
  const [uiSpec, setUISpec] = useState<UISpec>(DEFAULT_ADAPTIVE_UI_SPEC);
  const [reason, setReason] = useState<AdaptiveUIReason>("general");
  const [beforeScore, setBeforeScore] = useState<number | null>(null);
  const [adaptedAt, setAdaptedAt] = useState<number | null>(null);

  const setAdaptation = useCallback(
    (
      nextUISpec: UISpec,
      nextReason: AdaptiveUIReason,
      nextBeforeScore: number
    ) => {
      setUISpec(nextUISpec);
      setReason(nextReason);
      setBeforeScore(nextBeforeScore);
      setAdaptedAt(Date.now());
    },
    []
  );

  const value = useMemo(
    () => ({ uiSpec, reason, beforeScore, adaptedAt, setAdaptation }),
    [uiSpec, reason, beforeScore, adaptedAt, setAdaptation]
  );

  return (
    <AdaptiveUIContext.Provider value={value}>
      {children}
    </AdaptiveUIContext.Provider>
  );
}

export function useAdaptiveUI() {
  const context = useContext(AdaptiveUIContext);
  if (!context) {
    throw new Error("useAdaptiveUI must be used within an AdaptiveUIProvider");
  }
  return context;
}

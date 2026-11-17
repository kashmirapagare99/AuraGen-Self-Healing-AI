"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

type FontSize = "standard" | "large";
type Theme = "light" | "dark";

interface AccessibilityContextValue {
  fontSize: FontSize;
  highContrast: boolean;
  theme: Theme;
  setFontSize: (fontSize: FontSize) => void;
  setHighContrast: (enabled: boolean) => void;
  setTheme: (theme: Theme) => void;
}

const AccessibilityContext =
  createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>("standard");
  const [highContrast, setHighContrast] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  const value = useMemo(
    () => ({
      fontSize,
      highContrast,
      theme,
      setFontSize,
      setHighContrast,
      setTheme,
    }),
    [fontSize, highContrast, theme]
  );
  const className = [
    "min-h-screen",
    fontSize === "large" && "a11y-large",
    highContrast && "a11y-high-contrast",
    theme === "dark" && "a11y-dark",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AccessibilityContext.Provider value={value}>
      <div className={className}>{children}</div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return context;
}

"use client";

import { useAccessibility } from "@/contexts/AccessibilityContext";

export function AccessibilityControls() {
  const {
    fontSize,
    highContrast,
    theme,
    setFontSize,
    setHighContrast,
    setTheme,
  } = useAccessibility();

  return (
    <fieldset className="grid gap-4 sm:grid-cols-3">
      <legend className="sr-only">Accessibility preferences</legend>
      <div className="space-y-1.5">
        <label
          htmlFor="accessibility-font-size"
          className="text-sm font-medium text-slate-800"
        >
          Font size
        </label>
        <select
          id="accessibility-font-size"
          value={fontSize}
          onChange={(event) =>
            setFontSize(event.target.value === "large" ? "large" : "standard")
          }
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-aura-600"
        >
          <option value="standard">Standard</option>
          <option value="large">Large</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="accessibility-theme"
          className="text-sm font-medium text-slate-800"
        >
          Theme
        </label>
        <select
          id="accessibility-theme"
          value={theme}
          onChange={(event) =>
            setTheme(event.target.value === "dark" ? "dark" : "light")
          }
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-aura-600"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div className="flex items-end">
        <label className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            checked={highContrast}
            onChange={(event) => setHighContrast(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-aura-600 focus:ring-aura-500"
          />
          High contrast
        </label>
      </div>
    </fieldset>
  );
}

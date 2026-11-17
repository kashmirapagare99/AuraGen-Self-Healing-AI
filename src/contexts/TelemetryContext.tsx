"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { FrictionEvent, FrictionEventType } from "@/types/friction";
import { createTelemetryEvent } from "@/utils/telemetry";

interface TelemetryContextValue {
  trackingEnabled: boolean;
  events: FrictionEvent[];
  setTrackingEnabled: (enabled: boolean) => void;
  clearEvents: () => void;
  recordEvent: (type: FrictionEventType, durationMs?: number) => void;
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [trackingEnabled, setTrackingEnabledState] = useState(false);
  const [events, setEvents] = useState<FrictionEvent[]>([]);
  const trackingEnabledRef = useRef(false);

  const setTrackingEnabled = useCallback((enabled: boolean) => {
    trackingEnabledRef.current = enabled;
    setTrackingEnabledState(enabled);
    if (!enabled) {
      setEvents([]);
    }
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const recordEvent = useCallback(
    (type: FrictionEventType, durationMs?: number) => {
      const event = createTelemetryEvent(
        trackingEnabledRef.current,
        type,
        Date.now(),
        durationMs
      );
      if (!event) return;

      setEvents((current) => [...current, event]);
    },
    []
  );

  const value = useMemo(
    () => ({
      trackingEnabled,
      events,
      setTrackingEnabled,
      clearEvents,
      recordEvent,
    }),
    [trackingEnabled, events, setTrackingEnabled, clearEvents, recordEvent]
  );

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetryContext() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error(
      "useTelemetryContext must be used within a TelemetryProvider"
    );
  }
  return context;
}

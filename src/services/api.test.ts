import { afterEach, describe, expect, it, vi } from "vitest";
import type { FrictionEvent } from "@/types/friction";
import {
  createMockAdaptiveUIResponse,
  interactionContextRequestSchema,
  sanitizeInteractionContextRequest,
} from "./api";

describe("adaptive UI mock service", () => {
  it("chooses one-question mode when hesitation is dominant", () => {
    const response = createMockAdaptiveUIResponse({
      score: 70,
      events: [
        { type: "long_pause", timestamp: 100, durationMs: 30_000 },
        { type: "extended_hesitation", timestamp: 200, durationMs: 10_000 },
        { type: "field_time", timestamp: 300, durationMs: 500 },
      ],
    });

    expect(response.reason).toBe("hesitation");
    expect(response.uiSpec.mode).toBe("one_question");
  });

  it("rejects requests containing form values or extra fields", () => {
    expect(
      interactionContextRequestSchema.safeParse({
        score: 50,
        events: [{ type: "validation_error", timestamp: 100 }],
        fullName: "Sensitive value",
      }).success
    ).toBe(false);
  });

  it("limits sanitized event batches to the API contract maximum", () => {
    const request = sanitizeInteractionContextRequest({
      score: 75,
      events: Array.from({ length: 501 }, (_, timestamp) => ({
        type: "field_time" as const,
        timestamp,
      })),
    });

    expect(request.events).toHaveLength(500);
    expect(request.events[0]?.timestamp).toBe(1);
  });
});

describe("optional backend API integration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("strips identifiers, descriptions, and form values from insights requests", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_AURAGEN_ADAPTIVE_API_URL",
      "http://backend.test/api/adaptive-ui"
    );
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          summary: "A short summary.",
          suggestions: [
            {
              title: "Clarify instructions",
              detail: "Provide clear next-step guidance.",
              priority: "medium",
              category: "form",
              action: "application",
            },
            {
              title: "Simplify layout",
              detail: "Keep related controls easy to scan.",
              priority: "low",
              category: "layout",
              action: "application",
            },
            {
              title: "Support accessibility",
              detail: "Keep guidance concise and readable.",
              priority: "low",
              category: "accessibility",
              action: "none",
            },
          ],
          source: "rules",
          provider: "rules",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.resetModules();

    const { requestInsights } = await import("./api");
    const event: FrictionEvent = {
      id: "event-id",
      type: "validation_error",
      fieldId: "social-security-number",
      timestamp: 100,
      weight: 99,
      description: "User entered a personal identifier",
      durationMs: 250,
    };
    const request = {
      score: 35,
      events: [event],
      fullName: "Sensitive Applicant",
      monthlyIncome: 9500,
      requestedAmount: 42000,
    };

    await expect(requestInsights(request)).resolves.toMatchObject({
      source: "rules",
      provider: "rules",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://backend.test/api/insights",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          score: 35,
          events: [
            {
              type: "validation_error",
              timestamp: 100,
              durationMs: 250,
            },
          ],
        }),
      })
    );
  });

  it("fetches and validates optional aggregate metrics", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_AURAGEN_ADAPTIVE_API_URL",
      "http://backend.test/api/adaptive-ui"
    );
    const metricsSummary = {
      adaptations: {
        total: 2,
        averageScore: 62,
        byReason: { validation_errors: 1, hesitation: 1 },
        bySource: { rules: 2 },
      },
      outcomes: {
        total: 1,
        averageBeforeScore: 62,
        averageAfterScore: 25,
        improved: 1,
      },
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(metricsSummary), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.resetModules();

    const { requestMetricsSummary } = await import("./api");

    await expect(requestMetricsSummary()).resolves.toEqual(metricsSummary);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://backend.test/api/metrics/summary",
      expect.objectContaining({ signal: undefined })
    );
  });

  it("sends only aggregate fields when reporting an outcome", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_AURAGEN_ADAPTIVE_API_URL",
      "http://backend.test/api/adaptive-ui"
    );
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.resetModules();

    const { reportOutcome } = await import("./api");
    const outcome = {
      reason: "validation_errors" as const,
      mode: "wizard" as const,
      beforeScore: 65,
      afterScore: 25,
      email: "private@example.test",
      requestedAmount: 50000,
    };

    await expect(reportOutcome(outcome)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://backend.test/api/metrics/outcome",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          reason: "validation_errors",
          mode: "wizard",
          beforeScore: 65,
          afterScore: 25,
        }),
      })
    );
  });

  it("reports HTTP errors instead of treating failed API responses as valid data", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_AURAGEN_ADAPTIVE_API_URL",
      "http://backend.test/api/adaptive-ui"
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 }))
    );
    vi.resetModules();

    const { requestMetricsSummary } = await import("./api");

    await expect(requestMetricsSummary()).rejects.toThrow(
      "Metrics summary request failed with status 503"
    );
  });
});

import { describe, expect, it } from "vitest";
import { createAdaptiveWebSocketStub } from "./websocket";

describe("adaptive WebSocket stub", () => {
  it("delivers validated messages to subscribers and supports unsubscribe", () => {
    const stub = createAdaptiveWebSocketStub();
    const received: string[] = [];
    const unsubscribe = stub.subscribe((message) => {
      received.push(message.type);
    });

    stub.receive({
      type: "status",
      payload: { status: "connected" },
    });
    unsubscribe();
    stub.receive({
      type: "status",
      payload: { status: "closed" },
    });

    expect(received).toEqual(["status"]);
  });

  it("rejects unknown message shapes", () => {
    const stub = createAdaptiveWebSocketStub();
    expect(() => stub.receive({ type: "unknown" })).toThrow(TypeError);
  });
});

# AuraGen Adaptive UI API Contract

## Current mode

AuraGen is frontend-only. The adaptive UI service defaults to its deterministic mock. Set `NEXT_PUBLIC_AURAGEN_ADAPTIVE_API_URL` to select the fetch-based backend integration. Do not put credentials or secrets in this public client-side variable.

## Request

`POST <NEXT_PUBLIC_AURAGEN_ADAPTIVE_API_URL>`

```json
{
  "score": 65,
  "events": [
    { "type": "validation_error", "timestamp": 1731770700000 },
    { "type": "field_time", "timestamp": 1731770701000, "durationMs": 12000 }
  ]
}
```

The request is validated with Zod before it is sent. Its strict schema accepts only a score from 0 to 100 and an array of event types and timings. It does not accept form values, field names, or other application data.

## Response

Return JSON matching this shape:

```json
{
  "reason": "validation_errors",
  "uiSpec": {
    "mode": "wizard",
    "steps": [
      {
        "id": "personal",
        "title": "Personal information",
        "fields": [
          { "key": "fullName", "label": "Full name" }
        ]
      },
      {
        "id": "review",
        "title": "Review your application",
        "fields": []
      }
    ]
  }
}
```

The example omits fields for readability; the full response must include each supported form field exactly once, a unique ID for every step, a review step, and one of the supported modes (`wizard` or `one_question`). Field keys, labels, optional help text, step count, mode, and response reason are checked by Zod. The renderer maps accepted keys to predefined local controls; it never evaluates response text as code.

Supported `reason` values: `repeated_clicks`, `validation_errors`, `hesitation`, and `general`.

## Mock behavior

Without the endpoint environment variable, the mock counts privacy-safe event causes and returns the predefined wizard spec. Hesitation-dominant sessions select one-question mode. No LLM is called.

## WebSocket placeholder

`src/services/websocket.ts` defines and validates typed `adaptive_ui` and `status` messages and provides a local stub for subscribers. It opens no connection and does not require a server.

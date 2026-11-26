# Backend API

Base URL when running locally: `http://localhost:4000`. All bodies are JSON.

Responses to `/api/*` routes carry `Cache-Control: no-store`. Every response also
has `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` and
`Referrer-Policy: no-referrer`.

## Errors

| Status | Body | When |
|---|---|---|
| 400 | `{"error": "invalid_request", "issues": [...]}` | The body is not JSON or fails validation |
| 404 | `{"error": "not_found"}` | Unknown route |
| 405 | `{"error": "method_not_allowed"}` | Wrong HTTP method |
| 413 | `{"error": "payload_too_large"}` | Body over 100 KB |
| 429 | `{"error": "rate_limited"}` | Too many requests, see the `Retry-After` header |
| 500 | `{"error": "internal_error"}` | Unexpected failure |

Each entry in `issues` has a `path` and a `message`:

```json
{"error": "invalid_request", "issues": [{"path": "score", "message": "Input should be less than or equal to 100"}]}
```

## GET /health

```json
{"llm": true, "provider": "groq", "status": "ok"}
```

`provider` is `groq`, `claude` or `rules`. `llm` is false when only the built-in layouts are used.

## GET /api/config

Non-secret runtime settings, handy for checking which model is active.

```json
{"maxEventsPerRequest": 500, "model": "openai/gpt-oss-20b", "provider": "groq", "rateLimitPerMin": 60}
```

`model` is `null` when no provider is configured.

## POST /api/adaptive-ui

Chooses a simplified layout for the form.

Request:

```json
{
  "score": 70,
  "events": [
    {"type": "validation_error", "timestamp": 1731770700000},
    {"type": "field_time", "timestamp": 1731770701000, "durationMs": 12000}
  ]
}
```

- `score` is a whole number from 0 to 100.
- `events` holds at most 500 items. `type` is one of `repeated_click`, `validation_error`,
  `extended_hesitation`, `field_time`, `long_pause`, `repeated_attempt`, `repeated_interaction`,
  `mode_toggle`, `step_abandonment`. `durationMs` is optional.
- Any other key is rejected, so form values cannot be sent.

Response: a `uiSpec` (layout) and the `reason` it was chosen.

```json
{
  "reason": "validation_errors",
  "uiSpec": {
    "mode": "wizard",
    "steps": [
      {"id": "personal", "title": "Personal information",
       "fields": [{"key": "fullName", "label": "Full name"}]},
      {"id": "review", "title": "Review your application", "fields": []}
    ]
  }
}
```

`reason` is `validation_errors`, `repeated_clicks`, `hesitation` or `general`. `mode` is
`one_question` when the reason is `hesitation` and `wizard` otherwise. Every form field appears
exactly once, and the last step is always `review`.

The `X-Aura-Source` response header says where the layout came from: `llm` (generated) or
`rules` (built in).

## POST /api/insights

Dashboard suggestions. The request body is the same as `/api/adaptive-ui`.

```json
{
  "summary": "The friction score is 85 (high) with 6 recorded events.",
  "suggestions": [
    {"title": "Show format hints before people submit",
     "detail": "4 validation errors were recorded. Put the expected format next to the fields.",
     "priority": "high", "category": "form", "action": "application"}
  ],
  "source": "llm",
  "provider": "groq"
}
```

There are 3 to 5 suggestions. `priority` is `high`, `medium` or `low`. `category` is `form`,
`layout`, `accessibility` or `process`. `action` is the page that helps most: `application`,
`simplified`, `analytics`, `demo` or `none`. `source` is `llm` or `rules`.

## POST /api/metrics/outcome

Stores one before/after result. Returns `204` with no body.

```json
{"reason": "validation_errors", "mode": "wizard", "beforeScore": 60, "afterScore": 20}
```

## GET /api/metrics/summary

```json
{
  "adaptations": {"total": 3, "averageScore": 70.0, "byReason": {"hesitation": 1}, "bySource": {"rules": 3}},
  "outcomes": {"total": 1, "averageBeforeScore": 60.0, "averageAfterScore": 20.0, "improved": 1}
}
```

Averages are `null` when there is no data yet. `improved` counts outcomes whose score went down.

## WebSocket /ws

Send an `interaction_context` message:

```json
{"type": "interaction_context", "payload": {"score": 70, "events": []}}
```

Messages from the server:

```json
{"type": "status", "payload": {"status": "connected"}}
{"type": "adaptive_ui", "payload": {"uiSpec": {}, "reason": "general"}}
{"type": "error", "payload": {"message": "Invalid interaction_context message"}}
```

Connections from origins that are not in `CORS_ORIGINS` are closed.

## Trying it from the command line

```
curl http://localhost:4000/health
curl -X POST http://localhost:4000/api/adaptive-ui -H "Content-Type: application/json" -d @body.json
```

On Windows PowerShell, put the JSON in a file (`body.json`) and use `--data-binary @body.json`,
because PowerShell removes the quotes from inline JSON.

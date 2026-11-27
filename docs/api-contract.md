# Optional AuraGen Flask API Contract

## Integration mode

The frontend works without a backend: adaptive UI requests use a deterministic
local mock, and backend insights and metrics are omitted. An external Flask
service can be enabled by setting
`NEXT_PUBLIC_AURAGEN_ADAPTIVE_API_URL` before starting Next.js. The value must
be the service's adaptive UI endpoint, for example:

```text
http://127.0.0.1:4000/api/adaptive-ui
```

The frontend uses that URL for adaptive UI requests and derives the service
base URL for `/api/insights`, `/api/metrics/summary`, and
`/api/metrics/outcome`. No Flask backend is included in this repository. Do not
put credentials or secrets in this public client-side variable.

## Adaptive UI

`POST <NEXT_PUBLIC_AURAGEN_ADAPTIVE_API_URL>`

The request is validated before sending and accepts a score from 0 to 100 and
up to 500 event records. Each event contains only:

- `type`: one of `repeated_click`, `validation_error`,
  `extended_hesitation`, `field_time`, `long_pause`, `repeated_attempt`,
  `repeated_interaction`, `mode_toggle`, or `step_abandonment`
- `timestamp`: a non-negative finite number
- `durationMs`: an optional non-negative finite number

The frontend constructs each outgoing event from this explicit allowlist.
Identifiers, field names, descriptions, weights, personal information, and
financial form values are not accepted or transmitted.

Example:

```json
{
  "score": 65,
  "events": [
    { "type": "validation_error", "timestamp": 1731770700000 },
    { "type": "field_time", "timestamp": 1731770701000, "durationMs": 12000 }
  ]
}
```

The response must include `reason` (`repeated_clicks`, `validation_errors`,
`hesitation`, or `general`) and a Zod-valid `uiSpec`. The UI spec contains
supported form fields exactly once, unique step IDs, a review step, and a
supported mode (`wizard` or `one_question`). The renderer uses predefined
controls and never evaluates response text as code.

## Insights

`POST <service-base-url>/api/insights`

The request uses the same allowlisted score and event shape described above.
The response schema is:

```json
{
  "summary": "Users may benefit from clearer field guidance.",
  "suggestions": [
    {
      "title": "Clarify the next step",
      "detail": "Add a short explanation before the next section.",
      "priority": "medium",
      "category": "form",
      "action": "application"
    },
    {
      "title": "Keep instructions concise",
      "detail": "Use brief guidance for the current task.",
      "priority": "low",
      "category": "accessibility",
      "action": "none"
    },
    {
      "title": "Review the layout",
      "detail": "Check that the next control is easy to find.",
      "priority": "low",
      "category": "layout",
      "action": "application"
    }
  ],
  "source": "rules",
  "provider": "rules"
}
```

`suggestions` must contain 3–5 entries. `title` is limited to 80 characters and
`detail` to 300. `priority` is `high`, `medium`, or `low`; `category` is `form`,
`layout`, `accessibility`, or `process`; `action` is `application`,
`simplified`, `analytics`, `demo`, or `none`. `source` is `llm` or `rules`;
`provider` is a string. The service may use deterministic rules; an external
LLM is not required.

## Aggregate metrics

`GET <service-base-url>/api/metrics/summary`

The response contains:

- `adaptations`: non-negative integer `total`, nullable numeric
  `averageScore`, and non-negative integer maps `byReason` and `bySource`
- `outcomes`: non-negative integer `total`, nullable numeric
  `averageBeforeScore` and `averageAfterScore`, and non-negative integer
  `improved`

This endpoint returns aggregates and does not include the current form draft or
session event payload.

## Outcome reporting

`POST <service-base-url>/api/metrics/outcome`

When consent is active and an adapted form is completed, the frontend may send
only:

```json
{
  "reason": "validation_errors",
  "mode": "wizard",
  "beforeScore": 65,
  "afterScore": 25
}
```

`reason` uses the supported adaptive UI reason values; `mode` is `wizard` or
`one_question`; scores are integers from 0 to 100. No application fields or
form values are included.

## Errors and privacy

Unconfigured optional endpoints return the frontend's documented
offline/unavailable state. HTTP failures, network errors, and invalid
responses are reported by the caller rather than treated as valid data.
Telemetry requests are made only while consent is active. Turning tracking off
clears the in-memory event list, cancels pending requests where possible, and
prevents subsequent telemetry sends. A request already transmitted before
withdrawal cannot be recalled by the browser.

## WebSocket placeholder

`src/services/websocket.ts` defines and validates typed `adaptive_ui` and
`status` messages and provides a local stub for subscribers. It opens no
connection and does not require a server.

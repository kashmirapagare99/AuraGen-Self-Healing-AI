# AuraGen backend

Flask API for the AuraGen frontend. It implements the contract in
`../frontend/docs/api-contract.md`.

## Setup

```
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python run.py
```

The server listens on http://localhost:4000. To connect the frontend, put this in
`frontend/.env.local` and restart `npm run dev`:

```
NEXT_PUBLIC_AURAGEN_ADAPTIVE_API_URL=http://localhost:4000/api/adaptive-ui
```

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Status, and which layout provider is active (`groq`, `claude` or `rules`) |
| GET | `/api/config` | Non-secret runtime settings: provider, model, rate limit |
| POST | `/api/adaptive-ui` | Takes `{score, events}`, returns `{uiSpec, reason}`. The `X-Aura-Source` header is `llm` or `rules` |
| POST | `/api/insights` | Takes `{score, events}`, returns `{summary, suggestions, source, provider}`: 3 to 5 dashboard suggestions written by the AI from the session counts and the anonymous totals. Falls back to rule-based suggestions |
| POST | `/api/metrics/outcome` | Stores a before/after score pair (`reason`, `mode`, `beforeScore`, `afterScore`) |
| GET | `/api/metrics/summary` | Aggregate counts and averages |
| WS | `/ws` | Send `{"type": "interaction_context", "payload": {...}}`, get `status`, `adaptive_ui` or `error` messages back |

Request and response examples are in [docs/API.md](docs/API.md).

The frontend uses `/api/adaptive-ui`, `/api/insights`, `/api/metrics/outcome` and `/api/metrics/summary`. It does not use the WebSocket yet.

## How a layout is chosen

1. The request is validated. Only a 0-100 score and event types/timings are accepted, and any extra key is rejected, so form values can't be submitted.
2. The main cause is worked out from the events (validation errors, repeated clicks, hesitation, or general).
3. If a provider is configured, the model proposes the grouping, labels and help text. It only sees the score and the cause counts. Its reply must pass the same validation as everything else, and the layout mode is then forced to match the cause (one question at a time for hesitation, wizard otherwise). Groq gets one retry if its first reply is unusable.
4. If there is no key, the call fails, or the reply is still unusable, the built-in layout in `app/layouts.py` is returned.

## AI providers

Set the keys in `.env` (it is ignored by git). `LLM_PROVIDER=auto` uses Groq when `GROQ_API_KEY` is set, otherwise Claude when `ANTHROPIC_API_KEY` is set. Use `LLM_PROVIDER=rules` to switch the AI off.

| Provider | Settings | Notes |
|---|---|---|
| Groq | `GROQ_API_KEY`, `GROQ_MODEL` (default `openai/gpt-oss-20b`) | Plain HTTP, no extra package. Groq retires models from time to time; if requests start falling back to `rules`, check the backend log and the model list at `https://api.groq.com/openai/v1/models`. |
| Claude | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Needs the `anthropic` package to load. |

## Privacy

SQLite stores the reason, mode, source, score, event count and a timestamp. It does not store events, form values, IP addresses or user agents.

## Layout of the code

```
app/
  __init__.py       app factory
  config.py         settings from environment
  schemas.py        request/response validation
  layouts.py        default layout and cause detection
  prompt.py         shared prompt and reply parsing
  groq_provider.py    Groq provider
  claude_provider.py  Claude provider
  providers.py      picks the provider from settings
  adaptive.py       picks generated or built-in layout
  insights.py       dashboard suggestions (AI with rule-based fallback)
  routes.py         HTTP endpoints
  sockets.py        websocket endpoint
  db.py             sqlite metrics
  ratelimit.py      per-address limiter
run.py              entry point
tests/              pytest suite
```

## Tests

Install the development requirements once, then run pytest:

```
pip install -r requirements-dev.txt
pytest
```

## Notes

- `python run.py` uses Flask's development server. For production use a WSGI server with thread support (for example `gunicorn -k gthread run:application`) behind your own authentication, because the API has none.
- `schemas.py` repeats the frontend's validation rules. If the form fields change, change them in both places.

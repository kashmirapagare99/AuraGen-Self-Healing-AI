import pytest

from app.layouts import DEFAULT_LAYOUT
from app.schemas import FIELD_KEYS, AdaptiveResponse
from conftest import StubProvider, event


def post(client, body):
    return client.post("/api/adaptive-ui", json=body)


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.get_json() == {"status": "ok", "llm": False, "provider": "rules"}


def test_health_names_the_provider(make_app):
    class Named(StubProvider):
        name = "groq"

    res = make_app(provider=Named()).test_client().get("/health")
    assert res.get_json() == {"status": "ok", "llm": True, "provider": "groq"}


def test_validation_errors_give_a_wizard(client):
    res = post(client, {"score": 70, "events": [
        event("validation_error"), event("validation_error"), event("repeated_click", 500)]})
    assert res.status_code == 200
    assert res.headers["X-Aura-Source"] == "rules"

    body = AdaptiveResponse.model_validate(res.get_json())
    assert body.reason == "validation_errors"
    assert body.uiSpec.mode == "wizard"
    used = sorted(f.key for step in body.uiSpec.steps for f in step.fields)
    assert used == sorted(FIELD_KEYS)


def test_hesitation_gives_one_question_mode(client):
    res = post(client, {"score": 40, "events": [event("extended_hesitation", 12000), event("long_pause", 30000)]})
    assert res.get_json()["reason"] == "hesitation"
    assert res.get_json()["uiSpec"]["mode"] == "one_question"


def test_no_causes_is_general(client):
    res = post(client, {"score": 0, "events": []})
    assert res.get_json()["reason"] == "general"


def test_ties_prefer_validation_errors(client):
    res = post(client, {"score": 50, "events": [event("repeated_click", 400), event("validation_error")]})
    assert res.get_json()["reason"] == "validation_errors"


def test_optional_help_text_is_omitted_not_null(client):
    spec = post(client, {"score": 1, "events": []}).get_json()["uiSpec"]
    first = spec["steps"][0]["fields"][0]
    assert "helpText" not in first


@pytest.mark.parametrize("body", [
    {"score": 1, "events": [], "formValues": {"fullName": "x"}},
    {"score": 101, "events": []},
    {"score": -1, "events": []},
    {"score": 5.5, "events": []},
    {"score": True, "events": []},
    {"score": 1},
    {"score": 1, "events": [{"type": "keystroke", "timestamp": 1}]},
    {"score": 1, "events": [{"type": "validation_error", "timestamp": 1, "field": "email"}]},
    {"score": 1, "events": [{"type": "field_time", "timestamp": 1, "durationMs": -5}]},
    {"score": 1, "events": [{"type": "field_time", "timestamp": 1}] * 501},
])
def test_bad_requests_are_rejected(client, body):
    res = post(client, body)
    assert res.status_code == 400
    assert res.get_json()["error"] == "invalid_request"


def test_non_json_body(client):
    res = client.post("/api/adaptive-ui", data="nope", content_type="text/plain")
    assert res.status_code == 400


def test_large_body(client):
    res = post(client, {"score": 1, "events": [], "pad": "x" * 200000})
    assert res.status_code == 413


def test_unknown_route(client):
    assert client.get("/nope").status_code == 404


def test_generated_layout_is_used(make_app):
    spec = DEFAULT_LAYOUT.model_copy(deep=True)
    spec.steps[0].title = "Generated title"
    client = make_app(provider=StubProvider(result=spec)).test_client()

    res = post(client, {"score": 80, "events": [event("validation_error")]})
    assert res.headers["X-Aura-Source"] == "llm"
    assert res.get_json()["uiSpec"]["steps"][0]["title"] == "Generated title"


def test_generated_layout_mode_follows_the_cause(make_app):
    # the model picked one_question, but the cause is validation errors
    spec = DEFAULT_LAYOUT.model_copy(update={"mode": "one_question"})
    client = make_app(provider=StubProvider(result=spec)).test_client()
    res = post(client, {"score": 80, "events": [event("validation_error")]})
    assert res.get_json()["uiSpec"]["mode"] == "wizard"

    # and the other way round for hesitation
    spec = DEFAULT_LAYOUT.model_copy(update={"mode": "wizard"})
    client = make_app(provider=StubProvider(result=spec)).test_client()
    res = post(client, {"score": 80, "events": [event("long_pause", 31000)]})
    assert res.get_json()["uiSpec"]["mode"] == "one_question"


@pytest.mark.parametrize("provider", [
    StubProvider(error=RuntimeError("boom")),
    StubProvider(result=None),
])
def test_falls_back_when_generation_fails(make_app, provider):
    client = make_app(provider=provider).test_client()
    res = post(client, {"score": 80, "events": []})
    assert res.status_code == 200
    assert res.headers["X-Aura-Source"] == "rules"


def test_rate_limit(make_app):
    client = make_app(rate_limit_per_min=2).test_client()
    for _ in range(2):
        assert post(client, {"score": 1, "events": []}).status_code == 200
    res = post(client, {"score": 1, "events": []})
    assert res.status_code == 429
    assert "Retry-After" in res.headers


def test_cors_only_for_configured_origin(client):
    ok = client.options("/api/adaptive-ui", headers={
        "Origin": "http://localhost:3000", "Access-Control-Request-Method": "POST"})
    assert ok.headers["Access-Control-Allow-Origin"] == "http://localhost:3000"

    bad = client.options("/api/adaptive-ui", headers={
        "Origin": "http://evil.test", "Access-Control-Request-Method": "POST"})
    assert "Access-Control-Allow-Origin" not in bad.headers


def test_loopback_address_is_allowed_too(client):
    res = client.options("/api/adaptive-ui", headers={
        "Origin": "http://127.0.0.1:3000", "Access-Control-Request-Method": "POST"})
    assert res.headers["Access-Control-Allow-Origin"] == "http://127.0.0.1:3000"


def test_metrics_summary(client):
    post(client, {"score": 60, "events": [event("validation_error")]})
    post(client, {"score": 80, "events": [event("extended_hesitation")]})
    res = client.post("/api/metrics/outcome", json={
        "reason": "validation_errors", "mode": "wizard", "beforeScore": 60, "afterScore": 20})
    assert res.status_code == 204

    summary = client.get("/api/metrics/summary").get_json()
    assert summary["adaptations"]["total"] == 2
    assert summary["adaptations"]["averageScore"] == 70
    assert summary["adaptations"]["byReason"] == {"hesitation": 1, "validation_errors": 1}
    assert summary["adaptations"]["bySource"] == {"rules": 2}
    assert summary["outcomes"] == {
        "total": 1, "averageBeforeScore": 60, "averageAfterScore": 20, "improved": 1}


def test_empty_summary(client):
    summary = client.get("/api/metrics/summary").get_json()
    assert summary["adaptations"]["total"] == 0
    assert summary["outcomes"]["averageBeforeScore"] is None


def test_bad_outcome(client):
    res = client.post("/api/metrics/outcome", json={
        "reason": "x", "mode": "wizard", "beforeScore": 1, "afterScore": 1})
    assert res.status_code == 400


def test_requests_are_logged_without_their_content(client, caplog):
    with caplog.at_level("INFO", logger="app.access"):
        client.get("/health?secret=1")
        post(client, {"score": 12, "events": []})

    text = caplog.text
    assert "GET /health 200" in text
    assert "POST /api/adaptive-ui 200" in text
    assert "secret" not in text
    assert "score" not in text


def test_security_headers(client):
    res = post(client, {"score": 1, "events": []})
    assert res.headers["X-Content-Type-Options"] == "nosniff"
    assert res.headers["X-Frame-Options"] == "DENY"
    assert res.headers["Referrer-Policy"] == "no-referrer"
    assert res.headers["Cache-Control"] == "no-store"


def test_only_api_routes_are_marked_no_store(client):
    assert "Cache-Control" not in client.get("/health").headers
    # errors get the headers as well
    assert client.get("/nope").headers["X-Content-Type-Options"] == "nosniff"

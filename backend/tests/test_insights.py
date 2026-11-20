import json

import pytest

from app.schemas import Insights
from conftest import event

GOOD = {
    "summary": "Validation errors dominate this session.",
    "suggestions": [
        {"title": "Add format hints", "detail": "Show the expected phone format.",
         "priority": "high", "category": "form", "action": "application"},
        {"title": "Offer the wizard earlier", "detail": "Show it after two errors.",
         "priority": "medium", "category": "layout", "action": "simplified"},
        {"title": "Check contrast", "detail": "Try the high contrast setting.",
         "priority": "low", "category": "accessibility", "action": "analytics"},
    ],
}


class TextProvider:
    """Stands in for a model that answers with the given replies, one per call."""
    name = "stub"

    def __init__(self, *replies, error=None):
        self.replies = list(replies)
        self.error = error
        self.calls = []

    def complete(self, system, user):
        self.calls.append((system, user))
        if self.error:
            raise self.error
        return self.replies.pop(0) if self.replies else ""

    def build(self, score, reason, counts):
        return None


def ask(client, score=70, events=None):
    body = {"score": score, "events": events if events is not None else [
        event("validation_error"), event("validation_error"), event("repeated_attempt")]}
    return client.post("/api/insights", json=body)


def test_rule_based_suggestions_without_a_provider(client):
    res = ask(client)
    assert res.status_code == 200
    body = res.get_json()
    assert body["source"] == "rules" and body["provider"] == "rules"
    Insights.model_validate({k: body[k] for k in ("summary", "suggestions")})

    first = body["suggestions"][0]
    assert first["priority"] == "high" and first["action"] == "simplified"
    assert any(s["category"] == "form" for s in body["suggestions"])


def test_empty_session_points_to_the_demo(client):
    body = ask(client, score=0, events=[]).get_json()
    assert "No interaction data" in body["summary"]
    assert any(s["action"] == "demo" for s in body["suggestions"])
    assert 3 <= len(body["suggestions"]) <= 5


def test_generated_suggestions_are_returned(make_app):
    provider = TextProvider(json.dumps(GOOD))
    body = ask(make_app(provider=provider).test_client()).get_json()

    assert body["source"] == "llm" and body["provider"] == "stub"
    assert body["suggestions"][0]["title"] == "Add format hints"
    # the prompt carries numbers only
    system, user = provider.calls[0]
    assert '"validationErrors": 3' in user and '"frictionScore": 70' in user


def test_reply_with_extra_text_is_accepted(make_app):
    provider = TextProvider("Sure!\n" + json.dumps(GOOD) + "\nHope that helps.")
    assert ask(make_app(provider=provider).test_client()).get_json()["source"] == "llm"


def test_action_written_in_the_category_field_is_repaired(make_app):
    slipped = json.loads(json.dumps(GOOD))
    slipped["suggestions"][0]["category"] = "analytics"
    slipped["suggestions"][1]["action"] = "somewhere"
    slipped["suggestions"][2]["priority"] = "urgent"
    body = ask(make_app(provider=TextProvider(json.dumps(slipped))).test_client()).get_json()

    assert body["source"] == "llm"
    first, second, third = body["suggestions"]
    # an action in the category field is replaced by the matching category
    assert (first["category"], first["action"]) == ("form", "application")
    # an unknown action becomes "none" and the valid category is kept
    assert (second["category"], second["action"]) == ("layout", "none")
    # an unknown priority becomes medium
    assert third["priority"] == "medium"

    # a category that holds an action name is moved over to the action field
    swapped = json.loads(json.dumps(GOOD))
    swapped["suggestions"][0].update(category="analytics", action="unknown")
    body = ask(make_app(provider=TextProvider(json.dumps(swapped))).test_client()).get_json()
    assert (body["suggestions"][0]["category"], body["suggestions"][0]["action"]) == ("process", "analytics")


def test_one_retry_after_a_bad_reply(make_app):
    provider = TextProvider("garbage", json.dumps(GOOD))
    body = ask(make_app(provider=provider).test_client()).get_json()
    assert body["source"] == "llm"
    assert len(provider.calls) == 2


@pytest.mark.parametrize("reply", [
    "garbage",
    json.dumps({"summary": "x", "suggestions": GOOD["suggestions"][:2]}),
    json.dumps({**GOOD, "suggestions": [{**GOOD["suggestions"][0], "title": "x" * 200}] * 3}),
    json.dumps({**GOOD, "extra": 1}),
])
def test_unusable_replies_fall_back(make_app, reply):
    provider = TextProvider(reply, reply)
    assert ask(make_app(provider=provider).test_client()).get_json()["source"] == "rules"


def test_provider_errors_fall_back(make_app):
    provider = TextProvider(error=RuntimeError("down"))
    res = ask(make_app(provider=provider).test_client())
    assert res.status_code == 200 and res.get_json()["source"] == "rules"


def test_earlier_outcomes_are_used(client):
    for _ in range(3):
        client.post("/api/metrics/outcome", json={
            "reason": "validation_errors", "mode": "wizard", "beforeScore": 40, "afterScore": 60})
    body = ask(client, score=10, events=[]).get_json()
    assert any("did not lower" in s["title"] for s in body["suggestions"])


@pytest.mark.parametrize("body", [
    {"score": 500, "events": []},
    {"score": 1, "events": [], "notes": "hi"},
    {"events": []},
])
def test_bad_requests(client, body):
    assert client.post("/api/insights", json=body).status_code == 400


def test_not_json(client):
    assert client.post("/api/insights", data="x", content_type="text/plain").status_code == 400

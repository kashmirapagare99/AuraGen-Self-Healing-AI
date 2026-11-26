import io
import json
import urllib.error

import pytest

from app.config import Settings, load_settings
from app.groq_provider import GroqProvider
from app.layouts import DEFAULT_LAYOUT
from app.providers import create_provider


class FakeResponse(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


def reply_with(content):
    body = {"choices": [{"message": {"content": content}}]}
    return FakeResponse(json.dumps(body).encode())


def patch_http(monkeypatch, result=None, error=None):
    seen = {}

    def fake_urlopen(request, timeout=None):
        seen["request"] = request
        seen["timeout"] = timeout
        if error:
            raise error
        # a retry reads the reply again, so every call gets its own copy
        return FakeResponse(result.getvalue())

    monkeypatch.setattr("urllib.request.urlopen", fake_urlopen)
    return seen


def test_groq_returns_a_valid_layout(monkeypatch):
    seen = patch_http(monkeypatch, reply_with(DEFAULT_LAYOUT.model_dump_json(exclude_none=True)))
    layout = GroqProvider("key", "some-model", 5).build(70, "validation_errors", {})

    assert layout == DEFAULT_LAYOUT
    request = seen["request"]
    assert request.get_header("Authorization") == "Bearer key"
    sent = json.loads(request.data)
    assert sent["model"] == "some-model"
    assert sent["response_format"] == {"type": "json_object"}
    # the prompt carries the score and cause only
    assert "70/100" in sent["messages"][1]["content"]
    assert seen["timeout"] == 5


def test_groq_ignores_text_around_the_json(monkeypatch):
    wrapped = "Here you go:\n" + DEFAULT_LAYOUT.model_dump_json(exclude_none=True) + "\nDone."
    patch_http(monkeypatch, reply_with(wrapped))
    assert GroqProvider("k", "m", 5).build(10, "general", {}) == DEFAULT_LAYOUT


@pytest.mark.parametrize("content", ["not json at all", '{"mode": "wizard", "steps": []}', ""])
def test_groq_rejects_unusable_layouts(monkeypatch, content):
    patch_http(monkeypatch, reply_with(content))
    assert GroqProvider("k", "m", 5).build(10, "general", {}) is None


def test_groq_retries_once_after_a_bad_reply(monkeypatch):
    replies = [reply_with("garbage"), reply_with(DEFAULT_LAYOUT.model_dump_json(exclude_none=True))]
    calls = []

    def fake_urlopen(request, timeout=None):
        calls.append(1)
        return replies[len(calls) - 1]

    monkeypatch.setattr("urllib.request.urlopen", fake_urlopen)
    assert GroqProvider("k", "m", 5).build(10, "general", {}) == DEFAULT_LAYOUT
    assert len(calls) == 2


def test_groq_gives_up_after_two_bad_replies(monkeypatch):
    calls = []

    def fake_urlopen(request, timeout=None):
        calls.append(1)
        return reply_with("garbage")

    monkeypatch.setattr("urllib.request.urlopen", fake_urlopen)
    assert GroqProvider("k", "m", 5).build(10, "general", {}) is None
    assert len(calls) == 2


def test_groq_rejects_a_layout_missing_fields(monkeypatch):
    spec = DEFAULT_LAYOUT.model_dump(exclude_none=True)
    spec["steps"][0]["fields"].pop()
    patch_http(monkeypatch, reply_with(json.dumps(spec)))
    assert GroqProvider("k", "m", 5).build(10, "general", {}) is None


def test_groq_http_errors_are_raised(monkeypatch):
    error = urllib.error.HTTPError("u", 429, "Too Many", {}, io.BytesIO(b'{"error":"slow down"}'))
    patch_http(monkeypatch, error=error)
    with pytest.raises(RuntimeError, match="429"):
        GroqProvider("k", "m", 5).build(10, "general", {})


def test_provider_choice():
    assert create_provider(Settings()) is None
    assert create_provider(Settings(groq_api_key="g")).name == "groq"
    assert create_provider(Settings(groq_api_key="g", llm_provider="rules")) is None
    # a Groq key is not used when Claude was asked for explicitly
    assert create_provider(Settings(groq_api_key="g", llm_provider="claude")) is None


def test_settings_read_the_new_variables():
    settings = load_settings({"GROQ_API_KEY": " abc ", "LLM_PROVIDER": "Groq", "GROQ_MODEL": "m"})
    assert (settings.groq_api_key, settings.llm_provider, settings.groq_model) == ("abc", "groq", "m")

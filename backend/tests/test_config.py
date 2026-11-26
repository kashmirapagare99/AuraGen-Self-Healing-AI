import pytest

from app.config import ConfigError, load_settings


def test_defaults():
    settings = load_settings({})
    assert settings.port == 4000
    assert settings.log_level == "INFO"
    assert settings.llm_provider == "auto"
    assert settings.cors_origins == ("http://localhost:3000", "http://127.0.0.1:3000")


def test_log_level_is_read_and_uppercased():
    assert load_settings({"LOG_LEVEL": " debug "}).log_level == "DEBUG"


def test_origins_are_split_and_trimmed():
    settings = load_settings({"CORS_ORIGINS": "http://a.test, http://b.test ,"})
    assert settings.cors_origins == ("http://a.test", "http://b.test")


@pytest.mark.parametrize("env, message", [
    ({"PORT": "0"}, "PORT"),
    ({"PORT": "70000"}, "PORT"),
    ({"PORT": "abc"}, "not a number"),
    ({"RATE_LIMIT_PER_MIN": "0"}, "RATE_LIMIT_PER_MIN"),
    ({"LLM_TIMEOUT_SECONDS": "-1"}, "LLM_TIMEOUT_SECONDS"),
    ({"LLM_PROVIDER": "openai"}, "LLM_PROVIDER"),
    ({"LOG_LEVEL": "loud"}, "LOG_LEVEL"),
])
def test_bad_settings_are_rejected_with_a_clear_message(env, message):
    with pytest.raises(ConfigError, match=message):
        load_settings(env)


def test_good_settings_pass():
    settings = load_settings({"PORT": "5000", "LLM_PROVIDER": "Groq", "LOG_LEVEL": "warning"})
    assert (settings.port, settings.llm_provider, settings.log_level) == (5000, "groq", "WARNING")

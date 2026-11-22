from app.config import load_settings


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

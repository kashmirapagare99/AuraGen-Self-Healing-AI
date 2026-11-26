import os
from dataclasses import dataclass


@dataclass
class Settings:
    port: int = 4000
    cors_origins: tuple = ("http://localhost:3000", "http://127.0.0.1:3000")
    db_path: str = "data/auragen.db"
    rate_limit_per_min: int = 60
    log_level: str = "INFO"
    llm_provider: str = "auto"
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-20b"
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-opus-5-5"
    llm_timeout_seconds: float = 20.0


PROVIDERS = ("auto", "groq", "claude", "rules")
LOG_LEVELS = ("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL")


class ConfigError(ValueError):
    pass


def check(settings):
    if not 1 <= settings.port <= 65535:
        raise ConfigError(f"PORT must be between 1 and 65535, got {settings.port}")
    if settings.rate_limit_per_min < 1:
        raise ConfigError("RATE_LIMIT_PER_MIN must be at least 1")
    if settings.llm_timeout_seconds <= 0:
        raise ConfigError("LLM_TIMEOUT_SECONDS must be greater than 0")
    if settings.llm_provider not in PROVIDERS:
        raise ConfigError(f"LLM_PROVIDER must be one of {', '.join(PROVIDERS)}, got '{settings.llm_provider}'")
    if settings.log_level not in LOG_LEVELS:
        raise ConfigError(f"LOG_LEVEL must be one of {', '.join(LOG_LEVELS)}, got '{settings.log_level}'")
    return settings


def read(env):
    origins = env.get("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    return Settings(
        port=int(env.get("PORT", 4000)),
        cors_origins=tuple(o.strip() for o in origins.split(",") if o.strip()),
        db_path=env.get("DB_PATH", "data/auragen.db"),
        rate_limit_per_min=int(env.get("RATE_LIMIT_PER_MIN", 60)),
        log_level=env.get("LOG_LEVEL", "INFO").strip().upper(),
        llm_provider=env.get("LLM_PROVIDER", "auto").strip().lower(),
        groq_api_key=env.get("GROQ_API_KEY", "").strip(),
        groq_model=env.get("GROQ_MODEL", "openai/gpt-oss-20b"),
        anthropic_api_key=env.get("ANTHROPIC_API_KEY", "").strip(),
        anthropic_model=env.get("ANTHROPIC_MODEL", "claude-opus-5-5"),
        llm_timeout_seconds=float(env.get("LLM_TIMEOUT_SECONDS", 20)),
    )


def load_settings(env=None):
    env = os.environ if env is None else env
    try:
        settings = read(env)
    except ValueError as exc:
        raise ConfigError(f"a numeric setting has a value that is not a number ({exc})") from None
    return check(settings)

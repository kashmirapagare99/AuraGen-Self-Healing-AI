import os
from dataclasses import dataclass


@dataclass
class Settings:
    port: int = 4000
    cors_origins: tuple = ("http://localhost:3000", "http://127.0.0.1:3000")
    db_path: str = "data/auragen.db"
    rate_limit_per_min: int = 60
    llm_provider: str = "auto"
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-20b"
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-opus-5-5"
    llm_timeout_seconds: float = 20.0


def load_settings(env=None):
    env = os.environ if env is None else env
    origins = env.get("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    return Settings(
        port=int(env.get("PORT", 4000)),
        cors_origins=tuple(o.strip() for o in origins.split(",") if o.strip()),
        db_path=env.get("DB_PATH", "data/auragen.db"),
        rate_limit_per_min=int(env.get("RATE_LIMIT_PER_MIN", 60)),
        llm_provider=env.get("LLM_PROVIDER", "auto").strip().lower(),
        groq_api_key=env.get("GROQ_API_KEY", "").strip(),
        groq_model=env.get("GROQ_MODEL", "openai/gpt-oss-20b"),
        anthropic_api_key=env.get("ANTHROPIC_API_KEY", "").strip(),
        anthropic_model=env.get("ANTHROPIC_MODEL", "claude-opus-5-5"),
        llm_timeout_seconds=float(env.get("LLM_TIMEOUT_SECONDS", 20)),
    )

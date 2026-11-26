import logging

from .claude_provider import ClaudeProvider
from .groq_provider import GroqProvider

log = logging.getLogger(__name__)


def create_provider(settings):
    """Picks the layout generator. Returns None to use the built-in layouts only."""
    choice = settings.llm_provider

    if choice == "rules":
        return None

    if choice in ("auto", "groq") and settings.groq_api_key:
        return GroqProvider(settings.groq_api_key, settings.groq_model, settings.llm_timeout_seconds)

    if choice in ("auto", "claude") and settings.anthropic_api_key:
        try:
            return ClaudeProvider(settings.anthropic_api_key, settings.anthropic_model,
                                settings.llm_timeout_seconds)
        except Exception as exc:
            log.warning("Claude layouts disabled, could not load the SDK: %s", exc)

    return None

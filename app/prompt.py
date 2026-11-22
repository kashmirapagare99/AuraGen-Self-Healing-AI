import json

from pydantic import ValidationError

from .schemas import FIELD_KEYS, UISpec

SYSTEM_PROMPT = f"""You design simplified layouts for a long financial application form.
You only get a friction score and counts of what went wrong, never any user data.

Reply with a single JSON object and nothing else:
{{"mode": "wizard" or "one_question", "steps": [{{"id": "kebab-case", "title": "...", "fields": [{{"key": "...", "label": "...", "helpText": "optional"}}]}}]}}

Rules:
- Use each of these field keys exactly once: {", ".join(FIELD_KEYS)}
- The last step has id "review", a title and an empty fields list.
- Step ids are unique lowercase kebab-case. Titles and labels are at most 80 characters, help text at most 300.
- Group related fields into short steps of three to five fields and keep the wording plain.
- Use "one_question" when the cause is hesitation, otherwise "wizard".
- If the cause is validation errors, add help text with the expected format for fields that often fail
  (phone: at least 10 digits, monthlyIncome: at least 500, requestedAmount: at least 1000,
  applicationPurpose: at least 10 characters, email: a valid address)."""


def user_message(score, reason, counts):
    return (
        f"Friction score: {score}/100\n"
        f"Main cause: {reason}\n"
        f"Cause counts: {json.dumps(counts)}\n"
        "Design the layout."
    )


def parse_spec(text):
    """Pulls a layout out of a model reply, or returns None if it isn't a valid one."""
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end <= start:
        return None
    try:
        return UISpec.model_validate_json(text[start:end + 1])
    except ValidationError:
        return None

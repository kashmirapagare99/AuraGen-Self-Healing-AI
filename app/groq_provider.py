import json
import urllib.error
import urllib.request

from .prompt import SYSTEM_PROMPT, parse_spec, user_message

URL = "https://api.groq.com/openai/v1/chat/completions"


class GroqProvider:
    name = "groq"

    def __init__(self, api_key, model, timeout):
        self.api_key = api_key
        self.model = model
        self.timeout = timeout

    def complete(self, system, user):
        """Sends one chat request and returns the reply text, expected to be JSON."""
        payload = {
            "model": self.model,
            "temperature": 0.3,
            "max_tokens": 4000,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        }
        if "gpt-oss" in self.model:
            # these models think before answering, keep that short
            payload["reasoning_effort"] = "low"

        request = urllib.request.Request(
            URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "auragen-backend/1.0",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                body = json.load(response)
        except urllib.error.HTTPError as exc:
            # the error body can explain things like a retired model name
            detail = exc.read().decode("utf-8", "replace")[:200]
            raise RuntimeError(f"Groq returned HTTP {exc.code}: {detail}") from None

        choices = body.get("choices") or []
        if not choices:
            return ""
        return choices[0].get("message", {}).get("content") or ""

    def build(self, score, reason, counts):
        # models sometimes return a layout that breaks the rules, so one more try is allowed
        for _ in range(2):
            layout = parse_spec(self.complete(SYSTEM_PROMPT, user_message(score, reason, counts)))
            if layout is not None:
                return layout
        return None

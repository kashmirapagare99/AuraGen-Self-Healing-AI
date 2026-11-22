from .prompt import SYSTEM_PROMPT, parse_spec, user_message


class ClaudeProvider:
    name = "claude"

    def __init__(self, api_key, model, timeout):
        # imported here so the app still runs when the sdk is missing or can't be loaded
        import anthropic

        self.model = model
        self.client = anthropic.Anthropic(api_key=api_key, timeout=timeout, max_retries=1)

    def complete(self, system, user):
        message = self.client.messages.create(
            model=self.model,
            max_tokens=4000,
            output_config={"effort": "low"},
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        if message.stop_reason == "refusal":
            return ""
        return "".join(block.text for block in message.content if block.type == "text")

    def build(self, score, reason, counts):
        return parse_spec(self.complete(SYSTEM_PROMPT, user_message(score, reason, counts)))

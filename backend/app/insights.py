import json
import logging

from pydantic import ValidationError

from .layouts import count_causes
from .schemas import Insights, InsightsResponse

log = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a product analyst for AuraGen, a web app that watches for friction while people
fill in a long financial application form and offers a simpler guided layout when they struggle.

You get a friction score, counts of what went wrong in the current session, and anonymous totals from
earlier sessions. You never get any personal data. Write practical suggestions for the people running
the dashboard, based only on the numbers you were given. Do not invent figures.

Reply with a single JSON object and nothing else:
{"summary": "one or two sentences describing the situation",
 "suggestions": [{"title": "...", "detail": "...", "priority": "high|medium|low",
                  "category": "form|layout|accessibility|process", "action": "application|simplified|analytics|demo|none"}]}

Field meanings, which are different things:
- category is the kind of change: form (fields, validation, wording), layout (screens, steps, buttons),
  accessibility (text size, contrast, keyboard use) or process (tracking, measuring, follow-up).
- action is the dashboard page to open: application, simplified, analytics, demo or none.

Example item:
{"title": "Show format hints early", "detail": "Four validation errors were recorded, so put the expected phone and amount formats next to the fields.",
 "priority": "high", "category": "form", "action": "application"}

Rules:
- Give between 3 and 5 suggestions, most important first.
- Write for a person reading a dashboard. Never mention JSON keys or field names such as byReason or
  bySource, describe them in plain words instead.
- In the earlier-sessions totals, "outcomes total" counts before/after reports that were sent back. Zero
  means none were reported yet, it does not mean sessions failed.
- Titles are at most 80 characters and details at most 300. The summary is at most 300.
- "action" is the page that helps most: application (the complex form), simplified (the guided wizard),
  analytics (charts and exports), demo (scripted scenarios), or none.
- Use "high" only when the numbers show real friction, such as a score of 60 or more.
- If there is no session data yet, suggest ways to get useful data, for example turning tracking on."""


def level_for(score):
    if score >= 60:
        return "high"
    return "moderate" if score >= 30 else "low"


def user_message(context, stats):
    counts = count_causes(context.events)
    session = {
        "frictionScore": context.score,
        "level": level_for(context.score),
        "eventsRecorded": len(context.events),
        "validationErrors": counts["validation_errors"],
        "repeatedClicks": counts["repeated_clicks"],
        "hesitations": counts["hesitation"],
    }
    return (
        "Current session:\n" + json.dumps(session) +
        "\n\nAnonymous totals from earlier sessions:\n" + json.dumps(stats) +
        "\n\nWrite the suggestions."
    )


def rule_based(context, stats):
    counts = count_causes(context.events)
    items = []

    if context.score >= 60:
        items.append(("Offer the guided layout straight away",
                      "The score is in the high range. Show the simplified wizard as soon as friction starts instead of waiting for the user to ask.",
                      "high", "process", "simplified"))
    if counts["validation_errors"] >= 2:
        items.append(("Show format hints before people submit",
                      f"{counts['validation_errors']} validation errors were recorded. Put the expected format next to phone, income, amount and purpose fields.",
                      "high", "form", "application"))
    if counts["repeated_clicks"] >= 1:
        items.append(("Make button feedback clearer",
                      "Repeated clicks usually mean nothing seemed to happen. Show a loading or success state right after a click.",
                      "medium", "layout", "application"))
    if counts["hesitation"] >= 1:
        items.append(("Try the one-question layout",
                      "Long pauses on a field point to uncertainty. Asking one question at a time often reduces it.",
                      "medium", "layout", "simplified"))
    if not context.events:
        items.append(("Turn on tracking and run a scenario",
                      "There is no session data yet. Enable tracking and use the demo scenarios to see how the score reacts.",
                      "low", "process", "demo"))

    outcomes = stats["outcomes"]
    if outcomes["total"] and outcomes["improved"] < outcomes["total"] / 2:
        items.append(("Review layouts that did not lower the score",
                      f"Only {outcomes['improved']} of {outcomes['total']} reported adaptations lowered the score. Compare before and after in analytics.",
                      "medium", "process", "analytics"))

    items.append(("Check accessibility settings",
                  "Large text and high contrast can reduce errors for some users. Review them in the analytics page.",
                  "low", "accessibility", "analytics"))
    items.append(("Review the analytics after a few sessions",
                  "Patterns are clearer once several sessions have been recorded. Export the before and after metrics to compare.",
                  "low", "process", "analytics"))

    suggestions = [
        {"title": t, "detail": d, "priority": p, "category": c, "action": a}
        for t, d, p, c, a in items[:5]
    ]
    level = level_for(context.score)
    summary = (f"The friction score is {context.score} ({level}) with {len(context.events)} recorded events."
               if context.events else "No interaction data has been recorded in this session yet.")
    return Insights.model_validate({"summary": summary, "suggestions": suggestions})


class InsightsService:
    def __init__(self, provider, store):
        self.provider = provider
        self.store = store

    def build(self, context):
        stats = self.store.summary()

        if self.provider is not None:
            try:
                message = user_message(context, stats)
                for _ in range(2):
                    text = self.provider.complete(SYSTEM_PROMPT, message)
                    insights = parse(text)
                    if insights is not None:
                        return InsightsResponse(**insights.model_dump(), source="llm",
                                                provider=self.provider.name)
                log.info("no usable generated suggestions, using the rule based ones")
            except Exception as exc:
                log.warning("suggestion generation failed (%s), using the rule based ones",
                            type(exc).__name__)

        return InsightsResponse(**rule_based(context, stats).model_dump(), source="rules",
                                provider="rules")


CATEGORY_FOR_ACTION = {
    "application": "form",
    "simplified": "layout",
    "analytics": "process",
    "demo": "process",
    "none": "process",
}


def tidy(data):
    """Repairs small slips models make, such as an action written in the category field."""
    if not isinstance(data, dict) or not isinstance(data.get("suggestions"), list):
        return data
    for item in data["suggestions"]:
        if not isinstance(item, dict):
            continue
        if item.get("action") not in CATEGORY_FOR_ACTION:
            item["action"] = item["category"] if item.get("category") in CATEGORY_FOR_ACTION else "none"
        if item.get("category") not in ("form", "layout", "accessibility", "process"):
            item["category"] = CATEGORY_FOR_ACTION[item["action"]]
        if item.get("priority") not in ("high", "medium", "low"):
            item["priority"] = "medium"
    return data


def parse(text):
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end <= start:
        return None
    try:
        return Insights.model_validate(tidy(json.loads(text[start:end + 1])))
    except (ValueError, ValidationError):
        return None

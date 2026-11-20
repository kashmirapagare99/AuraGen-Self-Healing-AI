from typing import Annotated, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

FIELD_KEYS = (
    "fullName", "email", "phone", "dateOfBirth", "residentialAddress",
    "employmentStatus", "employmentType", "monthlyIncome", "existingObligations",
    "applicationType", "requestedAmount", "applicationPurpose",
    "additionalInformation", "agreedToTerms",
)
FieldKey = Literal[
    "fullName", "email", "phone", "dateOfBirth", "residentialAddress",
    "employmentStatus", "employmentType", "monthlyIncome", "existingObligations",
    "applicationType", "requestedAmount", "applicationPurpose",
    "additionalInformation", "agreedToTerms",
]
EventType = Literal[
    "repeated_click", "validation_error", "extended_hesitation", "field_time",
    "long_pause", "repeated_attempt", "repeated_interaction", "mode_toggle",
    "step_abandonment",
]
Reason = Literal["repeated_clicks", "validation_errors", "hesitation", "general"]
Mode = Literal["wizard", "one_question"]

Score = Annotated[int, Field(ge=0, le=100, strict=True)]


class Strict(BaseModel):
    # unknown keys are rejected, so form values can never sneak into a request
    model_config = ConfigDict(extra="forbid")


class FrictionEvent(Strict):
    type: EventType
    timestamp: Annotated[float, Field(ge=0, strict=True)]
    durationMs: Optional[Annotated[float, Field(ge=0, strict=True)]] = None


class InteractionContext(Strict):
    score: Score
    events: list[FrictionEvent] = Field(max_length=500)


class UIField(Strict):
    key: FieldKey
    label: str = Field(min_length=1, max_length=80)
    helpText: Optional[str] = Field(default=None, max_length=300)


class UIStep(Strict):
    id: str = Field(pattern=r"^[a-z][a-z0-9-]*$", max_length=40)
    title: str = Field(min_length=1, max_length=80)
    fields: list[UIField] = Field(max_length=len(FIELD_KEYS))


class UISpec(Strict):
    mode: Mode
    steps: list[UIStep] = Field(min_length=2, max_length=len(FIELD_KEYS) + 1)

    @model_validator(mode="after")
    def check_structure(self):
        ids = [s.id for s in self.steps]
        if len(set(ids)) != len(ids):
            raise ValueError("Step IDs must be unique")
        if "review" not in ids:
            raise ValueError("The UI specification must include a review step")

        used = [f.key for s in self.steps for f in s.fields]
        if len(set(used)) != len(used):
            raise ValueError("A field can appear only once in a UI specification")
        missing = [k for k in FIELD_KEYS if k not in used]
        if missing:
            raise ValueError("The UI specification is missing fields: " + ", ".join(missing))
        return self


class AdaptiveResponse(Strict):
    uiSpec: UISpec
    reason: Reason


class Outcome(Strict):
    reason: Reason
    mode: Mode
    beforeScore: Score
    afterScore: Score


class SocketRequest(Strict):
    type: Literal["interaction_context"]
    payload: InteractionContext


Priority = Literal["high", "medium", "low"]
Category = Literal["form", "layout", "accessibility", "process"]
Action = Literal["application", "simplified", "analytics", "demo", "none"]


class Suggestion(Strict):
    title: str = Field(min_length=1, max_length=80)
    detail: str = Field(min_length=1, max_length=300)
    priority: Priority
    category: Category
    action: Action = "none"


class Insights(Strict):
    summary: str = Field(min_length=1, max_length=300)
    suggestions: list[Suggestion] = Field(min_length=3, max_length=5)


class InsightsResponse(Insights):
    source: Literal["llm", "rules"]
    provider: str

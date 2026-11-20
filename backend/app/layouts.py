from .schemas import UISpec

# used whenever no generated layout is available
DEFAULT_LAYOUT = UISpec.model_validate({
    "mode": "wizard",
    "steps": [
        {"id": "personal", "title": "Personal information", "fields": [
            {"key": "fullName", "label": "Full name"},
            {"key": "email", "label": "Email address",
             "helpText": "Use an address where you can receive application updates."},
            {"key": "phone", "label": "Phone number",
             "helpText": "Include the area or country code if it applies."},
            {"key": "dateOfBirth", "label": "Date of birth"},
            {"key": "residentialAddress", "label": "Residential address"},
        ]},
        {"id": "financial", "title": "Financial information", "fields": [
            {"key": "employmentStatus", "label": "Employment status"},
            {"key": "employmentType", "label": "Employment type"},
            {"key": "monthlyIncome", "label": "Monthly income ($)",
             "helpText": "Enter your income as a monthly amount before deductions."},
            {"key": "existingObligations", "label": "Existing monthly obligations ($)",
             "helpText": "Include recurring loan, credit, or support payments."},
        ]},
        {"id": "application", "title": "Application details", "fields": [
            {"key": "applicationType", "label": "Application type"},
            {"key": "requestedAmount", "label": "Requested amount ($)",
             "helpText": "Enter the total amount you are requesting."},
            {"key": "applicationPurpose", "label": "Application purpose",
             "helpText": "Briefly describe how you plan to use the funds."},
            {"key": "additionalInformation", "label": "Additional information (optional)"},
            {"key": "agreedToTerms", "label": "I agree to the terms and conditions"},
        ]},
        {"id": "review", "title": "Review your application", "fields": []},
    ],
})

CAUSE_BY_EVENT = {
    "repeated_click": "repeated_clicks",
    "validation_error": "validation_errors",
    "repeated_attempt": "validation_errors",
    "extended_hesitation": "hesitation",
    "long_pause": "hesitation",
}

# order is used to break ties
REASON_PRIORITY = ["validation_errors", "repeated_clicks", "hesitation"]


def count_causes(events):
    counts = {"repeated_clicks": 0, "validation_errors": 0, "hesitation": 0}
    for event in events:
        cause = CAUSE_BY_EVENT.get(event.type)
        if cause:
            counts[cause] += 1
    return counts


def pick_reason(events):
    counts = count_causes(events)
    best = max(REASON_PRIORITY, key=lambda r: (counts[r], -REASON_PRIORITY.index(r)))
    return best if counts[best] > 0 else "general"


def mode_for(reason):
    return "one_question" if reason == "hesitation" else "wizard"


def fallback_layout(reason):
    return DEFAULT_LAYOUT.model_copy(update={"mode": mode_for(reason)})

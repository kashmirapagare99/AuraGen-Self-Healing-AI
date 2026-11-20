from flask import Blueprint, current_app, jsonify, request
from pydantic import ValidationError

from .schemas import InteractionContext, Outcome

api = Blueprint("api", __name__)


def validation_problem(exc):
    problems = [
        {"path": ".".join(str(p) for p in err["loc"]), "message": err["msg"]}
        for err in exc.errors()
    ]
    return jsonify(error="invalid_request", issues=problems), 400


def limited():
    wait = current_app.limiter.check(request.remote_addr or "unknown")
    if wait:
        response = jsonify(error="rate_limited")
        response.status_code = 429
        response.headers["Retry-After"] = str(wait)
        return response
    return None


@api.get("/health")
def health():
    provider = current_app.service.provider
    return jsonify(
        status="ok",
        llm=provider is not None,
        provider=getattr(provider, "name", "rules"),
    )


@api.post("/api/adaptive-ui")
def adaptive_ui():
    blocked = limited()
    if blocked:
        return blocked

    body = request.get_json(silent=True)
    if body is None:
        return jsonify(error="invalid_request", issues=[{"path": "", "message": "Body must be JSON"}]), 400
    try:
        context = InteractionContext.model_validate(body)
    except ValidationError as exc:
        return validation_problem(exc)

    result, source = current_app.service.adapt(context)
    current_app.store.add_adaptation(
        result.reason, result.uiSpec.mode, source, context.score, len(context.events))

    response = jsonify(result.model_dump(exclude_none=True))
    response.headers["X-Aura-Source"] = source
    return response


@api.post("/api/insights")
def insights():
    blocked = limited()
    if blocked:
        return blocked

    body = request.get_json(silent=True)
    if body is None:
        return jsonify(error="invalid_request", issues=[{"path": "", "message": "Body must be JSON"}]), 400
    try:
        context = InteractionContext.model_validate(body)
    except ValidationError as exc:
        return validation_problem(exc)

    return jsonify(current_app.insights.build(context).model_dump())


@api.post("/api/metrics/outcome")
def report_outcome():
    blocked = limited()
    if blocked:
        return blocked

    try:
        outcome = Outcome.model_validate(request.get_json(silent=True))
    except ValidationError as exc:
        return validation_problem(exc)

    current_app.store.add_outcome(
        outcome.reason, outcome.mode, outcome.beforeScore, outcome.afterScore)
    return "", 204


@api.get("/api/metrics/summary")
def metrics_summary():
    return jsonify(current_app.store.summary())

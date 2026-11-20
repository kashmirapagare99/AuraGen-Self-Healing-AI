import json

from flask import current_app, request
from flask_sock import Sock
from pydantic import ValidationError

from .schemas import SocketRequest

sock = Sock()


def reply_for(raw, service, store):
    """Builds the reply for one incoming websocket message."""
    try:
        data = json.loads(raw)
    except (TypeError, ValueError):
        return {"type": "error", "payload": {"message": "Message must be valid JSON"}}

    try:
        message = SocketRequest.model_validate(data)
    except ValidationError:
        return {"type": "error", "payload": {"message": "Invalid interaction_context message"}}

    result, source = service.adapt(message.payload)
    store.add_adaptation(result.reason, result.uiSpec.mode, source,
                         message.payload.score, len(message.payload.events))
    return {"type": "adaptive_ui", "payload": result.model_dump(exclude_none=True)}


@sock.route("/ws")
def adaptive_socket(ws):
    allowed = current_app.config["CORS_ORIGINS"]
    origin = request.headers.get("Origin")
    if origin and origin not in allowed:
        ws.close(reason=1008, message="origin not allowed")
        return

    ws.send(json.dumps({"type": "status", "payload": {"status": "connected"}}))
    while True:
        try:
            raw = ws.receive()
        except Exception:
            break
        if raw is None:
            break
        reply = reply_for(raw, current_app.service, current_app.store)
        ws.send(json.dumps(reply))

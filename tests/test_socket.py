import json
import threading

import pytest
from simple_websocket import Client, ConnectionClosed, ConnectionError
from werkzeug.serving import make_server

from conftest import event


@pytest.fixture
def server_url(make_app):
    app = make_app()
    server = make_server("127.0.0.1", 0, app, threaded=True)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    yield f"ws://127.0.0.1:{server.server_port}/ws"
    server.shutdown()


def receive(ws):
    return json.loads(ws.receive(timeout=5))


def test_status_then_layout(server_url):
    ws = Client.connect(server_url, headers={"Origin": "http://localhost:3000"})
    assert receive(ws) == {"type": "status", "payload": {"status": "connected"}}

    ws.send(json.dumps({"type": "interaction_context", "payload": {
        "score": 70, "events": [event("validation_error")]}}))
    reply = receive(ws)
    assert reply["type"] == "adaptive_ui"
    assert reply["payload"]["reason"] == "validation_errors"
    ws.close()


def test_bad_messages_get_an_error(server_url):
    ws = Client.connect(server_url)
    receive(ws)

    ws.send("not json")
    assert receive(ws)["type"] == "error"

    ws.send(json.dumps({"type": "interaction_context", "payload": {"score": 500, "events": []}}))
    assert receive(ws)["type"] == "error"
    ws.close()


def test_other_origins_are_closed(server_url):
    try:
        ws = Client.connect(server_url, headers={"Origin": "http://evil.test"})
        with pytest.raises(ConnectionClosed):
            ws.receive(timeout=5)
    except ConnectionError:
        pass

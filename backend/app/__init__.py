import logging
import time

from flask import Flask, g, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from .adaptive import AdaptiveService
from .config import load_settings
from .db import MetricsStore
from .insights import InsightsService
from .providers import create_provider
from .ratelimit import RateLimiter
from .routes import api
from .sockets import sock


access_log = logging.getLogger("app.access")


def create_app(settings=None, provider="auto", store=None):
    settings = settings or load_settings()
    if provider == "auto":
        provider = create_provider(settings)

    app = Flask(__name__)
    app.config["CORS_ORIGINS"] = list(settings.cors_origins)
    app.config["MAX_CONTENT_LENGTH"] = 100 * 1024

    app.service = AdaptiveService(provider)
    app.store = store or MetricsStore(settings.db_path)
    app.insights = InsightsService(provider, app.store)
    app.limiter = RateLimiter(settings.rate_limit_per_min)

    CORS(app, origins=list(settings.cors_origins), methods=["GET", "POST"],
         expose_headers=["X-Aura-Source"])
    app.register_blueprint(api)
    sock.init_app(app)

    @app.before_request
    def start_timer():
        g.started = time.perf_counter()

    @app.after_request
    def log_request(response):
        # path only: no query string, body or client address
        started = getattr(g, "started", None)
        took = int((time.perf_counter() - started) * 1000) if started else 0
        access_log.info("%s %s %s %dms", request.method, request.path, response.status_code, took)
        return response

    @app.after_request
    def add_security_headers(response):
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        if request.path.startswith("/api/"):
            response.headers.setdefault("Cache-Control", "no-store")
        return response

    @app.errorhandler(HTTPException)
    def handle_http_error(err):
        names = {404: "not_found", 405: "method_not_allowed", 413: "payload_too_large"}
        return jsonify(error=names.get(err.code, "invalid_request")), err.code

    @app.errorhandler(Exception)
    def handle_unexpected(err):
        app.logger.exception("unhandled error")
        return jsonify(error="internal_error"), 500

    return app

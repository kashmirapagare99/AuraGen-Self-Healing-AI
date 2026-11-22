from flask import Flask, jsonify
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

    @app.errorhandler(HTTPException)
    def handle_http_error(err):
        names = {404: "not_found", 405: "method_not_allowed", 413: "payload_too_large"}
        return jsonify(error=names.get(err.code, "invalid_request")), err.code

    @app.errorhandler(Exception)
    def handle_unexpected(err):
        app.logger.exception("unhandled error")
        return jsonify(error="internal_error"), 500

    return app

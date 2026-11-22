import logging

from dotenv import load_dotenv

load_dotenv()

from app import create_app  # noqa: E402
from app.config import load_settings  # noqa: E402

settings = load_settings()
logging.basicConfig(level=settings.log_level, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

application = create_app(settings)

if __name__ == "__main__":
    provider = application.service.provider
    source = provider.name if provider else "rule based layouts"
    print(f"AuraGen backend on http://localhost:{settings.port} using {source}")
    application.run(host="0.0.0.0", port=settings.port, threaded=True)

import pytest

from app import create_app
from app.config import Settings
from app.db import MetricsStore


class StubProvider:
    def __init__(self, result=None, error=None):
        self.result = result
        self.error = error

    def build(self, score, reason, counts):
        if self.error:
            raise self.error
        return self.result


@pytest.fixture
def settings():
    return Settings(db_path=":memory:", rate_limit_per_min=100)


@pytest.fixture
def make_app(settings):
    def factory(provider=None, **overrides):
        for name, value in overrides.items():
            setattr(settings, name, value)
        return create_app(settings, provider=provider, store=MetricsStore(":memory:"))
    return factory


@pytest.fixture
def client(make_app):
    return make_app().test_client()


def event(kind, duration=None):
    item = {"type": kind, "timestamp": 1}
    if duration is not None:
        item["durationMs"] = duration
    return item

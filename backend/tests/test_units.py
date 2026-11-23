import pytest

from app import ratelimit
from app.db import MetricsStore
from app.errors import describe
from app.layouts import count_causes, fallback_layout, mode_for, pick_reason
from app.ratelimit import RateLimiter
from app.schemas import FrictionEvent


def events(*kinds):
    return [FrictionEvent(type=kind, timestamp=1) for kind in kinds]


class TestRateLimiter:
    def test_allows_up_to_the_limit_then_blocks(self):
        limiter = RateLimiter(limit=2)
        assert limiter.check("a") == 0
        assert limiter.check("a") == 0
        assert limiter.check("a") > 0

    def test_clients_are_counted_separately(self):
        limiter = RateLimiter(limit=1)
        assert limiter.check("a") == 0
        assert limiter.check("b") == 0
        assert limiter.check("a") > 0

    def test_window_resets(self, monkeypatch):
        now = [1000.0]
        monkeypatch.setattr(ratelimit.time, "monotonic", lambda: now[0])
        limiter = RateLimiter(limit=1, window=60)

        assert limiter.check("a") == 0
        assert limiter.check("a") > 0
        now[0] += 61
        assert limiter.check("a") == 0

    def test_wait_time_shrinks_as_the_window_runs_down(self, monkeypatch):
        now = [0.0]
        monkeypatch.setattr(ratelimit.time, "monotonic", lambda: now[0])
        limiter = RateLimiter(limit=1, window=60)
        limiter.check("a")

        assert limiter.check("a") == 60
        now[0] += 45
        assert limiter.check("a") == 15

    def test_old_entries_are_dropped_when_the_table_grows(self, monkeypatch):
        now = [0.0]
        monkeypatch.setattr(ratelimit.time, "monotonic", lambda: now[0])
        limiter = RateLimiter(limit=5, window=60)
        for number in range(10001):
            limiter.check(f"client-{number}")

        now[0] += 120
        limiter.check("fresh")
        assert len(limiter.hits) == 1


class TestMetricsStore:
    def test_empty_store(self):
        summary = MetricsStore(":memory:").summary()
        assert summary["adaptations"] == {
            "total": 0, "averageScore": None, "byReason": {}, "bySource": {}}
        assert summary["outcomes"]["improved"] == 0

    def test_averages_are_rounded_to_one_decimal(self):
        store = MetricsStore(":memory:")
        for score in (10, 10, 11):
            store.add_adaptation("general", "wizard", "rules", score, 0)
        assert store.summary()["adaptations"]["averageScore"] == 10.3

    def test_only_lower_scores_count_as_improved(self):
        store = MetricsStore(":memory:")
        store.add_outcome("general", "wizard", 50, 20)
        store.add_outcome("general", "wizard", 50, 50)
        store.add_outcome("general", "wizard", 50, 70)
        outcomes = store.summary()["outcomes"]
        assert (outcomes["total"], outcomes["improved"]) == (3, 1)

    def test_data_survives_reopening_a_file_database(self, tmp_path):
        path = str(tmp_path / "metrics.db")
        first = MetricsStore(path)
        first.add_adaptation("hesitation", "one_question", "llm", 44, 3)
        first.close()

        second = MetricsStore(path)
        assert second.summary()["adaptations"]["byReason"] == {"hesitation": 1}


    def test_file_database_uses_wal_and_has_indexes(self, tmp_path):
        store = MetricsStore(str(tmp_path / "metrics.db"))
        mode = store.conn.execute("PRAGMA journal_mode").fetchone()[0]
        indexes = {row[1] for row in store.conn.execute(
            "SELECT * FROM sqlite_master WHERE type = 'index'").fetchall()}
        store.close()

        assert mode == "wal"
        assert {"idx_adaptations_created", "idx_outcomes_created"} <= indexes

    def test_opening_an_existing_database_again_is_safe(self, tmp_path):
        path = str(tmp_path / "metrics.db")
        MetricsStore(path).close()
        MetricsStore(path).close()


class TestLayoutRules:
    @pytest.mark.parametrize("kinds, expected", [
        ([], "general"),
        (["field_time", "mode_toggle"], "general"),
        (["repeated_click"], "repeated_clicks"),
        (["long_pause"], "hesitation"),
        (["validation_error", "repeated_attempt"], "validation_errors"),
        (["repeated_click", "repeated_click", "validation_error"], "repeated_clicks"),
        (["repeated_click", "validation_error"], "validation_errors"),
        (["repeated_click", "extended_hesitation"], "repeated_clicks"),
    ])
    def test_main_cause(self, kinds, expected):
        assert pick_reason(events(*kinds)) == expected

    def test_counts(self):
        counts = count_causes(events("repeated_click", "validation_error", "repeated_attempt", "long_pause"))
        assert counts == {"repeated_clicks": 1, "validation_errors": 2, "hesitation": 1}

    def test_mode_follows_the_cause(self):
        assert mode_for("hesitation") == "one_question"
        assert {mode_for(r) for r in ("general", "repeated_clicks", "validation_errors")} == {"wizard"}

    def test_fallback_layout_keeps_every_field(self):
        layout = fallback_layout("hesitation")
        assert layout.mode == "one_question"
        assert sum(len(step.fields) for step in layout.steps) == 14


class TestDescribe:
    def test_includes_type_and_message(self):
        assert describe(RuntimeError("Groq returned HTTP 404: model gone")) ==             "RuntimeError: Groq returned HTTP 404: model gone"

    def test_type_only_when_there_is_no_message(self):
        assert describe(TimeoutError()) == "TimeoutError"

    def test_long_messages_are_cut(self):
        assert len(describe(ValueError("x" * 1000))) == 200

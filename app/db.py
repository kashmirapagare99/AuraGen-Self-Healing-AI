import os
import sqlite3
import threading
import time

SCHEMA = """
CREATE TABLE IF NOT EXISTS adaptations (
    id INTEGER PRIMARY KEY,
    created_at INTEGER NOT NULL,
    reason TEXT NOT NULL,
    mode TEXT NOT NULL,
    source TEXT NOT NULL,
    score INTEGER NOT NULL,
    event_count INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS outcomes (
    id INTEGER PRIMARY KEY,
    created_at INTEGER NOT NULL,
    reason TEXT NOT NULL,
    mode TEXT NOT NULL,
    before_score INTEGER NOT NULL,
    after_score INTEGER NOT NULL
);
"""


def _round(value):
    return None if value is None else round(value, 1)


class MetricsStore:
    """Keeps counts and scores only. No events, form values or client details."""

    def __init__(self, path):
        if path != ":memory:":
            os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        self.conn = sqlite3.connect(path, check_same_thread=False)
        self.lock = threading.Lock()
        with self.lock:
            self.conn.executescript(SCHEMA)

    def add_adaptation(self, reason, mode, source, score, event_count):
        with self.lock:
            self.conn.execute(
                "INSERT INTO adaptations (created_at, reason, mode, source, score, event_count)"
                " VALUES (?, ?, ?, ?, ?, ?)",
                (int(time.time()), reason, mode, source, score, event_count))
            self.conn.commit()

    def add_outcome(self, reason, mode, before_score, after_score):
        with self.lock:
            self.conn.execute(
                "INSERT INTO outcomes (created_at, reason, mode, before_score, after_score)"
                " VALUES (?, ?, ?, ?, ?)",
                (int(time.time()), reason, mode, before_score, after_score))
            self.conn.commit()

    def summary(self):
        with self.lock:
            total, avg_score = self.conn.execute(
                "SELECT COUNT(*), AVG(score) FROM adaptations").fetchone()
            by_reason = dict(self.conn.execute(
                "SELECT reason, COUNT(*) FROM adaptations GROUP BY reason").fetchall())
            by_source = dict(self.conn.execute(
                "SELECT source, COUNT(*) FROM adaptations GROUP BY source").fetchall())
            count, avg_before, avg_after, improved = self.conn.execute(
                "SELECT COUNT(*), AVG(before_score), AVG(after_score),"
                " SUM(CASE WHEN after_score < before_score THEN 1 ELSE 0 END) FROM outcomes"
            ).fetchone()

        return {
            "adaptations": {
                "total": total,
                "averageScore": _round(avg_score),
                "byReason": by_reason,
                "bySource": by_source,
            },
            "outcomes": {
                "total": count,
                "averageBeforeScore": _round(avg_before),
                "averageAfterScore": _round(avg_after),
                "improved": improved or 0,
            },
        }

    def close(self):
        with self.lock:
            self.conn.close()

import threading
import time


class RateLimiter:
    """Fixed window counter per client address, kept in memory."""

    def __init__(self, limit, window=60):
        self.limit = limit
        self.window = window
        self.hits = {}
        self.lock = threading.Lock()

    def check(self, key):
        """Returns 0 if the request is allowed, otherwise seconds until the window resets."""
        now = time.monotonic()
        with self.lock:
            started, count = self.hits.get(key, (now, 0))
            if now - started >= self.window:
                started, count = now, 0
            count += 1
            self.hits[key] = (started, count)

            if len(self.hits) > 10000:
                self.hits = {k: v for k, v in self.hits.items() if now - v[0] < self.window}

            if count > self.limit:
                return max(1, int(self.window - (now - started)))
        return 0

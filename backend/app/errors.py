def describe(exc, limit=200):
    """Short text for a log line: the error type plus its message, cut to a safe length."""
    message = str(exc).strip()
    name = type(exc).__name__
    return (f"{name}: {message}" if message else name)[:limit]


def provider_label(provider):
    """Name and model of the AI provider, for log lines. Never includes a key."""
    name = getattr(provider, "name", "provider")
    model = getattr(provider, "model", None)
    return f"{name} ({model})" if model else name

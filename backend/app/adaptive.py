import logging

from .layouts import count_causes, fallback_layout, mode_for, pick_reason
from .schemas import AdaptiveResponse

log = logging.getLogger(__name__)


class AdaptiveService:
    def __init__(self, provider=None):
        self.provider = provider

    def adapt(self, context):
        """Returns (response, source) where source is 'llm' or 'rules'."""
        reason = pick_reason(context.events)

        if self.provider is not None:
            try:
                spec = self.provider.build(context.score, reason, count_causes(context.events))
                if spec is not None:
                    # the mode follows the cause no matter what the model chose
                    spec = spec.model_copy(update={"mode": mode_for(reason)})
                    return AdaptiveResponse(uiSpec=spec, reason=reason), "llm"
                log.info("no usable generated layout, using the rule based one")
            except Exception as exc:
                log.warning("layout generation failed (%s), using the rule based one",
                            type(exc).__name__)

        return AdaptiveResponse(uiSpec=fallback_layout(reason), reason=reason), "rules"

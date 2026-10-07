from typing import List, Optional
from ..models.schemas import EventZone

_EVENT_ZONES: List[EventZone] = []

def get_active_events() -> List[EventZone]:
    return [e for e in _EVENT_ZONES if e.is_active]

PILOT_EVENTS = _EVENT_ZONES

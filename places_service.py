from typing import List, Optional
from ..models.schemas import Place, PlaceAccessibility

# Production verified places registry (populated via municipal audits & user verification)
PILOT_PLACES: List[Place] = []

def search_places(query: Optional[str] = None, city: Optional[str] = None) -> List[Place]:
    results = PILOT_PLACES
    if city:
        results = [p for p in results if p.city.lower() == city.lower()]
    if query:
        q = query.lower().strip()
        results = [
            p for p in results 
            if q in p.name.lower() or q in p.address.lower() or q in p.category.lower()
        ]
    return results

def get_place_by_id(place_id: str) -> Optional[Place]:
    for p in PILOT_PLACES:
        if p.id == place_id:
            return p
    return None

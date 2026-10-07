import math
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from ..models.schemas import CommunityReport, CommunityReportCreate

# In-memory storage for community reports (starts empty in production)
_REPORTS_STORE: List[CommunityReport] = []

def calculate_report_confidence(report: CommunityReport) -> str:
    """Calculates freshness decay and social verification confidence level."""
    now = datetime.now(timezone.utc)

    hours_since_verify = (now - report.last_verified_at).total_seconds() / 3600.0
    net_votes = report.upvotes - report.downvotes

    if report.status == "RESOLVED":
        return "EXPIRED"
    
    if hours_since_verify > 24:
        return "EXPIRED"
    elif hours_since_verify > 12:
        return "LOW"
    
    if net_votes >= 3 and hours_since_verify <= 4:
        return "HIGH"
    elif net_votes >= 1 and hours_since_verify <= 8:
        return "MEDIUM"
    elif net_votes <= -2:
        return "LOW"
    else:
        return "UNVERIFIED"

def get_nearby_reports(lat: Optional[float] = None, lng: Optional[float] = None, radius_km: float = 10.0) -> List[CommunityReport]:
    results = []
    for rep in _REPORTS_STORE:
        # Update freshness dynamically
        rep.confidence_level = calculate_report_confidence(rep)
        if rep.confidence_level == "EXPIRED":
            rep.status = "EXPIRED"
            continue
        
        if lat is not None and lng is not None:
            # Haversine distance
            d_lat = math.radians(rep.latitude - lat)
            d_lng = math.radians(rep.longitude - lng)
            a = math.sin(d_lat/2)**2 + math.cos(math.radians(lat)) * math.cos(math.radians(rep.latitude)) * math.sin(d_lng/2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            dist_km = 6371.0 * c
            if dist_km <= radius_km:
                results.append(rep)
        else:
            results.append(rep)
    return results

def create_report(data: CommunityReportCreate) -> CommunityReport:
    lat_val = data.latitude if data.latitude is not None else (data.lat if data.lat is not None else 0.0)
    lng_val = data.longitude if data.longitude is not None else (data.lng if data.lng is not None else 0.0)

    new_report = CommunityReport(
        category=data.category,
        title=data.title,
        description=data.description or "",
        severity=data.severity,
        latitude=lat_val,
        longitude=lng_val,
        status="UNVERIFIED",
        upvotes=1,
        downvotes=0,
        confidence_level="UNVERIFIED",
        reported_at=datetime.now(timezone.utc),
        last_verified_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24)
    )
    _REPORTS_STORE.insert(0, new_report)
    return new_report

def vote_report(report_id: str, vote_type: str) -> Optional[CommunityReport]:
    for rep in _REPORTS_STORE:
        if rep.id == report_id:
            if vote_type == "upvote":
                rep.upvotes += 1
                rep.last_verified_at = datetime.now(timezone.utc)

                if rep.upvotes >= 3:
                    rep.status = "CONFIRMED"
            elif vote_type == "downvote":
                rep.downvotes += 1
            elif vote_type == "resolve":
                rep.status = "RESOLVED"
                rep.confidence_level = "LOW"
            
            rep.confidence_level = calculate_report_confidence(rep)
            return rep
    return None

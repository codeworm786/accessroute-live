from fastapi import APIRouter, HTTPException
from ..models.schemas import RouteRequest, MultiRouteResponse, RerouteRequest, RouteResult
from ..services.valhalla_service import routing_service

router = APIRouter(prefix="/routes", tags=["Routes"])

@router.post("", response_model=MultiRouteResponse)
async def calculate_routes(req: RouteRequest):
    try:
        return await routing_service.calculate_routes(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recalculate", response_model=MultiRouteResponse)
@router.post("/reroute", response_model=RouteResult)
async def reroute_around_obstacle(req: RerouteRequest):
    try:
        route_req = RouteRequest(
            origin=req.current_location,
            destination=req.destination,
            profile=req.profile,
            origin_name="Current Location",
            destination_name="Destination"
        )
        multi = await routing_service.calculate_routes(route_req)
        if not multi.routes:
            raise HTTPException(status_code=404, detail="No viable detour route found")
        detour_route = multi.routes[0]
        detour_route.title = "Dynamic Detour (Obstacle Bypassed)"
        detour_route.color = "#059669"
        return detour_route
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

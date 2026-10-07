import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Place, RouteResult, CommunityReport, EventZone, MapLayerConfig } from '../../types';

interface MapViewProps {
  center: [number, number];
  zoom: number;
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  routes: RouteResult[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  reports: CommunityReport[];
  selectedReport: CommunityReport | null;
  onSelectReport: (report: CommunityReport) => void;
  events: EventZone[];
  layers: MapLayerConfig;
  userLocation: [number, number] | null;
  navigationActive: boolean;
  navPosition: [number, number] | null;
  onMapClick?: (lat: number, lng: number) => void;
  onMapMoveEnd?: (center: [number, number], zoom: number) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  center,
  zoom,
  places,
  selectedPlace,
  onSelectPlace,
  routes,
  selectedRouteId,
  onSelectRoute,
  reports,
  selectedReport,
  onSelectReport,
  events,
  layers,
  userLocation,
  navigationActive,
  navPosition,
  onMapClick,
  onMapMoveEnd,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayersRef = useRef<L.LayerGroup | null>(null);
  const markerLayersRef = useRef<L.LayerGroup | null>(null);
  const eventLayersRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const isProgrammaticMoveRef = useRef<boolean>(false);

  // Basemap Tile Layer
  const getTileUrl = () => {
    if (layers.highContrast) {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    }
    return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileLayer = L.tileLayer(getTileUrl(), {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    tileLayer.on('tileerror', () => {
      tileLayer.setUrl('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    });

    routeLayersRef.current = L.layerGroup().addTo(map);
    markerLayersRef.current = L.layerGroup().addTo(map);
    eventLayersRef.current = L.layerGroup().addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    map.on('dragend zoomend', () => {
      if (isProgrammaticMoveRef.current) return;
      if (onMapMoveEnd) {
        const c = map.getCenter();
        onMapMoveEnd([c.lat, c.lng], map.getZoom());
      }
    });

    mapInstanceRef.current = map;

    // ResizeObserver to automatically invalidate Leaflet size upon layout transitions
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ animate: false });
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer if contrast changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileLayer = L.tileLayer(getTileUrl(), {
      maxZoom: 19,
      attribution: layers.highContrast
        ? 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    tileLayer.on('tileerror', () => {
      tileLayer.setUrl('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    });
  }, [layers.highContrast]);

  // Update Map Center programmatically
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const current = map.getCenter();
    const currZoom = map.getZoom();

    const dLat = Math.abs(current.lat - center[0]);
    const dLng = Math.abs(current.lng - center[1]);
    const dZoom = Math.abs(currZoom - zoom);

    if (dLat > 0.0001 || dLng > 0.0001 || dZoom > 0.01) {
      isProgrammaticMoveRef.current = true;
      map.setView(center, zoom, { animate: true });
      const timer = setTimeout(() => {
        isProgrammaticMoveRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [center[0], center[1], zoom]);

  // Update Events & Caution Polygons
  useEffect(() => {
    if (!eventLayersRef.current) return;
    eventLayersRef.current.clearLayers();

    if (!layers.showEvents) return;

    events.forEach((ev) => {
      if (!ev.is_active) return;
      const polygon = L.polygon(ev.polygon, {
        color: '#D97706',
        weight: 2.5,
        fillColor: '#F59E0B',
        fillOpacity: 0.2,
        dashArray: '6, 8',
      });

      polygon.bindPopup(`
        <div class="p-2.5 text-slate-900 font-sans max-w-xs">
          <div class="flex items-center gap-1.5 font-bold text-amber-700 text-xs mb-1">
            <span>⚠ Active Event / Caution Area</span>
          </div>
          <p class="font-extrabold text-xs text-slate-900">${ev.title}</p>
          <p class="text-[11px] text-slate-600 mt-1">${ev.description}</p>
          <div class="mt-2 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">
            Density: ${ev.crowd_density}
          </div>
        </div>
      `);
      eventLayersRef.current?.addLayer(polygon);
    });
  }, [events, layers.showEvents]);

  // Update Places & Community Hazards Markers
  useEffect(() => {
    if (!markerLayersRef.current) return;
    markerLayersRef.current.clearLayers();

    const placesToRender = [...places];
    if (selectedPlace && !places.some((p) => p.id === selectedPlace.id)) {
      placesToRender.push(selectedPlace);
    }

    // Places Markers
    placesToRender.forEach((p) => {
      const isSelected = selectedPlace?.id === p.id;
      const isTransit = p.category === 'transit' || p.name.toLowerCase().includes('metro') || p.name.toLowerCase().includes('station');
      const isAccessible = p.accessibility?.has_ramp || p.accessibility?.has_accessible_entrance;
      
      const pinBg = isSelected
        ? 'bg-blue-600 ring-2 ring-blue-400'
        : isTransit
        ? 'bg-teal-600 hover:bg-teal-700'
        : isAccessible
        ? 'bg-emerald-600 hover:bg-emerald-700'
        : 'bg-blue-600 hover:bg-blue-700';

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="w-8 h-8 rounded-2xl flex items-center justify-center shadow-md border-2 border-white text-white transition-transform duration-150 hover:scale-110 ${pinBg}">
            ${isTransit ? '🚆' : isAccessible ? '♿' : '📍'}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-place-pin',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([p.latitude, p.longitude], { icon: customIcon });
      marker.on('click', () => onSelectPlace(p));
      markerLayersRef.current?.addLayer(marker);
    });

    // Community Reports / Hazards Markers
    if (layers.showHazards) {
      reports.forEach((rep) => {
        if (rep.status === 'EXPIRED') return;
        const isCritical = rep.severity === 'critical' || rep.severity === 'severe' || rep.status === 'CONFIRMED';

        const repBg = isCritical
          ? 'bg-red-600 text-white ring-2 ring-red-300'
          : 'bg-amber-400 text-slate-950 border-white ring-2 ring-amber-200';

        const repIconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white font-bold text-xs transition-transform duration-150 hover:scale-110 ${repBg}">
              ${isCritical ? '🚨' : '🟡'}
            </div>
          </div>
        `;

        const repIcon = L.divIcon({
          className: 'custom-hazard-pin',
          html: repIconHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([rep.latitude, rep.longitude], { icon: repIcon });
        marker.on('click', () => onSelectReport(rep));
        markerLayersRef.current?.addLayer(marker);
      });
    }
  }, [places, selectedPlace, reports, selectedReport, layers.showHazards]);

  // Update Routes Polyline
  useEffect(() => {
    if (!routeLayersRef.current || !mapInstanceRef.current) return;
    routeLayersRef.current.clearLayers();

    if (routes.length === 0) return;

    // 1. Render alternative routes first in muted Slate
    routes.forEach((rt) => {
      const isSelected = rt.id === (selectedRouteId || routes[0].id);
      if (isSelected) return;

      const poly = L.polyline(rt.coordinates, {
        color: '#64748B',
        weight: 5,
        opacity: 0.6,
        dashArray: rt.is_step_free ? undefined : '5, 8',
        className: 'cursor-pointer hover:opacity-90 transition-opacity',
      });
      poly.bindTooltip(
        `<div class="font-bold text-xs text-slate-800">${rt.title} <span class="text-slate-500">(${rt.duration_minutes} min)</span></div>`,
        { sticky: true, className: 'card-shadow-sm' }
      );
      poly.on('click', () => onSelectRoute(rt.id));
      routeLayersRef.current?.addLayer(poly);
    });

    // 2. Render active selected route in vibrant Blue or Green
    const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
    if (activeRoute) {
      const isStepFree = activeRoute.is_step_free;
      const primaryColor = isStepFree ? '#16A34A' : '#2563EB';
      const outlineColor = isStepFree ? '#14532D' : '#1E3A8A';

      const outline = L.polyline(activeRoute.coordinates, {
        color: outlineColor,
        weight: 9,
        opacity: 0.35,
      });
      const mainPoly = L.polyline(activeRoute.coordinates, {
        color: primaryColor,
        weight: 6,
        opacity: 1.0,
      });
      mainPoly.bindTooltip(
        `<div class="font-bold text-xs ${isStepFree ? 'text-emerald-700' : 'text-blue-700'}">${activeRoute.title} <span class="text-slate-600 font-semibold">(${activeRoute.duration_minutes} min • ${activeRoute.distance_km} km)</span></div>`,
        { sticky: true, className: 'card-shadow-sm' }
      );
      routeLayersRef.current.addLayer(outline);
      routeLayersRef.current.addLayer(mainPoly);

      // Start & Destination Markers
      if (activeRoute.coordinates.length > 0) {
        const startCoord = activeRoute.coordinates[0];
        const endCoord = activeRoute.coordinates[activeRoute.coordinates.length - 1];

        // Origin marker
        const startIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="w-4 h-4 bg-emerald-600 border-2 border-white rounded-full shadow-md"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        const startMarker = L.marker(startCoord, { icon: startIcon, zIndexOffset: 1500 });
        startMarker.bindTooltip('<span class="font-bold text-xs">Origin</span>');
        routeLayersRef.current.addLayer(startMarker);

        // Destination pin
        const destIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="w-6 h-6 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white text-[10px] font-bold">🏁</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const destMarker = L.marker(endCoord, { icon: destIcon, zIndexOffset: 1600 });
        destMarker.bindTooltip('<span class="font-bold text-xs">Destination</span>');
        routeLayersRef.current.addLayer(destMarker);
      }

      // Verified Ramp Marker
      if (layers.showRamps && activeRoute.is_step_free) {
        const midPoint = activeRoute.coordinates[Math.floor(activeRoute.coordinates.length / 2)];
        if (midPoint) {
          const rampIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="bg-white text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md border border-emerald-300 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500"></span>♿ Verified Ramp</div>`,
            iconSize: [110, 24],
            iconAnchor: [55, 12],
          });
          const rampMarker = L.marker(midPoint, { icon: rampIcon });
          routeLayersRef.current.addLayer(rampMarker);
        }
      }

      if (!navigationActive) {
        const bounds = L.latLngBounds(activeRoute.coordinates);
        mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60] });
      }
    }
  }, [routes, selectedRouteId, layers.showRamps, navigationActive]);

  // Update User Live Location (ONLY when real coordinates exist)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const pos = navPosition || userLocation;

    if (!pos) {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      return;
    }

    if (!userMarkerRef.current) {
      const userIconHtml = `
        <div class="relative flex items-center justify-center pointer-events-none">
          <div class="w-6 h-6 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
            <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
          </div>
          <div class="absolute -inset-2.5 bg-blue-500 rounded-full opacity-35 animate-pulse-ring pointer-events-none"></div>
        </div>
      `;
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: userIconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      userMarkerRef.current = L.marker(pos, { icon: userIcon, zIndexOffset: 2000 }).addTo(map);
      userMarkerRef.current.bindPopup(`
        <div class="p-1 text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
          <span>Your Live Location</span>
        </div>
      `);
    } else {
      userMarkerRef.current.setLatLng(pos);
    }

    if (navigationActive && navPosition) {
      map.panTo(navPosition, { animate: true });
    }
  }, [userLocation, navPosition, navigationActive]);

  return (
    <div className="relative w-full h-full bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};

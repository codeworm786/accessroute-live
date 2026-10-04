/**
 * AccessRoute Live - Core Engine
 * Inclusive Multi-Modal Navigation & Hazard Intelligence System
 */

(function () {
  'use strict';

  // ==================== STATE MANAGEMENT ====================
  const state = {
    currentCity: 'delhi',
    activeMode: 'wheelchair', // wheelchair, walking, bicycle, transit, driving, emergency
    startCoords: null,
    destCoords: null,
    startName: 'Central Metro Station Gate 2',
    destName: 'City General Hospital & Medical Center',
    isSimulatingLive: true,
    isHighContrast: false,
    isVoiceEnabled: true,
    isNavigating: false,
    navInterval: null,
    navStepIndex: 0,
    selectedHazardType: 'pothole',
    reportingPinCoords: null,
    activeRouteData: null,
    overlays: {
      traffic: true,
      rallies: true,
      ramps: true,
      hazards: true
    }
  };

  // City Presets with rich accessibility and road network data
  const CITY_PRESETS = {
    delhi: {
      name: 'New Delhi (Connaught Place)',
      center: [28.6328, 77.2197],
      zoom: 15,
      start: { lat: 28.6325, lng: 28.6325 ? 77.2185 : 77.2185, name: 'Rajiv Chowk Metro Gate 2 (Ramp Access)' },
      dest: { lat: 28.6385, lng: 77.2245, name: 'Connaught Medical Center & Polyclinic' },
      ramps: [
        { lat: 28.6329, lng: 77.2188, name: 'Gate 2 ADA Ramp', type: 'ramp', slope: '3.1%', status: 'Clear & Verified', icon: 'fa-road' },
        { lat: 28.6342, lng: 77.2201, name: 'Inner Circle Crosswalk Ramp', type: 'ramp', slope: '4.0%', status: 'Gentle Slope', icon: 'fa-road' },
        { lat: 28.6360, lng: 77.2215, name: 'Radial 3 Pedestrian Ramp', type: 'ramp', slope: '3.5%', status: 'Tactile Paved', icon: 'fa-road' },
        { lat: 28.6375, lng: 77.2238, name: 'Hospital Entrance Incline Ramp', type: 'ramp', slope: '2.8%', status: 'Dual Handrails', icon: 'fa-road' }
      ],
      elevators: [
        { lat: 28.6327, lng: 77.2192, name: 'Metro Concourse Lift A', type: 'elevator', status: 'Operational', capacity: '12 Person / Stretcher', icon: 'fa-elevator' },
        { lat: 28.6355, lng: 77.2210, name: 'Underpass Accessible Lift B', type: 'elevator', status: 'Operational', capacity: 'Wheelchair Accessible', icon: 'fa-elevator' },
        { lat: 28.6331, lng: 77.2205, name: 'Metro Gate 5 Escalator', type: 'escalator', status: 'Running Upward (Ramp 10m away)', note: 'Wheelchair alternative: Lift A', icon: 'fa-stairs' }
      ],
      rallies: [
        {
          id: 'rally-delhi-1',
          name: 'Civic Teachers & Public Rally',
          lat: 28.6348,
          lng: 77.2230,
          radius: 140,
          crowd: '~2,200 Participants',
          severity: 'Road Blocked by Police Cordon',
          trafficDelay: 15,
          active: true
        }
      ],
      hazards: [
        {
          id: 'hz-1',
          type: 'pothole',
          lat: 28.6338,
          lng: 77.2195,
          desc: 'Deep 15cm pothole on edge of curb cut, severe wheelchair tilt hazard.',
          severity: 'high',
          verifiedCount: 7,
          timestamp: '8 mins ago'
        },
        {
          id: 'hz-2',
          type: 'barricade',
          lat: 28.6350,
          lng: 77.2225,
          desc: 'Iron barricades placed for pedestrian redirection, steps only.',
          severity: 'high',
          verifiedCount: 14,
          timestamp: '25 mins ago'
        }
      ]
    },
    sf: {
      name: 'San Francisco (Market St & Union Sq)',
      center: [37.7879, -122.4075],
      zoom: 15,
      start: { lat: 37.7858, lng: -122.4065, name: 'Powell St BART Station (Street Lift)' },
      dest: { lat: 37.7905, lng: -122.4035, name: 'Sutter Health Urgent Care' },
      ramps: [
        { lat: 37.7862, lng: -122.4062, name: 'Market St Curb Cut & Ramp', type: 'ramp', slope: '3.2%', status: 'Compliant', icon: 'fa-road' },
        { lat: 37.7885, lng: -122.4050, name: 'Union Sq Plaza Gentle Ramp', type: 'ramp', slope: '2.5%', status: 'Wide Accessible', icon: 'fa-road' },
        { lat: 37.7898, lng: -122.4042, name: 'Post St Accessible Crossing', type: 'ramp', slope: '3.8%', status: 'Tactile Indicator', icon: 'fa-road' }
      ],
      elevators: [
        { lat: 37.7857, lng: -122.4068, name: 'Powell BART Street-to-Platform Elevator', type: 'elevator', status: 'Operational', capacity: 'Wheelchair / Bike', icon: 'fa-elevator' },
        { lat: 37.7882, lng: -122.4055, name: 'Union Sq Garage Public Elevator', type: 'elevator', status: 'Operational', capacity: 'ADA Certified', icon: 'fa-elevator' },
        { lat: 37.7865, lng: -122.4060, name: 'Cable Car Turnaround Escalator', type: 'escalator', status: 'Under Inspection (Ramp adjacent)', icon: 'fa-stairs' }
      ],
      rallies: [
        {
          id: 'rally-sf-1',
          name: 'Tech Worker & Climate Rally',
          lat: 37.7875,
          lng: -122.4052,
          radius: 120,
          crowd: '~1,500 Participants',
          severity: 'Powell / Geary St Infiltration',
          trafficDelay: 12,
          active: true
        }
      ],
      hazards: [
        {
          id: 'hz-sf-1',
          type: 'broken_ramp',
          lat: 37.7868,
          lng: -122.4058,
          desc: 'Construction scaffold blocking curb ramp. 10cm step without transition.',
          severity: 'high',
          verifiedCount: 9,
          timestamp: '15 mins ago'
        }
      ]
    },
    london: {
      name: 'London (Westminster & Whitehall)',
      center: [51.5014, -0.1265],
      zoom: 15,
      start: { lat: 51.5010, lng: -0.1250, name: 'Westminster Underground Station (Step-Free)' },
      dest: { lat: 51.5065, lng: -0.1280, name: 'Trafalgar Medical Center' },
      ramps: [
        { lat: 51.5015, lng: -0.1255, name: 'Parliament Square Accessible Ramp', type: 'ramp', slope: '3.0%', status: 'Step-Free Pavement', icon: 'fa-road' },
        { lat: 51.5035, lng: -0.1265, name: 'Whitehall Northbound Ramp', type: 'ramp', slope: '2.9%', status: 'Smooth Asphalting', icon: 'fa-road' },
        { lat: 51.5055, lng: -0.1275, name: 'Trafalgar Square South Terrace Ramp', type: 'ramp', slope: '4.2%', status: 'Handrailed Ramp', icon: 'fa-road' }
      ],
      elevators: [
        { lat: 51.5012, lng: -0.1248, name: 'Westminster Station Jubilee Line Lift', type: 'elevator', status: 'Operational', capacity: 'Step-Free to Train', icon: 'fa-elevator' },
        { lat: 51.5040, lng: -0.1270, name: 'MOD Pedestrian Underpass Lift', type: 'elevator', status: 'Operational', capacity: 'Clean & Safe', icon: 'fa-elevator' },
        { lat: 51.5020, lng: -0.1258, name: 'Bridge St Escalators', type: 'escalator', status: 'Running (Wheelchairs use Station Lift 1)', icon: 'fa-stairs' }
      ],
      rallies: [
        {
          id: 'rally-lon-1',
          name: 'Parliament Green March & Gathering',
          lat: 51.5028,
          lng: -0.1260,
          radius: 130,
          crowd: '~3,000 Marchers',
          severity: 'Whitehall Traffic Diversion in effect',
          trafficDelay: 18,
          active: true
        }
      ],
      hazards: [
        {
          id: 'hz-lon-1',
          type: 'pothole',
          lat: 51.5030,
          lng: -0.1268,
          desc: 'Broken cobblestone paver, creates wheelchair wheel wedge risk.',
          severity: 'medium',
          verifiedCount: 5,
          timestamp: '20 mins ago'
        }
      ]
    }
  };

  // 6 MODES CONFIGURATION
  const MODES_CONFIG = {
    wheelchair: {
      name: 'Wheelchair / Accessible',
      icon: 'fa-wheelchair',
      color: '#10b981', // Emerald
      speedKmH: 3.8,
      caloriePerKm: 32,
      accessibleRating: '100% Step-Free',
      description: 'Prioritizes certified ramps, working elevators, gentle gradients (<5%), and avoids all stairs & barricades.'
    },
    walking: {
      name: 'Pedestrian / Walking',
      icon: 'fa-person-walking',
      color: '#06b6d4', // Cyan
      speedKmH: 4.8,
      caloriePerKm: 55,
      accessibleRating: 'Partial (Stairs permitted)',
      description: 'Optimized for shortest walking time using sidewalks, crosswalks, and pedestrian shortcuts.'
    },
    bicycle: {
      name: 'Bicycle / E-Scooter',
      icon: 'fa-bicycle',
      color: '#eab308', // Amber / Yellow
      speedKmH: 15.0,
      caloriePerKm: 38,
      accessibleRating: 'Bike Infrastructure Priority',
      description: 'Follows dedicated bike paths, low-traffic lanes, avoiding steep staircases and potholes.'
    },
    transit: {
      name: 'Public Transit / Metro & Bus',
      icon: 'fa-train-subway',
      color: '#a855f7', // Purple
      speedKmH: 26.0,
      caloriePerKm: 15,
      accessibleRating: 'Elevator-Equipped Stations',
      description: 'Combines metro/bus routes with wheelchair-accessible station boarding, lifts, and escalators.'
    },
    driving: {
      name: 'Car / Driving',
      icon: 'fa-car',
      color: '#3b82f6', // Blue
      speedKmH: 28.0, // Modified dynamically by traffic
      caloriePerKm: 0,
      accessibleRating: 'Motorized',
      description: 'Standard arterial driving route evaluated against live road traffic, blockades, and rallies.'
    },
    emergency: {
      name: 'Emergency / Fast Response',
      icon: 'fa-truck-medical',
      color: '#ef4444', // Red
      speedKmH: 48.0,
      caloriePerKm: 0,
      accessibleRating: 'Priority Corridor',
      description: 'Sirens green-corridor routing, bypasses congestion, clears rallies, and directs to emergency trauma centers.'
    }
  };

  // Leaflet Map & Layer Groups
  let map = null;
  let tileLayers = {};
  let currentTileLayer = null;
  let markersLayer = L.layerGroup();
  let routeLayer = L.layerGroup();
  let trafficLayer = L.layerGroup();
  let ralliesLayer = L.layerGroup();
  let rampsLayer = L.layerGroup();
  let hazardsLayer = L.layerGroup();
  let navAvatarMarker = null;

  // DOM Elements cache
  const el = {
    citySelect: document.getElementById('citySelect'),
    tileStyleSelect: document.getElementById('tileStyleSelect'),
    startInput: document.getElementById('startInput'),
    destInput: document.getElementById('destInput'),
    swapPointsBtn: document.getElementById('swapPointsBtn'),
    currentLocBtn: document.getElementById('currentLocBtn'),
    recalcRouteBtn: document.getElementById('recalcRouteBtn'),
    toggleSimulationBtn: document.getElementById('toggleSimulationBtn'),
    simStatusText: document.getElementById('simStatusText'),
    openCompareBtn: document.getElementById('openCompareBtn'),
    toggleContrastBtn: document.getElementById('toggleContrastBtn'),
    toggleVoiceBtn: document.getElementById('toggleVoiceBtn'),
    voiceIcon: document.getElementById('voiceIcon'),
    openReportModalBtn: document.getElementById('openReportModalBtn'),
    modesContainer: document.getElementById('modesContainer'),
    etaValue: document.getElementById('etaValue'),
    distValue: document.getElementById('distValue'),
    trafficBadge: document.getElementById('trafficBadge'),
    routeSafetyBadge: document.getElementById('routeSafetyBadge'),
    accessibilityDetailsBox: document.getElementById('accessibilityDetailsBox'),
    rampsCountText: document.getElementById('rampsCountText'),
    elevatorsCountText: document.getElementById('elevatorsCountText'),
    escalatorsCountText: document.getElementById('escalatorsCountText'),
    slopeGradeText: document.getElementById('slopeGradeText'),
    liveAlertBanner: document.getElementById('liveAlertBanner'),
    liveAlertTitle: document.getElementById('liveAlertTitle'),
    liveAlertDesc: document.getElementById('liveAlertDesc'),
    toggleStepsBtn: document.getElementById('toggleStepsBtn'),
    stepsChevron: document.getElementById('stepsChevron'),
    stepsListContainer: document.getElementById('stepsListContainer'),
    stepsCount: document.getElementById('stepsCount'),
    startNavigationBtn: document.getElementById('startNavigationBtn'),
    activeNavBanner: document.getElementById('activeNavBanner'),
    navDirectionIcon: document.getElementById('navDirectionIcon'),
    navNextInstruction: document.getElementById('navNextInstruction'),
    navStreetInstruction: document.getElementById('navStreetInstruction'),
    navRemainingEta: document.getElementById('navRemainingEta'),
    navRemainingDist: document.getElementById('navRemainingDist'),
    stopNavBtn: document.getElementById('stopNavBtn'),
    layerTraffic: document.getElementById('layerTraffic'),
    layerRallies: document.getElementById('layerRallies'),
    layerRamps: document.getElementById('layerRamps'),
    layerHazards: document.getElementById('layerHazards'),
    activeIncidentsCount: document.getElementById('activeIncidentsCount'),
    reportModal: document.getElementById('reportModal'),
    closeReportModalBtn: document.getElementById('closeReportModalBtn'),
    cancelReportBtn: document.getElementById('cancelReportBtn'),
    submitReportBtn: document.getElementById('submitReportBtn'),
    hazardTypeGrid: document.getElementById('hazardTypeGrid'),
    reportLocationText: document.getElementById('reportLocationText'),
    reportDescText: document.getElementById('reportDescText'),
    pinOnMapBtn: document.getElementById('pinOnMapBtn'),
    compareModal: document.getElementById('compareModal'),
    closeCompareModalBtn: document.getElementById('closeCompareModalBtn'),
    compareGridContainer: document.getElementById('compareGridContainer'),
    toastContainer: document.getElementById('toastContainer')
  };

  // ==================== INITIALIZATION ====================
  function init() {
    initMap();
    loadSavedHazards();
    setupEventListeners();
    setCity('delhi');
    setupSearch();
    addKeyButton();
    startLiveFeedSimulation();
    showToast('🚀 System Online: Live Multi-Modal & Ramp Engine active!', 'info');
  }

  // Initialize Map
  function initMap() {
    // Map tile providers
    tileLayers.dark = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      className: 'dark-tiles',
      maxZoom: 19
    });

    tileLayers.light = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      
      maxZoom: 19
    });

    tileLayers.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    });

    // Default: Dark style for sleek presentation
    currentTileLayer = tileLayers.dark;

    map = L.map('map', {
      center: CITY_PRESETS.delhi.center,
      zoom: CITY_PRESETS.delhi.zoom,
      layers: [currentTileLayer],
      zoomControl: false
    });

    // Position Zoom controls on bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add layer groups
    routeLayer.addTo(map);
    trafficLayer.addTo(map);
    ralliesLayer.addTo(map);
    rampsLayer.addTo(map);
    hazardsLayer.addTo(map);
    markersLayer.addTo(map);

    // Map Click Handler for placing custom points or reporting
    map.on('click', onMapClick);
  }

  // Load custom hazards from localStorage


  // Switch City

  // Render Overlays for City (Ramps, Elevators, Rallies, Hazards, Traffic)

  // Render a single hazard marker
  function renderHazardMarker(hz) {
    let iconClass = 'fa-triangle-exclamation';
    let iconColor = '#f59e0b';
    let typeLabel = 'Hazard';

    switch (hz.type) {
      case 'pothole':
        iconClass = 'fa-circle-radiation';
        iconColor = '#f97316';
        typeLabel = 'Pothole';
        break;
      case 'barricade':
        iconClass = 'fa-road-barrier';
        iconColor = '#ef4444';
        typeLabel = 'Barricade';
        break;
      case 'broken_ramp':
        iconClass = 'fa-wheelchair';
        iconColor = '#ea580c';
        typeLabel = 'Broken Ramp';
        break;
      case 'broken_elevator':
        iconClass = 'fa-elevator';
        iconColor = '#06b6d4';
        typeLabel = 'Lift Down';
        break;
      case 'rally':
        iconClass = 'fa-bullhorn';
        iconColor = '#a855f7';
        typeLabel = 'Rally';
        break;
      case 'waterlogging':
        iconClass = 'fa-water';
        iconColor = '#3b82f6';
        typeLabel = 'Waterlogged';
        break;
    }

    const marker = L.marker([hz.lat, hz.lng], {
      icon: createSvgIcon(iconClass, iconColor, typeLabel)
    });

    marker.bindPopup(`
      <div class="p-2 text-slate-900 min-w-[200px]">
        <div class="flex items-center justify-between font-bold text-sm" style="color: ${iconColor}">
          <span class="flex items-center gap-1.5"><i class="fa-solid ${iconClass}"></i> ${typeLabel}</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">${hz.timestamp || 'Just now'}</span>
        </div>
        <p class="text-xs text-slate-700 mt-1">${hz.desc || 'Reported obstruction on road/pathway.'}</p>
        <div class="flex items-center justify-between text-[11px] text-slate-600 mt-2 pt-2 border-t border-slate-200">
          <span><i class="fa-solid fa-users text-emerald-600"></i> ${hz.verifiedCount || 1} Community Verifications</span>
          <button onclick="window.upvoteHazard('${hz.id}')" class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-300">
            +1 Confirm
          </button>
        </div>
      </div>
    `);

    hazardsLayer.addLayer(marker);
  }

  // Create clean modern SVG map markers
  function createSvgIcon(fontAwesomeClass, color, label = '', isPulse = false) {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="relative flex flex-col items-center custom-pin">
          ${isPulse ? '<div class="rally-pulse-ring"></div>' : ''}
          <div style="background-color: ${color}; box-shadow: 0 4px 12px ${color}88;" class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs shadow-lg transition-transform">
            <i class="fa-solid ${fontAwesomeClass}"></i>
          </div>
          ${label ? `<span class="mt-0.5 text-[9px] font-bold text-white bg-slate-900/90 px-1.5 py-0.5 rounded border border-white/20 whitespace-nowrap shadow-md">${label}</span>` : ''}
        </div>
      `,
      iconSize: [32, 44],
      iconAnchor: [16, 22]
    });
  }

  // Update total incident counter pill

  // ==================== ROUTE CALCULATION & 6 MODES ====================

  /**
   * Generates realistic, dynamic routes based on mode, traffic congestion, rallies, and ramps
   */

  /**
   * Generates waypoint points with realistic road curve & rally avoidance
   */

  // Draw colorful traffic congestion lines

  // Generate turn-by-turn guidance steps

  // Update Telemetry HUD with detailed accessibility indicators

  // Render Step-by-Step list
  function renderStepsList(steps) {
    el.stepsCount.textContent = steps.length;
    el.stepsListContainer.innerHTML = steps.map((s, idx) => `
      <div class="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
        <div class="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <i class="fa-solid ${s.icon}"></i>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-100">${s.instruction}</span>
            <span class="text-[10px] text-blue-400 font-semibold">${s.dist}</span>
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5">${s.accessibleNote || ''}</p>
        </div>
      </div>
    `).join('');
  }

  // ==================== TURN-BY-TURN NAVIGATION & SPEECH ====================

  let navWatchId = null, demoMode = false, lastReroute = 0, navAnnounced = {};
  const mDist = (a, b) => getDistanceKm(a[0], a[1], b[0], b[1]) * 1000;

  function lineLen(line, from) { let m = 0; for (let i = from; i < line.length - 1; i++) m += mDist(line[i], line[i + 1]); return m; }
  function nearestIdx(p, line) { let best = 0, bd = Infinity; for (let i = 0; i < line.length; i++) { const d = mDist(p, line[i]); if (d < bd) { bd = d; best = i; } } return { idx: best, off: bd }; }
  function resample(line, step) {
    const out = [line[0]]; let acc = 0;
    for (let i = 0; i < line.length - 1; i++) {
      const a = line[i], b = line[i + 1], d = mDist(a, b); let t = step - acc;
      while (t <= d) { const f = t / d; out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); t += step; }
      acc = d - (t - step);
    }
    out.push(line[line.length - 1]); return out;
  }

  async function onNavPosition(p) {
    const R = state.activeRouteData;
    if (!R || !state.isNavigating) return;
    if (navAvatarMarker) navAvatarMarker.setLatLng(p);
    map.panTo(p, { animate: true });
    const line = R.points, steps = R.steps;
    if (!R.totalM) R.totalM = lineLen(line, 0);
    const { idx, off } = nearestIdx(p, line);

    if (mDist(p, state.destCoords) < 25) {
      stopTurnByTurnNavigation();
      speakGuidance('You have arrived at your destination.');
      showToast('🎉 You have arrived at your destination!', 'success');
      if (window.confetti) window.confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      return;
    }
    if (off > 60 && !demoMode && Date.now() - lastReroute > 15000) {
      lastReroute = Date.now();
      showToast('↪️ You left the route. Recalculating from your position…', 'warning');
      speakGuidance('Off route. Recalculating.');
      state.startCoords = p; state.startName = 'My current location'; el.startInput.value = state.startName;
      await calculateAndRenderRoute();
      state.navStepIndex = 1; navAnnounced = {};
      return;
    }
    // advance to the next upcoming manoeuvre
    while (state.navStepIndex < steps.length - 1 && (!steps[state.navStepIndex].loc || mDist(p, steps[state.navStepIndex].loc) < 20)) state.navStepIndex++;
    const next = steps[state.navStepIndex], dNext = next.loc ? mDist(p, next.loc) : 0;
    if (next.loc && dNext < 50 && !navAnnounced[state.navStepIndex]) { navAnnounced[state.navStepIndex] = 1; speakGuidance(`In ${Math.max(10, Math.round(dNext / 10) * 10)} metres. ${next.instruction.replace(/<[^>]+>/g, '')}`); }
    const leftM = lineLen(line, idx), eta = Math.max(1, Math.round(R.timeMin * (leftM / R.totalM)));
    updateNavBanner({ instruction: next.instruction, dist: fmtDist(dNext), icon: next.icon }, eta, fmtDist(leftM));
  }

  function startTurnByTurnNavigation() {
    if (!state.activeRouteData || state.isNavigating) return;
    const R = state.activeRouteData, mc = MODES_CONFIG[state.activeMode];
    state.isNavigating = true; state.navStepIndex = 1; navAnnounced = {};
    el.activeNavBanner.classList.remove('hidden');
    el.startNavigationBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> In Trip...`;
    if (navAvatarMarker) map.removeLayer(navAvatarMarker);
    navAvatarMarker = L.marker(R.points[0], { icon: createSvgIcon(mc.icon, mc.color, 'You', true) }).addTo(map);
    speakGuidance(`Starting trip in ${mc.name} mode. ${R.steps[0].instruction.replace(/<[^>]+>/g, '')}`);
    onNavPosition(R.points[0]);

    if (demoMode) {
      const pts = resample(R.points, 40); let i = 0;
      showToast('🎬 Demo walk: the marker moves along the route by itself.', 'info');
      state.navInterval = setInterval(() => { i++; if (i < pts.length) onNavPosition(pts[i]); else onNavPosition(state.destCoords); }, 1200);
    } else if ('geolocation' in navigator) {
      showToast('📍 Following your real location. Walk and the guidance follows you. Waiting for GPS…', 'info');
      navWatchId = navigator.geolocation.watchPosition(
        pos => onNavPosition([pos.coords.latitude, pos.coords.longitude]),
        () => { showToast('⚠️ Location unavailable. Allow location access, or switch on "Demo walk".', 'warning'); stopTurnByTurnNavigation(); },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 30000 });
    } else { showToast('This device has no GPS. Use "Demo walk".', 'warning'); stopTurnByTurnNavigation(); }
  }

  function stopTurnByTurnNavigation() {
    state.isNavigating = false;
    clearInterval(state.navInterval);
    if (navWatchId != null && navigator.geolocation) { navigator.geolocation.clearWatch(navWatchId); navWatchId = null; }
    el.activeNavBanner.classList.add('hidden');
    el.startNavigationBtn.innerHTML = `<i class="fa-solid fa-location-arrow"></i> <span>Start Trip</span>`;
    if (navAvatarMarker) { map.removeLayer(navAvatarMarker); navAvatarMarker = null; }
  }


  function updateNavBanner(step, eta, dist) {
    el.navStreetInstruction.textContent = step.instruction;
    el.navNextInstruction.textContent = `In ${step.dist}`;
    el.navRemainingEta.textContent = `${eta} min`;
    el.navRemainingDist.textContent = `${dist} left`;
    el.navDirectionIcon.className = `fa-solid ${step.icon}`;
  }


  // Web Speech API Voice Guidance
  function speakGuidance(text) {
    if (!state.isVoiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Stop ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  }

  // ==================== CROWDSOURCED HAZARD REPORTING ====================

  function openReportModal(lat = null, lng = null) {
    if (lat && lng) {
      state.reportingPinCoords = [lat, lng];
      el.reportLocationText.value = `Selected Map Pin: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } else if (state.startCoords) {
      state.reportingPinCoords = [
        state.startCoords[0] + 0.001,
        state.startCoords[1] + 0.001
      ];
      el.reportLocationText.value = `Near ${state.startName}`;
    }
    el.reportModal.showModal();
  }


  // Upvote / Verify hazard

  // ==================== 6 MODES COMPARISON MODAL ====================


  window.selectModeFromModal = function (modeKey) {
    setActiveMode(modeKey);
    el.compareModal.close();
  };

  // ==================== REAL-TIME LIVE SIMULATION ====================


  // ==================== REAL DATA LAYER (OSRM + OpenStreetMap/Overpass + TomTom + Open-Meteo) ====================
  const HAZ_KEY = 'accessroute_hazards_v2';
  const TT_KEY = () => localStorage.getItem('accessroute_tomtom') || '';
  const OSRM_PROFILE = { wheelchair: 'foot', walking: 'foot', bicycle: 'bike', transit: 'car', driving: 'car', emergency: 'car' };
  let HAZARDS = [];
  let ttIncidents = [];
  let routeSeq = 0;
  const MEMO = {};

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ago = ts => { const m = (Date.now() - ts) / 6e4; return m < 1 ? 'Just now' : m < 60 ? Math.round(m) + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : Math.round(m / 1440) + ' d ago'; };
  const fmtDist = m => m >= 1000 ? (m / 1000).toFixed(1) + ' km' : Math.round(m) + ' m';
  const setStatus = t => { const n = document.getElementById('liveFeedTicker'); if (n) n.textContent = t; };
  const samplePts = (a, n) => a.length <= n ? a : Array.from({ length: n }, (_, i) => a[Math.round(i * (a.length - 1) / (n - 1))]);

  function memo(k, f, ttl) {
    const m = MEMO[k];
    if (m && Date.now() - m.t < ttl) return m.p;
    const p = f();
    MEMO[k] = { t: Date.now(), p };
    p.catch(() => { delete MEMO[k]; });
    return p;
  }

  async function getJ(u, opt = {}, ms = 20000) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), ms);
    try {
      const r = await fetch(u, { ...opt, signal: c.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  }

  // geometry helpers
  function segD(p, a, b) {
    const k = Math.cos(p[0] * Math.PI / 180), X = q => [(q[1] - p[1]) * 111320 * k, (q[0] - p[0]) * 110540];
    const A = X(a), B = X(b), dx = B[0] - A[0], dy = B[1] - A[1], l = dx * dx + dy * dy;
    const t = l ? Math.max(0, Math.min(1, -(A[0] * dx + A[1] * dy) / l)) : 0;
    return Math.hypot(A[0] + t * dx, A[1] + t * dy);
  }
  function near(p, line, m) { for (let i = 0; i < line.length - 1; i++) if (segD(p, line[i], line[i + 1]) <= m) return true; return false; }

  // hazards (community reports)
  function loadSavedHazards() {
    try { HAZARDS = JSON.parse(localStorage.getItem(HAZ_KEY) || '[]').filter(h => Date.now() - h.ts < 7 * 864e5); }
    catch (e) { HAZARDS = []; }
  }
  function saveCustomHazard() { try { localStorage.setItem(HAZ_KEY, JSON.stringify(HAZARDS)); } catch (e) { } }
  function updateIncidentCounter() { el.activeIncidentsCount.textContent = HAZARDS.length + ttIncidents.length; }

  // ---- live data fetchers ----
  async function osrm(mode, s, d) {
    const u = `https://routing.openstreetmap.de/routed-${OSRM_PROFILE[mode]}/route/v1/driving/${s[1]},${s[0]};${d[1]},${d[0]}?overview=full&geometries=geojson&steps=true&alternatives=true`;
    const j = await getJ(u);
    if (!j.routes || !j.routes.length) throw new Error('No route found');
    return j.routes.slice(0, 3);
  }

  const classify = e => {
    const t = e.tags || {}, k = [];
    if (t.highway === 'elevator') k.push('elev');
    if (t.highway === 'steps') k.push(t.conveying ? 'esc' : (t.ramp === 'yes' || t['ramp:wheelchair'] === 'yes') ? 'ramp' : 'stairs');
    else if (t.conveying) k.push('esc');
    if (t.ramp === 'yes' || t.kerb) k.push('ramp');
    if (t.tactile_paving === 'yes') k.push('tact');
    return k;
  };
  const KIND_NAME = { stairs: 'Stairs', esc: 'Escalator', elev: 'Lift / elevator', ramp: 'Ramp / dropped kerb', tact: 'Tactile paving' };

  function getInfra(b) {
    if (b.getNorth() - b.getSouth() > 0.12 || b.getEast() - b.getWest() > 0.12) return Promise.resolve(null);
    const bb = [b.getSouth(), b.getWest(), b.getNorth(), b.getEast()].map(x => x.toFixed(5)).join(',');
    return memo('i' + bb, async () => {
      const q = `[out:json][timeout:25];(node["highway"="elevator"](${bb});node["kerb"~"^(lowered|flush)$"](${bb});node["tactile_paving"="yes"](${bb});way["highway"="steps"](${bb});way["conveying"](${bb});way["ramp"="yes"](${bb}););out center tags;`;
      let j = null;
      for (const u of ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']) {
        try { j = await getJ(u, { method: 'POST', body: 'data=' + encodeURIComponent(q) }, 28000); break; } catch (e) { }
      }
      if (!j) throw new Error('overpass');
      const out = [];
      j.elements.forEach(e => {
        const lat = e.lat != null ? e.lat : e.center && e.center.lat, lon = e.lon != null ? e.lon : e.center && e.center.lon;
        if (lat == null) return;
        const ks = classify(e);
        if (ks.length) out.push({ p: [lat, lon], k: ks, name: (e.tags && e.tags.name) || '' });
      });
      return out;
    }, 600000).catch(() => null);
  }

  function getIncidents(b) {
    const key = TT_KEY();
    if (!key) return Promise.resolve([]);
    const bb = `${b.getWest().toFixed(4)},${b.getSouth().toFixed(4)},${b.getEast().toFixed(4)},${b.getNorth().toFixed(4)}`;
    return memo('t' + bb + key, async () => {
      const u = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${key}&bbox=${bb}&fields=%7Bincidents%7Bgeometry%7Btype,coordinates%7D,properties%7BiconCategory,events%7Bdescription%7D%7D%7D%7D&language=en-GB&timeValidityFilter=present`;
      const j = await getJ(u);
      return (j.incidents || []).map(i => {
        let c = i.geometry.coordinates; while (Array.isArray(c[0])) c = c[0];
        return { lat: c[1], lng: c[0], cat: i.properties.iconCategory, txt: (i.properties.events || []).map(e => e.description).join(', ') || 'Traffic incident' };
      });
    }, 90000).catch(() => []);
  }

  async function getFlow(line) {
    const key = TT_KEY();
    if (!key) return [];
    const idx = [0, 1, 2, 3, 4].map(k => Math.min(line.length - 1, Math.floor(line.length * (k + 0.5) / 5)));
    const res = await Promise.all(idx.map(i => memo('f' + line[i].join(',') + key, async () => {
      const j = await getJ(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${key}&point=${line[i][0].toFixed(5)},${line[i][1].toFixed(5)}`);
      const f = j.flowSegmentData;
      return { i, ratio: Math.max(1, Math.min(3, f.freeFlowSpeed / Math.max(1, f.currentSpeed))) };
    }, 90000).catch(() => null)));
    return res.filter(Boolean);
  }

  function getElev(line) {
    const n = Math.min(25, line.length);
    if (n < 2) return Promise.resolve(null);
    const idx = Array.from({ length: n }, (_, i) => Math.round(i * (line.length - 1) / (n - 1)));
    const lat = idx.map(i => line[i][0].toFixed(5)).join(','), lng = idx.map(i => line[i][1].toFixed(5)).join(',');
    return memo('e' + lat + lng, async () => {
      const z = (await getJ(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`)).elevation;
      let sum = 0, len = 0, max = 0;
      for (let i = 1; i < n; i++) {
        const dm = getDistanceKm(line[idx[i - 1]][0], line[idx[i - 1]][1], line[idx[i]][0], line[idx[i]][1]) * 1000;
        if (dm < 20) continue;
        const g = Math.abs(z[i] - z[i - 1]) / dm * 100;
        sum += g * dm; len += dm; if (dm >= 80) max = Math.max(max, g);
      }
      return { avg: len ? sum / len : 0, max };
    }, 3600000).catch(() => null);
  }

  // ---- analysis ----
  function analyse(r, feats, inc) {
    const line = r.geometry.coordinates.map(c => [c[1], c[0]]);
    const o = { raw: r, line, c: { stairs: 0, esc: 0, elev: 0, ramp: 0, tact: 0 }, feats: [], blocks: [], incs: [] };
    (feats || []).forEach(f => { if (near(f.p, line, 20)) f.k.forEach(k => { o.c[k]++; o.feats.push({ p: f.p, k, name: f.name }); }); });
    HAZARDS.forEach(h => { if (BLOCKER_TYPES.includes(h.type) && near([h.lat, h.lng], line, h.type === 'rally' ? 150 : 30)) o.blocks.push(h); });
    inc.forEach(x => { if (near([x.lat, x.lng], line, 40)) o.incs.push(x); });
    return o;
  }
  const BLOCKER_TYPES = ['rally', 'barricade', 'broken_ramp', 'broken_elevator', 'waterlogging', 'pothole'];

  function buildSteps(A, mode) {
    const useInfra = ['wheelchair', 'walking', 'bicycle'].includes(mode);
    const out = [];
    A.raw.legs[0].steps.forEach(s => {
      const m = s.maneuver || {}, nm = s.name ? ' on ' + esc(s.name) : '';
      let text, icon = 'fa-arrow-up';
      if (m.type === 'depart') text = 'Head' + (s.name ? ' along ' + esc(s.name) : ' out');
      else if (m.type === 'arrive') { text = 'Arrive at your destination'; icon = 'fa-flag-checkered'; }
      else if (m.type === 'roundabout' || m.type === 'rotary') { text = 'Take the roundabout' + nm; icon = 'fa-rotate'; }
      else if (['turn', 'end of road', 'fork', 'on ramp', 'off ramp'].includes(m.type)) {
        const mod = m.modifier || 'straight'; text = 'Turn ' + mod + nm;
        icon = /left/.test(mod) ? 'fa-arrow-left' : /right/.test(mod) ? 'fa-arrow-right' : 'fa-arrow-up';
      } else text = 'Continue' + nm;
      let note = '';
      if (m.location) {
        const p = [m.location[1], m.location[0]];
        const f = useInfra && A.feats.find(f => getDistanceKm(p[0], p[1], f.p[0], f.p[1]) * 1000 < 30);
        if (f) note = f.k === 'stairs' ? '⚠️ Stairs mapped here' : f.k === 'esc' ? 'Escalator here' : f.k === 'elev' ? 'Lift available here' : f.k === 'ramp' ? 'Ramp / dropped kerb here' : 'Tactile paving here';
        const h = A.blocks.find(h => getDistanceKm(p[0], p[1], h.lat, h.lng) * 1000 < 60);
        if (h) note = '🚧 Reported: ' + h.type.replace('_', ' ');
      }
      out.push({ dist: m.type === 'arrive' ? 'Arrival' : fmtDist(s.distance), instruction: text, icon, accessibleNote: note, loc: m.location ? [m.location[1], m.location[0]] : null });
    });
    return out.slice(0, 60);
  }

  async function computeRoute(mode, s, d) {
    const rs = await memo('o' + OSRM_PROFILE[mode] + s + d, () => osrm(mode, s, d), 120000);
    const b = L.latLngBounds(rs.flatMap(r => r.geometry.coordinates.map(c => [c[1], c[0]]))).pad(0.05);
    const needInfra = ['wheelchair', 'walking', 'bicycle'].includes(mode);
    const [feats, inc] = await Promise.all([needInfra ? getInfra(b) : Promise.resolve([]), getIncidents(b)]);
    const A = rs.map(r => analyse(r, feats, inc));
    const stepMode = mode === 'wheelchair';
    const base = a => a.raw.distance / 1000 / (MODES_CONFIG[mode].speedKmH) * 60;
    const score = a => (['wheelchair', 'walking', 'bicycle'].includes(mode) ? base(a) : a.raw.duration / 60)
      + a.blocks.length * 15 + a.incs.length * 3 + (stepMode ? a.c.stairs * 60 + a.c.esc * 20 : 0) + (mode === 'bicycle' ? a.c.stairs * 30 : 0);
    const sorted = [...A].sort((x, y) => score(x) - score(y));
    const best = sorted[0];
    const fastest = A[0];
    const blocked = a => a.blocks.some(h => h.type === 'rally' || h.type === 'barricade');
    const rallyConflict = best !== fastest && blocked(fastest) && best.blocks.length < fastest.blocks.length;

    const km = best.raw.distance / 1000;
    let timeMin, delay = 0, estimate = false, flow = [];
    if (['wheelchair', 'walking', 'bicycle'].includes(mode)) timeMin = km / MODES_CONFIG[mode].speedKmH * 60;
    else {
      const free = best.raw.duration / 60;
      if (mode === 'driving') {
        flow = await getFlow(best.line);
        const f = flow.length ? flow.reduce((a, x) => a + x.ratio, 0) / flow.length : 1;
        timeMin = free * f; delay = Math.round(timeMin - free);
      } else if (mode === 'emergency') { timeMin = free * 0.7; estimate = true; }
      else { timeMin = 8 + km / 22 * 60 + 5; estimate = true; }
    }
    const elevation = mode === 'wheelchair' ? await getElev(best.line) : null;
    return {
      points: best.line, distanceKm: km.toFixed(2), timeMin: Math.max(1, Math.round(timeMin)), trafficDelayMin: delay,
      rallyConflict, steps: buildSteps(best, mode), c: best.c, feats: best.feats, blocks: best.blocks, incs: best.incs,
      flow, estimate, elevation, altCount: A.length, allInc: inc, noInfra: needInfra && feats === null ? 'Map data unavailable for this area/size' : ''
    };
  }

  // ---- rendering ----
  function drawPins() {
    markersLayer.clearLayers();
    markersLayer.addLayer(L.marker(state.startCoords, { icon: createSvgIcon('fa-location-dot', '#10b981', 'Start') }).bindPopup(`<b>Starting Point</b><br>${esc(state.startName)}`));
    markersLayer.addLayer(L.marker(state.destCoords, { icon: createSvgIcon('fa-flag-checkered', '#ef4444', 'Destination') }).bindPopup(`<b>Destination</b><br>${esc(state.destName)}`));
  }

  function drawRoute(route) {
    routeLayer.clearLayers(); trafficLayer.clearLayers();
    const mc = MODES_CONFIG[state.activeMode];
    routeLayer.addLayer(L.polyline(route.points, { color: '#ffffff', weight: 8, opacity: 0.35, lineCap: 'round' }));
    routeLayer.addLayer(L.polyline(route.points, { color: mc.color, weight: 5, opacity: 0.95, lineCap: 'round', dashArray: (state.activeMode === 'walking' || state.activeMode === 'wheelchair') ? '8, 6' : null }));
    if (state.overlays.traffic && route.flow && route.flow.length) {
      const pts = route.points, f = route.flow;
      const cuts = [0, ...f.slice(0, -1).map((x, i) => Math.floor((x.i + f[i + 1].i) / 2)), pts.length - 1];
      f.forEach((x, k) => {
        const col = x.ratio < 1.25 ? '#10b981' : x.ratio < 1.6 ? '#f59e0b' : '#ef4444';
        trafficLayer.addLayer(L.polyline(pts.slice(cuts[k], cuts[k + 1] + 1), { color: col, weight: 4, opacity: 0.95, className: col === '#ef4444' ? 'traffic-flow' : '' }));
      });
    }
    if (state.overlays.traffic && TT_KEY()) trafficLayer.addLayer(L.tileLayer(`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TT_KEY()}`, { opacity: 0.6, maxZoom: 18 }));
  }

  function renderCityOverlays(route) {
    rampsLayer.clearLayers(); ralliesLayer.clearLayers(); hazardsLayer.clearLayers();
    if (route && route.feats) route.feats.forEach(f => {
      const m = { stairs: ['fa-stairs', '#ef4444'], esc: ['fa-stairs', '#f59e0b'], elev: ['fa-elevator', '#06b6d4'], ramp: ['fa-road', '#10b981'], tact: ['fa-hand', '#a855f7'] }[f.k];
      rampsLayer.addLayer(L.marker(f.p, { icon: createSvgIcon(m[0], m[1], KIND_NAME[f.k].split(' ')[0]) })
        .bindPopup(`<div class="p-2 text-slate-900"><b>${KIND_NAME[f.k]}</b><br>${esc(f.name)}<div class="text-xs mt-1">Source: OpenStreetMap (volunteer-mapped). Live working status is not published.</div></div>`));
    });
    HAZARDS.forEach(h => {
      if (h.type === 'rally') {
        const html = `<div class="p-2 text-slate-900"><b>Reported rally / gathering</b> (${ago(h.ts)})<br>${esc(h.desc)}<br>${h.verifiedCount} verification(s)<br>
          <button onclick="window.upvoteHazard('${h.id}')" class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold mt-1">+1 Confirm</button></div>`;
        ralliesLayer.addLayer(L.circle([h.lat, h.lng], { color: '#dc2626', fillColor: '#ef4444', fillOpacity: 0.3, radius: 150, weight: 2, dashArray: '6, 6' }).bindPopup(html));
        ralliesLayer.addLayer(L.marker([h.lat, h.lng], { icon: createSvgIcon('fa-bullhorn', '#ef4444', 'RALLY (reported)', true) }).bindPopup(html));
      } else renderHazardMarker({ ...h, timestamp: ago(h.ts), desc: esc(h.desc) });
    });
    ttIncidents.forEach(x => hazardsLayer.addLayer(L.marker([x.lat, x.lng], { icon: createSvgIcon('fa-triangle-exclamation', '#f59e0b', 'Traffic') })
      .bindPopup(`<div class="p-2 text-slate-900"><b>Live traffic incident</b><br>${esc(x.txt)}<br><small>Source: TomTom Traffic</small></div>`)));
    updateIncidentCounter();
  }

  async function calculateAndRenderRoute() {
    if (!state.startCoords || !state.destCoords) return;
    const seq = ++routeSeq;
    drawPins();
    setStatus('⏳ Fetching live route, map data and traffic…');
    let route;
    try { route = await computeRoute(state.activeMode, state.startCoords, state.destCoords); }
    catch (e) { console.warn(e); setStatus('⚠️ Routing service unreachable or no route between these points'); showToast('⚠️ No route found (or routing service busy). Try again.', 'warning'); return; }
    if (seq !== routeSeq) return;
    state.activeRouteData = route;
    ttIncidents = route.allInc || [];
    drawRoute(route);
    updateRouteHUD(route);
    renderCityOverlays(route);
    if (!state.isNavigating) map.fitBounds(L.latLngBounds(route.points), { padding: [80, 80], maxZoom: 17 });
    const t = new Date().toLocaleTimeString();
    setStatus(`✅ Live ${t} · OSRM route · ${route.feats.length} accessibility features (OpenStreetMap) · traffic: ${TT_KEY() ? 'TomTom live' : 'off (add key)'} · ${HAZARDS.length} community report(s)`);
  }

  function updateRouteHUD(route) {
    el.etaValue.textContent = `${route.timeMin} min`;
    el.distValue.textContent = `${route.distanceKm} km`;
    const carLike = ['driving', 'emergency', 'transit'].includes(state.activeMode);
    const badge = (cls, ic, t) => { el.trafficBadge.className = 'nav-badge ' + cls; el.trafficBadge.innerHTML = `<i class="fa-solid ${ic}"></i> ${t}`; };
    const AMB = 'bg-amber-500/20 text-amber-300 border border-amber-500/30', RED = 'bg-red-500/20 text-red-300 border border-red-500/30', GRN = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    if (route.estimate) badge('bg-slate-500/20 text-slate-300 border border-slate-500/30', 'fa-circle-info', 'Estimate (no live feed)');
    else if (carLike) {
      if (!TT_KEY()) badge(AMB, 'fa-key', 'Add TomTom key for live traffic');
      else if (route.trafficDelayMin > 5) badge(RED, 'fa-triangle-exclamation', `Heavy traffic (+${route.trafficDelayMin}m)`);
      else if (route.trafficDelayMin > 0) badge(AMB, 'fa-clock', `Moderate traffic (+${route.trafficDelayMin}m)`);
      else badge(GRN, 'fa-circle-check', 'Free flow');
    } else if (route.blocks.length) badge(AMB, 'fa-triangle-exclamation', `${route.blocks.length} reported problem(s) on route`);
    else badge(GRN, 'fa-circle-check', 'No reports on route');

    if (state.activeMode === 'wheelchair') {
      el.accessibilityDetailsBox.classList.remove('hidden');
      const c = route.c, na = route.noInfra;
      el.rampsCountText.textContent = na ? 'Data unavailable' : `${c.ramp} ramps / dropped kerbs`;
      el.elevatorsCountText.textContent = na ? 'Data unavailable' : `${c.elev} lift(s) mapped`;
      el.escalatorsCountText.textContent = na ? 'Data unavailable' : (c.esc ? `${c.esc} on path — use a lift` : 'None on path');
      el.slopeGradeText.textContent = route.elevation ? `Avg ${route.elevation.avg.toFixed(1)}% · max ${route.elevation.max.toFixed(1)}%` : 'Terrain data unavailable';
      el.routeSafetyBadge.innerHTML = na ? '<i class="fa-solid fa-circle-question"></i> Unknown' : c.stairs ? `<i class="fa-solid fa-triangle-exclamation"></i> ${c.stairs} stairs on path` : (c.ramp + c.elev) ? '<i class="fa-solid fa-shield-check"></i> Step-free (mapped)' : '<i class="fa-solid fa-circle-question"></i> No stairs mapped';
    } else {
      el.accessibilityDetailsBox.classList.add('hidden');
      el.routeSafetyBadge.innerHTML = route.altCount > 1 ? `<i class="fa-solid fa-check"></i> Best of ${route.altCount} routes` : '<i class="fa-solid fa-check"></i> Fastest route';
    }

    const worst = route.blocks.find(h => h.type === 'rally' || h.type === 'barricade') || route.blocks[0];
    if (route.rallyConflict) {
      el.liveAlertBanner.classList.remove('hidden');
      el.liveAlertTitle.textContent = '⚠️ Rerouted around a reported rally/barricade';
      el.liveAlertDesc.textContent = 'The fastest route crossed a community-reported blockage, so a clear alternative was chosen.';
    } else if (worst) {
      el.liveAlertBanner.classList.remove('hidden');
      el.liveAlertTitle.textContent = `⚠️ Reported ${worst.type.replace('_', ' ')} on this route`;
      el.liveAlertDesc.textContent = 'No clear alternative was found. Check the map marker before you go.';
    } else if (route.incs.length) {
      el.liveAlertBanner.classList.remove('hidden');
      el.liveAlertTitle.textContent = '🚦 Live traffic incident on route';
      el.liveAlertDesc.textContent = route.incs[0].txt;
    } else el.liveAlertBanner.classList.add('hidden');
    renderStepsList(route.steps);
  }

  function setCity(cityKey) {
    if (!CITY_PRESETS[cityKey]) return;
    state.currentCity = cityKey;
    const city = CITY_PRESETS[cityKey];
    map.flyTo(city.center, city.zoom, { duration: 1.2 });
    state.startCoords = [city.start.lat, city.start.lng]; state.destCoords = [city.dest.lat, city.dest.lng];
    state.startName = city.start.name; state.destName = city.dest.name;
    el.startInput.value = state.startName; el.destInput.value = state.destName;
    calculateAndRenderRoute();
  }

  function submitHazardReport() {
    const desc = el.reportDescText.value.trim() || 'Reported by a community member.';
    const sev = document.querySelector('input[name="severity"]:checked');
    if (!state.reportingPinCoords) state.reportingPinCoords = map.getCenter();
    const hz = {
      id: 'hz-' + Date.now(), type: state.selectedHazardType,
      lat: state.reportingPinCoords.lat || state.reportingPinCoords[0], lng: state.reportingPinCoords.lng || state.reportingPinCoords[1],
      desc, severity: sev ? sev.value : 'medium', verifiedCount: 1, ts: Date.now()
    };
    HAZARDS.push(hz); saveCustomHazard();
    el.reportModal.close(); el.reportDescText.value = '';
    showToast(`✅ ${hz.type.replace('_', ' ').toUpperCase()} reported. Routes now account for it.`, 'success');
    speakGuidance('Report saved. Routes will now avoid this problem where possible.');
    calculateAndRenderRoute();
  }

  window.upvoteHazard = function (id) {
    const hz = HAZARDS.find(h => h.id === id);
    if (!hz) return;
    hz.verifiedCount = (hz.verifiedCount || 1) + 1; saveCustomHazard();
    showToast(`👍 Confirmed by ${hz.verifiedCount} user(s).`, 'info');
    renderCityOverlays(state.activeRouteData);
  };

  async function openCompareModal() {
    if (!state.startCoords || !state.destCoords) return;
    el.compareGridContainer.innerHTML = '<p class="text-slate-300 text-sm p-4">⏳ Fetching live routes for all 6 modes…</p>';
    el.compareModal.showModal();
    const keys = Object.keys(MODES_CONFIG);
    const res = await Promise.allSettled(keys.map(k => computeRoute(k, state.startCoords, state.destCoords)));
    el.compareGridContainer.innerHTML = '';
    keys.forEach((modeKey, i) => {
      const mode = MODES_CONFIG[modeKey], r = res[i], cur = modeKey === state.activeMode;
      const ok = r.status === 'fulfilled', route = ok ? r.value : null;
      const card = document.createElement('div');
      card.className = `p-4 rounded-xl border flex flex-col justify-between transition-all ${cur ? 'bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/40' : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'}`;
      const access = !ok ? 'n/a' : modeKey === 'wheelchair' ? (route.noInfra ? 'Map data unavailable' : route.c.stairs ? route.c.stairs + ' stairs on path' : 'No stairs mapped') : (route.estimate ? 'Estimate' : mode.accessibleRating);
      card.innerHTML = `<div>
        <div class="flex items-center justify-between mb-2"><span class="flex items-center gap-2 font-bold text-sm" style="color:${mode.color}"><i class="fa-solid ${mode.icon}"></i> ${mode.name}</span>${cur ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">Active</span>' : ''}</div>
        <div class="flex items-baseline gap-2 mb-2"><span class="text-2xl font-extrabold text-white">${ok ? route.timeMin + ' min' : '—'}</span><span class="text-xs text-slate-400">${ok ? route.distanceKm + ' km' : 'no route'}</span></div>
        <p class="text-xs text-slate-300 mb-3">${mode.description}</p>
        <div class="space-y-1.5 text-[11px] bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 mb-3">
          <div class="flex justify-between"><span class="text-slate-400">Accessibility:</span><span class="font-bold text-emerald-400">${esc(access)}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Calories / Energy:</span><span class="text-slate-200">${ok ? Math.round(mode.caloriePerKm * route.distanceKm) : 0} kcal</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Reported problems on path:</span><span class="text-amber-400 font-semibold">${ok ? (route.blocks.length ? route.blocks.length + ' reported' : 'None') : 'n/a'}</span></div>
        </div></div>
        <button onclick="window.selectModeFromModal('${modeKey}')" class="w-full py-2 rounded-xl text-xs font-bold transition-all ${cur ? 'bg-emerald-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}">${cur ? 'Current Mode' : 'Switch to This Mode'}</button>`;
      el.compareGridContainer.appendChild(card);
    });
  }

  function startLiveFeedSimulation() {
    // Real refresh: re-pull routes, traffic and community reports every 3 minutes
    setInterval(() => {
      if (!state.isSimulatingLive || state.isNavigating) return;
      loadSavedHazards();
      calculateAndRenderRoute();
    }, 180000);
  }

  function setupSearch() {
    [['start', el.startInput], ['dest', el.destInput]].forEach(([k, inp]) => inp.addEventListener('keydown', async e => {
      if (e.key !== 'Enter') return;
      const q = inp.value.trim(); if (!q) return;
      try {
        const bb = map.getBounds();
        const r = await getJ('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q) + '&viewbox=' + [bb.getWest(), bb.getNorth(), bb.getEast(), bb.getSouth()].join(','));
        if (!r[0]) { showToast('Place not found', 'warning'); return; }
        const c = [+r[0].lat, +r[0].lon], name = r[0].display_name.split(',').slice(0, 2).join(',');
        if (k === 'start') { state.startCoords = c; state.startName = name; } else { state.destCoords = c; state.destName = name; }
        inp.value = name; calculateAndRenderRoute();
      } catch (err) { showToast('Search failed. Try again.', 'warning'); }
    }));
  }

  function addKeyButton() {
    const b = document.createElement('button');
    const label = () => TT_KEY() ? '🚦 Traffic key ✓' : '🚦 Add traffic key';
    b.textContent = label();
    b.style.cssText = 'position:fixed;right:12px;bottom:130px;z-index:9999;padding:6px 10px;border-radius:10px;background:#1e293b;color:#e2e8f0;border:1px solid #475569;font-size:11px;cursor:pointer';
    b.onclick = () => {
      const k = prompt('Paste your free TomTom API key (developer.tomtom.com). Leave empty to remove it.', TT_KEY());
      if (k === null) return;
      localStorage.setItem('accessroute_tomtom', k.trim()); b.textContent = label(); calculateAndRenderRoute();
    };
    document.body.appendChild(b);
    const d = document.createElement('button');
    d.textContent = '🎬 Demo walk: OFF';
    d.style.cssText = b.style.cssText.replace('bottom:130px', 'bottom:165px');
    d.onclick = () => { demoMode = !demoMode; d.textContent = '🎬 Demo walk: ' + (demoMode ? 'ON' : 'OFF'); if (state.isNavigating) stopTurnByTurnNavigation(); };
    document.body.appendChild(d);
  }

  // ==================== EVENT LISTENERS & UI HELPERS ====================

  function setupEventListeners() {
    // City Selector
    el.citySelect.addEventListener('change', (e) => {
      if (e.target.value !== 'custom') {
        setCity(e.target.value);
      } else {
        showToast('📍 Custom Mode: Click anywhere on map to set Start and Destination!', 'info');
      }
    });

    // Basemap Style Switcher
    el.tileStyleSelect.addEventListener('change', (e) => {
      const style = e.target.value;
      if (tileLayers[style]) {
        map.removeLayer(currentTileLayer);
        currentTileLayer = tileLayers[style];
        map.addLayer(currentTileLayer);
      }
    });

    // Mode Chips Click
    el.modesContainer.querySelectorAll('.mode-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        setActiveMode(mode);
      });
    });

    // Recalculate Button
    el.recalcRouteBtn.addEventListener('click', () => {
      calculateAndRenderRoute();
      showToast('🔄 Route updated with latest live telemetry!', 'info');
    });

    // Swap Origin & Destination
    el.swapPointsBtn.addEventListener('click', () => {
      const tempCoords = state.startCoords;
      state.startCoords = state.destCoords;
      state.destCoords = tempCoords;

      const tempName = state.startName;
      state.startName = state.destName;
      state.destName = tempName;

      el.startInput.value = state.startName;
      el.destInput.value = state.destName;

      calculateAndRenderRoute();
    });

    // Current Location Geolocation Button
    el.currentLocBtn.addEventListener('click', () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            state.startCoords = [pos.coords.latitude, pos.coords.longitude];
            state.startName = 'My Current GPS Location';
            el.startInput.value = state.startName;
            map.flyTo(state.startCoords, 16);
            calculateAndRenderRoute();
            showToast('📍 GPS Location detected!', 'success');
          },
          (err) => {
            showToast('⚠️ Could not access GPS. Using preset center point.', 'warning');
          }
        );
      }
    });

    // Toggle Steps Drawer
    el.toggleStepsBtn.addEventListener('click', () => {
      const isHidden = el.stepsListContainer.classList.contains('hidden');
      if (isHidden) {
        el.stepsListContainer.classList.remove('hidden');
        el.stepsChevron.classList.add('rotate-180');
      } else {
        el.stepsListContainer.classList.add('hidden');
        el.stepsChevron.classList.remove('rotate-180');
      }
    });

    // Start / Stop Navigation Trip
    el.startNavigationBtn.addEventListener('click', () => {
      if (state.isNavigating) {
        stopTurnByTurnNavigation();
      } else {
        startTurnByTurnNavigation();
      }
    });

    el.stopNavBtn.addEventListener('click', stopTurnByTurnNavigation);

    // Toggle Live Simulation Stream
    el.toggleSimulationBtn.addEventListener('click', () => {
      state.isSimulatingLive = !state.isSimulatingLive;
      if (state.isSimulatingLive) {
        el.simStatusText.textContent = 'ACTIVE';
        el.toggleSimulationBtn.className = 'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition-all shadow-sm';
        showToast('🟢 Live Stream Resumed: Telemetry feed active.', 'success');
      } else {
        el.simStatusText.textContent = 'PAUSED';
        el.toggleSimulationBtn.className = 'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750 transition-all';
        showToast('⏸️ Live Stream Paused.', 'info');
      }
    });

    // Compare 6 Modes Modal
    el.openCompareBtn.addEventListener('click', openCompareModal);
    el.closeCompareModalBtn.addEventListener('click', () => el.compareModal.close());

    // High Contrast Accessibility Mode (WCAG AAA)
    el.toggleContrastBtn.addEventListener('click', () => {
      state.isHighContrast = !state.isHighContrast;
      if (state.isHighContrast) {
        document.body.classList.add('high-contrast');
        showToast('👁️ High Contrast WCAG AAA mode enabled!', 'info');
      } else {
        document.body.classList.remove('high-contrast');
        showToast('Normal contrast restored.', 'info');
      }
    });

    // Voice Guidance Audio Toggle
    el.toggleVoiceBtn.addEventListener('click', () => {
      state.isVoiceEnabled = !state.isVoiceEnabled;
      if (state.isVoiceEnabled) {
        el.voiceIcon.className = 'fa-solid fa-volume-high text-emerald-400';
        showToast('🔊 Turn-by-turn Voice Guidance ENABLED.', 'success');
        speakGuidance('Voice guidance enabled.');
      } else {
        el.voiceIcon.className = 'fa-solid fa-volume-xmark text-slate-500';
        showToast('🔇 Voice Guidance MUTED.', 'info');
      }
    });

    // Report Hazard Modal Open / Close
    el.openReportModalBtn.addEventListener('click', () => openReportModal());
    el.closeReportModalBtn.addEventListener('click', () => el.reportModal.close());
    el.cancelReportBtn.addEventListener('click', () => el.reportModal.close());
    el.submitReportBtn.addEventListener('click', submitHazardReport);

    // Hazard type selector buttons in modal
    el.hazardTypeGrid.querySelectorAll('.hazard-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        el.hazardTypeGrid.querySelectorAll('.hazard-type-btn').forEach(b => b.classList.remove('active', 'border-blue-500', 'bg-blue-500/20'));
        btn.classList.add('active', 'border-blue-500', 'bg-blue-500/20');
        state.selectedHazardType = btn.getAttribute('data-type');
      });
    });

    // Map Overlays Checkboxes
    el.layerTraffic.addEventListener('change', (e) => {
      state.overlays.traffic = e.target.checked;
      if (e.target.checked) map.addLayer(trafficLayer);
      else map.removeLayer(trafficLayer);
    });

    el.layerRallies.addEventListener('change', (e) => {
      state.overlays.rallies = e.target.checked;
      if (e.target.checked) map.addLayer(ralliesLayer);
      else map.removeLayer(ralliesLayer);
    });

    el.layerRamps.addEventListener('change', (e) => {
      state.overlays.ramps = e.target.checked;
      if (e.target.checked) map.addLayer(rampsLayer);
      else map.removeLayer(rampsLayer);
    });

    el.layerHazards.addEventListener('change', (e) => {
      state.overlays.hazards = e.target.checked;
      if (e.target.checked) map.addLayer(hazardsLayer);
      else map.removeLayer(hazardsLayer);
    });
  }

  // Switch Active Mode
  function setActiveMode(modeKey) {
    if (!MODES_CONFIG[modeKey]) return;
    state.activeMode = modeKey;

    // Update active class on chips
    el.modesContainer.querySelectorAll('.mode-chip').forEach(chip => {
      if (chip.getAttribute('data-mode') === modeKey) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    calculateAndRenderRoute();
    showToast(`⚡ Switched to ${MODES_CONFIG[modeKey].name}`, 'info');
    speakGuidance(`Mode changed to ${MODES_CONFIG[modeKey].name}`);
  }

  // Map Click Handler
  let isSelectingPinForReport = false;
  function onMapClick(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    if (isSelectingPinForReport) {
      isSelectingPinForReport = false;
      openReportModal(lat, lng);
      return;
    }

    // If destination not set or Alt key pressed, set destination
    if (e.originalEvent.altKey || !state.destCoords) {
      state.destCoords = [lat, lng];
      state.destName = `Pinned Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      el.destInput.value = state.destName;
      showToast('📍 Destination pinned on map!', 'info');
    } else {
      // Set Start or ask
      state.startCoords = [lat, lng];
      state.startName = `Pinned Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      el.startInput.value = state.startName;
      showToast('🟢 Starting location updated!', 'info');
    }

    calculateAndRenderRoute();
  }

  // "Select on Map" button inside report modal
  el.pinOnMapBtn.addEventListener('click', () => {
    isSelectingPinForReport = true;
    el.reportModal.close();
    showToast('👇 Click anywhere on the map to place the problem marker!', 'warning');
  });

  // Haversine Distance helper
  function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Floating Toast Notification
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'glass-panel px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs text-slate-100 border toast-enter pointer-events-auto max-w-sm';

    let icon = 'fa-info-circle text-blue-400';
    if (type === 'success') icon = 'fa-circle-check text-emerald-400';
    if (type === 'warning') icon = 'fa-triangle-exclamation text-amber-400';
    if (type === 'danger') icon = 'fa-circle-xmark text-red-400';

    toast.innerHTML = `
      <i class="fa-solid ${icon} text-sm"></i>
      <span class="flex-1 font-medium">${message}</span>
    `;

    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // Kickstart on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

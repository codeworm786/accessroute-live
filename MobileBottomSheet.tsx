import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, 
  ChevronDown, AlertTriangle, 
  X, Check
} from 'lucide-react';
import { Place, RouteResult, MobilityProfileCode } from '../../types';

export type SheetSnapState = 'COLLAPSED' | 'HALF' | 'FULL';

interface MobileBottomSheetProps {
  selectedPlace: Place | null;
  routes: RouteResult[];
  selectedRouteId: string | null;
  onSelectRouteId: (id: string) => void;
  onCalculateRoute: (place: Place) => void;
  onStartNavigation: () => void;
  onClearSelection: () => void;
  activeProfile: MobilityProfileCode | null;
  onSelectProfile: (p: MobilityProfileCode) => void;
  onOpenReportModal: () => void;
  onOpenSavedPlaces: () => void;
  isCalculatingRoutes: boolean;
  highContrast: boolean;
  isNavigating: boolean;
}

const PROFILE_OPTIONS: Array<{
  id: MobilityProfileCode;
  label: string;
  icon: string;
  desc: string;
}> = [
  { id: 'wheelchair', label: 'Wheelchair', icon: '🦽', desc: 'Step-free paths, ADA ramps, max 5% slope' },
  { id: 'vision', label: 'Visual Assist', icon: '👁️', desc: 'Tactile paving, voice guidance, audio beacons' },
  { id: 'pram_elderly', label: 'Pram / Walker', icon: '👶', desc: 'Gentle curb ramps, wide pavements, no stairs' },
  { id: 'walking', label: 'Walking', icon: '🚶', desc: 'Standard pedestrian sidewalks & crossings' },
  { id: 'bicycle', label: 'Bicycle', icon: '🚲', desc: 'Designated bike lanes & smooth paved paths' },
  { id: 'scooter', label: 'Scooter', icon: '🛴', desc: 'Low curb drops & paved pathways' },
];

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  selectedPlace,
  routes,
  selectedRouteId,
  onSelectRouteId,
  onCalculateRoute,
  onStartNavigation,
  onClearSelection,
  activeProfile,
  onSelectProfile,
  onOpenReportModal,
  onOpenSavedPlaces,
  isCalculatingRoutes,
  highContrast,
  isNavigating,
}) => {
  const [snapState, setSnapState] = useState<SheetSnapState>('COLLAPSED');
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [isWarningExpanded, setIsWarningExpanded] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // When a new place or route is selected, auto-snap to HALF for user clarity
  useEffect(() => {
    if (selectedPlace || routes.length > 0) {
      setSnapState('HALF');
    } else {
      setSnapState('COLLAPSED');
    }
  }, [selectedPlace, routes.length]);

  if (isNavigating) return null;

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0] || null;
  const currentProfile = activeProfile
    ? PROFILE_OPTIONS.find((p) => p.id === activeProfile) || PROFILE_OPTIONS[0]
    : { id: 'wheelchair' as MobilityProfileCode, label: 'Choose Profile', icon: '♿', desc: 'Select your mobility preference' };

  // Touch drag handlers for natural mobile bottom sheet sliding
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;

    if (diff > 50) {
      if (snapState === 'COLLAPSED') setSnapState('HALF');
      else if (snapState === 'HALF') setSnapState('FULL');
    } else if (diff < -50) {
      if (snapState === 'FULL') setSnapState('HALF');
      else if (snapState === 'HALF') setSnapState('COLLAPSED');
    }
    setTouchStartY(null);
  };

  const getSheetHeightClass = () => {
    switch (snapState) {
      case 'COLLAPSED':
        return 'max-h-[96px]';
      case 'HALF':
        return 'max-h-[46vh]';
      case 'FULL':
        return 'max-h-[85vh]';
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden flex flex-col transition-all duration-300 ease-out safe-bottom rounded-t-3xl border-t shadow-2xl pointer-events-auto ${getSheetHeightClass()} ${
        highContrast
          ? 'bg-black text-yellow-300 border-yellow-400'
          : 'bg-slate-900/98 backdrop-blur-xl text-white border-slate-800'
      }`}
      role="region"
      aria-label="Mobile Navigation Sheet"
    >
      {/* 1. Drag Handle & Sheet Header */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (snapState === 'COLLAPSED') setSnapState('HALF');
          else if (snapState === 'FULL') setSnapState('HALF');
        }}
        className="w-full flex flex-col items-center pt-2.5 pb-2 cursor-grab active:cursor-grabbing select-none shrink-0"
      >
        <div className="w-12 h-1.5 rounded-full bg-slate-600 hover:bg-slate-500 transition-colors" />
      </div>

      {/* 2. Sheet Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {/* CASE A: ROUTES COMPUTED -> SHOW COMPACT BEST ROUTE SUMMARY */}
        {routes.length > 0 && activeRoute ? (
          <div className="space-y-3 animate-fade-in">
            {/* Top Stats Row */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Best Accessible Route
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-white">
                    {activeRoute.duration_minutes} min
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    ({(activeRoute.distance_meters / 1000).toFixed(1)} km)
                  </span>
                </div>
              </div>

              {/* Profile Badge Button (tap to switch) */}
              <button
                onClick={() => setShowProfileDrawer((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 active:scale-95 cursor-pointer"
              >
                <span>{currentProfile.icon}</span>
                <span>{currentProfile.label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Step-Free Accessibility Pills */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Step-free verified</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-700 text-blue-300 font-semibold">
                <Check className="w-3.5 h-3.5 text-blue-400" />
                <span>Avoids stairs</span>
              </span>
              {activeRoute.accessibility_breakdown?.ramps_count > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-700 text-purple-300 font-semibold">
                  <span>{activeRoute.accessibility_breakdown.ramps_count} ADA ramps</span>
                </span>
              )}
            </div>

            {/* Primary Action Button: Start Navigation */}
            <button
              onClick={onStartNavigation}
              className="w-full py-3.5 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/20 active:scale-98 transition flex items-center justify-center gap-2 touch-target-48 cursor-pointer"
            >
              <Navigation className="w-4 h-4 fill-current" />
              <span>Start Navigation</span>
            </button>

            {/* Alternative Routes & Turn Maneuvers when expanded */}
            {snapState !== 'COLLAPSED' && (
              <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
                {routes.length > 1 && (
                  <div>
                    <span className="text-xs font-bold text-slate-400 block mb-1.5">
                      Alternative Routes ({routes.length})
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {routes.map((r, idx) => (
                        <button
                          key={r.id}
                          onClick={() => onSelectRouteId(r.id)}
                          className={`p-2 rounded-xl border text-left text-xs transition cursor-pointer ${
                            r.id === selectedRouteId
                              ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 font-bold'
                              : 'bg-slate-800/60 border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="truncate">{`Route Option ${idx + 1}`}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {r.duration_minutes} min • {(r.distance_meters / 1000).toFixed(1)} km
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Maneuver Steps Preview */}
                {activeRoute.steps && activeRoute.steps.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-slate-400 block mb-1.5">
                      Route Maneuvers ({activeRoute.steps.length} turns)
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {activeRoute.steps.slice(0, 5).map((step, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2 rounded-xl bg-slate-800/40 border border-slate-800 text-xs flex items-center gap-2 text-slate-300"
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {sIdx + 1}
                          </span>
                          <span className="truncate flex-1">{step.instruction}</span>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {step.distance_meters}m
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : selectedPlace ? (
          /* CASE B: DESTINATION SELECTED -> SHOW COMPACT DESTINATION CARD */
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm text-white truncate">
                    {selectedPlace.name}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {selectedPlace.address}
                  </p>
                </div>
              </div>

              <button
                onClick={onClearSelection}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800 shrink-0 cursor-pointer"
                aria-label="Clear selected destination"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Collapsible Accessibility Warning / Audit Status */}
            <div className="rounded-xl bg-slate-800/60 border border-slate-700/80 p-2.5">
              <button
                onClick={() => setIsWarningExpanded((prev) => !prev)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    {selectedPlace.accessibility?.details?.toLowerCase().includes('unavailable')
                      ? 'Accessibility information unavailable'
                      : 'Verified accessible infrastructure'}
                  </span>
                </div>
              </button>

              {isWarningExpanded && (
                <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-300 space-y-1">
                  <p className="text-[11px] leading-relaxed">
                    {selectedPlace.accessibility?.details ||
                      'Standard pedestrian path data will be used. Verified ADA ramps will be prioritized where data exists.'}
                  </p>
                </div>
              )}
            </div>

            {/* Compact Profile Selector Pill */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xs font-medium text-slate-400">Mobility Profile</span>
              <button
                onClick={() => setShowProfileDrawer((prev) => !prev)}
                className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 active:scale-95 cursor-pointer"
              >
                <span>{currentProfile.icon}</span>
                <span>{currentProfile.label}</span>
                <ChevronDown className="w-3 h-3 text-cyan-400" />
              </button>
            </div>

            {/* Primary Action Button: Calculate Accessible Route */}
            <button
              onClick={() => onCalculateRoute(selectedPlace)}
              disabled={isCalculatingRoutes}
              className="w-full py-3.5 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/20 active:scale-98 transition flex items-center justify-center gap-2 touch-target-48 cursor-pointer"
            >
              {isCalculatingRoutes ? (
                <span>Calculating accessible route...</span>
              ) : (
                <>
                  <Navigation className="w-4 h-4 fill-current" />
                  <span>Find Accessible Route</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* CASE C: DEFAULT HOMESCREEN STATE -> CLEAN FRESH APP PEEK */
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">
                  Choose a destination to find an accessible route
                </span>
              </div>

              {/* Compact Profile Indicator */}
              <button
                onClick={() => setShowProfileDrawer((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-300 active:scale-95 cursor-pointer"
              >
                <span>{currentProfile.icon}</span>
                <span>{currentProfile.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Quick Action Buttons (Saved Places, Report) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={onOpenSavedPlaces}
                className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-left flex items-center gap-2 text-xs font-semibold text-slate-200 active:scale-98 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">Saved Places</span>
              </button>

              <button
                onClick={onOpenReportModal}
                className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-left flex items-center gap-2 text-xs font-semibold text-slate-200 active:scale-98 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Report Issue</span>
              </button>
            </div>
          </div>
        )}

        {/* PROGRESSIVE DISCLOSURE: MOBILITY PROFILE SELECTION DRAWER */}
        {showProfileDrawer && (
          <div className="pt-3 border-t border-slate-800 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                How will you be travelling?
              </span>
              <button
                onClick={() => setShowProfileDrawer(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {PROFILE_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProfile(p.id);
                    setShowProfileDrawer(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                    activeProfile === p.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 font-bold'
                      : 'bg-slate-800/50 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{p.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-none">{p.label}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.desc}</div>
                    </div>
                  </div>
                  {activeProfile === p.id && (
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

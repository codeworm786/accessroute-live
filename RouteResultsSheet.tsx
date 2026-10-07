import React, { useState } from 'react';
import { 
  Navigation, ShieldCheck, CheckCircle2, AlertTriangle, 
  Sparkles, X, Check, ChevronUp, ChevronDown, Info, Footprints 
} from 'lucide-react';
import { RouteResult, MobilityProfileCode } from '../../types';

interface RouteResultsSheetProps {
  routes: RouteResult[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  onStartNavigation: () => void;
  onClose: () => void;
  profile: MobilityProfileCode;
  destinationName: string;
  highContrast: boolean;
}

export const RouteResultsSheet: React.FC<RouteResultsSheetProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  onStartNavigation,
  onClose,
  profile,
  destinationName,
  highContrast,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  if (!activeRoute) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 max-w-xl mx-auto rounded-t-3xl border-t border-x p-4 sm:p-5 card-shadow-floating safe-bottom transition-all duration-300 ease-in-out ${
        highContrast
          ? 'bg-black text-yellow-300 border-yellow-400'
          : 'bg-white/95 backdrop-blur-lg text-slate-900 border-slate-200'
      }`}
      role="region"
      aria-label="Accessible Route Results and Navigation Sheet"
    >
      {/* Mobile Drag / Expand Handle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center py-1 -mt-2 mb-1 text-slate-400 hover:text-slate-600 transition touch-target-48 cursor-pointer"
        aria-label={isExpanded ? 'Collapse route details' : 'Expand route details'}
      >
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-1"></div>
      </button>

      {/* Header: Destination & Close */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="min-w-0 pr-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Destination Route ({routes.length} options available)
          </span>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
            {destinationName}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition active:scale-95 touch-target-48 cursor-pointer"
            title={isExpanded ? 'Collapse details' : 'View alternatives & details'}
            aria-label={isExpanded ? 'Collapse details' : 'View alternatives & details'}
          >
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95 touch-target-48 cursor-pointer"
            aria-label="Close route sheet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Primary Route Summary Hero Card (Green Accessibility Accents) */}
      <div className="flex flex-col gap-2.5 pt-2">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono-nums text-slate-900">
              {activeRoute.duration_minutes} min
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono-nums">
              ({activeRoute.distance_km} km)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{Math.round(activeRoute.accessibility_score)}/100 Score</span>
            </span>
          </div>
        </div>

        {/* Quick Accessibility Assurance Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {activeRoute.is_step_free ? (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Step-Free
            </span>
          ) : (
            <span className="text-xs font-bold text-red-800 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Contains Stairs
            </span>
          )}

          <span className="text-xs font-semibold text-emerald-900 bg-emerald-50/80 px-2.5 py-0.5 rounded-lg border border-emerald-200">
            ♿ {activeRoute.accessibility_breakdown.ramps_count} Verified Ramps
          </span>

          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
            Slope &lt; {activeRoute.accessibility_breakdown.max_slope_percent}%
          </span>
        </div>

        {activeRoute.tradeoff_warning && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{activeRoute.tradeoff_warning}</span>
          </div>
        )}
      </div>

      {/* Expanded Section: Route Alternatives & Telemetry */}
      {isExpanded && (
        <div className="flex flex-col gap-3.5 pt-3 border-t border-slate-100 mt-2 max-h-[48vh] overflow-y-auto pr-1 animate-fade-in">
          {/* Alternative Route Choices */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Select Alternate Corridors
            </span>
            {routes.map((rt) => {
              const isSelected = rt.id === activeRoute.id;

              return (
                <button
                  key={rt.id}
                  onClick={() => onSelectRoute(rt.id)}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition active:scale-98 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 text-blue-950 ring-2 ring-blue-500/30'
                      : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: rt.is_step_free ? '#16A34A' : '#2563EB' }}
                      />
                      <span className="font-extrabold text-xs text-slate-900">{rt.title}</span>
                    </div>
                    {rt.is_recommended && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        RECOMMENDED
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-extrabold font-mono-nums text-slate-900">
                      {rt.duration_minutes} min <span className="text-xs font-semibold text-slate-500 font-mono-nums">({rt.distance_km} km)</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {Math.round(rt.accessibility_score)}/100 Score
                    </span>
                  </div>

                  {rt.tradeoff_warning && (
                    <p className="text-[11px] text-amber-800 font-medium bg-amber-50 px-2 py-1 rounded-lg">
                      {rt.tradeoff_warning}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Telemetry Breakdown Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Why This Route? (Accessibility Telemetry)</span>
              </span>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {activeRoute.accessibility_breakdown.confidence_level} CONFIDENCE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Verified Ramps:</span>
                <span className="font-extrabold text-emerald-700 font-mono-nums">
                  {activeRoute.accessibility_breakdown.ramps_count}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Stairs / Steps:</span>
                <span
                  className={`font-extrabold font-mono-nums ${
                    activeRoute.accessibility_breakdown.stairs_count === 0
                      ? 'text-emerald-700'
                      : 'text-red-600'
                  }`}
                >
                  {activeRoute.accessibility_breakdown.stairs_count}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Max Incline:</span>
                <span className="font-extrabold text-slate-800 font-mono-nums">
                  {activeRoute.accessibility_breakdown.max_slope_percent}%
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Tactile Paved:</span>
                <span className="font-extrabold text-blue-700 font-mono-nums">
                  {activeRoute.accessibility_breakdown.tactile_paved_pct}%
                </span>
              </div>
            </div>

            {/* Confidence Reasons */}
            <div className="flex flex-col gap-1 text-[11px] text-slate-700 pt-1 border-t border-slate-200">
              {activeRoute.accessibility_breakdown.confidence_reasons.map((r, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Turn-by-Turn Maneuvers Preview */}
          {activeRoute.steps && activeRoute.steps.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Turn-by-Turn Maneuvers ({activeRoute.steps.length} steps)
              </span>
              <div className="flex flex-col gap-1.5">
                {activeRoute.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 text-xs"
                  >
                    <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-black text-[11px]">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-slate-900 leading-snug">{step.instruction}</div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono-nums">
                        <span>{step.distance_meters} m</span>
                        {step.street_name && (
                          <span className="text-slate-400 font-sans truncate">• {step.street_name}</span>
                        )}
                      </div>
                      {step.accessibility_note && (
                        <div className="mt-1 text-[11px] text-emerald-700 font-medium">
                          {step.accessibility_note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Start Navigation Master CTA (Primary Blue #2563EB) */}
      <div className="pt-3">
        <button
          onClick={onStartNavigation}
          className="w-full py-4 px-5 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg shadow-blue-600/25 transition active:scale-98 touch-target-48 cursor-pointer"
          aria-label={`Start accessible navigation to ${destinationName}`}
        >
          <Navigation className="w-5 h-5 transform rotate-45" />
          <span>START ACCESSIBLE NAVIGATION</span>
        </button>
      </div>
    </div>
  );
};

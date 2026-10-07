import React, { useState } from 'react';
import { 
  Compass, Eye, Layers, ShieldAlert, Accessibility, 
  AlertOctagon, Plus, Minus, X, Sparkles, Check 
} from 'lucide-react';
import { MapLayerConfig } from '../../types';

interface MapControlsProps {
  layers: MapLayerConfig;
  onToggleLayer: (layer: keyof MapLayerConfig) => void;
  onRecenter: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onOpenScreenReaderTable: () => void;
  highContrast: boolean;
  isNavigating: boolean;
}

export const MapControls: React.FC<MapControlsProps> = ({
  layers,
  onToggleLayer,
  onRecenter,
  onZoomIn,
  onZoomOut,
  onOpenScreenReaderTable,
  highContrast,
  isNavigating,
}) => {
  const [showLayerDrawer, setShowLayerDrawer] = useState(false);

  if (isNavigating) return null;

  return (
    <div className="absolute right-3 sm:right-4 bottom-28 sm:bottom-32 flex flex-col items-end gap-2.5 z-30 pointer-events-auto">
      {/* Map Layers Progressive Drawer Modal */}
      {showLayerDrawer && (
        <div
          className={`rounded-3xl p-4 border card-shadow-floating w-64 flex flex-col gap-3 mb-2 animate-fade-in ${
            highContrast
              ? 'bg-black text-yellow-300 border-yellow-400'
              : 'bg-white text-slate-900 border-slate-200'
          }`}
          role="dialog"
          aria-label="Map Layer Settings"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-extrabold text-xs tracking-tight flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Map Layers</span>
            </span>
            <button
              onClick={() => setShowLayerDrawer(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Close layers menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* Verified ADA Ramps Layer */}
            <button
              onClick={() => onToggleLayer('showRamps')}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                layers.showRamps
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Accessibility className="w-4 h-4 text-emerald-600" />
                <span className="text-xs">ADA Ramps</span>
              </div>
              {layers.showRamps && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>

            {/* Community Barriers Layer */}
            <button
              onClick={() => onToggleLayer('showHazards')}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                layers.showHazards
                  ? 'bg-red-50 border-red-500 text-red-950 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span className="text-xs">Barriers & Hazards</span>
              </div>
              {layers.showHazards && <Check className="w-3.5 h-3.5 text-red-600" />}
            </button>

            {/* Civic Gatherings Layer */}
            <button
              onClick={() => onToggleLayer('showEvents')}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                layers.showEvents
                  ? 'bg-purple-50 border-purple-500 text-purple-950 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-purple-600" />
                <span className="text-xs">Civic Rallies</span>
              </div>
              {layers.showEvents && <Check className="w-3.5 h-3.5 text-purple-600" />}
            </button>
          </div>
        </div>
      )}

      {/* Screen Reader Directions Table View (Desktop) */}
      <button
        onClick={onOpenScreenReaderTable}
        className={`hidden sm:flex w-11 h-11 rounded-2xl items-center justify-center border transition card-shadow-md touch-target-48 cursor-pointer active:scale-95 ${
          highContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
        title="Open Accessible Directions Table (Screen Reader view)"
        aria-label="Open Accessible Directions Table"
      >
        <Eye className="w-5 h-5" />
      </button>

      {/* Map Layers Drawer Toggle Button (Desktop) */}
      <button
        onClick={() => setShowLayerDrawer(!showLayerDrawer)}
        className={`hidden sm:flex w-11 h-11 rounded-2xl items-center justify-center border transition card-shadow-md touch-target-48 cursor-pointer active:scale-95 ${
          showLayerDrawer
            ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
            : highContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
        title="Configure Map Layers"
        aria-label="Configure Map Layers"
      >
        <Layers className="w-5 h-5" />
      </button>

      {/* Recenter My GPS Location (Essential on mobile & desktop, 48px touch target) */}
      <button
        onClick={onRecenter}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition shadow-lg touch-target-48 cursor-pointer active:scale-95 ${
          highContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 shadow-cyan-500/30'
        }`}
        title="Recenter to my location"
        aria-label="Recenter to my location"
      >
        <Compass className="w-6 h-6" />
      </button>
    </div>
  );
};

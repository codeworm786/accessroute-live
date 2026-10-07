import React, { useState } from 'react';
import { 
  Bookmark, MapPin, X, Navigation, 
  CheckCircle2, Clock, Star, Trash2 
} from 'lucide-react';
import { Place } from '../../types';

interface SavedPlacesModalProps {
  onClose: () => void;
  onSelectPlace: (place: Place) => void;
  savedPlaces: Place[];
  recentTrips: Place[];
  onRemoveSavedPlace?: (id: string) => void;
  highContrast: boolean;
}

export const SavedPlacesModal: React.FC<SavedPlacesModalProps> = ({
  onClose,
  onSelectPlace,
  savedPlaces,
  recentTrips,
  onRemoveSavedPlace,
  highContrast,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'recent'>('saved');

  const activeList = activeTab === 'saved' ? savedPlaces : recentTrips;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-places-title"
    >
      <div
        className={`w-full max-w-lg rounded-3xl p-5 sm:p-6 card-shadow-floating border flex flex-col gap-4 max-h-[85vh] overflow-y-auto ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 id="saved-places-title" className="text-base sm:text-lg font-extrabold tracking-tight">
                My Places & Recent Trips
              </h2>
              <p className="text-xs text-slate-500 font-medium">1-click accessible route planning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95 touch-target-48 cursor-pointer"
            aria-label="Close saved places dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'saved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Saved Places {savedPlaces.length > 0 && `(${savedPlaces.length})`}</span>
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'recent' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Recent Trips {recentTrips.length > 0 && `(${recentTrips.length})`}</span>
          </button>
        </div>

        {/* Places List / Empty States */}
        <div className="flex flex-col gap-2 pt-1 min-h-[140px] justify-center">
          {activeList.length > 0 ? (
            activeList.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-400 text-left flex items-center justify-between gap-3 transition group"
              >
                <button
                  type="button"
                  onClick={() => { onSelectPlace(p); onClose(); }}
                  className="flex items-start gap-3 min-w-0 flex-1 text-left cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-slate-900 truncate">{p.name}</div>
                    <div className="text-xs text-slate-500 truncate">{p.address}</div>
                    {p.accessibility?.has_ramp && (
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified ADA Ramp</span>
                      </div>
                    )}
                  </div>
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => { onSelectPlace(p); onClose(); }}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white transition cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Route</span>
                  </button>
                  {activeTab === 'saved' && onRemoveSavedPlace && (
                    <button
                      type="button"
                      onClick={() => onRemoveSavedPlace(p.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Remove saved place"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 px-4 text-center flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                {activeTab === 'saved' ? <Bookmark className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
              </div>
              <p className="font-bold text-sm text-slate-800">
                {activeTab === 'saved'
                  ? 'Your saved places will appear here.'
                  : 'Your recent trips will appear here after you navigate.'}
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                {activeTab === 'saved'
                  ? 'Search for destinations and save frequently visited places for fast step-free route planning.'
                  : 'Routes you calculate and navigate will be saved here for easy one-tap access.'}
              </p>
            </div>
          )}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-md transition active:scale-98 touch-target-48 cursor-pointer mt-1"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  Check, X 
} from 'lucide-react';
import { MobilityProfileCode } from '../../types';
import { saveProfileToStorage } from '../../utils/storage';

interface MobilityProfileSelectorProps {
  selectedProfile: MobilityProfileCode | null;
  onSelectProfile: (profile: MobilityProfileCode) => void;
  onClose?: () => void;
  highContrast?: boolean;
}

interface ProfileDefinition {
  code: MobilityProfileCode;
  title: string;
  icon: string;
  badge: string;
  badgeColor: string;
  description: string;
  keyFeatures: string[];
}

const PROFILES: ProfileDefinition[] = [
  {
    code: 'wheelchair',
    title: 'Wheelchair / Mobility Aid',
    icon: '🦽',
    badge: '100% Step-Free',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Finds routes with zero stairs, verified ADA ramps, operational station elevators, and inclines strictly under 5%.',
    keyFeatures: ['Avoids stairs & escalators', 'Certified ramps & lifts', 'Gentle slope (<5%)'],
  },
  {
    code: 'vision',
    title: 'Visual Assistance',
    icon: '👁️',
    badge: 'Spoken + Tactile',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Prioritizes continuous tactile guiding paving, detailed spoken street names, audio chime landmarks, and barrier alerts.',
    keyFeatures: ['Continuous tactile paving', 'Detailed voice cues', 'Hazard alerts'],
  },
  {
    code: 'pram_elderly',
    title: 'Pram / Stroller / Elder-Friendly',
    icon: '👶',
    badge: 'Smooth Low-Gradient',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    description: 'Curates smooth walking corridors with gentle inclines, step-free curb cuts, safe pedestrian crossings, and no cracked footpaths.',
    keyFeatures: ['No stairs / step-free', 'Gentle gradients', 'Safer road crossings'],
  },
  {
    code: 'walking',
    title: 'Walking Pedestrian',
    icon: '🚶',
    badge: 'Pedestrian Sidewalks',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Standard pedestrian paths through municipal sidewalks, public walkways, parks, and designated pedestrian crossings.',
    keyFeatures: ['Sidewalks & walkways', 'Direct crossings', 'Pedestrian plazas'],
  },
  {
    code: 'bicycle',
    title: 'Bicycle Commute',
    icon: '🚲',
    badge: 'Cycle Infrastructure',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    description: 'Routes along dedicated cycle tracks, shared low-traffic residential roads, avoiding stairs and hazardous road surfaces.',
    keyFeatures: ['Cycle tracks', 'Low vehicular traffic', 'Avoids steep climbs'],
  },
  {
    code: 'scooter',
    title: 'Two-Wheeler / Scooter',
    icon: '🛴',
    badge: 'Smooth Paved Street',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Fast transit corridors prioritizing smooth paved surfaces, avoiding pedestrian-only zones and impassable barricades.',
    keyFeatures: ['Paved street paths', 'Avoids stairs', 'Fastest travel time'],
  },
];

export const MobilityProfileSelector: React.FC<MobilityProfileSelectorProps> = ({
  selectedProfile,
  onSelectProfile,
  onClose,
  highContrast,
}) => {
  const handleSelect = (code: MobilityProfileCode) => {
    saveProfileToStorage(code);
    onSelectProfile(code);
    if (onClose) onClose();
  };

  return (
    <div
      className={`rounded-3xl p-4 sm:p-5 border flex flex-col gap-4 card-shadow-lg transition-all ${
        highContrast
          ? 'bg-black text-yellow-300 border-yellow-400'
          : 'bg-white text-slate-900 border-slate-200'
      }`}
      role="region"
      aria-label="Accessibility Profile Selector"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight flex items-center gap-2">
            <span>How will you be travelling?</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Choose your mobility profile to personalize accessible routing and step-free guidance
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95 touch-target-48 cursor-pointer"
            aria-label="Close profile selector"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
        {PROFILES.map((p) => {
          const isSelected = selectedProfile === p.code;

          return (
            <button
              key={p.code}
              onClick={() => handleSelect(p.code)}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2.5 transition-all duration-150 cursor-pointer active:scale-98 ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 text-blue-950 ring-2 ring-blue-500/30 shadow-xs'
                  : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-800'
              }`}
              aria-pressed={isSelected}
              aria-label={`${p.title} profile. ${p.description}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl shrink-0">{p.icon}</span>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                      {p.title}
                    </h4>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.2 rounded-full border mt-0.5 ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-300 text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                {p.description}
              </p>

              <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-200/70">
                {p.keyFeatures.map((feat, i) => (
                  <span
                    key={i}
                    className="text-[10px] text-slate-600 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

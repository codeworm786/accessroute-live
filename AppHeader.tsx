import React from 'react';
import { Menu, Settings, MapPin, Navigation, Search } from 'lucide-react';
import { MobilityProfileCode } from '../../types';

interface AppHeaderProps {
  onToggleMenu: () => void;
  locationLabel?: string;
  isLocating?: boolean;
  locationStatus?: 'IDLE' | 'REQUESTING' | 'GRANTED' | 'DENIED' | 'UNAVAILABLE' | 'ERROR';
  onRecenterLocation?: () => void;
  activeProfile: MobilityProfileCode | null;
  onOpenProfileSelector: () => void;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
  highContrast: boolean;
  isNavigating: boolean;
}

const PROFILE_LABELS: Record<MobilityProfileCode, { label: string; icon: string }> = {
  wheelchair: { label: 'Wheelchair', icon: '🦽' },
  vision: { label: 'Visual Assist', icon: '👁️' },
  pram_elderly: { label: 'Pram / Walker', icon: '👶' },
  walking: { label: 'Walking', icon: '🚶' },
  bicycle: { label: 'Bicycle', icon: '🚲' },
  scooter: { label: 'Scooter', icon: '🛴' },
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleMenu,
  locationLabel,
  isLocating,
  locationStatus = 'IDLE',
  onRecenterLocation,
  activeProfile,
  onOpenProfileSelector,
  onOpenSettings,
  onOpenCommandPalette,
  highContrast,
  isNavigating,
}) => {
  if (isNavigating) return null;

  const currentProfileInfo = activeProfile && PROFILE_LABELS[activeProfile]
    ? PROFILE_LABELS[activeProfile]
    : { label: 'Choose Profile', icon: '♿' };

  let displayLocation = 'Enable location';
  if (isLocating || locationStatus === 'REQUESTING') {
    displayLocation = 'Locating...';
  } else if (locationStatus === 'GRANTED' && locationLabel) {
    displayLocation = locationLabel;
  } else if (locationStatus === 'DENIED') {
    displayLocation = 'Location disabled';
  } else if (locationStatus === 'UNAVAILABLE' || locationStatus === 'ERROR') {
    displayLocation = 'Location unavailable';
  }

  const isGpsActive = locationStatus === 'GRANTED';

  return (
    <header
      className={`absolute top-0 left-0 right-0 z-30 pointer-events-auto safe-top px-3 py-2 sm:px-4 sm:py-2.5 transition-colors duration-200 ${
        highContrast
          ? 'bg-black/95 text-yellow-300 border-b-2 border-yellow-400'
          : 'bg-slate-900/90 backdrop-blur-md text-white border-b border-slate-800/80 shadow-md'
      }`}
      role="banner"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Menu Trigger & Brand Name */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Menu Button */}
          <button
            onClick={onToggleMenu}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition active:scale-95 touch-target-48 cursor-pointer shrink-0 border border-slate-700"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm shrink-0">
              <Navigation className="w-4 h-4 text-white transform rotate-45" aria-hidden="true" />
            </div>
            <div className="min-w-0 hidden xs:block">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight truncate flex items-center gap-1.5 leading-tight">
                <span>AccessRoute</span>
                <span className="text-cyan-400 font-bold text-xs px-1.5 py-0.2 rounded-full bg-cyan-950/80 border border-cyan-800">
                  Live
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right Actions: Quick Search, Location, Profile, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Palette Search Shortcut (Desktop) */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/80 text-xs font-semibold transition active:scale-95 cursor-pointer"
            title="Open Command Search Palette (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <kbd className="text-[10px] font-mono text-slate-400">⌘K</kbd>
          </button>

          {/* Real Browser GPS Location Indicator */}
          <button
            type="button"
            onClick={onRecenterLocation}
            className={`hidden xs:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition active:scale-95 cursor-pointer max-w-[140px] sm:max-w-[200px] ${
              highContrast
                ? 'bg-black text-yellow-300 border-yellow-400 hover:bg-yellow-950/40'
                : isGpsActive
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700/80'
                : 'bg-amber-950/40 border-amber-700/60 text-amber-300 hover:bg-amber-900/50'
            }`}
            title={isGpsActive ? 'Centered on real GPS location' : 'Enable browser location'}
            aria-label={`Location status: ${displayLocation}. Tap to request GPS.`}
          >
            <MapPin
              className={`w-3.5 h-3.5 shrink-0 ${
                isLocating
                  ? 'text-amber-400 animate-pulse'
                  : isGpsActive
                  ? 'text-cyan-400'
                  : 'text-amber-400'
              }`}
              aria-hidden="true"
            />
            <span className="truncate">{displayLocation}</span>
          </button>

          {/* Profile Selector Pill */}
          <button
            onClick={onOpenProfileSelector}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition active:scale-95 touch-target-48 cursor-pointer ${
              activeProfile
                ? 'bg-blue-600/30 hover:bg-blue-600/50 border-blue-500/50 text-blue-200'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
            }`}
            title="Change accessibility profile"
            aria-label={`Current profile: ${currentProfileInfo.label}. Tap to choose profile.`}
          >
            <span>{currentProfileInfo.icon}</span>
            <span className="hidden md:inline truncate max-w-[100px] sm:max-w-none">{currentProfileInfo.label}</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition active:scale-95 touch-target-48 cursor-pointer"
            title="Open Accessibility Settings"
            aria-label="Open Accessibility Settings"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};

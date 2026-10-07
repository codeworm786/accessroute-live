
import React, { useEffect, useState } from 'react';
import { 
  Volume2, VolumeX, ArrowUp, ArrowLeft, ArrowRight, 
  CheckCircle2, X, ShieldAlert, RotateCcw, AlertTriangle, Sparkles 
} from 'lucide-react';
import { RouteResult } from '../../types';
import { voiceAssistant } from '../../services/voiceAssistant';

interface NavigationHUDProps {
  route: RouteResult;
  currentStepIndex: number;
  remainingDistance: number;
  remainingSeconds: number;
  onExitNavigation: () => void;
  onTriggerObstacleAlert: () => void;
  onOpenReportModal?: () => void;
  highContrast: boolean;
}

export const NavigationHUD: React.FC<NavigationHUDProps> = ({
  route,
  currentStepIndex,
  remainingDistance,
  remainingSeconds,
  onExitNavigation,
  onTriggerObstacleAlert,
  onOpenReportModal,
  highContrast,
}) => {
  const [isMuted, setIsMuted] = useState(voiceAssistant.getIsMuted());
  const currentStep = route.steps[currentStepIndex] || route.steps[0];

  // Announce step instruction on step change
  useEffect(() => {
    if (currentStep) {
      const prompt = `${currentStep.instruction}. ${currentStep.accessibility_note || ''}`;
      voiceAssistant.speak(prompt);
    }
  }, [currentStepIndex]);

  const handleToggleMute = () => {
    const muted = voiceAssistant.toggleMute();
    setIsMuted(muted);
  };

  const handleRepeatInstruction = () => {
    if (currentStep) {
      const prompt = `${currentStep.instruction}. ${currentStep.accessibility_note || ''}`;
      voiceAssistant.speak(prompt);
    }
  };

  const getManeuverIcon = (maneuver: string) => {
    switch (maneuver) {
      case 'turn-left':
        return <ArrowLeft className="w-10 h-10 text-white" />;
      case 'turn-right':
        return <ArrowRight className="w-10 h-10 text-white" />;
      case 'arrive':
        return <CheckCircle2 className="w-10 h-10 text-white" />;
      default:
        return <ArrowUp className="w-10 h-10 text-white" />;
    }
  };

  // Estimated Arrival Time calculation
  const etaDate = new Date(Date.now() + remainingSeconds * 1000);
  const etaFormatted = etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-3 sm:p-4 safe-top safe-bottom">
      {/* Top Banner: Big Upcoming Maneuver Direction */}
      <div
        className={`pointer-events-auto rounded-3xl p-4 sm:p-5 card-shadow-floating border flex items-center justify-between gap-3 max-w-xl mx-auto w-full transition-all duration-200 ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-slate-900 text-white border-slate-800 shadow-xl'
        }`}
        role="region"
        aria-live="assertive"
        aria-label="Upcoming turn direction"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 border border-blue-400/40 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
            {getManeuverIcon(currentStep.maneuver)}
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono-nums tracking-tight">
                {currentStep.distance_meters} m
              </span>
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-md font-bold text-slate-300 truncate max-w-[140px]">
                {currentStep.street_name}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-extrabold mt-0.5 leading-snug truncate">
              {currentStep.instruction}
            </h2>
            {currentStep.accessibility_note && (
              <p className="text-xs text-emerald-400 font-semibold mt-0.5 flex items-center gap-1 truncate">
                <span>✓ {currentStep.accessibility_note}</span>
              </p>
            )}
          </div>
        </div>

        {/* Exit & Mute Controls */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={onExitNavigation}
            className="w-10 h-10 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition active:scale-95 touch-target-48 cursor-pointer shadow-md"
            title="Exit navigation"
            aria-label="Exit navigation"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={handleToggleMute}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95 touch-target-48 cursor-pointer"
            title={isMuted ? 'Unmute voice' : 'Mute voice'}
            aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Middle Action: Simulate Dynamic Detour */}
      <div className="pointer-events-auto flex justify-center">
        <button
          onClick={onTriggerObstacleAlert}
          className="bg-white/95 hover:bg-white text-slate-800 text-xs font-extrabold px-4 py-2.5 rounded-full card-shadow-md border border-slate-200 flex items-center gap-2 transition active:scale-95 touch-target-48 cursor-pointer"
          title="Simulate obstacle on path and test automatic detour"
        >
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Test Dynamic Detour Recalculation</span>
        </button>
      </div>

      {/* Bottom Telemetry Card & Controls */}
      <div
        className={`pointer-events-auto rounded-3xl p-4 sm:p-5 card-shadow-floating border max-w-xl mx-auto w-full transition-all duration-200 flex items-center justify-between gap-3 ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-white/95 backdrop-blur-md text-slate-900 border-slate-200'
        }`}
      >
        <div className="flex items-baseline gap-3">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Remaining
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono-nums text-slate-900">
              {Math.ceil(remainingSeconds / 60)} min
            </div>
          </div>
          <div className="text-xs font-bold text-slate-500 font-mono-nums">
            {Math.round(remainingDistance)} m • ETA {etaFormatted}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRepeatInstruction}
            className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition active:scale-95 touch-target-48 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Repeat turn instruction"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Repeat</span>
          </button>

          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition active:scale-95 touch-target-48 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Report barrier at current location"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  X, Volume2, Shield, Eye, Moon, Sun, 
  Sparkles, Check, Play, RefreshCw, Accessibility, Mic 
} from 'lucide-react';
import { MobilityProfileCode } from '../../types';
import { voiceAssistant } from '../../services/voiceAssistant';

interface SettingsModalProps {
  onClose: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  activeProfile: MobilityProfileCode;
  onSelectProfile: (profile: MobilityProfileCode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  highContrast,
  onToggleHighContrast,
  activeProfile,
  onSelectProfile,
}) => {
  const [speechRate, setSpeechRate] = useState(voiceAssistant.getSpeechRate());
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const vList = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
        setVoices(vList);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const handleSpeechRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSpeechRate(val);
    voiceAssistant.setSpeechRate(val);
  };

  const handleTestVoice = () => {
    setIsTestingVoice(true);
    voiceAssistant.speak(
      'This is a test of your AccessRoute Live voice navigation guidance. Step-free route calculations are active.',
      {
        onComplete: () => setIsTestingVoice(false),
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Settings and Preferences"
    >
      <div
        className={`w-full max-w-lg rounded-3xl p-5 sm:p-6 border card-shadow-floating flex flex-col gap-4 max-h-[90vh] overflow-y-auto ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-white text-slate-900 border-slate-200 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-black text-base">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Settings & Voice Preferences</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95 touch-target-48"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Assistant Section */}
        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-purple-950 uppercase tracking-wider">
              <Volume2 className="w-4 h-4 text-purple-600" />
              <span>Voice Navigation Engine</span>
            </div>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
              Female / Natural Prefer
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">Speech Rate / Speed</div>
              <div className="text-[11px] text-slate-500 font-medium">Adjust pace of turn guidance</div>
            </div>
            <span className="text-xs font-black font-mono-nums bg-white px-2.5 py-1 rounded-xl border border-purple-200 text-purple-900">
              {speechRate.toFixed(1)}x
            </span>
          </div>

          <input
            type="range"
            min="0.7"
            max="1.5"
            step="0.1"
            value={speechRate}
            onChange={handleSpeechRateChange}
            className="w-full accent-purple-600 cursor-pointer h-2 bg-purple-200 rounded-lg"
          />

          <button
            type="button"
            onClick={handleTestVoice}
            disabled={isTestingVoice}
            className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-md shadow-purple-600/20"
          >
            {isTestingVoice ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isTestingVoice ? 'Speaking Test Prompt…' : 'Test Voice Guidance'}</span>
          </button>
        </div>

        {/* High Contrast & Visual Mode */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold text-xs">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">High Contrast Mode</div>
              <div className="text-[11px] text-slate-500 font-medium">Maximum contrast for low vision / glare</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleHighContrast}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              highContrast ? 'bg-yellow-400 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="bg-black w-4 h-4 rounded-full shadow-md" />
          </button>
        </div>

        {/* Close CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition active:scale-98 cursor-pointer shadow-md"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

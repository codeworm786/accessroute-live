import React from 'react';
import { AlertOctagon, X, PhoneCall, ShieldAlert, HeartHandshake } from 'lucide-react';

interface EmergencyConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  highContrast: boolean;
}

export const EmergencyConfirmationModal: React.FC<EmergencyConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  highContrast,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in pointer-events-auto"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="emergency-dialog-title"
      aria-describedby="emergency-dialog-desc"
    >
      <div
        className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl flex flex-col gap-4 ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-white text-slate-900 border-red-200 shadow-red-500/10'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h2 id="emergency-dialog-title" className="text-lg font-black text-slate-900 tracking-tight">
                Emergency Assistance
              </h2>
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                Confirmation Required
              </span>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Cancel emergency modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <div id="emergency-dialog-desc" className="bg-red-50/80 border border-red-200 rounded-2xl p-4 text-xs text-red-950 flex flex-col gap-2">
          <p className="font-bold text-sm">
            Are you sure you want to activate emergency assistance?
          </p>
          <p className="text-red-800 leading-relaxed">
            This will immediately highlight accessible hospital corridors, display urgent medical transport routes on your map, and broadcast priority emergency voice prompts.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3.5 px-4 rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition active:scale-98 cursor-pointer"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-xs tracking-wider shadow-lg shadow-red-600/30 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>CONFIRM EMERGENCY</span>
          </button>
        </div>
      </div>
    </div>
  );
};

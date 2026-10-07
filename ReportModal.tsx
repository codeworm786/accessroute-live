import React, { useState } from 'react';
import { 
  ShieldAlert, X, Accessibility, 
  Construction, Ban, Droplets, AlertTriangle 
} from 'lucide-react';
import { ReportCategory } from '../../types';

interface ReportModalProps {
  onClose: () => void;
  onSubmit: (report: {
    category: ReportCategory;
    title: string;
    description: string;
    severity: 'low' | 'moderate' | 'severe' | 'critical';
    lat: number;
    lng: number;
  }) => void;
  defaultLocation?: [number, number] | null;
  highContrast: boolean;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  onClose,
  onSubmit,
  defaultLocation,
  highContrast,
}) => {
  const [category, setCategory] = useState<ReportCategory>('broken_ramp');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'moderate' | 'severe' | 'critical'>('severe');

  const categories: { code: ReportCategory; label: string; icon: React.ReactNode }[] = [
    { code: 'broken_ramp', label: 'Broken Ramp', icon: <Accessibility className="w-4 h-4" /> },
    { code: 'broken_elevator', label: 'Broken Lift', icon: <AlertTriangle className="w-4 h-4" /> },
    { code: 'stairs', label: 'Unmapped Stairs', icon: <Ban className="w-4 h-4" /> },
    { code: 'pothole', label: 'Pothole / Pit', icon: <AlertTriangle className="w-4 h-4" /> },
    { code: 'barricade', label: 'Barricade', icon: <Ban className="w-4 h-4" /> },
    { code: 'waterlogging', label: 'Waterlogging', icon: <Droplets className="w-4 h-4" /> },
    { code: 'construction', label: 'Construction', icon: <Construction className="w-4 h-4" /> },
    { code: 'blocked_footpath', label: 'Blocked Path', icon: <Ban className="w-4 h-4" /> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const baseLat = defaultLocation ? defaultLocation[0] : 0.0;
    const baseLng = defaultLocation ? defaultLocation[1] : 0.0;
    onSubmit({
      category,
      title: title.trim(),
      description: description.trim(),
      severity,
      lat: baseLat,
      lng: baseLng,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs pointer-events-auto animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-3xl border p-5 sm:p-6 flex flex-col gap-4 card-shadow-floating ${
          highContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Report Accessibility Barrier
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Help commuters by reporting real-world obstacles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close report dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Category Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Obstacle Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((c) => {
                const isSelected = category === c.code;
                return (
                  <button
                    type="button"
                    key={c.code}
                    onClick={() => setCategory(c.code)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-300 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className={isSelected ? 'text-red-600' : 'text-slate-500'}>
                      {c.icon}
                    </div>
                    <span className="text-[10px] text-center">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Obstacle Title / Summary
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Broken ramp at station entrance, steep curb trap"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Details / Step-Free Alternate Advice
            </label>
            <textarea
              rows={2}
              placeholder="Provide context on safe detour corridors..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Severity */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Severity Level
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['low', 'moderate', 'severe', 'critical'] as const).map((sev) => (
                <button
                  type="button"
                  key={sev}
                  onClick={() => setSeverity(sev)}
                  className={`py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                    severity === sev
                      ? sev === 'critical'
                        ? 'bg-red-600 text-white'
                        : sev === 'severe'
                        ? 'bg-orange-500 text-white'
                        : 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/25 transition active:scale-98 cursor-pointer mt-1"
          >
            Submit Barrier Report
          </button>
        </form>
      </div>
    </div>
  );
};

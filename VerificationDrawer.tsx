import React from 'react';
import { ThumbsUp, CheckCircle2, Clock, ShieldAlert, X, AlertTriangle } from 'lucide-react';
import { CommunityReport } from '../../types';

interface VerificationDrawerProps {
  report: CommunityReport;
  onVote: (reportId: string, voteType: 'upvote' | 'downvote' | 'resolve') => void;
  onClose: () => void;
  highContrast: boolean;
}

export const VerificationDrawer: React.FC<VerificationDrawerProps> = ({
  report,
  onVote,
  onClose,
  highContrast,
}) => {
  const isConfirmed = report.status === 'CONFIRMED' || report.confidence_level === 'HIGH';
  const isCritical = report.severity === 'critical' || report.severity === 'severe';

  const getFreshnessLabel = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.max(1, Math.floor(diffMs / 60000));
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      return `${hours}h ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div
      className={`rounded-3xl border p-4 sm:p-5 flex flex-col gap-3 transition-all duration-200 card-shadow-floating ${
        highContrast
          ? 'bg-black border-yellow-400 text-yellow-300'
          : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-900'
      }`}
      role="region"
      aria-label="Community Obstacle Verification"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 mt-0.5 ${
              isCritical
                ? 'bg-red-50 border-red-200 text-red-600'
                : isConfirmed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}
          >
            {isCritical ? <ShieldAlert className="w-5 h-5" /> : isConfirmed ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {isConfirmed ? (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  🟢 VERIFIED HAZARD
                </span>
              ) : (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-yellow-100 text-yellow-800 border border-yellow-300">
                  🟡 COMMUNITY REPORT
                </span>
              )}
              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" /> Reported {getFreshnessLabel(report.reported_at)}
              </span>
            </div>
            <h3 className="font-black text-sm text-slate-900 mt-1">{report.title}</h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer touch-target-48"
          aria-label="Close report details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {report.description && (
        <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200 leading-relaxed font-medium">
          {report.description}
        </p>
      )}

      {/* Community Confirmation Voting Buttons */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          <span className="font-extrabold text-slate-900 font-mono-nums">{report.upvotes}</span> confirmations
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onVote(report.id, 'upvote')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition cursor-pointer"
            title="Confirm obstacle is active"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Confirm</span>
          </button>

          <button
            onClick={() => onVote(report.id, 'resolve')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition cursor-pointer"
            title="Mark obstacle as cleared"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Cleared</span>
          </button>
        </div>
      </div>
    </div>
  );
};

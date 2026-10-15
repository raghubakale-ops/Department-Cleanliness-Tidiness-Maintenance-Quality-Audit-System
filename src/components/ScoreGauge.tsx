import React from 'react';
import { ScoreCalculation } from '../types';
import { TOTAL_PARAMETERS } from '../data/inspectionData';
import { ColorTheme } from '../theme';
import { CheckCircle, AlertTriangle, Award } from 'lucide-react';

interface ScoreGaugeProps {
  score: ScoreCalculation;
  theme: ColorTheme;
  onJumpToFirstUnrated?: () => void;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, theme, onJumpToFirstUnrated }) => {
  const completedParameters = score.ratedCount + score.naCount;
  const progressPercent = Math.round((completedParameters / TOTAL_PARAMETERS) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Institutional Evaluation Matrix
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span
              className="text-3xl md:text-4xl font-extrabold"
              style={{ color: theme.primary }}
            >
              {score.percentage !== null ? `${score.percentage.toFixed(2)}%` : '—'}
            </span>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span className={`text-base md:text-lg font-bold ${score.bandColor}`}>
                {score.unratedCount > 0 && score.ratedCount > 0 ? 'Provisional: ' : ''}
                {score.band}
              </span>
            </div>
          </div>
        </div>

        {/* Status notice */}
        <div className="text-sm">
          {score.isComplete ? (
            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All 37 parameters evaluated or marked N/A. Ready for review.</span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 text-amber-900 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 font-medium">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Inspection incomplete: <b>{score.unratedCount}</b> parameter{score.unratedCount > 1 ? 's' : ''} remaining.
                </span>
              </div>
              {onJumpToFirstUnrated && (
                <button
                  type="button"
                  onClick={onJumpToFirstUnrated}
                  className="text-xs font-semibold underline shrink-0 hover:opacity-80"
                  style={{ color: theme.primary }}
                >
                  Jump to next ›
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between items-center text-xs text-slate-600 mb-1.5 font-medium">
          <span>Overall Audit Completion</span>
          <span>
            {completedParameters} of {TOTAL_PARAMETERS} parameters ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%`, backgroundColor: theme.primary }}
          />
        </div>
      </div>

      {/* Numerical breakdown metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
          <span className="text-slate-500 block">Rated (1–5)</span>
          <span className="text-sm font-bold text-slate-800">{score.ratedCount}</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
          <span className="text-slate-500 block">Marked N/A</span>
          <span className="text-sm font-bold text-slate-800">{score.naCount}</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
          <span className="text-slate-500 block">Pending Rating</span>
          <span className={`text-sm font-bold ${score.unratedCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
            {score.unratedCount}
          </span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
          <span className="text-slate-500 block">Score Obtained (A)</span>
          <span className="text-sm font-bold" style={{ color: theme.primary }}>{score.obtainedScore}</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 col-span-2 sm:col-span-1">
          <span className="text-slate-500 block">Max Possible (B)</span>
          <span className="text-sm font-bold text-slate-800">{score.maxPossibleScore}</span>
        </div>
      </div>
    </div>
  );
};

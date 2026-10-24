import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, Moon } from 'lucide-react';

export default function TrendComparison({ comparison }) {
  if (!comparison) return null;

  const { mood, sleep } = comparison;

  const renderBadge = (diff, label) => {
    if (diff === null || diff === undefined) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          <Minus className="w-3 h-3" />
          Need 10 check-ins to compare
        </span>
      );
    }

    const isPositive = diff > 0;
    const isZero = diff === 0;

    if (isZero) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
          <Minus className="w-3 h-3" />
          No change vs previous 5
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
          isPositive
            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
            : 'text-rose-700 bg-rose-50 border border-rose-200'
        }`}
      >
        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        {isPositive ? `+${diff}` : diff} vs previous 5
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Mood Averages Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Mood Comparison
              </span>
              <h4 className="font-bold text-slate-900 text-base">Past 5 vs. Previous 5</h4>
            </div>
          </div>
          {renderBadge(mood.diff, 'mood')}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">Recent 5 Check-ins</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
              {mood.recent !== null ? `${mood.recent} / 5` : '—'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">Previous 5 Check-ins</span>
            <span className="text-2xl font-extrabold text-slate-500 mt-0.5 block">
              {mood.previous !== null ? `${mood.previous} / 5` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Sleep Averages Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Sleep Comparison
              </span>
              <h4 className="font-bold text-slate-900 text-base">Past 5 vs. Previous 5</h4>
            </div>
          </div>
          {renderBadge(sleep.diff, 'sleep')}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">Recent 5 Check-ins</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
              {sleep.recent !== null ? `${sleep.recent} hrs` : '—'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">Previous 5 Check-ins</span>
            <span className="text-2xl font-extrabold text-slate-500 mt-0.5 block">
              {sleep.previous !== null ? `${sleep.previous} hrs` : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

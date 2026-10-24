import React from 'react';
import { Flame, Brain, CalendarDays, Award } from 'lucide-react';

export default function AnalyticsSection({ streaks, patterns, correlation }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Streaks (Gaps & Islands) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                SQL Gaps & Islands
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Check-in Streak</h4>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {streaks?.current_streak || 0}
            </span>
            <span className="text-xs font-semibold text-slate-500">days active streak</span>
          </div>

          <div className="mt-3 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between py-1 border-t border-slate-100">
              <span className="text-slate-400">Longest Streak:</span>
              <span className="font-bold text-slate-700">{streaks?.longest_streak || 0} days</span>
            </div>
            <div className="flex justify-between py-1 border-t border-slate-100">
              <span className="text-slate-400">Total Streaks:</span>
              <span className="font-bold text-slate-700">{streaks?.history?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Keep logging daily to expand your streak!</span>
        </div>
      </div>

      {/* 2. Correlation (CORR window function) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                PostgreSQL CORR()
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Sleep vs. Mood Correlation</h4>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-indigo-600">
              {correlation?.correlation !== null && correlation?.correlation !== undefined
                ? (correlation.correlation > 0 ? `+${correlation.correlation}` : correlation.correlation)
                : 'N/A'}
            </span>
            <span className="text-xs font-semibold text-slate-500">r coefficient (-1 to +1)</span>
          </div>

          <p className="mt-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            {correlation?.insight || 'Analyzing correlation...'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
          Evaluated across {correlation?.total_entries || 0} check-ins.
        </div>
      </div>

      {/* 3. Day of Week Patterns */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                EXTRACT(DOW) Patterns
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Day-of-Week Mood</h4>
            </div>
          </div>

          <div className="space-y-1 mt-2">
            {(patterns || []).slice(0, 5).map((p) => (
              <div key={p.dow} className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-600 font-medium">{p.day_name.slice(0, 3)}:</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${(p.avg_mood / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-slate-800 w-8 text-right">{p.avg_mood}★</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
          Aggregated by day-of-week frequency.
        </div>
      </div>
    </div>
  );
}

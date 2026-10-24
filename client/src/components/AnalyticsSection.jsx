import React from 'react';
import MoodFace from './MoodFace';
import { Flame, Brain, CalendarDays, Award } from 'lucide-react';

export default function AnalyticsSection({ streaks, patterns, correlation }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Streaks (Gaps & Islands) */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#EFEAE2] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-2xl bg-terracotta/10 text-terracotta">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-espresso-500 uppercase tracking-wider">
                SQL Gaps & Islands
              </span>
              <h4 className="font-display font-bold text-espresso-800 text-sm">Check-in Streak</h4>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-display text-4xl font-extrabold text-espresso-800">
              {streaks?.current_streak || 0}
            </span>
            <span className="text-xs font-semibold text-espresso-500">days active streak</span>
          </div>

          <div className="mt-4 text-xs space-y-1.5 pt-3 border-t border-[#F4EFE8]">
            <div className="flex justify-between py-0.5">
              <span className="text-espresso-500 font-medium">Longest Streak:</span>
              <span className="font-bold text-espresso-800">{streaks?.longest_streak || 0} days</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-espresso-500 font-medium">Recorded Streaks:</span>
              <span className="font-bold text-espresso-800">{streaks?.history?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#F4EFE8] text-[11px] font-medium text-espresso-500 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-terracotta" />
          <span>Keep your daily streak unbroken!</span>
        </div>
      </div>

      {/* 2. Correlation (CORR window function) */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#EFEAE2] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-2xl bg-sage/15 text-sage">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-espresso-500 uppercase tracking-wider">
                PostgreSQL CORR()
              </span>
              <h4 className="font-display font-bold text-espresso-800 text-sm">Sleep vs. Mood Link</h4>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-display text-4xl font-extrabold text-sage">
              {correlation?.correlation !== null && correlation?.correlation !== undefined
                ? (correlation.correlation > 0 ? `+${correlation.correlation}` : correlation.correlation)
                : 'N/A'}
            </span>
            <span className="text-xs font-semibold text-espresso-500">r coefficient (-1 to +1)</span>
          </div>

          <p className="mt-3 text-xs text-espresso-700 leading-relaxed bg-cream-50 p-3 rounded-2xl border border-[#EAE2D7]">
            {correlation?.insight || 'Analyzing correlation between sleep hours and daily mood...'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#F4EFE8] text-[11px] font-medium text-espresso-500">
          Computed across {correlation?.total_entries || 0} check-ins.
        </div>
      </div>

      {/* 3. Day of Week Patterns */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#EFEAE2] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-2xl bg-honey/15 text-honey">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-espresso-500 uppercase tracking-wider">
                EXTRACT(DOW)
              </span>
              <h4 className="font-display font-bold text-espresso-800 text-sm">Weekday Patterns</h4>
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            {(patterns || []).slice(0, 5).map((p) => (
              <div key={p.dow} className="flex items-center justify-between text-xs py-0.5">
                <span className="text-espresso-700 font-bold">{p.day_name.slice(0, 3)}</span>
                <div className="flex items-center gap-2">
                  <div className="w-18 bg-cream-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-honey h-full rounded-full"
                      style={{ width: `${(p.avg_mood / 5) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-espresso-800 w-9 text-right">
                    {p.avg_mood}★
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#F4EFE8] text-[11px] font-medium text-espresso-500">
          Aggregated by day-of-week averages.
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Flame, Moon, CalendarDays, HelpCircle } from 'lucide-react';
import MoodFace from './MoodFace';

function InfoTooltip({ title, explanation, sqlCode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-espresso-400 hover:text-espresso-700 transition-colors p-1 rounded-full hover:bg-cream-100"
        title="How is this calculated?"
        aria-label="How is this calculated?"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-espresso-900 text-cream-50 text-[11px] rounded-2xl shadow-xl z-40 pointer-events-none leading-relaxed animate-in fade-in zoom-in-95">
          <p className="font-bold text-cream-100 mb-1">{title}</p>
          <p className="text-cream-300">{explanation}</p>
          {sqlCode && (
            <div className="mt-2 pt-1.5 border-t border-espresso-700/60 font-mono text-[10px] text-terracotta-light">
              Under the hood: {sqlCode}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsSection({ streaks, patterns, correlation }) {
  // 1. Streak calculations
  const currentStreak = streaks?.current_streak || 0;
  const longestStreak = streaks?.longest_streak || 0;

  // 2. Sleep & Mood correlation interpretation
  const totalEntries = correlation?.total_entries || 0;
  const corrValue = correlation?.correlation;

  let sleepMainText = 'Log a few more days to see your sleep pattern.';
  if (totalEntries >= 14 && corrValue !== null && corrValue !== undefined) {
    if (corrValue >= 0.35) {
      sleepMainText = 'You tend to feel better after more sleep';
    } else if (corrValue >= 0.15) {
      sleepMainText = 'More sleep seems to give your mood a gentle lift';
    } else if (corrValue >= -0.15) {
      sleepMainText = 'Your mood stays relatively steady regardless of sleep';
    } else {
      sleepMainText = 'Your sleep and mood show varied patterns';
    }
  }

  // 3. Weekly pattern calculations (all 7 days: Sun to Sat)
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const patternMap = new Map();
  (patterns || []).forEach((p) => {
    patternMap.set(p.dow, p);
  });

  // Find best day
  let bestDay = null;
  let highestMood = -1;
  (patterns || []).forEach((p) => {
    if (p.total_entries > 0 && p.avg_mood > highestMood) {
      highestMood = p.avg_mood;
      bestDay = p;
    }
  });

  const weekHeadline = bestDay
    ? `${bestDay.day_name}s are your best day`
    : 'Keep checking in to reveal your peak day';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Streak Card */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#EFEAE2] flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-terracotta/10 text-terracotta">
                <Flame className="w-4 h-4" />
              </div>
              <h4 className="font-display font-bold text-espresso-800 text-sm">
                Your streak
              </h4>
            </div>
            <InfoTooltip
              title="How is your streak calculated?"
              explanation="Compares consecutive dates to measure your unbroken chain of daily check-ins."
              sqlCode="Gaps-and-islands window function"
            />
          </div>

          {/* Main Headline */}
          <div className="mt-3">
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-espresso-800 tracking-tight flex items-center gap-1.5">
              <span>{currentStreak} days in a row</span>
              <span>🔥</span>
            </h3>
            <p className="text-xs font-semibold text-espresso-500 mt-1">
              Your best: {longestStreak} days
            </p>
          </div>
        </div>

        {/* Friendly Footer */}
        <div className="mt-5 pt-3 border-t border-[#F4EFE8] text-xs font-bold text-terracotta">
          Keep it going!
        </div>
      </div>

      {/* 2. Sleep and Mood Card */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#EFEAE2] flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-sage/15 text-sage">
                <Moon className="w-4 h-4" />
              </div>
              <h4 className="font-display font-bold text-espresso-800 text-sm">
                Sleep and mood
              </h4>
            </div>
            <InfoTooltip
              title="How is sleep & mood analyzed?"
              explanation="Evaluates statistical correlation between your reported sleep hours and daily mood rating over time."
              sqlCode="PostgreSQL CORR(mood, sleep_hours)"
            />
          </div>

          {/* Main Headline */}
          <div className="mt-3">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-espresso-800 tracking-tight leading-snug">
              {sleepMainText}
            </h3>
            <p className="text-xs font-semibold text-espresso-500 mt-2">
              Based on {totalEntries} {totalEntries === 1 ? 'check-in' : 'check-ins'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-[#F4EFE8] text-xs font-medium text-espresso-500">
          {totalEntries < 14
            ? 'Trends become clearer after 2 weeks of check-ins.'
            : 'Sleep and emotional clarity walk hand in hand.'}
        </div>
      </div>

      {/* 3. Weekly Pattern Card */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#EFEAE2] flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-honey/15 text-honey">
                <CalendarDays className="w-4 h-4" />
              </div>
              <h4 className="font-display font-bold text-espresso-800 text-sm">
                Your week at a glance
              </h4>
            </div>
            <InfoTooltip
              title="How is your weekly pattern calculated?"
              explanation="Averages your mood ratings across each day of the week to reveal recurring peaks and gentle dips."
              sqlCode="EXTRACT(DOW FROM entry_date)"
            />
          </div>

          {/* Main Headline */}
          <h3 className="font-display text-lg font-bold text-espresso-800 tracking-tight mt-1 mb-3">
            {weekHeadline}
          </h3>

          {/* All 7 Days Display */}
          <div className="space-y-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((dow) => {
              const p = patternMap.get(dow);
              const hasData = p && p.total_entries > 0;
              const avgMood = hasData ? parseFloat(p.avg_mood) : 0;

              return (
                <div
                  key={dow}
                  className={`flex items-center justify-between text-xs py-0.5 ${
                    hasData ? 'text-espresso-800' : 'text-espresso-400 opacity-60'
                  }`}
                >
                  <span className="font-bold w-8">{dayNames[dow].slice(0, 3)}</span>

                  {hasData ? (
                    <div className="flex items-center gap-2 flex-1 max-w-[170px] justify-end">
                      <div className="w-20 bg-cream-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-honey h-full rounded-full transition-all"
                          style={{ width: `${(avgMood / 5) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-espresso-800 w-12 text-right">
                        {avgMood.toFixed(1)} / 5
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] italic text-espresso-400">
                      No entries yet
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#F4EFE8] text-[11px] font-medium text-espresso-500">
          Showing averages across all 7 days of the week.
        </div>
      </div>
    </div>
  );
}

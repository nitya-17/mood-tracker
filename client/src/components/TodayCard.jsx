import React from 'react';
import MoodFace, { MOOD_DEFINITIONS } from './MoodFace';
import { Moon, MessageSquare, Plus, Sparkles } from 'lucide-react';

export default function TodayCard({ todayEntry, onScrollToForm }) {
  if (!todayEntry) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-[#EFEAE2] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <MoodFace level={3} size={56} />
            <div>
              <span className="text-[11px] font-bold text-terracotta uppercase tracking-wider block">
                Daily Check-in
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-espresso-800 tracking-tight mt-0.5">
                How are you feeling today?
              </h3>
              <p className="text-xs sm:text-sm font-medium text-espresso-500 mt-0.5">
                Take a brief mindful moment to reflect on your mood and sleep.
              </p>
            </div>
          </div>

          <button
            onClick={onScrollToForm}
            className="flex-shrink-0 px-6 py-3 bg-terracotta hover:bg-terracotta-hover text-white rounded-full font-display font-bold text-xs sm:text-sm shadow-md shadow-terracotta/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Check In Now</span>
          </button>
        </div>
      </div>
    );
  }

  const def = MOOD_DEFINITIONS[todayEntry.mood] || MOOD_DEFINITIONS[3];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-[#EFEAE2]">
      <div className="flex items-center justify-between pb-4 border-b border-[#F4EFE8]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sage animate-pulse"></span>
          <span className="text-xs font-bold text-espresso-700 uppercase tracking-wider">
            Today's Logged Mood
          </span>
          <span className="text-xs text-espresso-500 font-mono">({todayEntry.entry_date})</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-espresso-700 bg-cream-100 px-3 py-1 rounded-full border border-[#EAE2D7]">
          <Moon className="w-3.5 h-3.5 text-terracotta" />
          <span>{Number(todayEntry.sleep_hours).toFixed(1)} hrs sleep</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col md:flex-row md:items-center gap-6">
        {/* Mood Face Badge */}
        <div className="flex items-center gap-4 bg-cream-50 p-4 rounded-2xl border border-[#EAE2D7]">
          <MoodFace level={todayEntry.mood} size={54} />
          <div>
            <h4 className="font-display text-lg font-bold text-espresso-800">
              {def.phrase}
            </h4>
            <span className="text-xs font-semibold text-espresso-500 block mt-0.5">
              Level {todayEntry.mood} of 5
            </span>
          </div>
        </div>

        {/* Reflection & Feelings */}
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-espresso-800 italic bg-cream-50 p-3.5 rounded-2xl border border-[#EAE2D7] leading-relaxed">
            "{todayEntry.reflection}"
          </p>

          {todayEntry.feelings && todayEntry.feelings.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {todayEntry.feelings.map((f) => (
                <span
                  key={f.id || f.label}
                  className="px-3 py-0.5 rounded-full text-xs font-semibold bg-white text-espresso-700 border border-[#EAE2D7]"
                >
                  #{f.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

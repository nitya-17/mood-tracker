import React from 'react';
import { MOOD_LEVELS } from './MoodRatingInput';
import { Sparkles, Moon, MessageSquare, CheckCircle, PlusCircle } from 'lucide-react';

export default function TodayCard({ todayEntry, onScrollToForm }) {
  if (!todayEntry) {
    return (
      <div className="bg-gradient-to-br from-indigo-500/10 via-white to-violet-500/10 border border-indigo-100 rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
              <Sparkles className="w-3.5 h-3.5" />
              Today's Check-in
            </span>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              You haven't checked in for today yet!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Take 30 seconds to reflect on your energy, sleep, and emotional state to keep your streak alive.
            </p>
          </div>
          <button
            onClick={onScrollToForm}
            className="flex-shrink-0 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Today's Mood</span>
          </button>
        </div>
      </div>
    );
  }

  const moodConfig = MOOD_LEVELS.find((m) => m.level === todayEntry.mood) || MOOD_LEVELS[2];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Today's Logged Check-in
          </span>
          <span className="text-xs text-slate-400 font-mono">({todayEntry.entry_date})</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
          <Moon className="w-3.5 h-3.5 text-indigo-500" />
          <span>{Number(todayEntry.sleep_hours).toFixed(1)} hrs sleep</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col md:flex-row md:items-center gap-6">
        {/* Mood Badge */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-4xl select-none">{moodConfig.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">{moodConfig.label}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                {todayEntry.mood}/5
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Recorded in your local day</p>
          </div>
        </div>

        {/* Reflection */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span>Reflection:</span>
          </div>
          <p className="text-sm text-slate-700 italic bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/60">
            "{todayEntry.reflection}"
          </p>

          {/* Feelings tags */}
          {todayEntry.feelings && todayEntry.feelings.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {todayEntry.feelings.map((f) => (
                <span
                  key={f.id || f.label}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
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

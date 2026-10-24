import React from 'react';

export const MOOD_LEVELS = [
  { level: 1, label: 'Very Low', emoji: '😫', color: '#EF4444', bg: 'hover:bg-red-50 hover:border-red-300' },
  { level: 2, label: 'Low', emoji: '🙁', color: '#F97316', bg: 'hover:bg-orange-50 hover:border-orange-300' },
  { level: 3, label: 'Okay', emoji: '😐', color: '#EAB308', bg: 'hover:bg-amber-50 hover:border-amber-300' },
  { level: 4, label: 'Good', emoji: '🙂', color: '#10B981', bg: 'hover:bg-emerald-50 hover:border-emerald-300' },
  { level: 5, label: 'Great', emoji: '🤩', color: '#3B82F6', bg: 'hover:bg-blue-50 hover:border-blue-300' },
];

export default function MoodRatingInput({ value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-800 mb-2">
        How is your mood today? <span className="text-rose-500">*</span>
      </label>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {MOOD_LEVELS.map((item) => {
          const isSelected = value === item.level;
          return (
            <button
              type="button"
              key={item.level}
              onClick={() => onChange(item.level)}
              className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-sm scale-105'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:scale-[1.02]'
              } ${item.bg}`}
            >
              <span className="text-2xl sm:text-3xl mb-1 select-none">{item.emoji}</span>
              <span
                className={`text-xs font-semibold ${
                  isSelected ? 'text-indigo-950 font-bold' : 'text-slate-600'
                }`}
              >
                {item.label}
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">({item.level}/5)</span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}

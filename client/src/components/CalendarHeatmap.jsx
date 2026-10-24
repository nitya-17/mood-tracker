import React, { useState } from 'react';
import { MOOD_LEVELS } from './MoodRatingInput';
import { Calendar, HelpCircle } from 'lucide-react';

export default function CalendarHeatmap({ entries, days = 30 }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Generate an array of dates for the last N days
  const today = new Date();
  const dateMap = new Map();

  (entries || []).forEach((e) => {
    dateMap.set(e.entry_date, e);
  });

  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = dateMap.get(dateStr);
    cells.push({
      dateStr,
      dayNumber: d.getDate(),
      dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
      entry,
    });
  }

  const getMoodColor = (mood) => {
    if (!mood) return 'bg-slate-100 border-dashed border-slate-200 text-slate-400';
    switch (mood) {
      case 1:
        return 'bg-red-500 text-white';
      case 2:
        return 'bg-orange-400 text-white';
      case 3:
        return 'bg-amber-400 text-slate-900';
      case 4:
        return 'bg-emerald-500 text-white';
      case 5:
        return 'bg-blue-500 text-white';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Calendar Heatmap & Daily Gaps
          </h3>
          <p className="text-xs text-slate-500">
            Visualizing consistent check-in habits. Unlogged days appear as empty dashed squares.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span>Gap</span>
          <div className="w-3.5 h-3.5 rounded bg-slate-100 border border-dashed border-slate-300"></div>
          <span className="mx-1">→</span>
          <div className="w-3.5 h-3.5 rounded bg-red-500"></div>
          <div className="w-3.5 h-3.5 rounded bg-orange-400"></div>
          <div className="w-3.5 h-3.5 rounded bg-amber-400"></div>
          <div className="w-3.5 h-3.5 rounded bg-emerald-500"></div>
          <div className="w-3.5 h-3.5 rounded bg-blue-500"></div>
          <span>Great</span>
        </div>
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-2 mt-5">
        {cells.map(({ dateStr, dayNumber, entry }) => {
          const hasEntry = !!entry;
          const mood = entry?.mood;
          const config = hasEntry ? MOOD_LEVELS.find((m) => m.level === mood) : null;

          return (
            <div
              key={dateStr}
              onMouseEnter={() => setHoveredDay({ dateStr, entry, config })}
              onMouseLeave={() => setHoveredDay(null)}
              className={`relative h-11 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-xs ${getMoodColor(
                mood
              )}`}
            >
              <span className="text-[10px] font-bold opacity-80">{dayNumber}</span>
              {hasEntry ? (
                <span className="text-xs select-none">{config?.emoji}</span>
              ) : (
                <span className="text-[10px] opacity-40 font-mono">—</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Hover Detail Tooltip banner */}
      <div className="mt-4 pt-3 border-t border-slate-100 min-h-[36px] flex items-center justify-between text-xs text-slate-600">
        {hoveredDay ? (
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900">{hoveredDay.dateStr}:</span>
            {hoveredDay.entry ? (
              <span className="flex items-center gap-2">
                <span>{hoveredDay.config?.emoji}</span>
                <span className="font-semibold">{hoveredDay.config?.label} (Mood {hoveredDay.entry.mood}/5)</span>
                <span>•</span>
                <span>{hoveredDay.entry.sleep_hours} hrs sleep</span>
                {hoveredDay.entry.reflection && (
                  <span className="italic text-slate-500 truncate max-w-sm">
                    "{hoveredDay.entry.reflection}"
                  </span>
                )}
              </span>
            ) : (
              <span className="text-amber-600 font-medium italic">No check-in recorded for this day (Gap)</span>
            )}
          </div>
        ) : (
          <span className="text-slate-400 italic">Hover over any day square to see details</span>
        )}
      </div>
    </div>
  );
}

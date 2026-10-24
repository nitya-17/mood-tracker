import React, { useState } from 'react';
import MoodFace, { MOOD_DEFINITIONS } from './MoodFace';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarHeatmap({ entries, todayEntry, onLogClick, onSelectDay }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const normalizeDateStr = (raw) => {
    if (!raw) return '';
    if (typeof raw === 'string') return raw.slice(0, 10);
    if (raw instanceof Date) return raw.toISOString().slice(0, 10);
    return String(raw).slice(0, 10);
  };

  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday

  // Map entries by date YYYY-MM-DD
  const entryMap = new Map();
  (entries || []).forEach((e) => {
    const key = normalizeDateStr(e.entry_date);
    if (key) entryMap.set(key, e);
  });

  // Ensure today's entry is immediately present in the map
  if (todayEntry && todayEntry.entry_date) {
    const todayKey = normalizeDateStr(todayEntry.entry_date);
    if (todayKey && !entryMap.has(todayKey)) {
      entryMap.set(todayKey, todayEntry);
    }
  }

  // Calculate count of logged moods in this month
  let loggedThisMonth = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (entryMap.has(dStr)) {
      loggedThisMonth++;
    }
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Calendar cells
  const blanks = Array.from({ length: firstDayOfWeek });
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const selectedEntry = entryMap.get(normalizeDateStr(selectedDateStr));

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-[#EFEAE2]">
      {/* Top Header matching Image 3 */}
      <div className="flex items-start justify-between pb-5 border-b border-[#F4EFE8]">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-espresso-800 tracking-tight">
              {loggedThisMonth}/{daysInMonth}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-espresso-500 mt-0.5">
            Moods logged in {monthName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month selector navigation */}
          <div className="flex items-center bg-cream-100 rounded-full p-1 border border-[#EAE2D7]">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-full hover:bg-white text-espresso-700 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-espresso-800 px-2 min-w-[70px] text-center">
              {currentDate.toLocaleString('default', { month: 'short' })} '{String(year).slice(2)}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-full hover:bg-white text-espresso-700 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Brown Circular Plus Button from Image 3 */}
          <button
            onClick={onLogClick}
            title="Log Mood"
            className="w-11 h-11 rounded-full bg-terracotta hover:bg-terracotta-hover text-white flex items-center justify-center shadow-md shadow-terracotta/20 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-espresso-700 pt-5 pb-2">
        {dayHeaders.map((dh) => (
          <div key={dh} className="py-1">
            {dh}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {/* Leading empty blank slots */}
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="h-14 sm:h-16 flex items-center justify-center opacity-25">
            <div className="w-9 h-9 rounded-full border border-dashed border-[#DDD2C3]" />
          </div>
        ))}

        {/* Days of current month */}
        {monthDays.map((day) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const entry = entryMap.get(dateStr);
          const isSelected = selectedDateStr === dateStr;

          return (
            <div
              key={dateStr}
              onClick={() => {
                setSelectedDateStr(dateStr);
                if (onSelectDay) onSelectDay(entry, dateStr);
              }}
              className={`h-14 sm:h-16 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                isSelected
                  ? 'border-2 border-terracotta bg-terracotta/5 shadow-xs scale-105'
                  : 'hover:bg-cream-100'
              }`}
            >
              <span
                className={`text-[11px] font-bold ${
                  isSelected ? 'text-terracotta font-extrabold' : 'text-espresso-700'
                }`}
              >
                {day}
              </span>

              {entry ? (
                <div className="mt-0.5">
                  <MoodFace level={entry.mood} size={24} />
                </div>
              ) : (
                <div className="mt-1 w-6 h-6 rounded-full border border-dashed border-[#D5C9B8] bg-white/50" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

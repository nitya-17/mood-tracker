import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, getElementAtEvent } from 'react-chartjs-2';
import { MOOD_LEVELS } from './MoodRatingInput';
import { BarChart3, Calendar, Moon, MessageSquare, Tag, Eye } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RecentChart({ entries }) {
  const chartRef = useRef(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Take the most recent 11 entries
  const recent11 = (entries || []).slice(-11);

  useEffect(() => {
    if (recent11.length > 0 && !selectedEntry) {
      // Default select the latest entry
      setSelectedEntry(recent11[recent11.length - 1]);
    }
  }, [entries]);

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h4 className="font-bold text-slate-700">No Check-in Data Yet</h4>
        <p className="text-xs text-slate-500 mt-1">Submit your first check-in to generate your time-series chart.</p>
      </div>
    );
  }

  // Format labels: "Oct 24", "Oct 23"
  const labels = recent11.map((e) => {
    const parts = e.entry_date.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const moodColors = recent11.map((e) => {
    const config = MOOD_LEVELS.find((m) => m.level === e.mood);
    return config ? config.color : '#3B82F6';
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Mood Level (1-5)',
        data: recent11.map((e) => e.mood),
        backgroundColor: moodColors,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: moodColors.map((c) => `${c}DD`),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const entry = recent11[context.dataIndex];
            const mood = MOOD_LEVELS.find((m) => m.level === entry.mood)?.label || entry.mood;
            return `Mood: ${mood} (${entry.mood}/5) | Sleep: ${entry.sleep_hours}h`;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: (val) => {
            const emojis = { 1: '😫 1', 2: '🙁 2', 3: '😐 3', 4: '🙂 4', 5: '🤩 5' };
            return emojis[val] || '';
          },
        },
        grid: {
          color: '#F1F5F9',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const handleChartClick = (event) => {
    const { current: chart } = chartRef;
    if (!chart) return;

    const elements = getElementAtEvent(chart, event);
    if (elements.length > 0) {
      const index = elements[0].index;
      setSelectedEntry(recent11[index]);
    }
  };

  const selectedMoodConfig = selectedEntry
    ? MOOD_LEVELS.find((m) => m.level === selectedEntry.mood) || MOOD_LEVELS[2]
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Recent 11 Check-ins
          </h3>
          <p className="text-xs text-slate-500">
            Click on any bar to inspect daily reflection, sleep, and emotional tags.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
          {MOOD_LEVELS.map((m) => (
            <span key={m.level} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }}></span>
              <span className="hidden md:inline">{m.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Chart View (2 cols on large screen) */}
        <div className="lg:col-span-2 h-64 sm:h-72">
          <Bar
            ref={chartRef}
            data={chartData}
            options={chartOptions}
            onClick={handleChartClick}
          />
        </div>

        {/* Selected Day Details Panel */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 flex flex-col justify-between">
          {selectedEntry ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  {selectedEntry.entry_date}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                  {selectedEntry.mood}/5
                </span>
              </div>

              {/* Mood & Sleep summary */}
              <div className="flex items-center gap-3">
                <span className="text-3xl select-none">{selectedMoodConfig?.emoji}</span>
                <div>
                  <h5 className="font-bold text-slate-800 text-sm">
                    {selectedMoodConfig?.label} Mood
                  </h5>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    {selectedEntry.sleep_hours} hours of sleep
                  </p>
                </div>
              </div>

              {/* Feelings tags */}
              {selectedEntry.feelings && selectedEntry.feelings.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-indigo-500" />
                    Feelings
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedEntry.feelings.map((f) => (
                      <span
                        key={f.id || f.label}
                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-white text-slate-700 border border-slate-200"
                      >
                        #{f.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reflection */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-indigo-500" />
                  Reflection
                </span>
                <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                  "{selectedEntry.reflection}"
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-8">
              <Eye className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">Click any bar to view details for that day.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

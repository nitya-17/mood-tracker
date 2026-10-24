import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import MoodFace, { MOOD_DEFINITIONS } from './MoodFace';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

export default function MoodOverviewCard({ entries, comparison }) {
  const totalEntries = entries?.length || 0;

  // Count distribution of each mood level
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  (entries || []).forEach((e) => {
    if (counts[e.mood] !== undefined) {
      counts[e.mood]++;
    }
  });

  // Trend from SQL window function
  const moodDiff = comparison?.mood?.diff;
  let trendTitle = 'Steady';
  let trendSubtitle = 'Your mood has remained stable across recent check-ins';
  if (moodDiff > 0) {
    trendTitle = 'Happier';
    trendSubtitle = `You are feeling +${moodDiff} points elevated vs. previous check-ins`;
  } else if (moodDiff < 0) {
    trendTitle = 'Gentle Rest';
    trendSubtitle = `Your mood averaged ${moodDiff} points vs. previous check-ins`;
  }

  // Last 11 entries for the smooth curved time-series chart
  const recent11 = (entries || []).slice(-11);

  const labels = recent11.map((e) => {
    const parts = e.entry_date.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const lineChartData = {
    labels,
    datasets: [
      {
        label: 'Mood Level',
        data: recent11.map((e) => e.mood),
        borderColor: '#8BAE68',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 220);
          gradient.addColorStop(0, 'rgba(139, 174, 104, 0.35)');
          gradient.addColorStop(1, 'rgba(139, 174, 104, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.42,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#8BAE68',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#433022',
        titleFont: { family: 'Nunito', weight: 'bold' },
        bodyFont: { family: 'Nunito' },
        callbacks: {
          label: (context) => {
            const entry = recent11[context.dataIndex];
            const mood = MOOD_DEFINITIONS[entry.mood]?.shortLabel || entry.mood;
            return `Mood: ${mood} (${entry.mood}/5) • ${entry.sleep_hours}h sleep`;
          },
        },
      },
    },
    scales: {
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          display: false, // We render the custom illustrated mood faces on the left axis
        },
        grid: {
          color: '#F4EFE8',
          lineWidth: 1,
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { family: 'Nunito', size: 10 },
          color: '#8A7B70',
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Left Card: Breakdown and Floating Mood Bubbles (Matching Image 2 Left) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-[#EFEAE2] flex flex-col justify-between overflow-hidden relative">
        <div>
          <span className="font-display text-4xl sm:text-5xl font-extrabold text-espresso-800 tracking-tight block">
            {totalEntries}
          </span>
          <p className="text-xs sm:text-sm font-medium text-espresso-500 mt-1">
            Total Moods Logged
          </p>

          {/* Dots breakdown */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-5 pt-4 border-t border-[#F4EFE8] text-xs">
            {[5, 4, 3, 2, 1].map((lvl) => {
              const def = MOOD_DEFINITIONS[lvl];
              return (
                <div key={lvl} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: def.bg }}
                  />
                  <span className="font-extrabold text-espresso-800">{counts[lvl]}</span>
                  <span className="text-espresso-500 text-[11px]">{def.shortLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Playful Floating Illustrated Mood Bubbles Clustered Harmoniously */}
        <div className="mt-8 pt-4 flex items-center justify-center relative min-h-[170px] select-none">
          {/* Green Overjoyed Face (large) */}
          <div className="transform hover:scale-110 transition-transform cursor-pointer drop-shadow-sm z-20">
            <MoodFace level={5} size={110} />
          </div>

          {/* Yellow Happy Face (overlapping left bottom) */}
          <div className="transform -translate-x-6 translate-y-6 hover:scale-110 transition-transform cursor-pointer drop-shadow-sm z-30">
            <MoodFace level={4} size={88} />
          </div>

          {/* Taupe Neutral Face (overlapping right bottom) */}
          <div className="transform translate-x-1 translate-y-8 hover:scale-110 transition-transform cursor-pointer drop-shadow-sm z-20">
            <MoodFace level={3} size={74} />
          </div>

          {/* Orange Sad Face (floating top left) */}
          <div className="transform -translate-x-14 -translate-y-6 hover:scale-110 transition-transform cursor-pointer drop-shadow-sm z-10">
            <MoodFace level={2} size={56} />
          </div>

          {/* Purple Depressed Face (floating bottom right) */}
          <div className="transform translate-x-12 translate-y-12 hover:scale-110 transition-transform cursor-pointer drop-shadow-sm z-10">
            <MoodFace level={1} size={48} />
          </div>
        </div>
      </div>

      {/* 2. Right Card: Insight - Mood Over Time (Matching Image 2 Right) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-[#EFEAE2] flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-bold text-espresso-500 uppercase tracking-wider block">
            Insight — Mood Over Time
          </span>
          <h3 className="font-display text-3xl font-extrabold text-espresso-800 tracking-tight mt-1">
            {trendTitle}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-espresso-500 mt-1">
            {trendSubtitle}
          </p>
        </div>

        {/* Chart with Mood Faces as Y-Axis Icons */}
        <div className="mt-6 flex items-stretch gap-3 h-56 sm:h-64">
          {/* Custom Y-Axis Icons */}
          <div className="flex flex-col justify-between items-center py-2 select-none">
            <MoodFace level={5} size={22} />
            <MoodFace level={4} size={22} />
            <MoodFace level={3} size={22} />
            <MoodFace level={2} size={22} />
            <MoodFace level={1} size={22} />
          </div>

          {/* The Chart */}
          <div className="flex-1 h-full">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

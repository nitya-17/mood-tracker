import React from 'react';

export const MOOD_DEFINITIONS = {
  1: {
    level: 1,
    name: 'depressed',
    shortLabel: 'Depressed',
    phrase: 'I feel depressed.',
    bg: '#A77CE8',
    featureColor: '#4A237A',
    badgeBg: 'bg-[#A77CE8]/15',
    badgeText: 'text-[#4A237A]',
    dotColor: '#A77CE8',
  },
  2: {
    level: 2,
    name: 'sad',
    shortLabel: 'Sad',
    phrase: 'I feel sad.',
    bg: '#F18947',
    featureColor: '#783508',
    badgeBg: 'bg-[#F18947]/15',
    badgeText: 'text-[#783508]',
    dotColor: '#F18947',
  },
  3: {
    level: 3,
    name: 'neutral',
    shortLabel: 'Neutral',
    phrase: 'I feel neutral.',
    bg: '#A88764',
    featureColor: '#453120',
    badgeBg: 'bg-[#A88764]/15',
    badgeText: 'text-[#453120]',
    dotColor: '#A88764',
  },
  4: {
    level: 4,
    name: 'happy',
    shortLabel: 'Happy',
    phrase: 'I feel happy.',
    bg: '#E9AD26',
    featureColor: '#614002',
    badgeBg: 'bg-[#E9AD26]/15',
    badgeText: 'text-[#614002]',
    dotColor: '#E9AD26',
  },
  5: {
    level: 5,
    name: 'overjoyed',
    shortLabel: 'Overjoyed',
    phrase: 'I feel overjoyed.',
    bg: '#8BAE68',
    featureColor: '#2B441B',
    badgeBg: 'bg-[#8BAE68]/15',
    badgeText: 'text-[#2B441B]',
    dotColor: '#8BAE68',
  },
};

export default function MoodFace({ level = 3, size = 48, className = '', monochrome = false }) {
  const numLevel = Math.min(Math.max(Number(level) || 3, 1), 5);
  const def = MOOD_DEFINITIONS[numLevel] || MOOD_DEFINITIONS[3];

  const bgColor = monochrome ? 'currentColor' : def.bg;
  const strokeColor = monochrome ? '#FFFFFF' : def.featureColor;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 transition-transform ${className}`}
    >
      {/* Circle Face */}
      <circle cx="50" cy="50" r="50" fill={bgColor} />

      {numLevel === 1 && (
        <g stroke={strokeColor} strokeWidth="8" strokeLinecap="round">
          {/* Left Eye X */}
          <line x1="28" y1="34" x2="40" y2="46" />
          <line x1="40" y1="34" x2="28" y2="46" />
          {/* Right Eye X */}
          <line x1="60" y1="34" x2="72" y2="46" />
          <line x1="72" y1="34" x2="60" y2="46" />
          {/* Frown */}
          <path d="M 32 73 C 38 58, 62 58, 68 73" fill="none" />
        </g>
      )}

      {numLevel === 2 && (
        <g stroke={strokeColor} strokeWidth="8" strokeLinecap="round">
          {/* Left Eye vertical pill */}
          <line x1="34" y1="34" x2="34" y2="46" />
          {/* Right Eye vertical pill */}
          <line x1="66" y1="34" x2="66" y2="46" />
          {/* Frown */}
          <path d="M 32 73 C 38 58, 62 58, 68 73" fill="none" />
        </g>
      )}

      {numLevel === 3 && (
        <g stroke={strokeColor} strokeWidth="8" strokeLinecap="round">
          {/* Left Eye vertical pill */}
          <line x1="34" y1="34" x2="34" y2="46" />
          {/* Right Eye vertical pill */}
          <line x1="66" y1="34" x2="66" y2="46" />
          {/* Neutral straight mouth */}
          <line x1="33" y1="67" x2="67" y2="67" />
        </g>
      )}

      {numLevel === 4 && (
        <g stroke={strokeColor} strokeWidth="8" strokeLinecap="round">
          {/* Left Eye vertical pill */}
          <line x1="34" y1="34" x2="34" y2="46" />
          {/* Right Eye vertical pill */}
          <line x1="66" y1="34" x2="66" y2="46" />
          {/* Upward smile */}
          <path d="M 31 60 C 37 77, 63 77, 69 60" fill="none" />
        </g>
      )}

      {numLevel === 5 && (
        <g stroke={strokeColor} strokeLinecap="round" fill="none">
          {/* Left joyful eye arc */}
          <path d="M 26 43 C 30 32, 40 32, 44 43" strokeWidth="8" />
          {/* Right joyful eye arc */}
          <path d="M 56 43 C 60 32, 70 32, 74 43" strokeWidth="8" />
          {/* Big happy smile */}
          <path d="M 29 58 C 36 80, 64 80, 71 58" strokeWidth="9" />
        </g>
      )}
    </svg>
  );
}

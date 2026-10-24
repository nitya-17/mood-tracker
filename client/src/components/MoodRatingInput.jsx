import React from 'react';
import MoodFace, { MOOD_DEFINITIONS } from './MoodFace';

export default function MoodRatingInput({ value = 3, onChange, error }) {
  const currentDef = MOOD_DEFINITIONS[value] || MOOD_DEFINITIONS[3];

  return (
    <div className="flex flex-col items-center text-center">
      <h3 className="font-display text-2xl sm:text-3xl font-bold text-espresso-700 tracking-tight mb-4">
        How's Your Mood?
      </h3>

      {/* Large Hero Face Illustration */}
      <div className="my-2 transform transition-all duration-300 hover:scale-105">
        <MoodFace level={value} size={110} />
      </div>

      {/* Mood Phrase */}
      <p className="font-display text-lg sm:text-xl font-medium text-espresso-800 tracking-wide mt-2 mb-6">
        {currentDef.phrase}
      </p>

      {/* Floating Pill Selector matching Image 1 */}
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-full p-1.5 shadow-pill border border-[#EAE2D7] flex items-center justify-between">
        {[1, 2, 3, 4, 5].map((lvl, index) => {
          const isSelected = value === lvl;
          return (
            <React.Fragment key={lvl}>
              {index > 0 && <div className="h-6 w-[1px] bg-[#EAE2D7]" />}
              <button
                type="button"
                onClick={() => onChange(lvl)}
                className={`flex-1 py-1.5 px-2 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'scale-120 drop-shadow-sm'
                    : 'opacity-40 hover:opacity-85 hover:scale-110'
                }`}
                title={MOOD_DEFINITIONS[lvl].phrase}
              >
                <MoodFace level={lvl} size={28} />
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {error && <p className="mt-3 text-xs text-rose-600 font-semibold">{error}</p>}
    </div>
  );
}

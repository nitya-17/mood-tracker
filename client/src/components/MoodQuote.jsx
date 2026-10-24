import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Quote, RefreshCw } from 'lucide-react';

export default function MoodQuote({ moodLevel }) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQuote = async (mood) => {
    setLoading(true);
    try {
      const data = await api.getQuote(mood);
      setQuote(data);
    } catch (err) {
      console.error('Failed to fetch mood quote', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote(moodLevel);
  }, [moodLevel]);

  if (!quote) return null;

  return (
    <div className="bg-[#FAF7F2] rounded-3xl p-6 shadow-soft border border-[#EAE2D7] flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Quote className="w-4 h-4 text-terracotta" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-espresso-500">
              Daily Reflection Quote
            </span>
          </div>

          <button
            onClick={() => fetchQuote(moodLevel)}
            disabled={loading}
            title="Refresh quote"
            className="p-1.5 text-espresso-500 hover:text-espresso-800 hover:bg-white rounded-full transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-terracotta' : ''}`} />
          </button>
        </div>

        <p className="font-display text-sm sm:text-base font-semibold text-espresso-800 italic leading-relaxed">
          "{quote.text}"
        </p>
      </div>

      <p className="text-xs font-bold text-espresso-500 mt-4 text-right">
        — {quote.author || 'Unknown'}
      </p>
    </div>
  );
}

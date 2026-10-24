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
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-200/60 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-200 flex-shrink-0 mt-0.5">
            <Quote className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-amber-800">
              Daily Mood Reflection Quote
            </span>
            <p className="text-sm font-medium text-slate-800 mt-1 italic leading-relaxed">
              "{quote.text}"
            </p>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              — {quote.author || 'Unknown'}
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchQuote(moodLevel)}
          disabled={loading}
          title="Get another quote"
          className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors flex-shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}

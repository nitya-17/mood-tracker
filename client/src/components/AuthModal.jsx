import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';

export default function AuthModal() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login, register, loginDemo } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        await register({ email, password, name, timezone: clientTz });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginDemo();
    } catch (err) {
      setError(err.message || 'Could not connect to demo account. Please verify database connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl shadow-slate-200/50">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 mx-auto flex items-center justify-center text-white text-2xl shadow-md shadow-indigo-100">
            🌱
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-4 tracking-tight">
            {isRegister ? 'Start Your Daily Journey' : 'Welcome to MoodPulse'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track daily moods, sleep cycles, and discover deep time-series insights.
          </p>
        </div>

        {/* 1-Click Demo Evaluation Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleDemoClick}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 border border-indigo-200/80 text-indigo-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs group"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 group-hover:rotate-12 transition-transform" />
            <span>Instant Demo Account (30 Days Pre-seeded Data)</span>
          </button>
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or with your credentials
            </span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            {isRegister
              ? 'Already have an account? Sign in here'
              : "Don't have an account? Register now"}
          </button>
        </div>
      </div>
    </div>
  );
}

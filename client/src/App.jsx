import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './api';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import TodayCard from './components/TodayCard';
import MoodQuote from './components/MoodQuote';
import RecentChart from './components/RecentChart';
import TrendComparison from './components/TrendComparison';
import CalendarHeatmap from './components/CalendarHeatmap';
import AnalyticsSection from './components/AnalyticsSection';
import CheckInForm from './components/CheckInForm';
import SettingsModal from './components/SettingsModal';
import ExportModal from './components/ExportModal';
import { Sparkles, RefreshCw, Layers, Database, ShieldCheck } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [todayEntry, setTodayEntry] = useState(null);
  const [todayDate, setTodayDate] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [streaks, setStreaks] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [correlation, setCorrelation] = useState(null);

  const [loadingData, setLoadingData] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const formRef = useRef(null);

  const loadDashboardData = async () => {
    if (!isAuthenticated) return;
    setLoadingData(true);
    try {
      const [todayData, recentData, compData, streakData, patData, corrData] = await Promise.all([
        api.getTodayEntry().catch(() => ({ entry: null })),
        api.getRecentEntries(30).catch(() => []),
        api.getComparison().catch(() => null),
        api.getStreaks().catch(() => null),
        api.getPatterns().catch(() => null),
        api.getCorrelation().catch(() => null),
      ]);

      setTodayEntry(todayData?.entry || null);
      setTodayDate(todayData?.today_date || new Date().toISOString().split('T')[0]);
      setRecentEntries(recentData || []);
      setComparison(compData);
      setStreaks(streakData);
      setPatterns(patData);
      setCorrelation(corrData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, user?.id]);

  const handleEntryCreated = (newEntry) => {
    setTodayEntry(newEntry);
    loadDashboardData();
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading your mood space...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar onOpenSettings={() => {}} onOpenExport={() => {}} todayLogged={false} />
        <main className="max-w-7xl mx-auto px-4">
          <AuthModal />
        </main>
      </div>
    );
  }

  const latestMood = todayEntry?.mood || (recentEntries.length > 0 ? recentEntries[recentEntries.length - 1].mood : 3);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Navbar */}
      <Navbar
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenExport={() => setExportOpen(true)}
        todayLogged={!!todayEntry}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Top Header & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Hello, {user?.name?.split(' ')[0] || 'Friend'} 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Welcome back to your emotional wellbeing and time-series dashboard.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              disabled={loadingData}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin text-indigo-600' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* 1. Today's Status Banner & Mood Quote */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TodayCard todayEntry={todayEntry} onScrollToForm={scrollToForm} />
          </div>
          <div>
            <MoodQuote moodLevel={latestMood} />
          </div>
        </div>

        {/* 2. Past 5 vs. Previous 5 Check-ins Comparison */}
        <TrendComparison comparison={comparison} />

        {/* 3. 11-Bar Recent Graph with Day Inspector */}
        <RecentChart entries={recentEntries} />

        {/* 4. Calendar Heatmap with Missing Days & Gaps */}
        <CalendarHeatmap entries={recentEntries} days={30} />

        {/* 5. SQL Analytics (Gaps & Islands Streaks, CORR Correlation, Day-of-week) */}
        <AnalyticsSection streaks={streaks} patterns={patterns} correlation={correlation} />

        {/* 6. Daily Check-in Form */}
        <div ref={formRef} className="pt-2">
          <CheckInForm onEntryCreated={handleEntryCreated} todayDate={todayDate} />
        </div>
      </main>

      {/* Footer & Architecture Notes */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-200 text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>PostgreSQL & Supabase Time-Series Analytics</span>
            <span>•</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Strict Client/Server Zod Validation</span>
          </div>
          <p className="text-slate-400">
            Portfolio Project: Time-series analysis, SQL window functions, and scheduled jobs.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}

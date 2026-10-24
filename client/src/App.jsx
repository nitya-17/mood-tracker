import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './api';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import TodayCard from './components/TodayCard';
import MoodQuote from './components/MoodQuote';
import MoodOverviewCard from './components/MoodOverviewCard';
import CalendarHeatmap from './components/CalendarHeatmap';
import AnalyticsSection from './components/AnalyticsSection';
import CheckInForm from './components/CheckInForm';
import SettingsModal from './components/SettingsModal';
import ExportModal from './components/ExportModal';
import MoodFace from './components/MoodFace';
import { RefreshCw, Database, ShieldCheck } from 'lucide-react';

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
        api.getRecentEntries(60).catch(() => []),
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
    setRecentEntries((prev) => {
      const dateKey = (newEntry.entry_date || '').slice(0, 10);
      const filtered = prev.filter((e) => (e.entry_date || '').slice(0, 10) !== dateKey);
      return [...filtered, newEntry];
    });
    loadDashboardData();
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-3">
          <MoodFace level={5} size={54} className="animate-bounce" />
          <p className="font-display text-xs font-bold text-espresso-700">Loading your space...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <Navbar onOpenSettings={() => {}} onOpenExport={() => {}} todayLogged={false} />
        <main className="max-w-4xl mx-auto px-4">
          <AuthModal />
        </main>
      </div>
    );
  }

  const latestMood = todayEntry?.mood || (recentEntries.length > 0 ? recentEntries[recentEntries.length - 1].mood : 4);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      {/* Navbar */}
      <Navbar
        onOpenSettings={() => setSettingsOpen(true)}
        onScrollToForm={scrollToForm}
        todayLogged={!!todayEntry}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Top Header & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-espresso-800 tracking-tight">
              Hello, {user?.name?.split(' ')[0] || 'Friend'} 👋
            </h2>
            <p className="text-xs sm:text-sm font-medium text-espresso-500 mt-0.5">
              Reflect, track, and watch your emotional wellbeing unfold.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              disabled={loadingData}
              className="px-4 py-2 rounded-full bg-white border border-[#EAE2D7] text-espresso-700 hover:text-espresso-900 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin text-terracotta' : ''}`} />
              <span>Refresh</span>
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

        {/* 2. Dual Overview & Time-Series Graph (Matching Image 2) */}
        <MoodOverviewCard entries={recentEntries} comparison={comparison} />

        {/* 3. Monthly Calendar Grid with Gaps and Illustrated Faces (Matching Image 3) */}
        <CalendarHeatmap
          entries={recentEntries}
          todayEntry={todayEntry}
          onLogClick={scrollToForm}
          onSelectDay={(entry) => {}}
        />

        {/* 4. SQL Analytics (Gaps & Islands Streaks, CORR Correlation, Day-of-week) */}
        <AnalyticsSection streaks={streaks} patterns={patterns} correlation={correlation} />

        {/* 5. Daily Check-in Form (Matching Image 1) */}
        <div ref={formRef} className="pt-2">
          <CheckInForm onEntryCreated={handleEntryCreated} todayDate={todayDate} />
        </div>
      </main>

      {/* Footer & Architecture Notes */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 pt-8 border-t border-[#EAE2D7] text-xs font-medium text-espresso-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-sage" />
            <span>PostgreSQL & Supabase Time-Series Analytics</span>
            <span>•</span>
            <ShieldCheck className="w-4 h-4 text-terracotta" />
            <span>Client & Server Zod Validation</span>
          </div>
          <p className="text-espresso-500">
            Portfolio Project: Time-series analysis, SQL window functions, and background jobs.
          </p>
        </div>
      </footer>

      {/* Settings Modal (Includes Reminders & Data Export) */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

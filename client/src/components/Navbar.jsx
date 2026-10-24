import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Settings, Download, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar({ onOpenSettings, onOpenExport, todayLogged }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 font-bold text-lg">
            🌱
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight text-lg leading-tight">
              MoodPulse
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">Time-Series Analytics & Daily Reflection</p>
          </div>
        </div>

        {/* User / Actions */}
        {user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Today status badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border">
              {todayLogged ? (
                <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Today Logged
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border-amber-200 px-2.5 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Awaiting Check-in
                </span>
              )}
            </div>

            {/* Export data button */}
            <button
              onClick={onOpenExport}
              title="Export Check-in Data"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              title="Settings & Reminders"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* User profile avatar & logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 object-cover"
              />
              <span className="text-sm font-medium text-slate-800 hidden lg:inline max-w-[120px] truncate">
                {user.name}
              </span>
              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

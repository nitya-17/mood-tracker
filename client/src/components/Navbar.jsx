import React from 'react';
import { useAuth } from '../context/AuthContext';
import MoodFace from './MoodFace';
import { Settings, Download, LogOut, CheckCircle2 } from 'lucide-react';

export default function Navbar({ onOpenSettings, onOpenExport, todayLogged }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EAE2D7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <MoodFace level={5} size={34} />
          <div>
            <h1 className="font-display font-extrabold text-espresso-800 tracking-tight text-lg leading-tight">
              MoodPulse
            </h1>
            <p className="text-[11px] font-medium text-espresso-500 hidden sm:block">
              Mindful Moods & Daily Reflections
            </p>
          </div>
        </div>

        {/* User / Actions */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Today status badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-[#EAE2D7]">
              {todayLogged ? (
                <span className="flex items-center gap-1.5 text-sage text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-sage animate-pulse"></span>
                  Today Logged
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-terracotta text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-terracotta"></span>
                  Check-in Awaiting
                </span>
              )}
            </div>

            {/* Export data button */}
            <button
              onClick={onOpenExport}
              title="Export Check-in Data"
              className="p-2 text-espresso-700 hover:text-espresso-900 hover:bg-white rounded-full transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Download className="w-4 h-4 text-terracotta" />
              <span className="hidden md:inline">Export</span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              title="Settings & Reminders"
              className="p-2 text-espresso-700 hover:text-espresso-900 hover:bg-white rounded-full transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Settings className="w-4 h-4 text-terracotta" />
              <span className="hidden md:inline">Settings</span>
            </button>

            {/* User profile avatar & logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#EAE2D7]">
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-[#DDD2C3] bg-white object-cover"
              />
              <span className="text-xs font-bold text-espresso-800 hidden lg:inline max-w-[110px] truncate">
                {user.name}
              </span>
              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 text-espresso-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
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

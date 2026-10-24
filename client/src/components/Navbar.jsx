import React from 'react';
import { useAuth } from '../context/AuthContext';
import MoodFace from './MoodFace';
import { Settings, LogOut } from 'lucide-react';

export default function Navbar({ onOpenSettings, onScrollToForm, todayLogged }) {
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
            {/* Today status button: Green when logged, Red when not logged */}
            <button
              onClick={todayLogged ? undefined : onScrollToForm}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                todayLogged
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer animate-pulse'
              }`}
              title={todayLogged ? "Today's check-in recorded" : "Click to log today's mood"}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  todayLogged
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-300'
                    : 'bg-rose-500 shadow-sm shadow-rose-300'
                }`}
              />
              <span>{todayLogged ? 'Today Logged' : 'Not Logged'}</span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              title="Settings & Export"
              className="px-3 py-1.5 text-espresso-700 hover:text-espresso-900 bg-white hover:bg-cream-100 border border-[#EAE2D7] rounded-full transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs"
            >
              <Settings className="w-3.5 h-3.5 text-terracotta" />
              <span>Settings</span>
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

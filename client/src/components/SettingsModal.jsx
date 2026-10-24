import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { X, User, Bell, Clock, Save, CheckCircle2, Download, FileSpreadsheet, FileJson } from 'lucide-react';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Astra',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Luna',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Kite',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Milo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Nova',
];

export default function SettingsModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');

  const [reminderTime, setReminderTime] = useState('20:00');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderChannel, setReminderChannel] = useState('email');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatar_url || '');
      setTimezone(user.timezone || 'UTC');
    }

    async function loadReminders() {
      try {
        const data = await api.getReminders();
        if (data) {
          setReminderTime(data.time_of_day ? data.time_of_day.slice(0, 5) : '20:00');
          setReminderEnabled(data.enabled);
          setReminderChannel(data.channel || 'email');
        }
      } catch (err) {
        console.error('Failed to load reminders', err);
      }
    }

    if (isOpen) {
      loadReminders();
      setSavedSuccess(false);
      setExportFormat(null);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateUser({ name, avatar_url: avatarUrl, timezone });

      await api.updateReminders({
        time_of_day: reminderTime,
        enabled: reminderEnabled,
        channel: reminderChannel,
      });

      setSavedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    setExportFormat(format);
    try {
      await api.downloadExport(format);
    } catch (err) {
      console.error('Export error', err);
    } finally {
      setExporting(false);
      setTimeout(() => setExportFormat(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-xl border border-[#EAE2D7] relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-espresso-500 hover:text-espresso-800 p-1 rounded-full hover:bg-cream-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-display text-2xl font-bold text-espresso-800 tracking-tight">
          Settings & Preferences
        </h3>
        <p className="text-xs text-espresso-500 mt-1">
          Manage your profile, daily reminders, and data export.
        </p>

        {savedSuccess && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Preferences saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-espresso-700 uppercase tracking-wider mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EAE2D7] bg-cream-50 text-sm font-medium focus:outline-none focus:border-terracotta"
              required
            />
          </div>

          {/* Avatar presets */}
          <div>
            <label className="block text-xs font-bold text-espresso-700 uppercase tracking-wider mb-2">
              Preset Avatars
            </label>
            <div className="flex items-center gap-2.5">
              {PRESET_AVATARS.map((avatar, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setAvatarUrl(avatar)}
                  className={`w-10 h-10 rounded-full p-0.5 border-2 transition-all ${
                    avatarUrl === avatar
                      ? 'border-terracotta scale-110 shadow-xs'
                      : 'border-[#DDD2C3] hover:border-terracotta/50'
                  }`}
                >
                  <img src={avatar} alt="Preset" className="w-full h-full rounded-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-xs font-bold text-espresso-700 uppercase tracking-wider mb-1">
              Timezone (Computes your local calendar "today")
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE2D7] bg-cream-50 text-xs font-semibold focus:outline-none focus:border-terracotta"
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York">America/New_York (EST/EDT)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
              <option value="America/Chicago">America/Chicago (CST/CDT)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
              <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
            </select>
          </div>

          {/* Reminders section */}
          <div className="pt-4 border-t border-[#F4EFE8]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-terracotta" />
                <span className="text-xs font-bold text-espresso-800 uppercase tracking-wider">
                  Scheduled Check-in Reminder
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-cream-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-terracotta"></div>
              </label>
            </div>

            {reminderEnabled && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block text-[11px] font-bold text-espresso-500 mb-1">
                    Notification Time
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE2D7] bg-cream-50 text-xs font-bold focus:outline-none focus:border-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-espresso-500 mb-1">
                    Channel
                  </label>
                  <select
                    value={reminderChannel}
                    onChange={(e) => setReminderChannel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE2D7] bg-cream-50 text-xs font-bold focus:outline-none focus:border-terracotta"
                  >
                    <option value="email">Email</option>
                    <option value="push">Web Push</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Data Export Section inside Settings */}
          <div className="pt-4 border-t border-[#F4EFE8]">
            <div className="flex items-center gap-2 mb-1.5">
              <Download className="w-4 h-4 text-terracotta" />
              <span className="text-xs font-bold text-espresso-800 uppercase tracking-wider">
                Export Check-in Data
              </span>
            </div>
            <p className="text-[11px] font-medium text-espresso-500 mb-3">
              Download your complete archive of moods, sleep hours, feelings, and reflections.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="py-2.5 px-3 rounded-2xl bg-cream-100 hover:bg-cream-200 border border-[#EAE2D7] text-espresso-800 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4 text-sage" />
                <span>{exporting && exportFormat === 'csv' ? 'Exporting...' : 'Download CSV'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleExport('json')}
                disabled={exporting}
                className="py-2.5 px-3 rounded-2xl bg-cream-100 hover:bg-cream-200 border border-[#EAE2D7] text-espresso-800 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <FileJson className="w-4 h-4 text-terracotta" />
                <span>{exporting && exportFormat === 'json' ? 'Exporting...' : 'Download JSON'}</span>
              </button>
            </div>

            {exportFormat && !exporting && (
              <div className="mt-2.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Exported {exportFormat.toUpperCase()} archive successfully!</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-espresso-600 hover:text-espresso-800 rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-terracotta hover:bg-terracotta-hover rounded-full shadow-md shadow-terracotta/20 transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

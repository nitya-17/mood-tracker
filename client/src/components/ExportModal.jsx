import React, { useState } from 'react';
import { api } from '../api';
import { X, FileSpreadsheet, FileJson, Download, CheckCircle } from 'lucide-react';

export default function ExportModal({ isOpen, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadedFormat, setDownloadedFormat] = useState(null);

  if (!isOpen) return null;

  const handleDownload = async (format) => {
    setDownloading(true);
    setDownloadedFormat(format);
    try {
      await api.downloadExport(format);
    } catch (err) {
      console.error('Export download error', err);
    } finally {
      setDownloading(false);
      setTimeout(() => setDownloadedFormat(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-[#EAE2D7] relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-espresso-500 hover:text-espresso-800 p-1 rounded-full hover:bg-cream-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-display text-2xl font-bold text-espresso-800 tracking-tight flex items-center gap-2">
          <Download className="w-5 h-5 text-terracotta" />
          Export Check-in Data
        </h3>
        <p className="text-xs text-espresso-500 mt-1">
          Download your historical archive of daily moods, sleep hours, feelings, and reflections.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {/* CSV Export */}
          <div className="border border-[#EAE2D7] bg-cream-50 rounded-2xl p-4 flex flex-col justify-between hover:border-terracotta/60 transition-all">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-sage/20 text-sage flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-espresso-800 text-sm">CSV File</h4>
              <p className="text-[11px] text-espresso-500 mt-1">
                Optimized for Excel, Google Sheets, and tabular analysis.
              </p>
            </div>
            <button
              onClick={() => handleDownload('csv')}
              disabled={downloading}
              className="mt-4 w-full py-2.5 px-3 rounded-full bg-sage hover:bg-[#789A57] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading && downloadedFormat === 'csv' ? 'Exporting...' : 'Download CSV'}</span>
            </button>
          </div>

          {/* JSON Export */}
          <div className="border border-[#EAE2D7] bg-cream-50 rounded-2xl p-4 flex flex-col justify-between hover:border-terracotta/60 transition-all">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-terracotta/15 text-terracotta flex items-center justify-center mb-3">
                <FileJson className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-espresso-800 text-sm">JSON Data</h4>
              <p className="text-[11px] text-espresso-500 mt-1">
                Raw structured time-series data for developer workflows.
              </p>
            </div>
            <button
              onClick={() => handleDownload('json')}
              disabled={downloading}
              className="mt-4 w-full py-2.5 px-3 rounded-full bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading && downloadedFormat === 'json' ? 'Exporting...' : 'Download JSON'}</span>
            </button>
          </div>
        </div>

        {downloadedFormat && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Archive exported successfully as {downloadedFormat.toUpperCase()}!
          </div>
        )}
      </div>
    </div>
  );
}

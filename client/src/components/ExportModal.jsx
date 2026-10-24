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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Download className="w-5 h-5 text-indigo-600" />
          Export Check-in Data
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Download your complete history of daily mood logs, sleep hours, feelings, and reflections.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {/* CSV Export Option */}
          <div className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-400 hover:bg-indigo-50/20 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">CSV Spreadsheet</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Optimized for Excel, Google Sheets, and data analytics tools.
              </p>
            </div>
            <button
              onClick={() => handleDownload('csv')}
              disabled={downloading}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading && downloadedFormat === 'csv' ? 'Exporting...' : 'Download CSV'}</span>
            </button>
          </div>

          {/* JSON Export Option */}
          <div className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-400 hover:bg-indigo-50/20 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <FileJson className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">JSON Format</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Raw structured time-series data for developer workflows.
              </p>
            </div>
            <button
              onClick={() => handleDownload('json')}
              disabled={downloading}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading && downloadedFormat === 'json' ? 'Exporting...' : 'Download JSON'}</span>
            </button>
          </div>
        </div>

        {downloadedFormat && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Export downloaded successfully in {downloadedFormat.toUpperCase()}!
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Smartphone, Download, X } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const { canInstallPWA, installPWA } = useExpense();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstallPWA || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white px-4 py-3 border-b border-indigo-800 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/50 rounded-lg text-indigo-200">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold">Install Expense Tracker PWA</p>
            <p className="text-xs text-indigo-200 hidden sm:block">
              Add to Home Screen for fast native app experience & offline expense tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={installPWA}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-indigo-300 hover:text-white rounded-md hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

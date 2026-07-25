import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Bell, 
  DollarSign, 
  ShieldCheck, 
  Download, 
  Upload, 
  Trash2, 
  LogOut, 
  LogIn, 
  Sun, 
  Moon, 
  Clock,
  Sparkles,
  Send
} from 'lucide-react';
import { requestNotificationPermission, showLocalNotification } from '../lib/notifications';

export const Settings: React.FC = () => {
  const { 
    user, 
    loginWithGoogle, 
    openAuthModal,
    logout, 
    settings, 
    updateSettings, 
    toggleTheme, 
    expenses, 
    categories 
  } = useExpense();

  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState<string>(settings.monthlyBudget.toString());
  const [warningThresholdInput, setWarningThresholdInput] = useState<string>(settings.warningThresholdPercent.toString());
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string>('');

  const currencies = [
    { symbol: '৳', label: 'BDT (৳)' },
    { symbol: '$', label: 'USD ($)' },
    { symbol: '₹', label: 'INR (₹)' },
    { symbol: '€', label: 'EUR (€)' },
    { symbol: '£', label: 'GBP (£)' },
    { symbol: '฿', label: 'THB (฿)' },
  ];

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(monthlyBudgetInput) || 20000;
    const thresholdNum = parseInt(warningThresholdInput) || 80;

    updateSettings({
      monthlyBudget: budgetNum,
      warningThresholdPercent: Math.min(100, Math.max(10, thresholdNum)),
    });

    setSavedSuccessMsg('Budget settings updated successfully!');
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  const handleTestNotification = async () => {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      showLocalNotification(
        'আজকের খরচ ট্র্যাকার রিমাইন্ডার',
        'আজকের খরচ যোগ করেছো? (Did you log your expenses today?)'
      );
      setSavedSuccessMsg('Test notification sent!');
      setTimeout(() => setSavedSuccessMsg(''), 3000);
    } else {
      alert('Notification permission was denied in your browser settings.');
    }
  };

  // Export JSON Backup
  const handleExportData = () => {
    const backupData = {
      version: 1,
      exportDate: new Date().toISOString(),
      expenses,
      categories,
      settings,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear Cache
  const handleClearData = () => {
    if (confirm('Are you sure you want to clear local cache? Your synced Firebase data will reload.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Application Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Manage currency, budget warnings, daily reminders, and backup data.
        </p>
      </div>

      {savedSuccessMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-fade-in">
          {savedSuccessMsg}
        </div>
      )}

      {/* Account & Firebase Auth */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3>Account & Cloud Backup</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {user?.displayName || (user?.isAnonymous ? 'Single User (Anonymous Mode)' : 'Single User')}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.email || 'Firestore cloud persistence active'}
              </p>
            </div>
          </div>

          {user?.isAnonymous || !user ? (
            <button
              onClick={openAuthModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-indigo-600/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In / Create Account</span>
            </button>
          ) : (
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs font-bold flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Currency & Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Currency Selection */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
            <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3>Preferred Currency</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select the currency symbol for expense values
          </p>
          <div className="grid grid-cols-3 gap-2">
            {currencies.map((c) => (
              <button
                key={c.symbol}
                onClick={() => updateSettings({ currency: c.symbol })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  settings.currency === c.symbol
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Settings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
            {settings.theme === 'light' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            <h3>Appearance Theme</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Switch between Light mode and Dark mode
          </p>
          <button
            onClick={toggleTheme}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-between"
          >
            <span>Current: {settings.theme.toUpperCase()} MODE</span>
            <span className="text-indigo-600 dark:text-indigo-400">Toggle Theme</span>
          </button>
        </div>

      </div>

      {/* Monthly Budget & Overspending Control */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
          <SettingsIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3>Monthly Budget & Overspend Guard</h3>
        </div>

        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Monthly Target Budget ({settings.currency})
              </label>
              <input
                type="number"
                value={monthlyBudgetInput}
                onChange={(e) => setMonthlyBudgetInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Warning Threshold (%)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={warningThresholdInput}
                onChange={(e) => setWarningThresholdInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white font-bold"
              />
            </div>

          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
          >
            Update Budget Target
          </button>
        </form>
      </div>

      {/* Local Notification Reminders */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3>Daily Expense Local Reminders</h3>
          </div>

          <button
            onClick={handleTestNotification}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Test Notification</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Browser Notification API reminders scheduled 3 times daily (Morning, Afternoon, Evening):
          <br />
          <span className="font-semibold text-slate-700 dark:text-slate-300">"আজকের খরচ যোগ করেছো?" • "আজ কত টাকা খরচ হলো?"</span>
        </p>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Active Reminder Times: 10:00 AM, 02:00 PM, 09:00 PM</span>
          </div>
          <button
            onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              settings.notificationsEnabled
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {settings.notificationsEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
          <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3>Data Export & Local Storage</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Backup</span>
          </button>

          <button
            onClick={handleClearData}
            className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs font-bold flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Local Cache</span>
          </button>
        </div>
      </div>

    </div>
  );
};

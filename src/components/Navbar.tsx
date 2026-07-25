import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { 
  Wallet, 
  Sun, 
  Moon, 
  Download, 
  Wifi, 
  WifiOff, 
  Bell, 
  User as UserIcon,
  Plus,
  LogIn,
  LogOut
} from 'lucide-react';
import { requestNotificationPermission } from '../lib/notifications';

export const Navbar: React.FC = () => {
  const { 
    isOnline, 
    settings, 
    toggleTheme, 
    canInstallPWA, 
    installPWA, 
    user, 
    openAddExpenseModal,
    openAuthModal,
    logout,
    updateSettings
  } = useExpense();

  const handleNotificationClick = async () => {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      updateSettings({ notificationsEnabled: true });
      alert('Local notifications enabled! You will receive daily expense reminders.');
    } else {
      alert('Notification permission was blocked in your browser settings.');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight leading-none flex items-center gap-2">
              Expense Tracker
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Personal Budget & Overspend Guard
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Online / Offline Status Badge */}
          <div 
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isOnline 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
            }`}
            title={isOnline ? 'Connected to Firebase' : 'Working Offline (Changes stored locally)'}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online Sync' : 'Offline Mode'}</span>
          </div>

          {/* Install PWA Prompt Button */}
          {canInstallPWA && (
            <button
              onClick={installPWA}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all border border-indigo-200 dark:border-indigo-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Install App</span>
            </button>
          )}

          {/* Quick Add Expense Button (Header Desktop) */}
          <button
            onClick={() => openAddExpenseModal()}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          {/* Notifications Toggle */}
          <button
            onClick={handleNotificationClick}
            className={`p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative ${
              settings.notificationsEnabled ? 'text-indigo-600 dark:text-indigo-400' : ''
            }`}
            title="Notification Reminders"
          >
            <Bell className="w-4 h-4" />
            {settings.notificationsEnabled && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={settings.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {settings.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* User Profile & Auth Button */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            {user && !user.isAnonymous ? (
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="User" 
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-200 dark:border-indigo-800">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                )}
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-600/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

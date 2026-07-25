import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { ActiveTab } from '../types';
import { 
  LayoutDashboard, 
  ReceiptText, 
  FolderKanban, 
  Settings as SettingsIcon, 
  Plus,
  AlertTriangle
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    openAddExpenseModal, 
    settings, 
    totalExpenseThisMonth, 
    isBudgetOverLimit,
    isBudgetWarning,
    budgetSpentPercentage
  } = useExpense();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses List', icon: ReceiptText },
    { id: 'categories', label: 'Categories', icon: FolderKanban },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-6 shrink-0">
      
      {/* Quick Add Expense Action */}
      <button
        onClick={() => openAddExpenseModal()}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30 active:scale-98"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span>Add New Expense</span>
      </button>

      {/* Navigation Links */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Monthly Budget Summary Card in Sidebar */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
          <span>Monthly Budget</span>
          <span>{settings.currency}{settings.monthlyBudget.toLocaleString()}</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-baseline">
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {settings.currency}{totalExpenseThisMonth.toLocaleString()}
            </span>
            <span className={`text-xs font-bold ${isBudgetOverLimit ? 'text-rose-600' : isBudgetWarning ? 'text-amber-500' : 'text-emerald-500'}`}>
              {budgetSpentPercentage}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isBudgetOverLimit
                  ? 'bg-rose-500'
                  : isBudgetWarning
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetSpentPercentage)}%` }}
            />
          </div>
        </div>

        {isBudgetOverLimit && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Over budget limit!</span>
          </div>
        )}
      </div>

    </aside>
  );
};

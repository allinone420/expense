import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { ActiveTab } from '../types';
import { 
  LayoutDashboard, 
  ReceiptText, 
  FolderKanban, 
  Settings as SettingsIcon, 
  Plus 
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openAddExpenseModal } = useExpense();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: ReceiptText },
    { id: 'categories', label: 'Categories', icon: FolderKanban },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) for Mobile/Tablet */}
      <button
        onClick={() => openAddExpenseModal()}
        className="fixed right-5 bottom-20 z-40 sm:hidden w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 active:scale-95 transition-transform"
        aria-label="Add Expense"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

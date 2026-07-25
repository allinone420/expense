import React from 'react';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';
import { CategoryManager } from './components/CategoryManager';
import { Settings } from './components/Settings';
import { ExpenseModal } from './components/ExpenseModal';

const AppContent: React.FC = () => {
  const { activeTab } = useExpense();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <OfflineBanner />
      <Navbar />
      <PWAInstallPrompt />

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex min-h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar Navigation */}
        <Sidebar />

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'expenses' && <ExpenseList />}
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Add/Edit Expense Modal */}
      <ExpenseModal />
    </div>
  );
};

export default function App() {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
}

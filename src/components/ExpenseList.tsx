import React, { useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { 
  Search, 
  Filter, 
  Calendar, 
  Trash2, 
  Edit2, 
  Plus, 
  X,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import { TimeViewMode, QuickFilterPeriod, Expense } from '../types';

export const ExpenseList: React.FC = () => {
  const { 
    filteredExpenses, 
    categories, 
    settings, 
    filters, 
    setFilters, 
    resetFilters, 
    timeViewMode, 
    setTimeViewMode,
    openAddExpenseModal,
    deleteExpense,
    totalFilteredExpense
  } = useExpense();

  // Handle Quick Period Pill Clicks
  const handlePeriodChange = (period: QuickFilterPeriod) => {
    setFilters((prev) => ({ ...prev, period }));
  };

  // Group Expenses based on timeViewMode (daily, weekly, monthly)
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, Expense[]> = {};

    filteredExpenses.forEach((exp) => {
      const expDate = new Date(exp.date + 'T00:00:00');
      let groupKey = exp.date;

      if (timeViewMode === 'daily') {
        groupKey = expDate.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      } else if (timeViewMode === 'weekly') {
        const startOfWeek = new Date(expDate);
        startOfWeek.setDate(expDate.getDate() - expDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        groupKey = `Week of ${startOfWeek.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      } else if (timeViewMode === 'monthly') {
        groupKey = expDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(exp);
    });

    return groups;
  }, [filteredExpenses, timeViewMode]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title & Add Expense Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Expense Records & History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Filter, search, and manage your daily personal expenditures.
          </p>
        </div>

        <button
          onClick={() => openAddExpenseModal()}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Filter Toolbar Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Top Controls: Search Bar & Time View Toggles */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Keyword Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes, categories, amount..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Time View Mode Switcher (Daily / Weekly / Monthly) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start md:self-auto">
            {(['daily', 'weekly', 'monthly'] as TimeViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setTimeViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  timeViewMode === mode
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {mode} View
              </button>
            ))}
          </div>

        </div>

        {/* Quick Filter Pills (Today, This Week, This Month, All, Custom) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'all', label: 'All Time' },
              { id: 'custom', label: 'Custom Range' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePeriodChange(p.id as QuickFilterPeriod)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filters.period === p.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {(filters.categoryId !== 'all' || filters.searchQuery || filters.period !== 'month' || filters.startDate) && (
              <button
                onClick={resetFilters}
                className="p-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1"
                title="Reset Filters"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom Date Range Selectors if 'custom' selected */}
        {filters.period === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">From:</span>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">To:</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

      </div>

      {/* Filter Results Total Summary */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
        <span>Showing {filteredExpenses.length} transaction(s)</span>
        <span className="text-slate-900 dark:text-white font-bold text-sm">
          Total: {settings.currency}{totalFilteredExpense.toLocaleString()}
        </span>
      </div>

      {/* Grouped Transactions List */}
      {Object.keys(groupedExpenses).length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
            No Expenses Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No expenses matched your selected filter criteria or search query.
          </p>
          <button
            onClick={() => openAddExpenseModal()}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm"
          >
            Add New Expense
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedExpenses).map(([groupTitle, items]: [string, Expense[]]) => {
            const groupSubtotal = items.reduce((sum, item) => sum + item.amount, 0);

            return (
              <div key={groupTitle} className="space-y-2">
                
                {/* Group Date Header */}
                <div className="flex items-center justify-between px-2 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="uppercase tracking-wider">{groupTitle}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    Subtotal: {settings.currency}{groupSubtotal.toLocaleString()}
                  </span>
                </div>

                {/* Group Items Card */}
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden">
                  {items.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: exp.categoryColor || '#8b5cf6' }}
                        >
                          <CategoryIcon name={exp.categoryIcon || 'Tag'} className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {exp.categoryName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {exp.note || 'No note added'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                            -{settings.currency}{exp.amount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {exp.date}
                          </span>
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openAddExpenseModal(exp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Expense"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

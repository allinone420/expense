import React, { useState, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { X, Check, Calendar, DollarSign, Tag, FileText, Zap } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

export const ExpenseModal: React.FC = () => {
  const { 
    isAddExpenseModalOpen, 
    closeAddExpenseModal, 
    editingExpense, 
    categories, 
    addExpense, 
    updateExpense,
    settings 
  } = useExpense();

  const todayStr = new Date().toISOString().split('T')[0];

  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(todayStr);
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isMinimalMode, setIsMinimalMode] = useState<boolean>(false);

  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setCategoryId(editingExpense.categoryId);
      setDate(editingExpense.date);
      setNote(editingExpense.note || '');
    } else {
      setAmount('');
      setCategoryId(categories[0]?.id || '');
      setDate(todayStr);
      setNote('');
    }
    setError('');
  }, [editingExpense, isAddExpenseModalOpen, categories]);

  if (!isAddExpenseModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid expense amount greater than 0.');
      return;
    }

    const selectedCat = categories.find((c) => c.id === categoryId) || categories[0];

    if (!selectedCat) {
      setError('Please select a valid category.');
      return;
    }

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, {
          amount: parsedAmount,
          date,
          categoryId: selectedCat.id,
          categoryName: selectedCat.name,
          categoryColor: selectedCat.color,
          categoryIcon: selectedCat.icon,
          note,
        });
      } else {
        await addExpense({
          amount: parsedAmount,
          date,
          categoryId: selectedCat.id,
          categoryName: selectedCat.name,
          categoryColor: selectedCat.color,
          categoryIcon: selectedCat.icon,
          note,
        });
      }

      closeAddExpenseModal();
    } catch (err) {
      setError('Failed to save expense. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track personal expenditures instantly
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!editingExpense && (
              <button
                type="button"
                onClick={() => setIsMinimalMode(!isMinimalMode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  isMinimalMode 
                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
                title="Toggle Minimal Quick Add Mode"
              >
                {isMinimalMode ? 'Quick Mode On' : 'Standard Mode'}
              </button>
            )}

            <button
              onClick={closeAddExpenseModal}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Expense Amount ({settings.currency}) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {settings.currency}
              </span>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xl font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category Selection Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all text-left ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Inputs (Date & Note) - Hidden in Minimal Mode unless expanded */}
          {!isMinimalMode && (
            <>
              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Transaction Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Note / Description Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Note / Description (Optional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <textarea
                    rows={2}
                    placeholder="e.g. Lunch with colleagues, Metro card recharge..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeAddExpenseModal}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingExpense ? 'Update Expense' : 'Save Expense'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

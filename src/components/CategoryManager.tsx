import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  FolderKanban, 
  Check, 
  X,
  Palette,
  Sparkles
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import { AVAILABLE_CATEGORY_ICONS, AVAILABLE_CATEGORY_COLORS } from '../lib/categories';
import { Category } from '../types';

export const CategoryManager: React.FC = () => {
  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    expenses, 
    settings 
  } = useExpense();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentCatId, setCurrentCatId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [color, setColor] = useState<string>(AVAILABLE_CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState<string>(AVAILABLE_CATEGORY_ICONS[0]);
  const [error, setError] = useState<string>('');

  const openForm = (cat?: Category) => {
    if (cat) {
      setCurrentCatId(cat.id);
      setName(cat.name);
      setColor(cat.color);
      setIcon(cat.icon);
    } else {
      setCurrentCatId(null);
      setName('');
      setColor(AVAILABLE_CATEGORY_COLORS[Math.floor(Math.random() * AVAILABLE_CATEGORY_COLORS.length)]);
      setIcon(AVAILABLE_CATEGORY_ICONS[0]);
    }
    setError('');
    setIsEditing(true);
  };

  const closeForm = () => {
    setIsEditing(false);
    setCurrentCatId(null);
    setName('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a category name.');
      return;
    }

    try {
      if (currentCatId) {
        await updateCategory(currentCatId, { name, color, icon });
      } else {
        await addCategory({ name, color, icon });
      }
      closeForm();
    } catch (err) {
      setError('Failed to save category.');
    }
  };

  const handleDelete = async (cat: Category) => {
    if (cat.isDefault) {
      alert('Default categories cannot be deleted.');
      return;
    }

    if (confirm(`Are you sure you want to delete "${cat.name}" category?`)) {
      await deleteCategory(cat.id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Category Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Customize colors, icons, and custom spending categories.
          </p>
        </div>

        <button
          onClick={() => openForm()}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Category</span>
        </button>
      </div>

      {/* Add / Edit Category Modal */}
      {isEditing && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/80 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {currentCatId ? 'Edit Category' : 'Create Custom Category'}
            </h3>
            <button
              onClick={closeForm}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Category Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Subscriptions, Gaming, Healthcare..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Color Palette Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Category Color
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_CATEGORY_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      color === c ? 'scale-125 border-slate-900 dark:border-white shadow-md' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Icon Picker Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Category Icon
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
                {AVAILABLE_CATEGORY_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                      icon === ic
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <CategoryIcon name={ic} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeForm}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          // Compute total expenses for this category
          const catExpenseTotal = expenses
            .filter((e) => e.categoryId === cat.id)
            .reduce((sum, e) => sum + e.amount, 0);

          const catCount = expenses.filter((e) => e.categoryId === cat.id).length;

          return (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon name={cat.icon} className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      {cat.name}
                    </h4>
                    {cat.isDefault && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {catCount} expense(s) • Total: {settings.currency}{catExpenseTotal.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Edit/Delete Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openForm(cat)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Edit Category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {!cat.isDefault && (
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

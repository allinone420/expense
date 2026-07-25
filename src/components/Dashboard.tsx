import React, { useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { 
  AlertOctagon, 
  TrendingUp, 
  Receipt, 
  Plus, 
  ArrowRight,
  Trash2,
  Edit2
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

export const Dashboard: React.FC = () => {
  const { 
    expenses, 
    settings, 
    totalExpenseThisMonth, 
    budgetSpentPercentage, 
    isBudgetOverLimit, 
    isBudgetWarning,
    openAddExpenseModal,
    setActiveTab,
    deleteExpense
  } = useExpense();

  // Calculate Category Breakdown data for Pie Chart
  const categoryData = useMemo(() => {
    const currentMonthExpenses = expenses.filter((exp) => {
      const d = new Date(exp.date + 'T00:00:00');
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const map: Record<string, { name: string; amount: number; color: string; icon: string }> = {};

    currentMonthExpenses.forEach((exp) => {
      if (!map[exp.categoryId]) {
        map[exp.categoryId] = {
          name: exp.categoryName,
          amount: 0,
          color: exp.categoryColor || '#8b5cf6',
          icon: exp.categoryIcon || 'Tag',
        };
      }
      map[exp.categoryId].amount += exp.amount;
    });

    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  // Calculate Daily Trend Data for Last 14 Days
  const trendData = useMemo(() => {
    const days: { dateStr: string; label: string; amount: number }[] = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayTotal = expenses
        .filter((e) => e.date === iso)
        .reduce((sum, e) => sum + e.amount, 0);

      days.push({
        dateStr: iso,
        label,
        amount: dayTotal,
      });
    }

    return days;
  }, [expenses]);

  // Recent 5 transactions
  const recentExpenses = useMemo(() => {
    return [...expenses].slice(0, 5);
  }, [expenses]);

  return (
    <div className="space-[#10] space-y-6 pb-12">
      
      {/* Header Banner & Overspending Warning */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Personal Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Monitor daily spending, stay within budget, and prevent overspending.
          </p>
        </div>

        <button
          onClick={() => openAddExpenseModal()}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Quick Add Expense</span>
        </button>
      </div>

      {/* Overspending Alert Banner */}
      {isBudgetOverLimit && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-start gap-3 shadow-sm">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/60 rounded-xl text-rose-600 dark:text-rose-400 shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-rose-900 dark:text-rose-200 text-sm sm:text-base">
              Overspending Alert!
            </h3>
            <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 mt-0.5">
              You have exceeded your monthly budget of {settings.currency}{settings.monthlyBudget.toLocaleString()}. Total spent: {settings.currency}{totalExpenseThisMonth.toLocaleString()}.
            </p>
          </div>
        </div>
      )}

      {!isBudgetOverLimit && isBudgetWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 flex items-start gap-3 shadow-sm">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm sm:text-base">
              Budget Warning ({budgetSpentPercentage}% Used)
            </h3>
            <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-0.5">
              You are approaching your limit ({settings.currency}{settings.monthlyBudget.toLocaleString()}). Try reducing discretionary expenses.
            </p>
          </div>
        </div>
      )}

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Monthly Spent Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Spent This Month</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {settings.currency}{totalExpenseThisMonth.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Personal expenses only (No income tracking)
          </p>
        </div>

        {/* Budget Limit Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Monthly Budget Goal</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {budgetSpentPercentage}%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {settings.currency}{settings.monthlyBudget.toLocaleString()}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
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

        {/* Remaining Budget Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Remaining Allowance</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold ${
            settings.monthlyBudget - totalExpenseThisMonth < 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {settings.currency}{(settings.monthlyBudget - totalExpenseThisMonth).toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {settings.monthlyBudget - totalExpenseThisMonth < 0 ? 'Exceeded limit' : 'Safe spending margin'}
          </p>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown Pie Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Category Breakdown (This Month)
            </h3>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {categoryData.length} Categories
            </span>
          </div>

          {categoryData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
              <Receipt className="w-8 h-8 opacity-40" />
              <span>No expenses logged for this month yet.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${settings.currency}${Number(val).toLocaleString()}`, 'Amount']}
                      contentStyle={{
                        borderRadius: '12px',
                        backgroundColor: '#0f172a',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {categoryData.map((cat) => {
                  const pct = Math.round((cat.amount / (totalExpenseThisMonth || 1)) * 100);
                  return (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                          {cat.name}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {settings.currency}{cat.amount.toLocaleString()} ({pct}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Daily Spending Trend Area Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Daily Spending Trend (Last 14 Days)
            </h3>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Daily Total
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${settings.currency}${Number(val).toLocaleString()}`, 'Spent']}
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#spendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Transactions Section */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest personal expenses logged
            </p>
          </div>

          <button
            onClick={() => setActiveTab('expenses')}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm space-y-2">
            <p>No expenses recorded yet.</p>
            <button
              onClick={() => openAddExpenseModal()}
              className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold"
            >
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentExpenses.map((exp) => (
              <div key={exp.id} className="py-3 flex items-center justify-between gap-3 group">
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
                      {exp.note || 'No note added'} • {exp.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    -{settings.currency}{exp.amount.toLocaleString()}
                  </span>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      onClick={() => openAddExpenseModal(exp)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

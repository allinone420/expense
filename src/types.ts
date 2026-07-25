export interface Expense {
  id: string;
  amount: number;
  date: string; // Format: YYYY-MM-DD
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  note: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault?: boolean;
}

export type QuickFilterPeriod = 'today' | 'week' | 'month' | 'custom' | 'all';

export interface FilterState {
  period: QuickFilterPeriod;
  startDate: string;
  endDate: string;
  categoryId: string;
  searchQuery: string;
}

export interface UserSettings {
  currency: string;
  monthlyBudget: number;
  warningThresholdPercent: number; // e.g. 80 = 80%
  notificationsEnabled: boolean;
  reminderTimes: string[]; // e.g. ['10:00', '14:00', '21:00']
  theme: 'light' | 'dark';
}

export type ActiveTab = 'dashboard' | 'expenses' | 'categories' | 'settings';

export type TimeViewMode = 'daily' | 'weekly' | 'monthly';

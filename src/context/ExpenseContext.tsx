import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Expense, 
  Category, 
  FilterState, 
  UserSettings, 
  ActiveTab, 
  TimeViewMode 
} from '../types';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { 
  auth, 
  db, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithPopup, 
  googleProvider, 
  signOut, 
  User 
} from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { setupDailyReminders } from '../lib/notifications';

interface ExpenseContextType {
  user: User | null;
  isAuthLoading: boolean;
  isOnline: boolean;
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings;
  filters: FilterState;
  activeTab: ActiveTab;
  timeViewMode: TimeViewMode;
  isAddExpenseModalOpen: boolean;
  editingExpense: Expense | null;
  canInstallPWA: boolean;
  
  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setTimeViewMode: (mode: TimeViewMode) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  openAddExpenseModal: (expense?: Expense | null) => void;
  closeAddExpenseModal: () => void;
  
  // Expense CRUD
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Category CRUD
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Settings & Theme
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  toggleTheme: () => void;
  
  // Auth
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  
  // PWA
  installPWA: () => void;
  
  // Calculations
  filteredExpenses: Expense[];
  totalExpenseThisMonth: number;
  totalFilteredExpense: number;
  budgetSpentPercentage: number;
  isBudgetOverLimit: boolean;
  isBudgetWarning: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  currency: '৳',
  monthlyBudget: 20000,
  warningThresholdPercent: 80,
  notificationsEnabled: true,
  reminderTimes: ['10:00', '14:00', '21:00'],
  theme: 'light',
};

const DEFAULT_FILTERS: FilterState = {
  period: 'month',
  startDate: '',
  endDate: '',
  categoryId: 'all',
  searchQuery: '',
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const LOCAL_STORAGE_EXPENSES_KEY = 'pet_expenses_v1';
const LOCAL_STORAGE_CATEGORIES_KEY = 'pet_categories_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'pet_settings_v1';

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_EXPENSES_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });
  
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [timeViewMode, setTimeViewMode] = useState<TimeViewMode>('monthly');
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  // PWA Install state
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [canInstallPWA, setCanInstallPWA] = useState(false);

  // Online / Offline Status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA Install Prompt event
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
      setCanInstallPWA(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const installPWA = useCallback(() => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then(() => {
        setDeferredInstallPrompt(null);
        setCanInstallPWA(false);
      });
    }
  }, [deferredInstallPrompt]);

  // Auth Listener & Auto Anonymous Sign-In for single user experience
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthLoading(false);
      } else {
        try {
          const anonResult = await signInAnonymously(auth);
          setUser(anonResult.user);
        } catch (err) {
          console.warn('Anonymous auth failed or disabled, continuing in offline/local mode', err);
        } finally {
          setIsAuthLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Expenses from Firestore when authenticated
  useEffect(() => {
    if (!user) return;
    const expensesRef = collection(db, 'users', user.uid, 'expenses');
    const q = query(expensesRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreData: Expense[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Expense[];

        if (firestoreData.length > 0 || snapshot.metadata.fromCache) {
          setExpenses(firestoreData);
          localStorage.setItem(LOCAL_STORAGE_EXPENSES_KEY, JSON.stringify(firestoreData));
        }
      },
      (error) => {
        console.warn('Firestore expenses listener error (using local cache):', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Sync Categories from Firestore when authenticated
  useEffect(() => {
    if (!user) return;
    const categoriesRef = collection(db, 'users', user.uid, 'categories');

    const unsubscribe = onSnapshot(
      categoriesRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const catData: Category[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as Category[];
          setCategories(catData);
          localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(catData));
        }
      },
      (error) => {
        console.warn('Firestore categories listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Save state to Local Storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_EXPENSES_KEY, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    
    // Theme application
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Daily reminders
    setupDailyReminders(settings.notificationsEnabled, settings.reminderTimes);
  }, [settings]);

  // Expense Actions
  const addExpense = async (data: Omit<Expense, 'id' | 'createdAt'>) => {
    const newId = 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newExpense: Expense = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setExpenses((prev) => [newExpense, ...prev]);

    // Firestore Sync
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'expenses', newId), newExpense);
      } catch (err) {
        console.warn('Saved expense locally, offline sync pending:', err);
      }
    }
  };

  const updateExpense = async (id: string, updatedFields: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, ...updatedFields, updatedAt: new Date().toISOString() } : exp))
    );

    if (user) {
      try {
        await setDoc(
          doc(db, 'users', user.uid, 'expenses', id),
          { ...updatedFields, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch (err) {
        console.warn('Updated expense locally, offline sync pending:', err);
      }
    }
  };

  const deleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));

    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'expenses', id));
      } catch (err) {
        console.warn('Deleted expense locally, offline sync pending:', err);
      }
    }
  };

  // Category Actions
  const addCategory = async (catData: Omit<Category, 'id'>) => {
    const newId = 'cat_' + Date.now();
    const newCategory: Category = {
      ...catData,
      id: newId,
    };

    setCategories((prev) => [...prev, newCategory]);

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'categories', newId), newCategory);
      } catch (err) {
        console.warn('Saved category locally:', err);
      }
    }
  };

  const updateCategory = async (id: string, updatedFields: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updatedFields } : cat))
    );

    // Update matching category color/name in existing expenses too
    setExpenses((prev) =>
      prev.map((exp) => {
        if (exp.categoryId === id) {
          return {
            ...exp,
            categoryName: updatedFields.name || exp.categoryName,
            categoryColor: updatedFields.color || exp.categoryColor,
            categoryIcon: updatedFields.icon || exp.categoryIcon,
          };
        }
        return exp;
      })
    );

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'categories', id), updatedFields, { merge: true });
      } catch (err) {
        console.warn('Updated category locally:', err);
      }
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));

    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'categories', id));
      } catch (err) {
        console.warn('Deleted category locally:', err);
      }
    }
  };

  // Settings & Theme
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const toggleTheme = () => {
    setSettings((prev) => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  // Auth Methods
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      alert('Google Login failed. Please check your network connection.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Re-sign in anonymously for seamless single user continuation
      await signInAnonymously(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Modal Handlers
  const openAddExpenseModal = (expenseToEdit?: Expense | null) => {
    setEditingExpense(expenseToEdit || null);
    setIsAddExpenseModalOpen(true);
  };

  const closeAddExpenseModal = () => {
    setIsAddExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Calculations
  const filteredExpenses = useMemo(() => {
    const today = new Date();
    
    return expenses.filter((expense) => {
      const expDate = new Date(expense.date + 'T00:00:00');

      // Category filter
      if (filters.categoryId !== 'all' && expense.categoryId !== filters.categoryId) {
        return false;
      }

      // Keyword Search (notes or category name)
      if (filters.searchQuery.trim() !== '') {
        const query = filters.searchQuery.toLowerCase();
        const noteMatch = expense.note ? expense.note.toLowerCase().includes(query) : false;
        const categoryMatch = expense.categoryName.toLowerCase().includes(query);
        const amountMatch = expense.amount.toString().includes(query);
        if (!noteMatch && !categoryMatch && !amountMatch) return false;
      }

      // Period / Date filters
      if (filters.period === 'today') {
        const isToday =
          expDate.getDate() === today.getDate() &&
          expDate.getMonth() === today.getMonth() &&
          expDate.getFullYear() === today.getFullYear();
        if (!isToday) return false;
      } else if (filters.period === 'week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        if (expDate < startOfWeek || expDate > endOfWeek) return false;
      } else if (filters.period === 'month') {
        const isThisMonth =
          expDate.getMonth() === today.getMonth() &&
          expDate.getFullYear() === today.getFullYear();
        if (!isThisMonth) return false;
      } else if (filters.period === 'custom') {
        if (filters.startDate) {
          const start = new Date(filters.startDate + 'T00:00:00');
          if (expDate < start) return false;
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate + 'T23:59:59');
          if (expDate > end) return false;
        }
      }

      return true;
    });
  }, [expenses, filters]);

  // Total calculation for current month
  const totalExpenseThisMonth = useMemo(() => {
    const now = new Date();
    return expenses.reduce((sum, exp) => {
      const expDate = new Date(exp.date + 'T00:00:00');
      if (expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()) {
        return sum + exp.amount;
      }
      return sum;
    }, 0);
  }, [expenses]);

  const totalFilteredExpense = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  const budgetSpentPercentage = useMemo(() => {
    if (!settings.monthlyBudget || settings.monthlyBudget <= 0) return 0;
    return Math.min(100, Math.round((totalExpenseThisMonth / settings.monthlyBudget) * 100));
  }, [totalExpenseThisMonth, settings.monthlyBudget]);

  const isBudgetOverLimit = totalExpenseThisMonth >= settings.monthlyBudget;
  const isBudgetWarning = budgetSpentPercentage >= settings.warningThresholdPercent;

  return (
    <ExpenseContext.Provider
      value={{
        user,
        isAuthLoading,
        isOnline,
        expenses,
        categories,
        settings,
        filters,
        activeTab,
        timeViewMode,
        isAddExpenseModalOpen,
        editingExpense,
        canInstallPWA,
        
        setActiveTab,
        setTimeViewMode,
        setFilters,
        resetFilters,
        openAddExpenseModal,
        closeAddExpenseModal,
        
        addExpense,
        updateExpense,
        deleteExpense,
        
        addCategory,
        updateCategory,
        deleteCategory,
        
        updateSettings,
        toggleTheme,
        
        loginWithGoogle,
        logout,
        installPWA,
        
        filteredExpenses,
        totalExpenseThisMonth,
        totalFilteredExpense,
        budgetSpentPercentage,
        isBudgetOverLimit,
        isBudgetWarning,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};

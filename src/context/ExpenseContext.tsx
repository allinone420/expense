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
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
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
  isAuthModalOpen: boolean;
  editingExpense: Expense | null;
  canInstallPWA: boolean;
  
  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setTimeViewMode: (mode: TimeViewMode) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  openAddExpenseModal: (expense?: Expense | null) => void;
  closeAddExpenseModal: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  
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
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
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

// Persistent device ID fallback when unauthenticated
const getPersistentDeviceId = (): string => {
  let devId = localStorage.getItem('pet_device_id');
  if (!devId) {
    devId = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    localStorage.setItem('pet_device_id', devId);
  }
  return devId;
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const currentUid = user ? user.uid : getPersistentDeviceId();
  
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  // Auth Listener & Auto Anonymous Sign-In
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
          console.warn('Anonymous auth offline/disabled, using device ID fallback:', err);
        } finally {
          setIsAuthLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Realtime Sync Expenses from Firestore
  useEffect(() => {
    const expensesRef = collection(db, 'users', currentUid, 'expenses');
    const q = query(expensesRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const firestoreData: Expense[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as Expense[];
          setExpenses(firestoreData);
          localStorage.setItem(LOCAL_STORAGE_EXPENSES_KEY, JSON.stringify(firestoreData));
        } else {
          // If Firestore is empty, push existing local expenses to Firestore
          const saved = localStorage.getItem(LOCAL_STORAGE_EXPENSES_KEY);
          if (saved) {
            try {
              const localExps: Expense[] = JSON.parse(saved);
              localExps.forEach((exp) => {
                setDoc(doc(db, 'users', currentUid, 'expenses', exp.id), exp).catch(() => {});
              });
            } catch (e) {
              console.error('Failed to parse local expenses backup:', e);
            }
          }
        }
      },
      (error) => {
        console.warn('Firestore expenses listener error (using local state):', error);
      }
    );

    return () => unsubscribe();
  }, [currentUid]);

  // Realtime Sync Categories from Firestore
  useEffect(() => {
    const categoriesRef = collection(db, 'users', currentUid, 'categories');

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
        } else {
          // Seed default categories into Firestore
          DEFAULT_CATEGORIES.forEach((cat) => {
            setDoc(doc(db, 'users', currentUid, 'categories', cat.id), cat).catch(() => {});
          });
        }
      },
      (error) => {
        console.warn('Firestore categories listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUid]);

  // Realtime Sync Settings from Firestore
  useEffect(() => {
    const settingsRef = doc(db, 'users', currentUid, 'settings', 'config');

    const unsubscribe = onSnapshot(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const cloudSettings = snapshot.data() as UserSettings;
          setSettings((prev) => ({ ...prev, ...cloudSettings }));
          localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, ...cloudSettings }));
        } else {
          // Backup initial settings to Firestore
          setDoc(settingsRef, settings).catch(() => {});
        }
      },
      (error) => {
        console.warn('Firestore settings listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUid]);

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

    // Firestore Backup Sync
    try {
      await setDoc(doc(db, 'users', currentUid, 'expenses', newId), newExpense);
    } catch (err) {
      console.warn('Saved expense locally, Firestore backup pending:', err);
    }
  };

  const updateExpense = async (id: string, updatedFields: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, ...updatedFields, updatedAt: new Date().toISOString() } : exp))
    );

    try {
      await setDoc(
        doc(db, 'users', currentUid, 'expenses', id),
        { ...updatedFields, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (err) {
      console.warn('Updated expense locally, Firestore backup pending:', err);
    }
  };

  const deleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));

    try {
      await deleteDoc(doc(db, 'users', currentUid, 'expenses', id));
    } catch (err) {
      console.warn('Deleted expense locally, Firestore backup pending:', err);
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

    try {
      await setDoc(doc(db, 'users', currentUid, 'categories', newId), newCategory);
    } catch (err) {
      console.warn('Saved category locally, Firestore backup pending:', err);
    }
  };

  const updateCategory = async (id: string, updatedFields: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updatedFields } : cat))
    );

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

    try {
      await setDoc(doc(db, 'users', currentUid, 'categories', id), updatedFields, { merge: true });
    } catch (err) {
      console.warn('Updated category locally, Firestore backup pending:', err);
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));

    try {
      await deleteDoc(doc(db, 'users', currentUid, 'categories', id));
    } catch (err) {
      console.warn('Deleted category locally, Firestore backup pending:', err);
    }
  };

  // Settings & Theme
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await setDoc(doc(db, 'users', currentUid, 'settings', 'config'), updated, { merge: true });
    } catch (err) {
      console.warn('Updated settings locally, Firestore backup pending:', err);
    }
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: newTheme });
  };

  // Helper to migrate anonymous device data to logged in user
  const migrateDeviceDataToUser = useCallback((newUid: string) => {
    const devId = localStorage.getItem('pet_device_id');
    if (devId && devId !== newUid) {
      expenses.forEach((exp) => {
        setDoc(doc(db, 'users', newUid, 'expenses', exp.id), exp).catch(() => {});
      });
      categories.forEach((cat) => {
        setDoc(doc(db, 'users', newUid, 'categories', cat.id), cat).catch(() => {});
      });
      setDoc(doc(db, 'users', newUid, 'settings', 'config'), settings).catch(() => {});
    }
  }, [expenses, categories, settings]);

  // Auth Methods
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      migrateDeviceDataToUser(result.user.uid);
      setIsAuthModalOpen(false);
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      migrateDeviceDataToUser(result.user.uid);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Email Login failed:', err);
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (name.trim()) {
        await updateProfile(result.user, { displayName: name });
      }
      migrateDeviceDataToUser(result.user.uid);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Email registration failed:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await signInAnonymously(auth);
      setIsAuthModalOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Modal Handlers
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

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
        isAuthModalOpen,
        editingExpense,
        canInstallPWA,
        
        setActiveTab,
        setTimeViewMode,
        setFilters,
        resetFilters,
        openAddExpenseModal,
        closeAddExpenseModal,
        openAuthModal,
        closeAuthModal,
        
        addExpense,
        updateExpense,
        deleteExpense,
        
        addCategory,
        updateCategory,
        deleteCategory,
        
        updateSettings,
        toggleTheme,
        
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
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

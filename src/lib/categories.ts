import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-food',
    name: 'Food & Dining',
    color: '#ef4444', // Red / Rose
    icon: 'Utensils',
    isDefault: true,
  },
  {
    id: 'cat-transport',
    name: 'Transport',
    color: '#3b82f6', // Blue
    icon: 'Bus',
    isDefault: true,
  },
  {
    id: 'cat-shopping',
    name: 'Shopping',
    color: '#ec4899', // Pink
    icon: 'ShoppingBag',
    isDefault: true,
  },
  {
    id: 'cat-bills',
    name: 'Bills & Utilities',
    color: '#f59e0b', // Amber
    icon: 'Zap',
    isDefault: true,
  },
  {
    id: 'cat-others',
    name: 'Others',
    color: '#8b5cf6', // Purple
    icon: 'MoreHorizontal',
    isDefault: true,
  },
];

export const AVAILABLE_CATEGORY_ICONS = [
  'Utensils', 'Coffee', 'ShoppingBag', 'Bus', 'Car', 'Fuel', 'Home', 'Zap', 
  'Smartphone', 'Tv', 'Film', 'HeartPulse', 'GraduationCap', 'Gift', 'Dumbbell', 
  'Plane', 'Briefcase', 'Wrench', 'MoreHorizontal', 'Tag'
];

export const AVAILABLE_CATEGORY_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'
];

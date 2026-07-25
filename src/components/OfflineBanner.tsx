import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useExpense();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 shadow-inner">
      <WifiOff className="w-4 h-4 animate-bounce" />
      <span>Working Offline — Any new expenses added will save locally and sync automatically when reconnected.</span>
    </div>
  );
};

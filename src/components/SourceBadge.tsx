import React from 'react';
import { Database, Rss } from 'lucide-react';

interface SourceBadgeProps {
  sourceType?: 'supabase' | 'rss';
  size?: 'xs' | 'sm' | 'md';
  variant?: 'pill' | 'compact' | 'dot';
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  sourceType = 'supabase',
  size = 'sm',
  variant = 'pill',
}) => {
  const isSupabase = sourceType === 'supabase';

  if (variant === 'dot') {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[11px] font-medium"
        title={
          isSupabase
            ? 'Source: Supabase e-paper database'
            : 'Source: Live online RSS stream'
        }
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isSupabase ? 'bg-emerald-500 shadow-xs' : 'bg-amber-500 shadow-xs'
          }`}
        />
        <span className={isSupabase ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-amber-700 dark:text-amber-400 font-semibold'}>
          {isSupabase ? 'Supabase' : 'RSS'}
        </span>
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <span
        title={
          isSupabase
            ? 'Source: Supabase Database (Printed E-Paper Edition)'
            : 'Source: Online Website RSS Feed'
        }
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-semibold select-none transition-colors ${
          isSupabase
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px]'
            : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[10px]'
        }`}
      >
        {isSupabase ? (
          <Database className="w-2.5 h-2.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Rss className="w-2.5 h-2.5 shrink-0 text-amber-600 dark:text-amber-400" />
        )}
        <span>{isSupabase ? 'Supabase' : 'RSS'}</span>
      </span>
    );
  }

  // Default 'pill'
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      title={
        isSupabase
          ? 'Source: Supabase Database (Physical E-Paper Broad-sheet Edition)'
          : 'Source: Online Website RSS Articles'
      }
      className={`inline-flex items-center rounded-full font-semibold select-none border transition-all ${
        sizeClasses[size]
      } ${
        isSupabase
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/15'
          : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/25 hover:bg-amber-500/15'
      }`}
    >
      {isSupabase ? (
        <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
      ) : (
        <Rss className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
      )}
      <span>{isSupabase ? 'Supabase E-Paper' : 'RSS Web Feed'}</span>
    </span>
  );
};

import React from 'react';
import { Newspaper, Globe } from 'lucide-react';

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
  const isEpaper = sourceType === 'supabase';

  if (variant === 'dot') {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[11px] font-medium"
        title={
          isEpaper
            ? 'Edition: E-Paper broadsheet replica'
            : 'Edition: Free online web articles'
        }
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isEpaper ? 'bg-emerald-500 shadow-xs' : 'bg-sky-500 shadow-xs'
          }`}
        />
        <span
          className={
            isEpaper
              ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
              : 'text-sky-700 dark:text-sky-400 font-semibold'
          }
        >
          {isEpaper ? 'E-Paper' : 'Free'}
        </span>
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <span
        title={
          isEpaper
            ? 'Edition: E-Paper (Printed broadsheet replica)'
            : 'Edition: Free (Live website feed)'
        }
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-semibold select-none transition-colors ${
          isEpaper
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px]'
            : 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 text-[10px]'
        }`}
      >
        {isEpaper ? (
          <Newspaper className="w-2.5 h-2.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Globe className="w-2.5 h-2.5 shrink-0 text-sky-600 dark:text-sky-400" />
        )}
        <span>{isEpaper ? 'E-Paper' : 'Free'}</span>
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
        isEpaper
          ? 'Edition: E-Paper (Printed broadsheet replica)'
          : 'Edition: Free (Live website feed)'
      }
      className={`inline-flex items-center rounded-full font-semibold select-none border transition-all ${
        sizeClasses[size]
      } ${
        isEpaper
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/15'
          : 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25 hover:bg-sky-500/15'
      }`}
    >
      {isEpaper ? (
        <Newspaper className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
      ) : (
        <Globe className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
      )}
      <span>{isEpaper ? 'E-Paper' : 'Free Edition'}</span>
    </span>
  );
};

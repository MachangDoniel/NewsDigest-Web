import React from 'react';
import { Sun, Moon, Coffee } from 'lucide-react';
import { ThemeMode } from './Header';

interface ThemeToggleProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  variant?: 'pill' | 'segmented';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onThemeChange,
  variant = 'pill',
}) => {
  // If segmented variant (ideal for Settings)
  if (variant === 'segmented') {
    return (
      <div className="bg-black/5 dark:bg-white/10 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold select-none border border-black/5 dark:border-white/5">
        <button
          type="button"
          onClick={() => onThemeChange('light')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            theme === 'light'
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs font-bold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => onThemeChange('dark')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            theme === 'dark'
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs font-bold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-blue-400" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => onThemeChange('sepia')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            theme === 'sepia'
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs font-bold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Coffee className="w-3.5 h-3.5 text-[#9a3412]" />
          <span>Sepia</span>
        </button>
      </div>
    );
  }

  // Modern dual switch / toggle for the Top Bar
  // Clicking toggles between light and dark; right-click or long-press/secondary switches to sepia
  const isDark = theme === 'dark';

  const toggleDarkLight = () => {
    if (theme === 'dark') {
      onThemeChange('light');
    } else {
      onThemeChange('dark');
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Primary Dark / Light Toggle Switch */}
      <button
        type="button"
        onClick={toggleDarkLight}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode (T key)' : 'Switch to dark mode (T key)'}
        className="relative flex items-center bg-black/10 dark:bg-white/15 p-0.5 rounded-full w-14 h-7.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#007aff]/40"
      >
        <span
          className={`absolute left-1 flex items-center justify-center w-5.5 h-5.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-md transition-transform duration-200 ease-out transform ${
            isDark ? 'translate-x-6.5 text-blue-400' : 'translate-x-0 text-amber-500'
          }`}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Sun className="w-3.5 h-3.5 fill-current" />
          )}
        </span>

        {/* Static Background Icons for clarity */}
        <span className="w-full flex justify-between px-1.5 text-[10px] text-neutral-400 pointer-events-none select-none">
          <Sun className="w-3 h-3 text-amber-500/70" />
          <Moon className="w-3 h-3 text-blue-400/70" />
        </span>
      </button>

      {/* Subtle Sepia Option Button */}
      <button
        type="button"
        onClick={() => onThemeChange(theme === 'sepia' ? 'light' : 'sepia')}
        className={`hidden xl:flex p-1.5 rounded-lg text-xs font-medium transition-colors ${
          theme === 'sepia'
            ? 'bg-[#9a3412]/15 text-[#9a3412] font-bold'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        title="Sepia Eye-Care Mode"
      >
        <Coffee className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  LayoutGrid,
  List,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { formatDhakaPretty, getTodayDhaka, stepDhakaDate } from '../services/store';
import { ThemeToggle } from './ThemeToggle';

export type ViewMode = 'editorial' | 'compact';
export type ThemeMode = 'light' | 'sepia' | 'dark';

interface HeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  onOpenCalendar: () => void;
  activeTab: 'today' | 'practice' | 'archive' | 'papers' | 'settings';
  onTabChange: (tab: 'today' | 'practice' | 'archive' | 'papers' | 'settings') => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenRevisionSheet: () => void;
  onOpenShortcuts: () => void;
  mcqCount?: number;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  onOpenCalendar,
  activeTab,
  onTabChange,
  viewMode,
  onViewModeChange,
  theme,
  onThemeChange,
  onOpenRevisionSheet,
  onOpenShortcuts,
  mcqCount = 0,
  isAdmin = false,
}) => {
  const today = getTodayDhaka();
  const isToday = currentDate === today;
  const prettyDate = formatDhakaPretty(currentDate);

  const cycleTheme = () => {
    if (theme === 'light') onThemeChange('sepia');
    else if (theme === 'sepia') onThemeChange('dark');
    else onThemeChange('light');
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-canvas)]/90 backdrop-blur-xl border-b border-[var(--border-subtle)] px-4 sm:px-6 py-2.5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('today')}
            className="text-left group flex items-baseline gap-1.5 focus:outline-none"
          >
            <span className="font-serif font-black text-xl sm:text-2xl tracking-tight text-[var(--text-primary)] group-hover:text-[#007aff] transition-colors">
              NewsDigest
            </span>
            <span className="text-[10px] font-sans font-bold tracking-widest text-[#007aff] uppercase">
              Web v2
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium pl-2 border-l border-[var(--border-subtle)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Dhaka Edition</span>
            {isAdmin && (
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/25">
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop) & Date Stepper */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'today', label: 'Today' },
              { id: 'practice', label: 'Practice', badge: mcqCount > 0 ? mcqCount : undefined },
              { id: 'archive', label: 'Archive' },
              { id: 'papers', label: 'Papers' },
              { id: 'settings', label: 'Settings' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="bg-[#007aff] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Date Stepper Controls */}
          {(activeTab === 'today' || activeTab === 'practice') && (
            <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2 py-1 rounded-xl shadow-2xs">
              <button
                onClick={() => onDateChange(stepDhakaDate(currentDate, -1))}
                aria-label="Previous day"
                className="p-1 rounded-md text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Previous day ([ key)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenCalendar}
                className="px-2 py-0.5 text-xs font-bold text-[var(--text-primary)] hover:text-[#007aff] flex items-center gap-1.5 transition-colors"
                title="Jump to date"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-[#007aff]" />
                <span className="truncate max-w-[120px]">{prettyDate}</span>
              </button>

              {!isToday ? (
                <button
                  onClick={() => onDateChange(stepDhakaDate(currentDate, 1))}
                  aria-label="Next day"
                  className="p-1 rounded-md text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  title="Next day (] key)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <span className="w-4" />
              )}

              {!isToday && (
                <button
                  onClick={() => onDateChange(today)}
                  className="ml-1 px-2 py-0.5 text-[10px] font-bold text-[#007aff] hover:bg-[#007aff]/10 rounded-md transition-colors"
                >
                  Today
                </button>
              )}
            </div>
          )}
        </div>

        {/* Zone 3: Web Actions & Tooling */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* View mode toggle (Editorial vs Compact) */}
          {activeTab === 'today' && (
            <div className="hidden sm:flex items-center bg-black/5 dark:bg-white/5 p-0.5 rounded-xl text-xs">
              <button
                onClick={() => onViewModeChange('editorial')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'editorial'
                    ? 'bg-[var(--bg-surface)] text-[#007aff] shadow-2xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Editorial broadsheet view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onViewModeChange('compact')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-[var(--bg-surface)] text-[#007aff] shadow-2xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Compact study list view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Printable Revision Sheet Trigger */}
          <button
            onClick={onOpenRevisionSheet}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-2xs"
            title="Open printable daily revision sheet (S key)"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Revision Sheet</span>
          </button>

          {/* Dark / Light Mode Toggle Switch */}
          <ThemeToggle theme={theme} onThemeChange={onThemeChange} />

          {/* Shortcuts Modal Trigger */}
          <button
            onClick={onOpenShortcuts}
            className="hidden sm:flex p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Keyboard shortcuts (? key)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

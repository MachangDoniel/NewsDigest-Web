import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { formatDhakaPretty, getTodayDhaka, stepDhakaDate } from '../services/store';

interface HeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  onOpenCalendar: () => void;
  activeTab: 'today' | 'practice' | 'archive' | 'papers' | 'settings';
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  onOpenCalendar,
  activeTab,
}) => {
  const today = getTodayDhaka();
  const isToday = currentDate === today;
  const prettyDate = formatDhakaPretty(currentDate);

  const getTitle = () => {
    switch (activeTab) {
      case 'today':
        return prettyDate;
      case 'practice':
        return `Practice · ${prettyDate}`;
      case 'archive':
        return 'Archive';
      case 'papers':
        return 'Papers';
      case 'settings':
        return 'Settings';
      default:
        return 'NewsDigest';
    }
  };

  const showDateControls = activeTab === 'today' || activeTab === 'practice';

  return (
    <header className="sticky top-0 z-30 bg-[#f2f2f7]/85 dark:bg-[#000000]/85 backdrop-blur-xl border-b border-black/5 dark:border-white/10 px-4 py-2.5 transition-colors">
      <div className="max-w-3xl mx-auto flex items-center justify-between min-h-[38px]">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {showDateControls && !isToday && (
            <button
              onClick={() => onDateChange(today)}
              className="px-2.5 py-1 text-xs font-semibold text-[#007aff] hover:bg-[#007aff]/10 rounded-full transition-colors active:scale-95"
            >
              Today
            </button>
          )}
          {(!showDateControls || isToday) && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Dhaka Edition</span>
            </div>
          )}
        </div>

        {/* Center / Title */}
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 truncate px-2">
          {getTitle()}
        </h1>

        {/* Right side date controls */}
        <div className="flex items-center gap-1">
          {showDateControls ? (
            <>
              <button
                onClick={() => onDateChange(stepDhakaDate(currentDate, -1))}
                aria-label="Previous day"
                className="p-1.5 text-[#007aff] hover:bg-[#007aff]/10 rounded-full transition-colors active:scale-90"
                title="Previous day"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={onOpenCalendar}
                aria-label="Jump to date"
                className="p-1.5 text-[#007aff] hover:bg-[#007aff]/10 rounded-full transition-colors active:scale-90"
                title="Jump to date"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDateChange(stepDhakaDate(currentDate, 1))}
                disabled={isToday}
                aria-label="Next day"
                className={`p-1.5 rounded-full transition-colors active:scale-90 ${
                  isToday
                    ? 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed'
                    : 'text-[#007aff] hover:bg-[#007aff]/10'
                }`}
                title={isToday ? 'Already on today' : 'Next day'}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="w-8" />
          )}
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Check } from 'lucide-react';
import { getTodayDhaka, formatDhakaPretty } from '../services/store';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  onSelectDate: (date: string) => void;
  availableDates?: string[];
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  onSelectDate,
  availableDates = [],
}) => {
  const today = getTodayDhaka();
  const [selectedDate, setSelectedDate] = useState(currentDate);

  if (!isOpen) return null;

  const handleApply = () => {
    onSelectDate(selectedDate);
    onClose();
  };

  const handleQuickJump = (dateStr: string) => {
    setSelectedDate(dateStr);
    onSelectDate(dateStr);
    onClose();
  };

  // Helper to get offset date
  const getOffsetDate = (daysAgo: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-sm rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#007aff]" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              Jump to Date
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="text-center">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
              Currently Selected
            </span>
            <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
              {formatDhakaPretty(selectedDate)}
            </div>
            <div className="text-xs text-neutral-500">{selectedDate} (Dhaka Time)</div>
          </div>

          {/* Graphical HTML5 Date Picker Styled */}
          <div className="bg-[#f2f2f7] dark:bg-neutral-800/60 p-3 rounded-2xl flex flex-col items-center">
            <label className="text-xs font-medium text-neutral-500 mb-2">
              Select date on calendar:
            </label>
            <input
              type="date"
              max={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-sm font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#007aff]"
            />
          </div>

          {/* Quick jumps */}
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 px-1">
              Quick Jumps
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => handleQuickJump(today)}
                className={`p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between ${
                  selectedDate === today
                    ? 'border-[#007aff] bg-[#007aff]/10 text-[#007aff]'
                    : 'border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <span>Today</span>
                {selectedDate === today && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => handleQuickJump(getOffsetDate(1))}
                className={`p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between ${
                  selectedDate === getOffsetDate(1)
                    ? 'border-[#007aff] bg-[#007aff]/10 text-[#007aff]'
                    : 'border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <span>Yesterday</span>
                {selectedDate === getOffsetDate(1) && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => handleQuickJump(getOffsetDate(2))}
                className="p-2.5 rounded-xl border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300 text-left transition-colors"
              >
                2 Days Ago
              </button>

              <button
                onClick={() => handleQuickJump(getOffsetDate(7))}
                className="p-2.5 rounded-xl border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300 text-left transition-colors"
              >
                1 Week Ago
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/5 dark:border-white/10 bg-[#f2f2f7]/50 dark:bg-neutral-900/50 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-[#007aff] text-white hover:bg-[#0062cc] transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

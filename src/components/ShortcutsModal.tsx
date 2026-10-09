import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '[ / ]', desc: 'Previous / Next publication date' },
    { key: 'J / K', desc: 'Scroll to Next / Previous story' },
    { key: '/', desc: 'Instant search in Archive' },
    { key: 'M', desc: 'Jump directly to Practice MCQs' },
    { key: 'P', desc: 'Toggle Audio Read Aloud player' },
    { key: 'S', desc: 'Open Daily BCS Revision Sheet' },
    { key: 'T / D', desc: 'Toggle Dark / Light Mode' },
    { key: 'Esc', desc: 'Close any active modal or sheet' },
    { key: '?', desc: 'Toggle this keyboard shortcuts cheat sheet' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[var(--bg-surface)] text-[var(--text-primary)] w-full max-w-md rounded-2xl shadow-2xl border border-[var(--border-subtle)] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-[#007aff]" />
            <h3 className="font-bold text-base">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5 last:border-0"
            >
              <span className="text-[var(--text-secondary)]">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/10 font-mono font-semibold text-[11px] shadow-2xs border border-black/10 dark:border-white/10">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-[var(--text-muted)] text-center pt-2">
          Designed for high-cadence civil service exam preparation.
        </div>
      </div>
    </div>
  );
};

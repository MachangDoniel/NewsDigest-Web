import React from 'react';
import {
  Headphones,
  Palette,
  Globe,
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { ThemeMode } from '../components/Header';

interface SettingsViewProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  summaryLanguage: string;
  onSummaryLanguageChange: (lang: string) => void;
  speechVoice: string;
  onSpeechVoiceChange: (voice: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onThemeChange,
  summaryLanguage,
  onSummaryLanguageChange,
  speechVoice,
  onSpeechVoiceChange,
}) => {
  return (
    <div className="space-y-6 pb-28">
      {/* Appearance & Theme (Public) */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
          Appearance & Theme
        </h3>

        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-4 space-y-3 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#007aff]" />
              <div>
                <div className="font-semibold text-[var(--text-primary)]">
                  Color Mode
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  Light, Sepia or Dark reading environment
                </div>
              </div>
            </div>
          </div>

          <ThemeToggle
            theme={theme}
            onThemeChange={onThemeChange}
            variant="segmented"
          />
        </div>
      </section>

      {/* Language Preferences (Public) */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
          Language & Summary
        </h3>

        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-4 flex items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#007aff]" />
            <div>
              <div className="font-semibold text-[var(--text-primary)]">
                Summary language
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Language for headlines, bullets and facts
              </div>
            </div>
          </div>

          <select
            value={summaryLanguage}
            onChange={(e) => onSummaryLanguageChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[var(--text-primary)] font-medium text-xs focus:outline-none"
          >
            <option value="auto">Same as paper</option>
            <option value="en">English</option>
            <option value="bn">বাংলা (Bangla)</option>
            <option value="both">Both</option>
          </select>
        </div>
      </section>

      {/* Read Aloud (Public) */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
          🎧 Read Aloud
        </h3>

        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-4 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-[#007aff]" />
            <div>
              <div className="font-semibold text-[var(--text-primary)]">
                Voice engine
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Web SpeechSynthesis & audio narration
              </div>
            </div>
          </div>

          <select
            value={speechVoice}
            onChange={(e) => onSpeechVoiceChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[var(--text-primary)] font-medium text-xs focus:outline-none"
          >
            <option value="natural">Natural Browser Voice</option>
            <option value="gemini">Gemini Voice (Server)</option>
          </select>
        </div>
      </section>

      {/* Keyboard Shortcuts Reference (Public) */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
          Keyboard Shortcuts
        </h3>

        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5">
            <span className="text-[var(--text-secondary)]">Search</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] font-mono text-[10px] font-bold shadow-2xs border border-[var(--border-subtle)]">
              /
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5">
            <span className="text-[var(--text-secondary)]">Next Day</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] font-mono text-[10px] font-bold shadow-2xs border border-[var(--border-subtle)]">
              K
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5">
            <span className="text-[var(--text-secondary)]">Prev Day</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] font-mono text-[10px] font-bold shadow-2xs border border-[var(--border-subtle)]">
              J
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5">
            <span className="text-[var(--text-secondary)]">Tabs</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] font-mono text-[10px] font-bold shadow-2xs border border-[var(--border-subtle)]">
              1-5
            </kbd>
          </div>
        </div>
      </section>
    </div>
  );
};

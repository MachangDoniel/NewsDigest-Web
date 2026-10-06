import React, { useState } from 'react';
import {
  CheckCircle2,
  Sliders,
  Sparkles,
  Headphones,
  Key,
  RotateCw,
  Server,
  Palette,
  ShieldCheck,
  Lock,
  LogOut,
  AlertTriangle,
  Globe,
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { ThemeMode } from '../components/Header';
import { AdminUser, loginWithPasscode } from '../services/auth';
import { AdminTelemetryDashboard } from '../components/AdminTelemetryDashboard';

interface SettingsViewProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  aiModel: string;
  onAiModelChange: (model: string) => void;
  summaryLanguage: string;
  onSummaryLanguageChange: (lang: string) => void;
  speechVoice: string;
  onSpeechVoiceChange: (voice: string) => void;
  onRunDigestNow: () => Promise<void>;
  isCompiling: boolean;
  isAdmin: boolean;
  adminUser: AdminUser | null;
  onLoginSuccess: (user: AdminUser) => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onThemeChange,
  aiModel,
  onAiModelChange,
  summaryLanguage,
  onSummaryLanguageChange,
  speechVoice,
  onSpeechVoiceChange,
  onRunDigestNow,
  isCompiling,
  isAdmin,
  adminUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState(
    'https://utjluiipjiznedsglqsm.supabase.co'
  );
  const [showCustomProject, setShowCustomProject] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');

  // Admin login states
  const [showPasscodeField, setShowPasscodeField] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const aiModels = [
    { id: 'auto', label: 'Auto (best available)' },
    { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
    { id: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash' },
    { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite (fastest)' },
    { id: 'groq:openai/gpt-oss-120b', label: 'Groq GPT-OSS 120B' },
    { id: 'groq:llama-3.3-70b-versatile', label: 'Groq Llama 3.3 70B' },
  ];

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    setIsAuthenticating(true);
    setAuthError(null);

    const res = await loginWithPasscode(passcode);
    setIsAuthenticating(false);

    if (res.ok && res.isAdmin && res.user) {
      onLoginSuccess(res.user);
      setShowPasscodeField(false);
      setPasscode('');
    } else {
      setAuthError(res.message || 'Incorrect passcode.');
    }
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Admin Mode Bar if Admin */}
      {isAdmin && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <span>Admin Controls Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Admin Telemetry & Quota Visualization Dashboard */}
      {isAdmin && (
        <section className="space-y-4">
          <AdminTelemetryDashboard token={adminUser?.token} />
        </section>
      )}

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

      {/* ========================================================================= */}
      {/* ADMIN CONTROLS (Only visible when unlocked) */}
      {/* ========================================================================= */}
      {isAdmin ? (
        <>
          {/* Admin Action: Run Digest Now */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#007aff]" />
              <span>Live Digest Compiler</span>
            </h3>

            <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-4 space-y-3 text-xs sm:text-sm">
              <p className="text-xs text-[var(--text-secondary)]">
                Trigger real-time crawling of today's morning broadsheet editions and compile fresh summaries.
              </p>

              <button
                onClick={onRunDigestNow}
                disabled={isCompiling}
                className="w-full py-2.5 rounded-xl bg-[#007aff] hover:bg-[#0062cc] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
              >
                <RotateCw className={`w-4 h-4 ${isCompiling ? 'animate-spin' : ''}`} />
                <span>{isCompiling ? 'Running live compilation…' : 'Run Live Digest Now'}</span>
              </button>
            </div>
          </section>

          {/* Admin Action: Supabase Backend */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supabase Database</span>
            </h3>

            <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] overflow-hidden text-xs sm:text-sm">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Project Connected</span>
                </div>
                <span className="text-xs text-neutral-400 font-mono">
                  utjluiipjiznedsglqsm
                </span>
              </div>

              <div className="p-4 flex items-center justify-between text-[var(--text-secondary)]">
                <span className="font-medium">Active Database</span>
                <span className="text-[var(--text-primary)]">NewsDigest Built-in Supabase</span>
              </div>

              <div className="p-4">
                <button
                  onClick={() => setShowCustomProject(!showCustomProject)}
                  className="text-[#007aff] font-semibold hover:underline"
                >
                  {showCustomProject
                    ? 'Hide custom project setup'
                    : 'Use a different Supabase project'}
                </button>

                {showCustomProject && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                        Project URL
                      </label>
                      <input
                        type="text"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://xxxx.supabase.co"
                        className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-primary)]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                        Publishable (anon) key
                      </label>
                      <input
                        type="password"
                        value={customKey}
                        onChange={(e) => setCustomKey(e.target.value)}
                        placeholder="sb_publishable_..."
                        className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-primary)]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (customUrl) setSupabaseUrl(customUrl);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#007aff] text-white text-xs font-semibold"
                      >
                        Connect
                      </button>
                      <button
                        onClick={() => {
                          setCustomUrl('');
                          setCustomKey('');
                          setSupabaseUrl('https://utjluiipjiznedsglqsm.supabase.co');
                        }}
                        className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)]"
                      >
                        Use built-in project
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Admin Action: AI Model Configuration */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Pipeline Models</span>
            </h3>

            <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-4 flex items-center justify-between gap-4 text-xs sm:text-sm">
              <div>
                <div className="font-semibold text-[var(--text-primary)]">
                  Active AI Model
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  Fallback chain automatically triggers if busy
                </div>
              </div>

              <select
                value={aiModel}
                onChange={(e) => onAiModelChange(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[var(--text-primary)] font-medium text-xs focus:outline-none"
              >
                {aiModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </section>
        </>
      ) : (
        /* ========================================================================= */
        /* CLEAN, SUBTLE ADMIN UNLOCK (No email, no Google sign in, no warnings) */
        /* ========================================================================= */
        <div className="pt-6 flex flex-col items-center">
          {!showPasscodeField ? (
            <button
              onClick={() => setShowPasscodeField(true)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-75 hover:opacity-100"
              title="Unlock editor controls"
            >
              <Lock className="w-3 h-3" />
              <span>Admin access</span>
            </button>
          ) : (
            <form
              onSubmit={handlePasscodeSubmit}
              className="w-full max-w-sm p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#007aff]" />
                  <span>Enter Passcode</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasscodeField(false);
                    setAuthError(null);
                  }}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
              </div>

              {authError && (
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Passcode..."
                  autoFocus
                  className="flex-1 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#007aff]/30"
                />
                <button
                  type="submit"
                  disabled={isAuthenticating || !passcode}
                  className="px-3.5 py-1.5 rounded-xl bg-[#007aff] hover:bg-[#0062cc] disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  {isAuthenticating ? 'Checking…' : 'Unlock'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

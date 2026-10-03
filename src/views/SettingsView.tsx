import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Sliders,
  Sparkles,
  Headphones,
  Key,
  RotateCw,
  Info,
  Server,
  Palette,
  ShieldCheck,
  Lock,
  LogOut,
  AlertTriangle,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { saveSettingsToStorage } from '../services/store';
import { ThemeToggle } from '../components/ThemeToggle';
import { ThemeMode } from '../components/Header';
import { AdminUser, loginWithPasscode, loginWithGoogleToken } from '../services/auth';

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
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Admin login states
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<string | null>(null);

  const aiModels = [
    { id: 'auto', label: 'Auto (best available)' },
    { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
    { id: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash' },
    { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite (fastest)' },
    { id: 'groq:openai/gpt-oss-120b', label: 'Groq GPT-OSS 120B' },
    { id: 'groq:llama-3.3-70b-versatile', label: 'Groq Llama 3.3 70B' },
  ];

  const handleSaveSettings = (key: string, value: any) => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1500);
  };

  // Setup Google Identity Services button if available
  useEffect(() => {
    if (isAdmin) return;

    // Check if google accounts id is present
    const initGoogleSignIn = () => {
      if ((window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id:
              '155832180601-16qf4ckq3e1kld66quu06ck7oae5h1e7.apps.googleusercontent.com',
            callback: async (response: any) => {
              if (response.credential) {
                setIsAuthenticating(true);
                setAuthError(null);
                const res = await loginWithGoogleToken(response.credential);
                setIsAuthenticating(false);
                if (res.ok && res.isAdmin && res.user) {
                  onLoginSuccess(res.user);
                } else {
                  setAuthError(
                    res.message ||
                      'Access denied: Signed in account is not authorized as administrator.'
                  );
                }
              }
            },
          });

          const btnEl = document.getElementById('google-signin-btn-container');
          if (btnEl) {
            btnEl.innerHTML = '';
            (window as any).google.accounts.id.renderButton(btnEl, {
              theme: theme === 'dark' ? 'filled_black' : 'outline',
              size: 'large',
              shape: 'pill',
              text: 'signin_with',
            });
          }
        } catch (e) {
          console.warn('Google Identity initialization error:', e);
        }
      }
    };

    const timer = setTimeout(initGoogleSignIn, 500);
    return () => clearTimeout(timer);
  }, [isAdmin, theme]);

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    setIsAuthenticating(true);
    setAuthError(null);

    const res = await loginWithPasscode(passcode);
    setIsAuthenticating(false);

    if (res.ok && res.isAdmin && res.user) {
      onLoginSuccess(res.user);
      setShowPasscodeModal(false);
      setPasscode('');
    } else {
      setAuthError(res.message || 'Incorrect administrator passcode.');
    }
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Admin Status Banner if Admin */}
      {isAdmin && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Administrator Access
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-xs font-medium text-[var(--text-primary)]">
                {adminUser?.email || 'donieltripura1971@gmail.com'}
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

      {/* Appearance & Reading Theme Section (Public) */}
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
                  Optimized for comfortable civil service exam study
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
            onChange={(e) => {
              onSummaryLanguageChange(e.target.value);
              handleSaveSettings('summaryLanguage', e.target.value);
            }}
            className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[var(--text-primary)] font-medium text-xs focus:outline-none"
          >
            <option value="auto">Same as paper</option>
            <option value="en">English</option>
            <option value="bn">বাংলা (Bangla)</option>
            <option value="both">Both</option>
          </select>
        </div>
      </section>

      {/* Read Aloud Section (Public) */}
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
            onChange={(e) => {
              onSpeechVoiceChange(e.target.value);
              handleSaveSettings('speechVoice', e.target.value);
            }}
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
      {/* ADMIN CONTROLS (Shown ONLY if isAdmin === true) */}
      {/* ========================================================================= */}
      {isAdmin ? (
        <>
          {/* Admin Action: Run Digest Now */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#007aff]" />
              <span>Admin: Live Digest Compiler</span>
            </h3>

            <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-4 space-y-3 text-xs sm:text-sm">
              <p className="text-xs text-[var(--text-secondary)]">
                Trigger real-time crawling of today's morning broadsheet editions and compile BCS-targeted summaries.
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

          {/* Admin Action: Account & Supabase Backend */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-1 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin: Supabase Database</span>
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
                          handleSaveSettings('customProject', { customUrl, customKey });
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
                          handleSaveSettings('useDefault', true);
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-1 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin: AI Pipeline Models</span>
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
                onChange={(e) => {
                  onAiModelChange(e.target.value);
                  handleSaveSettings('aiModel', e.target.value);
                }}
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

          {/* Admin Action: Diagnostics & Troubleshooting */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-1">
              Admin Troubleshooting
            </h3>

            <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-4 space-y-2.5 text-xs text-[var(--text-secondary)]">
              <div className="flex items-start gap-2.5">
                <Key className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[var(--text-primary)]">Login credentials:</strong> DAILYSTAR_EMAIL / PROTHOMALO_EMAIL are maintained in the backend server.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <RotateCw className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[var(--text-primary)]">Cron jobs:</strong> The automated runner checks every hour for new Dhaka editions.
                </p>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* ========================================================================= */
        /* ADMINISTRATOR LOGIN PORTAL (Public View) */
        /* ========================================================================= */
        <section className="space-y-2 pt-4 border-t border-[var(--border-subtle)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Administrator Portal</span>
          </h3>

          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-4">
            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                Editor & Admin Controls
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Live digest compilation, AI model selection, and backend database credentials are strictly restricted to authorized administrators (<span className="font-mono text-emerald-600 dark:text-emerald-400">donieltripura1971@gmail.com</span>).
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              {/* Google Sign-in Container rendered by GIS */}
              <div id="google-signin-btn-container" className="min-h-[40px] flex items-center" />

              <span className="text-xs text-[var(--text-muted)]">or</span>

              {/* Master Key Passcode trigger */}
              <button
                onClick={() => setShowPasscodeModal(!showPasscodeModal)}
                className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-secondary)] text-xs font-semibold flex items-center gap-2 transition-colors border border-[var(--border-subtle)]"
              >
                <Key className="w-3.5 h-3.5 text-[#007aff]" />
                <span>Unlock with Admin Passcode</span>
              </button>
            </div>

            {/* Passcode Input Drawer */}
            {showPasscodeModal && (
              <form
                onSubmit={handlePasscodeSubmit}
                className="pt-3 border-t border-[var(--border-subtle)] space-y-3"
              >
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">
                    Admin Master Passcode
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter administrator passcode..."
                      autoFocus
                      className="flex-1 px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#007aff]/30"
                    />
                    <button
                      type="submit"
                      disabled={isAuthenticating || !passcode}
                      className="px-4 py-2 rounded-xl bg-[#007aff] hover:bg-[#0062cc] disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors"
                    >
                      {isAuthenticating ? 'Verifying…' : 'Unlock'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

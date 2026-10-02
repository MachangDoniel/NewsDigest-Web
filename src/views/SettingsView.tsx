import React, { useState } from 'react';
import {
  CheckCircle2,
  Sliders,
  Sparkles,
  Headphones,
  Key,
  RotateCw,
  Info,
  Server,
} from 'lucide-react';
import { saveSettingsToStorage } from '../services/store';

interface SettingsViewProps {
  aiModel: string;
  onAiModelChange: (model: string) => void;
  summaryLanguage: string;
  onSummaryLanguageChange: (lang: string) => void;
  speechVoice: string;
  onSpeechVoiceChange: (voice: string) => void;
  onRunDigestNow: () => Promise<void>;
  isCompiling: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  aiModel,
  onAiModelChange,
  summaryLanguage,
  onSummaryLanguageChange,
  speechVoice,
  onSpeechVoiceChange,
  onRunDigestNow,
  isCompiling,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState(
    'https://utjluiipjiznedsglqsm.supabase.co'
  );
  const [showCustomProject, setShowCustomProject] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  return (
    <div className="space-y-6 pb-28">
      {/* Account / Backend Section */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-1">
          Daily Digest Account
        </h3>

        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-black/5 dark:border-white/5 divide-y divide-black/5 dark:divide-white/5 overflow-hidden text-xs sm:text-sm">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Project Connected</span>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              utjluiipjiznedsglqsm
            </span>
          </div>

          <div className="p-4 flex items-center justify-between text-neutral-600 dark:text-neutral-300">
            <span className="font-medium">Active Database</span>
            <span className="text-neutral-500">NewsDigest Built-in Supabase</span>
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
              <div className="mt-3 space-y-3 pt-3 border-t border-black/5 dark:border-white/5">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
                    Project URL
                  </label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://xxxx.supabase.co"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f2f7] dark:bg-neutral-800 border border-black/5 dark:border-white/5 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
                    Publishable (anon) key
                  </label>
                  <input
                    type="password"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="sb_publishable_..."
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f2f7] dark:bg-neutral-800 border border-black/5 dark:border-white/5 font-mono text-xs"
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
                    className="px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold"
                  >
                    Use built-in project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ✨ Summarize Section */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-1">
          ✨ Summarize & AI
        </h3>

        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-black/5 dark:border-white/5 divide-y divide-black/5 dark:divide-white/5 overflow-hidden text-xs sm:text-sm">
          {/* AI Model Picker */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                AI model
              </div>
              <div className="text-xs text-neutral-500">
                Fallback chain automatically triggers if busy
              </div>
            </div>

            <select
              value={aiModel}
              onChange={(e) => {
                onAiModelChange(e.target.value);
                handleSaveSettings('aiModel', e.target.value);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#f2f2f7] dark:bg-neutral-800 border border-black/5 dark:border-white/5 text-neutral-800 dark:text-neutral-200 font-medium text-xs focus:outline-none"
            >
              {aiModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Summary Language */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                Summary language
              </div>
              <div className="text-xs text-neutral-500">
                Language for headlines, bullets and facts
              </div>
            </div>

            <select
              value={summaryLanguage}
              onChange={(e) => {
                onSummaryLanguageChange(e.target.value);
                handleSaveSettings('summaryLanguage', e.target.value);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#f2f2f7] dark:bg-neutral-800 border border-black/5 dark:border-white/5 text-neutral-800 dark:text-neutral-200 font-medium text-xs focus:outline-none"
            >
              <option value="auto">Same as paper</option>
              <option value="en">English</option>
              <option value="bn">বাংলা (Bangla)</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        <p className="text-[11px] text-neutral-500 px-2 leading-relaxed">
          Uses Gemini and Groq server models. If every key is busy or out of quota, you get the paper's own text for the page instead.
        </p>
      </section>

      {/* Read Aloud Section */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-1">
          🎧 Read Aloud
        </h3>

        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-black/5 dark:border-white/5 p-4 flex items-center justify-between text-xs sm:text-sm">
          <div>
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
              Voice engine
            </div>
            <div className="text-xs text-neutral-500">
              Web SpeechSynthesis & Audio narration
            </div>
          </div>

          <select
            value={speechVoice}
            onChange={(e) => {
              onSpeechVoiceChange(e.target.value);
              handleSaveSettings('speechVoice', e.target.value);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#f2f2f7] dark:bg-neutral-800 border border-black/5 dark:border-white/5 text-neutral-800 dark:text-neutral-200 font-medium text-xs focus:outline-none"
          >
            <option value="natural">Natural Browser Voice</option>
            <option value="gemini">Gemini Voice (Server)</option>
          </select>
        </div>
      </section>

      {/* Diagnostics / Troubleshooting Section */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-1">
          When A Digest Fails
        </h3>

        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-black/5 dark:border-white/5 p-4 space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
          <div className="flex items-start gap-2.5">
            <Key className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-neutral-900 dark:text-neutral-100">Login expired:</strong> check the paper's DAILYSTAR_EMAIL / PROTHOMALO_EMAIL credentials.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <RotateCw className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-neutral-900 dark:text-neutral-100">Re-run anytime:</strong> tap the button below to force build today's digest immediately from live editions.
            </p>
          </div>

          <button
            onClick={onRunDigestNow}
            disabled={isCompiling}
            className="w-full mt-2 py-2.5 rounded-xl bg-[#007aff]/10 hover:bg-[#007aff]/20 text-[#007aff] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCw className={`w-4 h-4 ${isCompiling ? 'animate-spin' : ''}`} />
            <span>{isCompiling ? 'Running digest now…' : 'Trigger live digest run'}</span>
          </button>
        </div>
      </section>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  BookOpen,
  Award,
  Layers,
  FileText,
  BrainCircuit,
  Bot,
} from 'lucide-react';
import { Digest } from '../types';

interface StudyInspectorProps {
  currentDate: string;
  digests: Digest[];
  onOpenRevisionSheet: () => void;
  onOpenFlashcards: () => void;
  onNavigateToPractice: () => void;
}

export const StudyInspector: React.FC<StudyInspectorProps> = ({
  currentDate,
  digests,
  onOpenRevisionSheet,
  onOpenFlashcards,
  onNavigateToPractice,
}) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Compute syllabus stats
  let totalItems = 0;
  const catCounts: Record<string, number> = {
    'Bangladesh Affairs': 0,
    'International Affairs': 0,
    Economy: 0,
    'Science & Tech': 0,
    Environment: 0,
  };

  digests.forEach((d) => {
    d.sections.forEach((s) => {
      catCounts[s.category] = (catCounts[s.category] || 0) + s.items.length;
      totalItems += s.items.length;
    });
  });

  const handleAskInspector = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: `Date: ${currentDate}. Total stories: ${totalItems}. Sources: The Daily Star and Prothom Alo.`,
          messages: [{ role: 'user', text: promptText }],
        }),
      });

      const data = await res.json();
      if (data.ok && data.text) {
        setResponse(data.text);
      } else {
        setResponse('Could not generate an answer right now. Please try again.');
      }
    } catch (e: any) {
      setResponse(`Error connecting to AI mentor: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="space-y-4 sticky top-20">
      {/* Quick Study Toolkit Card */}
      <div className="bg-[var(--bg-surface)] rounded-2xl p-4 border border-[var(--border-subtle)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-[#007aff]" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              BCS Study Toolkit
            </h3>
          </div>
          <span className="text-[10px] bg-[#007aff]/10 text-[#007aff] px-2 py-0.5 rounded-full font-bold">
            v2 Pro
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
          <button
            onClick={onOpenRevisionSheet}
            className="p-2.5 rounded-xl border border-[var(--border-subtle)] hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors flex flex-col justify-between h-20"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="font-bold text-[var(--text-primary)]">Revision Sheet</div>
              <div className="text-[10px] text-[var(--text-muted)]">Printable Broadsheet</div>
            </div>
          </button>

          <button
            onClick={onOpenFlashcards}
            className="p-2.5 rounded-xl border border-[var(--border-subtle)] hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors flex flex-col justify-between h-20"
          >
            <Layers className="w-4 h-4 text-amber-500" />
            <div>
              <div className="font-bold text-[var(--text-primary)]">Flashcards</div>
              <div className="text-[10px] text-[var(--text-muted)]">Rapid Memorizer</div>
            </div>
          </button>
        </div>
      </div>

      {/* Embedded BCS AI Mentor */}
      <div className="bg-[var(--bg-surface)] rounded-2xl p-4 border border-[var(--border-subtle)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#007aff]" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              Civil Service Mentor
            </h3>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Gemini 3.8
          </span>
        </div>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Ask questions about constitutional clauses, foreign policy, or economic indicators from today's papers.
        </p>

        {/* Preset prompts */}
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <button
            onClick={() => {
              setQuery('What are the 3 biggest Bangladesh Affairs points today?');
              handleAskInspector('What are the 3 biggest Bangladesh Affairs points today?');
            }}
            className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-[#007aff]/10 hover:text-[#007aff] transition-colors"
          >
            3 Key Affairs
          </button>
          <button
            onClick={() => {
              setQuery('বাংলায় গুরুত্বপূর্ণ সাধারণ জ্ঞান ব্যাখ্যা করুন');
              handleAskInspector('আজকের পত্রিকার গুরুত্বপূর্ণ সাধারণ জ্ঞান পয়েন্টগুলো বাংলায় বুঝিয়ে বলুন');
            }}
            className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-[#007aff]/10 hover:text-[#007aff] transition-colors font-bangla"
          >
            বাংলায় ব্যাখ্যা
          </button>
          <button
            onClick={() => {
              setQuery('Viva interview questions from today news');
              handleAskInspector('Suggest 3 possible BCS Viva interview questions based on today news');
            }}
            className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-[#007aff]/10 hover:text-[#007aff] transition-colors"
          >
            Viva Questions
          </button>
        </div>

        {/* Chat Output Area if active */}
        {isLoading && (
          <div className="p-3 bg-[var(--bg-canvas)] rounded-xl text-xs text-[var(--text-muted)] flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#007aff]" />
            <span>Analyzing exam syllabus & formulating advice…</span>
          </div>
        )}

        {response && (
          <div className="p-3.5 bg-[var(--bg-canvas)] rounded-xl text-xs text-[var(--text-primary)] font-bangla whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto custom-scrollbar border border-black/5 dark:border-white/5">
            {response}
          </div>
        )}

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskInspector(query);
          }}
          className="flex items-center gap-1.5 pt-1"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask mentor: 'tax policy', 'ICJ', 'BIMSTEC'…"
            className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#007aff] font-bangla"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="p-2 rounded-xl bg-[#007aff] text-white hover:bg-[#0062cc] disabled:opacity-40 transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Syllabus Distribution */}
      <div className="bg-[var(--bg-surface)] rounded-2xl p-4 border border-[var(--border-subtle)] shadow-xs space-y-2.5 text-xs">
        <h4 className="font-bold text-[var(--text-primary)]">
          Today's Syllabus Coverage
        </h4>

        <div className="space-y-2">
          {Object.entries(catCounts).map(([cat, count]) => {
            const pct = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>{cat}</span>
                  <span className="font-semibold">{count} ({pct}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#007aff] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

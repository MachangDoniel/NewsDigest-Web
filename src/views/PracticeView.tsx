import React, { useState } from 'react';
import { RotateCcw, Award, Layers } from 'lucide-react';
import { Digest, PaperId, Mcq, PAPERS } from '../types';
import { McqCard } from '../components/McqCard';
import { PaperBadge } from '../components/PaperBadge';
import { SourceBadge } from '../components/SourceBadge';

interface PracticeViewProps {
  currentDate: string;
  digests: Digest[];
  answers: Record<string, string>;
  onAnswerQuestion: (questionId: string, option: string) => void;
  onResetAnswers: () => void;
  onOpenInAppChat: (prompt: string, contextTitle: string) => void;
  onOpenFlashcards: () => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  currentDate,
  digests,
  answers,
  onAnswerQuestion,
  onResetAnswers,
  onOpenInAppChat,
  onOpenFlashcards,
}) => {
  const [paperFilter, setPaperFilter] = useState<PaperId | null>(null);

  const visibleDigests = digests.filter(
    (d) => paperFilter === null || d.paper === paperFilter
  );

  interface QuestionItem {
    id: string;
    paper: PaperId;
    mcq: Mcq;
  }

  const questions: QuestionItem[] = visibleDigests.flatMap((d) =>
    d.mcqs.map((mcq) => ({
      id: `${d.date}|${d.paper}|${mcq.question}`,
      paper: d.paper,
      mcq,
    }))
  );

  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
  const correctCount = questions.filter(
    (q) => answers[q.id] && answers[q.id] === q.mcq.answer
  ).length;

  const totalQuestions = questions.length;
  const percentComplete =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const primarySource =
    visibleDigests[0]?.sourceType ||
    (visibleDigests.some((d) => d.pageCount > 0) ? 'supabase' : 'rss');

  return (
    <div className="space-y-4 pb-28 max-w-3xl mx-auto">
      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Questions Origin
        </span>
        <SourceBadge sourceType={primarySource} size="xs" variant="pill" />
      </div>

      {/* Paper Segmented Control */}
      <div className="bg-black/5 dark:bg-white/5 p-1 rounded-xl flex text-xs font-semibold select-none border border-black/5 dark:border-white/5">
        <button
          onClick={() => setPaperFilter(null)}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
            paperFilter === null
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs font-bold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Both Papers
        </button>
        <button
          onClick={() => setPaperFilter('dailystar')}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
            paperFilter === 'dailystar'
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs font-bold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <PaperBadge paper="dailystar" size="sm" />
          <span>Daily Star</span>
        </button>
        <button
          onClick={() => setPaperFilter('prothomalo')}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
            paperFilter === 'prothomalo'
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs font-bold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <PaperBadge paper="prothomalo" size="sm" />
          <span>প্রথম আলো</span>
        </button>
      </div>

      {/* Score Progress Card */}
      {totalQuestions > 0 && (
        <div className="bg-[var(--bg-surface)] rounded-2xl p-4 sm:p-5 shadow-xs border border-[var(--border-subtle)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Circular Progress Ring */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="19"
                  className="stroke-black/10 dark:stroke-white/10"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="19"
                  className="stroke-[#007aff] transition-all duration-300"
                  strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 19}
                  strokeDashoffset={
                    2 * Math.PI * 19 * (1 - percentComplete / 100)
                  }
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute font-bold text-base text-[var(--text-primary)]">
                {correctCount}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="text-sm font-bold text-[var(--text-primary)]">
                {correctCount} correct of {answeredCount} answered
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {totalQuestions} questions · {totalQuestions - answeredCount} remaining
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenFlashcards}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold text-xs flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors"
              title="Open Flashcards quiz"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Flashcards</span>
            </button>

            {answeredCount > 0 && (
              <button
                onClick={onResetAnswers}
                className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors"
                title="Reset answers for this date"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MCQs List */}
      {questions.length === 0 ? (
        <div className="bg-[var(--bg-surface)] rounded-2xl p-10 text-center border border-[var(--border-subtle)] space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#007aff]/10 text-[#007aff] flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-[var(--text-primary)] text-sm">
            No MCQs generated for this date
          </h4>
          <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
            MCQs are created alongside today's digest. Navigate dates with ◀ or run a fresh digest on Today tab.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <McqCard
              key={q.id}
              index={idx + 1}
              mcq={q.mcq}
              paper={q.paper}
              pickedOption={answers[q.id]}
              onPick={(option) => onAnswerQuestion(q.id, option)}
              onOpenInAppChat={onOpenInAppChat}
            />
          ))}
        </div>
      )}
    </div>
  );
};

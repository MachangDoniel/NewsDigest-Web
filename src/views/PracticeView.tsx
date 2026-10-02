import React, { useState } from 'react';
import { RotateCcw, Award } from 'lucide-react';
import { Digest, PaperId, Mcq, PAPERS } from '../types';
import { McqCard } from '../components/McqCard';
import { PaperBadge } from '../components/PaperBadge';

interface PracticeViewProps {
  currentDate: string;
  digests: Digest[];
  answers: Record<string, string>;
  onAnswerQuestion: (questionId: string, option: string) => void;
  onResetAnswers: () => void;
  onOpenInAppChat: (prompt: string, contextTitle: string) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  currentDate,
  digests,
  answers,
  onAnswerQuestion,
  onResetAnswers,
  onOpenInAppChat,
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
    d.mcqs.map((mcq, idx) => ({
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

  return (
    <div className="space-y-4 pb-24">
      {/* Paper Segmented Control */}
      <div className="bg-black/5 dark:bg-white/10 p-0.5 rounded-xl flex text-xs font-semibold select-none">
        <button
          onClick={() => setPaperFilter(null)}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
            paperFilter === null
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          Both Papers
        </button>
        <button
          onClick={() => setPaperFilter('dailystar')}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
            paperFilter === 'dailystar'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          <PaperBadge paper="dailystar" size="sm" />
          <span>Daily Star</span>
        </button>
        <button
          onClick={() => setPaperFilter('prothomalo')}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
            paperFilter === 'prothomalo'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          <PaperBadge paper="prothomalo" size="sm" />
          <span>প্রথম আলো</span>
        </button>
      </div>

      {/* Score Progress Card */}
      {totalQuestions > 0 && (
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 dark:border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Circular Progress Ring */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="19"
                  className="stroke-neutral-200 dark:stroke-neutral-800"
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
              <span className="absolute font-bold text-base text-neutral-900 dark:text-neutral-100">
                {correctCount}
              </span>
            </div>

            {/* Score Text */}
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {correctCount} correct of {answeredCount} answered
              </div>
              <div className="text-xs text-neutral-500">
                {totalQuestions} questions · {totalQuestions - answeredCount} left
              </div>
            </div>
          </div>

          {answeredCount > 0 && (
            <button
              onClick={onResetAnswers}
              className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      )}

      {/* MCQs List */}
      {questions.length === 0 ? (
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-10 text-center border border-black/5 dark:border-white/5 space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#007aff]/10 text-[#007aff] flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
            No MCQs for this day
          </h4>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            MCQs are generated each morning with the day's digest. Use ◀ to test past days!
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

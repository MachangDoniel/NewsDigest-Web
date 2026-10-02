import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Mcq, PaperId } from '../types';
import { PaperBadge } from './PaperBadge';
import { AskAIMenu } from './AskAIMenu';

interface McqCardProps {
  index: number;
  mcq: Mcq;
  paper?: PaperId;
  pickedOption?: string;
  onPick: (option: string) => void;
  onOpenInAppChat: (prompt: string, contextTitle: string) => void;
}

export const McqCard: React.FC<McqCardProps> = ({
  index,
  mcq,
  paper,
  pickedOption,
  onPick,
  onOpenInAppChat,
}) => {
  const isAnswered = Boolean(pickedOption);
  const isCorrect = pickedOption === mcq.answer;

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 dark:border-white/5 space-y-3.5">
      {/* Question Header */}
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 leading-snug font-bangla">
          <span className="text-[#007aff] mr-1.5">Q{index}.</span>
          {mcq.question}
        </h4>
        {paper && <PaperBadge paper={paper} size="sm" />}
      </div>

      {mcq.model?.includes('lite') && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>From a lighter AI model. Verify the answer.</span>
        </div>
      )}

      {/* Options List */}
      <div className="space-y-2">
        {mcq.options.map((option, idx) => {
          const letter = optionLetters[idx] || `${idx + 1}`;
          const isSelected = pickedOption === option;
          const isTheAnswer = option === mcq.answer;

          let btnClass =
            'bg-[#f2f2f7] dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-black/5 dark:border-white/5 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/70';

          if (isAnswered) {
            if (isTheAnswer) {
              btnClass =
                'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-500/50';
            } else if (isSelected) {
              btnClass =
                'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-500/50';
            } else {
              btnClass = 'opacity-50 bg-[#f2f2f7] dark:bg-neutral-800 border-transparent';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isAnswered}
              onClick={() => onPick(option)}
              className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all font-bangla ${btnClass}`}
            >
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                  {letter}
                </span>
                <span className="leading-snug pt-0.5">{option}</span>
              </div>

              {isAnswered && (
                <div className="shrink-0 ml-2">
                  {isTheAnswer && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {isSelected && !isTheAnswer && (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Answer feedback & Explanation Trigger */}
      {isAnswered && (
        <div className="pt-2 flex items-center justify-between border-t border-black/5 dark:border-white/5">
          <div className="text-xs font-semibold">
            {isCorrect ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer!
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Correct: {mcq.answer}
              </span>
            )}
          </div>

          <AskAIMenu
            mcq={mcq}
            paper={paper}
            onOpenInAppChat={onOpenInAppChat}
            triggerButton={
              <button
                type="button"
                className="text-xs font-semibold text-[#007aff] hover:text-[#0051a8] transition-colors py-1 flex items-center gap-1.5"
              >
                Explain with AI…
              </button>
            }
          />
        </div>
      )}
    </div>
  );
};

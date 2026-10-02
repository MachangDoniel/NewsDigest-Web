import React, { useState } from 'react';
import { X, RotateCw, ChevronLeft, ChevronRight, Sparkles, Award } from 'lucide-react';
import { Digest } from '../types';

interface Flashcard {
  question: string;
  answer: string;
  category: string;
  source: string;
}

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  digests: Digest[];
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  isOpen,
  onClose,
  digests,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Generate flashcards from key facts and headlines
  const cards: Flashcard[] = [];

  digests.forEach((d) => {
    d.sections.forEach((sec) => {
      sec.items.forEach((item) => {
        if (item.keyFacts && item.keyFacts.length > 0) {
          cards.push({
            question: `In connection with "${item.headline.slice(0, 80)}...", what are the primary examination facts?`,
            answer: item.keyFacts.join('  •  '),
            category: sec.category,
            source: d.paper === 'dailystar' ? 'The Daily Star' : 'Prothom Alo',
          });
        }
      });
    });

    d.mcqs.forEach((mcq) => {
      cards.push({
        question: mcq.question,
        answer: mcq.answer,
        category: 'Exam MCQ',
        source: d.paper === 'dailystar' ? 'The Daily Star' : 'Prothom Alo',
      });
    });
  });

  if (!isOpen) return null;

  const currentCard = cards[currentIndex] || {
    question: 'No flashcards generated for this date yet.',
    answer: 'Run digest now on the Today tab to compile fresh cards.',
    category: 'General',
    source: 'NewsDigest',
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1 < cards.length ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : cards.length - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[var(--bg-surface)] text-[var(--text-primary)] w-full max-w-lg rounded-3xl shadow-2xl border border-[var(--border-subtle)] p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Key Facts Flashcards</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Card {cards.length > 0 ? currentIndex + 1 : 0} of {cards.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Flip Card */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`min-h-[220px] rounded-2xl p-6 border transition-all cursor-pointer flex flex-col justify-between select-none shadow-xs hover:border-[#007aff]/40 ${
            isFlipped
              ? 'bg-amber-500/5 border-amber-500/30'
              : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              {currentCard.category}
            </span>
            <span>{currentCard.source}</span>
          </div>

          <div className="my-auto py-4">
            {!isFlipped ? (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Question / Recall:
                </div>
                <div className="text-base sm:text-lg font-bold font-bangla leading-snug">
                  {currentCard.question}
                </div>
              </div>
            ) : (
              <div className="space-y-2 animate-in zoom-in-95 duration-100">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Answer & Key Facts:
                </div>
                <div className="text-base sm:text-lg font-bold font-bangla text-[#007aff] dark:text-[#0a84ff] leading-relaxed">
                  {currentCard.answer}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-2 border-t border-black/5 dark:border-white/5">
            <span className="flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" /> Click anywhere to flip
            </span>
            <span>{isFlipped ? 'Tap to hide' : 'Tap to reveal'}</span>
          </div>
        </div>

        {/* Navigation Steppers */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handlePrev}
            disabled={cards.length <= 1}
            className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-semibold hover:bg-black/10"
          >
            {isFlipped ? 'Hide Answer' : 'Reveal Answer'}
          </button>

          <button
            onClick={handleNext}
            disabled={cards.length <= 1}
            className="px-4 py-2 rounded-xl bg-[#007aff] text-white text-xs font-semibold hover:bg-[#0062cc] flex items-center gap-1 shadow-xs disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Flame,
  Bookmark,
  Share2,
  Newspaper,
  ChevronDown,
  ChevronUp,
  Quote,
  Check,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { SavedItem, PAPERS } from '../types';
import { PaperBadge } from './PaperBadge';
import { AskAIMenu } from './AskAIMenu';
import { SourceBadge } from './SourceBadge';

interface ItemCardProps {
  saved: SavedItem;
  isBookmarked: boolean;
  onToggleBookmark: (saved: SavedItem) => void;
  onOpenPage?: (paper: string, page: number) => void;
  onOpenInAppChat: (prompt: string, contextTitle: string) => void;
  showDate?: boolean;
  viewMode?: 'editorial' | 'compact';
}

export const ItemCard: React.FC<ItemCardProps> = ({
  saved,
  isBookmarked,
  onToggleBookmark,
  onOpenPage,
  onOpenInAppChat,
  showDate = false,
  viewMode = 'editorial',
}) => {
  const { item, paper, category } = saved;
  const paperInfo = PAPERS[paper] || PAPERS.dailystar;
  const [fromPaperOpen, setFromPaperOpen] = useState(item.source === 'paper');
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShare = async () => {
    const textToShare = [
      item.headline,
      ...(item.bullets || []).map((b) => `• ${b}`),
      item.keyFacts && item.keyFacts.length > 0
        ? `Key facts: ${item.keyFacts.join('; ')}`
        : '',
      `Source: ${paperInfo.name} (${saved.date})`,
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.headline,
          text: textToShare,
        });
      } else {
        await navigator.clipboard.writeText(textToShare);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(textToShare);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // Compact View Mode for high-speed skimming
  if (viewMode === 'compact') {
    return (
      <article className="bg-[var(--bg-surface)] rounded-xl p-3.5 border border-[var(--border-subtle)] shadow-2xs hover:border-[#007aff]/30 transition-all flex items-start justify-between gap-3 group">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium flex-wrap">
            <PaperBadge paper={paper} size="sm" />
            <SourceBadge sourceType={saved.sourceType || 'supabase'} size="xs" variant="compact" />
            <span>{category}</span>
            <span>·</span>
            <span>Page {item.page}</span>
            {item.bcsRelevance === 'high' && (
              <>
                <span>·</span>
                <span className="text-amber-600 font-bold flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-current" /> High
                </span>
              </>
            )}
          </div>

          <h3 className="text-sm font-bold font-bangla text-[var(--text-primary)] leading-snug group-hover:text-[#007aff] transition-colors">
            {item.headline}
          </h3>

          {item.keyFacts && item.keyFacts.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {item.keyFacts.slice(0, 3).map((f, i) => (
                <span
                  key={i}
                  className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-[var(--text-secondary)] font-bangla"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 pt-1">
          <AskAIMenu story={saved} onOpenInAppChat={onOpenInAppChat} />
          <button
            onClick={() => onToggleBookmark(saved)}
            className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
              isBookmarked ? 'text-[#007aff]' : 'text-neutral-400'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </article>
    );
  }

  // Editorial Rich View Mode
  return (
    <article className="bg-[var(--bg-surface)] rounded-2xl p-5 sm:p-6 shadow-xs border border-[var(--border-subtle)] space-y-3.5 transition-all hover:shadow-md hover:border-[#007aff]/30">
      {/* Top Metadata Row (Unboxed Clean Metadata) */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2 flex-wrap">
          <PaperBadge paper={paper} size="sm" />
          <SourceBadge sourceType={saved.sourceType || 'supabase'} size="xs" variant="compact" />
          <span className="font-semibold text-[var(--text-secondary)]">{category}</span>
          <span aria-hidden="true">·</span>
          <span>Page {item.page}</span>
          {showDate && (
            <>
              <span aria-hidden="true">·</span>
              <span>{saved.date}</span>
            </>
          )}
        </div>

        {item.bcsRelevance === 'high' && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>High BCS Exam Relevance</span>
          </div>
        )}
      </div>

      {/* Headline (Editorial Serif for English / Hind Siliguri for Bangla) */}
      <h3 className="text-base sm:text-xl font-bold font-bangla text-[var(--text-primary)] leading-snug">
        {item.headline}
      </h3>

      {/* Bullets (2-3 concise points) */}
      {item.bullets && item.bullets.length > 0 && (
        <ul className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-bangla pl-1">
          {item.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="text-[#007aff] font-bold text-base leading-none select-none mt-0.5">
                •
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Key Exam Facts tags */}
      {item.keyFacts && item.keyFacts.length > 0 && (
        <div className="pt-1.5 space-y-1.5">
          <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Memorize for Prelims & Viva
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.keyFacts.map((fact, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/5 dark:bg-white/5 text-[var(--text-primary)] border border-black/5 dark:border-white/5 font-bangla"
              >
                {fact}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Collapsible From The Paper Quote */}
      {(item.excerpt || item.sourceHeadline) && (
        <div
          className="rounded-xl p-3.5 border-l-4 transition-all"
          style={{
            backgroundColor: `${paperInfo.color}0a`,
            borderColor: paperInfo.color,
          }}
        >
          <button
            onClick={() => setFromPaperOpen(!fromPaperOpen)}
            className="w-full flex items-center justify-between text-left font-bold text-xs"
            style={{ color: paperInfo.color }}
          >
            <div className="flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5" />
              <span>From the original paper</span>
            </div>
            {fromPaperOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {fromPaperOpen && (
            <div className="mt-2.5 space-y-1.5 text-xs text-[var(--text-secondary)] font-bangla leading-relaxed">
              {item.sourceHeadline && item.sourceHeadline !== item.headline && (
                <div className="font-bold text-[var(--text-primary)]">
                  {item.sourceHeadline}
                </div>
              )}
              {item.excerpt && <p className="opacity-95 italic">“{item.excerpt}”</p>}
            </div>
          )}
        </div>
      )}

      {/* Model warning note if lighter model */}
      {item.source === 'image' && item.model?.includes('lite') && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Read by lighter AI model. Double-check numbers and dates on the e-paper page.</span>
        </div>
      )}

      {/* Bottom Action Row */}
      <div className="pt-2 flex items-center justify-between border-t border-[var(--border-subtle)] text-xs text-[#007aff]">
        {/* Page jump */}
        {item.page ? (
          <button
            onClick={() => onOpenPage && onOpenPage(paper, item.page)}
            className="flex items-center gap-1.5 font-bold hover:opacity-80 py-1"
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Page {item.page}</span>
          </button>
        ) : (
          <div />
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <AskAIMenu story={saved} onOpenInAppChat={onOpenInAppChat} />

          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] hover:text-[#007aff] transition-colors"
            title="Share or copy story"
          >
            {copiedShare ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => onToggleBookmark(saved)}
            className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors active:scale-90 ${
              isBookmarked ? 'text-[#007aff]' : 'text-neutral-400'
            }`}
            title={isBookmarked ? 'Remove from Saved' : 'Save for Revision'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
};

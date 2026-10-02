import React, { useState } from 'react';
import { Flame, Bookmark, Share2, Newspaper, ChevronDown, ChevronUp, Quote, Check, AlertTriangle } from 'lucide-react';
import { SavedItem, PAPERS } from '../types';
import { PaperBadge } from './PaperBadge';
import { AskAIMenu } from './AskAIMenu';

interface ItemCardProps {
  saved: SavedItem;
  isBookmarked: boolean;
  onToggleBookmark: (saved: SavedItem) => void;
  onOpenPage?: (paper: string, page: number) => void;
  onOpenInAppChat: (prompt: string, contextTitle: string) => void;
  showDate?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  saved,
  isBookmarked,
  onToggleBookmark,
  onOpenPage,
  onOpenInAppChat,
  showDate = false,
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

  return (
    <article className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 dark:border-white/5 space-y-3 transition-all hover:shadow-md">
      {/* Top Metadata Row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <PaperBadge paper={paper} size="sm" />
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            {category}
          </span>
          {showDate && (
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
              · {saved.date}
            </span>
          )}
        </div>

        {item.bcsRelevance === 'high' && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>High BCS Relevance</span>
          </div>
        )}
      </div>

      {/* Headline */}
      <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-50 leading-snug font-bangla">
        {item.headline}
      </h3>

      {/* Bullets */}
      {item.bullets && item.bullets.length > 0 && (
        <ul className="space-y-1.5 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-bangla">
          {item.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#007aff] font-bold text-base leading-none select-none mt-0.5">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Key Facts tags */}
      {item.keyFacts && item.keyFacts.length > 0 && (
        <div className="pt-1">
          <div className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 dark:text-neutral-500 mb-1.5">
            Key Exam Facts
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.keyFacts.map((fact, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-[#f2f2f7] dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-black/5 dark:border-white/5 font-bangla"
              >
                {fact}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* From the paper quote box */}
      {(item.excerpt || item.sourceHeadline) && (
        <div
          className="rounded-xl p-3 border-l-4 transition-all"
          style={{
            backgroundColor: `${paperInfo.color}0a`,
            borderColor: paperInfo.color,
          }}
        >
          <button
            onClick={() => setFromPaperOpen(!fromPaperOpen)}
            className="w-full flex items-center justify-between text-left font-semibold text-xs"
            style={{ color: paperInfo.color }}
          >
            <div className="flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5" />
              <span>From the paper</span>
            </div>
            {fromPaperOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {fromPaperOpen && (
            <div className="mt-2 space-y-1 text-xs text-neutral-600 dark:text-neutral-300 font-bangla">
              {item.sourceHeadline && item.sourceHeadline !== item.headline && (
                <div className="font-semibold text-neutral-800 dark:text-neutral-100">
                  {item.sourceHeadline}
                </div>
              )}
              {item.excerpt && <p className="leading-relaxed opacity-90">{item.excerpt}</p>}
            </div>
          )}
        </div>
      )}

      {/* Model warning note */}
      {item.source === 'image' && item.model?.includes('lite') && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Read by lighter AI model. Verify numbers and dates on the e-paper page.</span>
        </div>
      )}

      {/* Bottom Action Row */}
      <div className="pt-2 flex items-center justify-between border-t border-black/5 dark:border-white/5 text-xs text-[#007aff]">
        {/* Page jump */}
        {item.page ? (
          <button
            onClick={() => onOpenPage && onOpenPage(paper, item.page)}
            className="flex items-center gap-1.5 font-semibold hover:opacity-80 py-1"
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Page {item.page}</span>
          </button>
        ) : (
          <div />
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Ask AI Menu */}
          <AskAIMenu
            story={saved}
            onOpenInAppChat={onOpenInAppChat}
          />

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-full hover:bg-[#007aff]/10 transition-colors"
            title="Share or copy story"
          >
            {copiedShare ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>

          {/* Bookmark */}
          <button
            onClick={() => onToggleBookmark(saved)}
            className={`p-1.5 rounded-full hover:bg-[#007aff]/10 transition-colors active:scale-90 ${
              isBookmarked ? 'text-[#007aff]' : 'text-neutral-400 dark:text-neutral-500'
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

import React from 'react';
import {
  Flame,
  CheckSquare,
  RotateCw,
  Building,
  Globe,
  TrendingUp,
  Atom,
  Leaf,
  Trophy,
  Grid2X2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  Digest,
  DigestItem,
  PaperId,
  RunStatus,
  SavedItem,
  Category,
  PAPERS,
} from '../types';
import { ItemCard } from '../components/ItemCard';
import { PaperBadge } from '../components/PaperBadge';

interface TodayViewProps {
  currentDate: string;
  digests: Digest[];
  runStatus: RunStatus[];
  paperFilter: PaperId | null;
  onPaperFilterChange: (p: PaperId | null) => void;
  selectedCategory: string | null;
  onCategoryChange: (c: string | null) => void;
  highOnly: boolean;
  onHighOnlyToggle: () => void;
  bookmarks: SavedItem[];
  onToggleBookmark: (item: SavedItem) => void;
  onOpenPage: (paper: string, page: number) => void;
  onOpenInAppChat: (prompt: string, contextTitle: string) => void;
  onNavigateToPractice: () => void;
  onRunDigestNow: () => Promise<void>;
  isCompiling: boolean;
  isLoading: boolean;
}

export const TodayView: React.FC<TodayViewProps> = ({
  currentDate,
  digests,
  runStatus,
  paperFilter,
  onPaperFilterChange,
  selectedCategory,
  onCategoryChange,
  highOnly,
  onHighOnlyToggle,
  bookmarks,
  onToggleBookmark,
  onOpenPage,
  onOpenInAppChat,
  onNavigateToPractice,
  onRunDigestNow,
  isCompiling,
  isLoading,
}) => {
  const visibleDigests = digests.filter(
    (d) => paperFilter === null || d.paper === paperFilter
  );

  // Flatten all items with metadata
  const allItems: SavedItem[] = visibleDigests.flatMap((d) =>
    d.sections.flatMap((s) =>
      s.items.map((item) => ({
        id: `${d.date}|${d.paper}|${item.headline}`,
        date: d.date,
        paper: d.paper,
        category: s.category,
        item,
      }))
    )
  );

  const filteredByHigh = highOnly
    ? allItems.filter((i) => i.item.bcsRelevance === 'high')
    : allItems;

  const counts: Record<string, number> = {};
  allItems.forEach((i) => {
    counts[i.category] = (counts[i.category] || 0) + 1;
  });

  const displayItems = selectedCategory
    ? filteredByHigh.filter((i) => i.category === selectedCategory)
    : filteredByHigh;

  // Group by category if "All" is active
  const categoriesInOrder: Category[] = [
    'Bangladesh Affairs',
    'International Affairs',
    'Economy',
    'Science & Tech',
    'Environment',
    'Sports',
    'Others',
  ];

  const grouped = categoriesInOrder
    .map((cat) => ({
      category: cat,
      items: displayItems.filter((i) => i.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  const totalMcqCount = visibleDigests.reduce((sum, d) => sum + d.mcqs.length, 0);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Bangladesh Affairs':
        return <Building className="w-3.5 h-3.5" />;
      case 'International Affairs':
        return <Globe className="w-3.5 h-3.5" />;
      case 'Economy':
        return <TrendingUp className="w-3.5 h-3.5" />;
      case 'Science & Tech':
        return <Atom className="w-3.5 h-3.5" />;
      case 'Environment':
        return <Leaf className="w-3.5 h-3.5" />;
      case 'Sports':
        return <Trophy className="w-3.5 h-3.5" />;
      default:
        return <Grid2X2 className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryShort = (cat: string) => {
    switch (cat) {
      case 'Bangladesh Affairs':
        return 'Bangladesh';
      case 'International Affairs':
        return 'International';
      case 'Science & Tech':
        return 'Sci & Tech';
      default:
        return cat;
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Run status warning banner if any */}
      {runStatus
        .filter((s) => s.state !== 'ok')
        .map((s, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-start gap-3 text-xs"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold">{PAPERS[s.paper]?.name}: {s.state}</div>
              <p className="opacity-90 mt-0.5">{s.message}</p>
            </div>
          </div>
        ))}

      {/* "Papers out already? Run digest now" banner */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 shadow-xs border border-black/5 dark:border-white/5 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100">
            <Sparkles className="w-4 h-4 text-[#007aff]" />
            <span>Papers out already?</span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md">
            The server checks every hour. Build today's digest now from live editions instead of waiting.
          </p>
        </div>

        <button
          onClick={onRunDigestNow}
          disabled={isCompiling}
          className="shrink-0 px-3.5 py-2 rounded-xl bg-[#007aff] text-white text-xs font-semibold hover:bg-[#0062cc] disabled:opacity-50 transition-all shadow-xs flex items-center gap-1.5"
        >
          <span className={`inline-block ${isCompiling ? 'animate-spin' : ''}`}>
            ⟳
          </span>
          <span>{isCompiling ? 'Compiling…' : 'Run digest now'}</span>
        </button>
      </div>

      {/* Practice N MCQs Banner */}
      {totalMcqCount > 0 && (
        <button
          onClick={onNavigateToPractice}
          className="w-full bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 shadow-xs border border-black/5 dark:border-white/5 flex items-center justify-between text-left hover:border-[#007aff]/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#007aff] to-[#5856d6] flex items-center justify-center text-white font-bold shadow-xs">
              ✓
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#007aff] transition-colors">
                Practice {totalMcqCount} MCQs
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Test yourself on this day's key examination news
              </div>
            </div>
          </div>
          <div className="text-neutral-400 group-hover:text-[#007aff] transition-colors font-bold text-sm">
            →
          </div>
        </button>
      )}

      {/* Filter Section (Segmented Paper + Chips) */}
      <div className="sticky top-[53px] z-20 bg-[#f2f2f7]/95 dark:bg-[#000000]/95 backdrop-blur-md pt-1 pb-2 space-y-2">
        {/* Paper Segmented Control */}
        <div className="bg-black/5 dark:bg-white/10 p-0.5 rounded-xl flex text-xs font-semibold select-none">
          <button
            onClick={() => onPaperFilterChange(null)}
            className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
              paperFilter === null
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Both Papers
          </button>
          <button
            onClick={() => onPaperFilterChange('dailystar')}
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
            onClick={() => onPaperFilterChange('prothomalo')}
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

        {/* Horizontal Chips Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          {/* High relevance chip */}
          <button
            onClick={onHighOnlyToggle}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              highOnly
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white dark:bg-[#1c1c1e] text-neutral-700 dark:text-neutral-300 border border-black/5 dark:border-white/5 hover:bg-neutral-100'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${highOnly ? 'fill-current' : 'text-amber-500'}`} />
            <span>High</span>
          </button>

          <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700 shrink-0 mx-0.5" />

          {/* All chip */}
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              selectedCategory === null
                ? 'bg-[#007aff] text-white shadow-xs'
                : 'bg-white dark:bg-[#1c1c1e] text-neutral-700 dark:text-neutral-300 border border-black/5 dark:border-white/5 hover:bg-neutral-100'
            }`}
          >
            <span>All</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedCategory === null ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10'
            }`}>
              {allItems.length}
            </span>
          </button>

          {/* Category chips */}
          {categoriesInOrder.map((cat) => {
            const count = counts[cat] || 0;
            if (count === 0 && selectedCategory !== cat) return null;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(isSelected ? null : cat)}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#007aff] text-white shadow-xs'
                    : 'bg-white dark:bg-[#1c1c1e] text-neutral-700 dark:text-neutral-300 border border-black/5 dark:border-white/5 hover:bg-neutral-100'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{getCategoryShort(cat)}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stories Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-5 border border-black/5 dark:border-white/5 animate-pulse space-y-3"
            >
              <div className="w-24 h-4 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="w-3/4 h-6 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="space-y-2 pt-2">
                <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="w-5/6 h-3 bg-neutral-200 dark:bg-neutral-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center border border-black/5 dark:border-white/5 space-y-2">
          <div className="text-3xl">📰</div>
          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
            Nothing matches these filters
          </h4>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Try switching paper or category filter to see more stories for this date.
          </p>
        </div>
      ) : selectedCategory ? (
        // When a specific category is chosen, show items directly
        <div className="space-y-3">
          {displayItems.map((item) => (
            <ItemCard
              key={item.id}
              saved={item}
              isBookmarked={bookmarks.some((b) => b.id === item.id)}
              onToggleBookmark={onToggleBookmark}
              onOpenPage={onOpenPage}
              onOpenInAppChat={onOpenInAppChat}
            />
          ))}
        </div>
      ) : (
        // Grouped under Category Headers
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.category} className="space-y-3">
              <div className="flex items-center gap-2 pt-2 text-neutral-900 dark:text-neutral-100 font-bold text-base">
                {getCategoryIcon(group.category)}
                <span>{group.category}</span>
                <span className="text-xs font-normal text-neutral-400">
                  ({group.items.length})
                </span>
              </div>

              <div className="space-y-3">
                {group.items.map((item) => (
                  <ItemCard
                    key={item.id}
                    saved={item}
                    isBookmarked={bookmarks.some((b) => b.id === item.id)}
                    onToggleBookmark={onToggleBookmark}
                    onOpenPage={onOpenPage}
                    onOpenInAppChat={onOpenInAppChat}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

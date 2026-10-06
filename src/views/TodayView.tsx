import React, { useState } from 'react';
import {
  Flame,
  CheckSquare,
  Building,
  Globe,
  TrendingUp,
  Atom,
  Leaf,
  Trophy,
  Grid2X2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Search,
  X,
  Newspaper,
} from 'lucide-react';
import {
  Digest,
  PaperId,
  RunStatus,
  SavedItem,
  Category,
  PAPERS,
} from '../types';
import { ItemCard } from '../components/ItemCard';
import { PaperBadge } from '../components/PaperBadge';
import { SourceBadge } from '../components/SourceBadge';
import { StudyInspector } from '../components/StudyInspector';
import { ViewMode } from '../components/Header';

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
  viewMode: ViewMode;
  onOpenRevisionSheet: () => void;
  onOpenFlashcards: () => void;
  isAdmin?: boolean;
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
  viewMode,
  onOpenRevisionSheet,
  onOpenFlashcards,
  isAdmin = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [editionFilter, setEditionFilter] = useState<'all' | 'epaper' | 'free'>('all');

  const visibleDigests = digests.filter(
    (d) => paperFilter === null || d.paper === paperFilter
  );

  const paperCounts: Partial<Record<PaperId, number>> = {};
  digests.forEach((d) => {
    const total = d.sections.reduce((acc, s) => acc + s.items.length, 0);
    paperCounts[d.paper] = (paperCounts[d.paper] || 0) + total;
  });

  // Flatten all items
  const allItems: SavedItem[] = visibleDigests.flatMap((d) =>
    d.sections.flatMap((s) =>
      s.items.map((item) => ({
        id: `${d.date}|${d.paper}|${item.headline}|${d.sourceType || ''}`,
        date: d.date,
        paper: d.paper,
        category: s.category,
        item,
        sourceType: d.sourceType || (d.pageCount > 0 ? 'supabase' : 'rss'),
      }))
    )
  );

  const epaperCount = allItems.filter((i) => i.sourceType === 'supabase').length;
  const freeCount = allItems.filter((i) => i.sourceType === 'rss').length;

  const primarySource: 'supabase' | 'rss' =
    visibleDigests[0]?.sourceType ||
    (visibleDigests.some((d) => d.pageCount > 0) ? 'supabase' : 'rss');

  // 1. Filter by edition: All vs E-Paper vs Free
  const filteredByEdition = allItems.filter((i) => {
    if (editionFilter === 'epaper') return i.sourceType === 'supabase';
    if (editionFilter === 'free') return i.sourceType === 'rss';
    return true;
  });

  // 2. Filter by High relevance
  const filteredByHigh = highOnly
    ? filteredByEdition.filter((i) => i.item.bcsRelevance === 'high')
    : filteredByEdition;

  // Category counts based on edition
  const counts: Record<string, number> = {};
  filteredByEdition.forEach((i) => {
    counts[i.category] = (counts[i.category] || 0) + 1;
  });

  // 3. Filter by category
  const filteredByCategory = selectedCategory
    ? filteredByHigh.filter((i) => i.category === selectedCategory)
    : filteredByHigh;

  // 4. Search filter across headlines, bullets, facts, excerpts
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const displayItems = trimmedSearch
    ? filteredByCategory.filter((i) => {
        const hay = [
          i.item.headline,
          ...(i.item.bullets || []),
          ...(i.item.keyFacts || []),
          i.item.excerpt || '',
          i.item.sourceHeadline || '',
          i.category,
        ]
          .join(' ')
          .toLowerCase();
        return hay.includes(trimmedSearch);
      })
    : filteredByCategory;

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
    <div className="pb-28">
      {/* Run status warning banner if any */}
      {runStatus
        .filter((s) => s.state !== 'ok')
        .map((s, idx) => (
          <div
            key={idx}
            className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-start gap-3 text-xs"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold">{PAPERS[s.paper]?.name}: {s.state}</div>
              <p className="opacity-90 mt-0.5">{s.message}</p>
            </div>
          </div>
        ))}

      {/* Main Dual Grid: Feed on left (7 cols on desktop), StudyInspector on right (5 cols) */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        {/* Left Column: Feed */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Run Digest Now Action Banner (Admin Only) */}
          {isAdmin && (
            <div className="bg-[var(--bg-surface)] rounded-2xl p-4 sm:p-5 shadow-xs border border-[var(--border-subtle)] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                  <Sparkles className="w-4 h-4 text-[#007aff]" />
                  <span>Morning Papers Live (Admin Console)</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] max-w-lg leading-relaxed">
                  Compile fresh examination summaries immediately from today's live online editions.
                </p>
              </div>

              <button
                onClick={onRunDigestNow}
                disabled={isCompiling}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-[#007aff] text-white text-xs font-semibold hover:bg-[#0062cc] disabled:opacity-50 transition-all shadow-xs flex items-center gap-2"
              >
                <span className={`inline-block ${isCompiling ? 'animate-spin' : ''}`}>
                  ⟳
                </span>
                <span>{isCompiling ? 'Compiling…' : 'Run digest now'}</span>
              </button>
            </div>
          )}

          {/* Practice MCQs Callout */}
          {totalMcqCount > 0 && (
            <button
              onClick={onNavigateToPractice}
              className="w-full bg-[var(--bg-surface)] rounded-2xl p-4 shadow-xs border border-[var(--border-subtle)] flex items-center justify-between text-left hover:border-[#007aff]/30 transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#007aff] to-[#5856d6] flex items-center justify-center text-white font-bold shadow-xs">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[#007aff] transition-colors">
                    Practice {totalMcqCount} Exam MCQs
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Directly formulated from today's news for preliminary preparation
                  </div>
                </div>
              </div>
              <div className="p-2 rounded-xl text-[var(--text-muted)] group-hover:text-[#007aff] group-hover:translate-x-1 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          )}

          {/* Sticky Filters: Segmented Paper + Carousel Chips */}
          <div className="sticky top-[58px] z-20 bg-[var(--bg-canvas)]/95 backdrop-blur-md pt-1 pb-2 space-y-2">
            {/* Top Filter Bar: Edition Switcher + Search Icon Button */}
            <div className="flex items-center justify-between gap-2 px-0.5">
              {/* Edition Pills: All | E-Paper | Free */}
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-0.5 rounded-xl text-xs font-semibold select-none border border-black/5 dark:border-white/5">
                <button
                  onClick={() => setEditionFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all text-xs font-semibold ${
                    editionFilter === 'all'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  All ({allItems.length})
                </button>
                <button
                  onClick={() => setEditionFilter('epaper')}
                  className={`px-2.5 py-1 rounded-lg transition-all text-xs font-semibold flex items-center gap-1 ${
                    editionFilter === 'epaper'
                      ? 'bg-[var(--bg-surface)] text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Printed broadsheet edition"
                >
                  <Newspaper className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>E-Paper</span>
                  <span className="text-[10px] opacity-75">({epaperCount})</span>
                </button>
                <button
                  onClick={() => setEditionFilter('free')}
                  className={`px-2.5 py-1 rounded-lg transition-all text-xs font-semibold flex items-center gap-1 ${
                    editionFilter === 'free'
                      ? 'bg-[var(--bg-surface)] text-sky-700 dark:text-sky-300 shadow-2xs font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Free live website articles"
                >
                  <Globe className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  <span>Free</span>
                  <span className="text-[10px] opacity-75">({freeCount})</span>
                </button>
              </div>

              {/* Search Toggle Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                  isSearchOpen || searchQuery
                    ? 'bg-[#007aff] text-white border-[#007aff] shadow-xs'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                }`}
                title="Search today's headlines & facts"
                aria-label="Search stories"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {/* Expandable Instant Search Bar */}
            {(isSearchOpen || searchQuery) && (
              <div className="relative pt-0.5">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search today's headlines, keywords, budget, exam facts..."
                  autoFocus
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--bg-surface)] border border-[#007aff]/50 text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 font-bangla shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Search query active banner */}
            {trimmedSearch && (
              <div className="flex items-center justify-between text-xs px-1 text-[var(--text-secondary)]">
                <span>
                  Showing <b>{displayItems.length}</b> result{displayItems.length === 1 ? '' : 's'} for "{searchQuery}"
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#007aff] font-semibold hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Paper Selection Pills (Scrollable with National & Global badges) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-semibold select-none">
                <button
                  onClick={() => onPaperFilterChange(null)}
                  className={`px-3 py-1.5 rounded-xl transition-all text-center shrink-0 flex items-center gap-1.5 ${
                    paperFilter === null
                      ? 'bg-[var(--text-primary)] text-[var(--bg-surface)] shadow-2xs font-bold'
                      : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-black/5 dark:border-white/5'
                  }`}
                >
                  <span>All Outlets</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    paperFilter === null ? 'bg-white/20 dark:bg-black/20' : 'bg-black/5 dark:bg-white/10'
                  }`}>
                    {allItems.length}
                  </span>
                </button>

                {(Object.keys(PAPERS) as PaperId[]).map((pid) => {
                  const info = PAPERS[pid];
                  const count = paperCounts[pid] || 0;
                  const isSelected = paperFilter === pid;
                  if (count === 0 && !isSelected) return null;

                  return (
                    <button
                      key={pid}
                      onClick={() => onPaperFilterChange(isSelected ? null : pid)}
                      className={`px-3 py-1.5 rounded-xl transition-all text-center flex items-center gap-1.5 shrink-0 border ${
                        isSelected
                          ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs font-bold border-[#007aff]'
                          : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-transparent'
                      }`}
                    >
                      <PaperBadge paper={pid} size="sm" />
                      <span>{info.shortName}</span>
                      {count > 0 && (
                        <span className="text-[10px] opacity-75 font-mono">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Horizontal Chips Carousel */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
              <button
                onClick={onHighOnlyToggle}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  highOnly
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-black/5'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${highOnly ? 'fill-current' : 'text-amber-500'}`} />
                <span>High</span>
              </button>

              <div className="w-px h-5 bg-[var(--border-subtle)] shrink-0 mx-0.5" />

              <button
                onClick={() => onCategoryChange(null)}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === null
                    ? 'bg-[#007aff] text-white shadow-xs'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-black/5'
                }`}
              >
                <span>All</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === null ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10'
                }`}>
                  {allItems.length}
                </span>
              </button>

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
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-black/5'
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

          {/* Stories List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-[var(--bg-surface)] rounded-2xl p-6 border border-[var(--border-subtle)] animate-pulse space-y-3"
                >
                  <div className="w-24 h-4 bg-black/10 dark:bg-white/10 rounded" />
                  <div className="w-3/4 h-6 bg-black/10 dark:bg-white/10 rounded" />
                  <div className="space-y-2 pt-2">
                    <div className="w-full h-3 bg-black/10 dark:bg-white/10 rounded" />
                    <div className="w-5/6 h-3 bg-black/10 dark:bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayItems.length === 0 ? (
            <div className="bg-[var(--bg-surface)] rounded-2xl p-10 text-center border border-[var(--border-subtle)] space-y-3">
              <div className="text-3xl">📰</div>
              <h4 className="font-bold text-[var(--text-primary)] text-sm">
                {trimmedSearch
                  ? `No stories found matching "${searchQuery}"`
                  : editionFilter === 'free' && freeCount === 0
                  ? 'No Free Web Feed for this Archive Date'
                  : 'No articles match these filters'}
              </h4>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">
                {trimmedSearch
                  ? 'Try searching for different keywords or check spelling.'
                  : editionFilter === 'free' && freeCount === 0
                  ? 'On historical archive dates, the printed morning broadsheet (E-Paper) was archived into the database. Free website news feeds only deliver live articles for today.'
                  : 'Try switching the paper or edition filter to reveal more stories.'}
              </p>
              {editionFilter === 'free' && freeCount === 0 && epaperCount > 0 ? (
                <button
                  onClick={() => setEditionFilter('epaper')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>View E-Paper Edition ({epaperCount} stories)</span>
                </button>
              ) : trimmedSearch ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#007aff] text-white text-xs font-semibold hover:bg-[#0062cc] transition-colors inline-block"
                >
                  Clear search
                </button>
              ) : null}
            </div>
          ) : selectedCategory ? (
            <div className="space-y-3">
              {displayItems.map((item) => (
                <ItemCard
                  key={item.id}
                  saved={item}
                  viewMode={viewMode}
                  isBookmarked={bookmarks.some((b) => b.id === item.id)}
                  onToggleBookmark={onToggleBookmark}
                  onOpenPage={onOpenPage}
                  onOpenInAppChat={onOpenInAppChat}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map((group) => (
                <div key={group.category} className="space-y-3">
                  <div className="flex items-center gap-2 pt-2 text-[var(--text-primary)] font-bold text-base">
                    {getCategoryIcon(group.category)}
                    <span>{group.category}</span>
                    <span className="text-xs font-normal text-[var(--text-muted)]">
                      ({group.items.length})
                    </span>
                  </div>

                  <div className="space-y-3">
                    {group.items.map((item) => (
                      <ItemCard
                        key={item.id}
                        saved={item}
                        viewMode={viewMode}
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

        {/* Right Column: Desktop Study Inspector Sidebar */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
          <StudyInspector
            currentDate={currentDate}
            digests={digests}
            onOpenRevisionSheet={onOpenRevisionSheet}
            onOpenFlashcards={onOpenFlashcards}
            onNavigateToPractice={onNavigateToPractice}
          />
        </div>
      </div>
    </div>
  );
};

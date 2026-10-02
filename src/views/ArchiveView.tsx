import React, { useState } from 'react';
import { Search, Bookmark, Calendar, ChevronRight, X } from 'lucide-react';
import { Digest, SavedItem } from '../types';
import { ItemCard } from '../components/ItemCard';
import { PaperBadge } from '../components/PaperBadge';
import { formatDhakaPretty } from '../services/store';

interface ArchiveViewProps {
  allDigests: Digest[];
  bookmarks: SavedItem[];
  onToggleBookmark: (item: SavedItem) => void;
  onSelectDate: (date: string) => void;
  onOpenPage: (paper: string, page: number) => void;
  onOpenInAppChat: (prompt: string, contextTitle: string) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  allDigests,
  bookmarks,
  onToggleBookmark,
  onSelectDate,
  onOpenPage,
  onOpenInAppChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<'days' | 'saved'>('days');

  // Flatten all items from all available digests
  const allItems: SavedItem[] = allDigests.flatMap((d) =>
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

  // Search filtering
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const searchResults = trimmedSearch
    ? allItems.filter((i) => {
        const hay = [
          i.item.headline,
          ...(i.item.bullets || []),
          ...(i.item.keyFacts || []),
          i.item.excerpt || '',
        ]
          .join(' ')
          .toLowerCase();
        return hay.includes(trimmedSearch);
      })
    : [];

  // Group unique dates by month
  const uniqueDates = Array.from(new Set(allDigests.map((d) => d.date))).sort(
    (a, b) => b.localeCompare(a)
  );

  const monthGroups: { month: string; dates: string[] }[] = [];
  const monthMap = new Map<string, string[]>();

  uniqueDates.forEach((dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const month = d.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    if (!monthMap.has(month)) {
      monthMap.set(month, []);
      monthGroups.push({ month, dates: monthMap.get(month)! });
    }
    monthMap.get(month)!.push(dateStr);
  });

  return (
    <div className="space-y-4 pb-28 max-w-3xl mx-auto">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search: Padma, ASEAN, GDP, budget, নির্বাচন, আইসিজে…"
          className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#007aff]/50 font-bangla shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* When searching, show search results */}
      {searchQuery.trim() ? (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-[var(--text-muted)] px-1">
            Found {searchResults.length} matching stories
          </div>
          {searchResults.length === 0 ? (
            <div className="bg-[var(--bg-surface)] rounded-2xl p-10 text-center border border-[var(--border-subtle)] space-y-2">
              <Search className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2" />
              <div className="text-sm font-bold text-[var(--text-primary)]">
                No matches for “{searchQuery}”
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Try searching for other keywords, figures, or names.
              </p>
            </div>
          ) : (
            searchResults.map((item) => (
              <ItemCard
                key={item.id}
                saved={item}
                showDate={true}
                isBookmarked={bookmarks.some((b) => b.id === item.id)}
                onToggleBookmark={onToggleBookmark}
                onOpenPage={onOpenPage}
                onOpenInAppChat={onOpenInAppChat}
              />
            ))
          )}
        </div>
      ) : (
        <>
          {/* Segmented control: Days vs Saved */}
          <div className="bg-black/5 dark:bg-white/5 p-1 rounded-xl flex text-xs font-semibold select-none border border-black/5 dark:border-white/5">
            <button
              onClick={() => setMode('days')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                mode === 'days'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Days</span>
            </button>
            <button
              onClick={() => setMode('saved')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                mode === 'saved'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({bookmarks.length})</span>
            </button>
          </div>

          {/* Days Mode: Grouped by month */}
          {mode === 'days' ? (
            <div className="space-y-6">
              {monthGroups.map((group) => (
                <div key={group.month} className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
                    {group.month}
                  </h3>
                  <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] overflow-hidden shadow-xs">
                    {group.dates.map((dateStr) => {
                      const d = new Date(dateStr + 'T00:00:00');
                      const dayNumber = d.getDate();
                      const weekday = d.toLocaleDateString('en-US', {
                        weekday: 'short',
                      });
                      const dayDigests = allDigests.filter((x) => x.date === dateStr);

                      return (
                        <button
                          key={dateStr}
                          onClick={() => onSelectDate(dateStr)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 text-center shrink-0">
                              <div className="text-lg font-bold text-[var(--text-primary)] leading-none">
                                {dayNumber}
                              </div>
                              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight mt-0.5">
                                {weekday}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#007aff] transition-colors">
                                {formatDhakaPretty(dateStr)}
                              </div>
                              <div className="flex items-center gap-2">
                                {dayDigests.map((dig) => {
                                  const count = dig.sections.reduce(
                                    (sum, s) => sum + s.items.length,
                                    0
                                  );
                                  return (
                                    <div
                                      key={dig.paper}
                                      className="flex items-center gap-1 text-xs text-[var(--text-muted)]"
                                    >
                                      <PaperBadge paper={dig.paper} size="sm" />
                                      <span className="text-[11px]">{count}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#007aff] transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Saved Mode: list of bookmarked stories
            <div className="space-y-3">
              {bookmarks.length === 0 ? (
                <div className="bg-[var(--bg-surface)] rounded-2xl p-10 text-center border border-[var(--border-subtle)] space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#007aff]/10 text-[#007aff] flex items-center justify-center mx-auto mb-2">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">
                    No saved stories yet
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                    Click the bookmark button on any story to save it here for revision before exams.
                  </p>
                </div>
              ) : (
                bookmarks.map((saved) => (
                  <ItemCard
                    key={saved.id}
                    saved={saved}
                    showDate={true}
                    isBookmarked={true}
                    onToggleBookmark={onToggleBookmark}
                    onOpenPage={onOpenPage}
                    onOpenInAppChat={onOpenInAppChat}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { PaperId, PAPERS } from '../types';
import { PaperBadge } from '../components/PaperBadge';
import { AskAIMenu } from '../components/AskAIMenu';
import { ListenPill } from '../components/ListenPill';

interface StoryRaw {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  content?: string;
  category?: string;
  image?: string;
}

interface PapersViewProps {
  onOpenInAppChat: (prompt: string, contextTitle: string) => void;
  initialPaper?: PaperId | null;
}

export const PapersView: React.FC<PapersViewProps> = ({
  onOpenInAppChat,
  initialPaper = null,
}) => {
  const [selectedPaper, setSelectedPaper] = useState<PaperId | null>(initialPaper);
  const [activePage, setActivePage] = useState<number>(1);
  const [stories, setStories] = useState<StoryRaw[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedStory, setExpandedStory] = useState<number | null>(null);

  useEffect(() => {
    if (initialPaper) {
      setSelectedPaper(initialPaper);
    }
  }, [initialPaper]);

  useEffect(() => {
    if (selectedPaper) {
      loadLiveStories(selectedPaper);
    }
  }, [selectedPaper]);

  const loadLiveStories = async (paper: PaperId) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/feed/${paper}`);
      if (res.ok) {
        const data = await res.json();
        setStories(data);
      }
    } catch (e) {
      console.error('Failed to load feed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter stories by page approximation (2-3 stories per page)
  const storiesForPage = stories.slice((activePage - 1) * 2, activePage * 2 + 1);

  if (!selectedPaper) {
    // Top-level papers selection view
    return (
      <div className="space-y-4 pb-24">
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 sm:p-5 border border-black/5 dark:border-white/5 space-y-1">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            E-Papers & Live News
          </h2>
          <p className="text-xs text-neutral-500">
            Select a newspaper to browse today's edition, listen with Read Aloud, or generate instant BCS summaries.
          </p>
        </div>

        {/* Paper Cards */}
        <div className="space-y-3">
          {(['dailystar', 'prothomalo'] as PaperId[]).map((pid) => {
            const paper = PAPERS[pid];
            return (
              <button
                key={pid}
                onClick={() => setSelectedPaper(pid)}
                className="w-full bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 dark:border-white/5 flex items-center justify-between text-left hover:scale-[1.01] active:scale-[0.99] transition-all group"
              >
                <div className="flex items-center gap-4">
                  {/* Monogram Box */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md font-bangla shrink-0"
                    style={{ backgroundColor: paper.color }}
                  >
                    {paper.monogram}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 group-hover:text-[#007aff] transition-colors">
                      {paper.name}
                    </h3>
                    <p className="text-xs text-neutral-500 font-bangla">
                      Today's Live Edition & E-Paper Reader
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-[#007aff] transition-colors" />
              </button>
            );
          })}
        </div>

        {/* Note */}
        <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/50 text-xs text-neutral-500 space-y-1">
          <div className="font-semibold text-neutral-700 dark:text-neutral-300">
            Tip for Study Preparation:
          </div>
          <p>
            Tap "Ask" inside any page or story to get an instant BCS summary with key facts, or open it directly in ChatGPT, Gemini, or Claude with exam prompts already prepared.
          </p>
        </div>
      </div>
    );
  }

  const paperInfo = PAPERS[selectedPaper];

  return (
    <div className="space-y-4 pb-28 relative">
      {/* Top Bar inside reader */}
      <div className="flex items-center justify-between bg-white dark:bg-[#1c1c1e] p-3 rounded-2xl border border-black/5 dark:border-white/5">
        <button
          onClick={() => setSelectedPaper(null)}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Papers</span>
        </button>

        <div className="flex items-center gap-2">
          <PaperBadge paper={selectedPaper} size="sm" />
          <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
            {paperInfo.shortName}
          </span>
        </div>

        <a
          href={paperInfo.epaperUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-semibold text-[#007aff] hover:opacity-80"
          title="Open official e-paper site"
        >
          <span>E-Paper</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Page Navigation Strip */}
      <div className="bg-white dark:bg-[#1c1c1e] p-2 rounded-2xl border border-black/5 dark:border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((pageNo) => (
          <button
            key={pageNo}
            onClick={() => setActivePage(pageNo)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              activePage === pageNo
                ? 'text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activePage === pageNo ? paperInfo.color : undefined,
            }}
          >
            Page {pageNo}
          </button>
        ))}
      </div>

      {/* Stories on this page */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-5 border border-black/5 dark:border-white/5 animate-pulse space-y-3"
            >
              <div className="w-3/4 h-5 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="w-full h-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
          ))}
        </div>
      ) : storiesForPage.length === 0 ? (
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center border border-black/5 dark:border-white/5 space-y-2">
          <BookOpen className="w-8 h-8 text-neutral-400 mx-auto" />
          <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
            No articles loaded for Page {activePage}
          </h4>
          <button
            onClick={() => loadLiveStories(selectedPaper)}
            className="px-3 py-1.5 rounded-xl bg-[#007aff] text-white text-xs font-semibold inline-flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh Feed
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {storiesForPage.map((story, idx) => {
            const isExpanded = expandedStory === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 dark:border-white/5 space-y-3"
              >
                {/* Image if available */}
                {story.image && (
                  <div className="rounded-xl overflow-hidden max-h-48 border border-black/5 dark:border-white/5">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{story.category || 'General'}</span>
                    <span>Page {activePage}</span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 font-bangla leading-snug">
                    {story.title}
                  </h3>
                </div>

                <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-bangla leading-relaxed">
                  {isExpanded
                    ? story.content || story.description
                    : story.description}
                </div>

                {story.content && story.content.length > 250 && (
                  <button
                    onClick={() => setExpandedStory(isExpanded ? null : idx)}
                    className="text-xs font-semibold text-[#007aff] hover:underline"
                  >
                    {isExpanded ? 'Show less' : 'Read full text'}
                  </button>
                )}

                {/* Bottom row */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                  <a
                    href={story.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    <span>View original</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <AskAIMenu
                    story={{
                      id: `${story.title}`,
                      date: new Date().toISOString().split('T')[0],
                      paper: selectedPaper,
                      category: 'Bangladesh Affairs',
                      item: {
                        headline: story.title,
                        bullets: [story.description || ''],
                        keyFacts: [],
                        bcsRelevance: 'high',
                        page: activePage,
                        excerpt: story.description,
                      },
                    }}
                    onOpenInAppChat={onOpenInAppChat}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Read Aloud Pill */}
      <ListenPill
        stories={storiesForPage.map((s) => ({
          headline: s.title,
          content: s.description || s.content,
        }))}
        paperName={paperInfo.name}
        tintColor={paperInfo.color}
      />

      {/* Floating Ask Button on Bottom Right */}
      <div className="fixed bottom-20 right-4 z-40">
        <AskAIMenu
          story={{
            id: `page-${activePage}`,
            date: new Date().toISOString().split('T')[0],
            paper: selectedPaper,
            category: 'Bangladesh Affairs',
            item: {
              headline: `Page ${activePage} of ${paperInfo.name}`,
              bullets: storiesForPage.map((s) => s.title),
              keyFacts: [],
              bcsRelevance: 'high',
              page: activePage,
            },
          }}
          onOpenInAppChat={onOpenInAppChat}
          triggerButton={
            <button
              style={{ backgroundColor: paperInfo.color }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white shadow-xl hover:opacity-95 active:scale-95 transition-all text-xs font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask</span>
            </button>
          }
        />
      </div>
    </div>
  );
};

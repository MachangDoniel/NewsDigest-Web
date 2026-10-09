/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Digest,
  PaperId,
  RunStatus,
  SavedItem,
} from './types';
import {
  getTodayDhaka,
  loadSavedBookmarks,
  saveBookmarksToStorage,
  loadSavedAnswers,
  saveAnswersToStorage,
  loadSettings,
  saveSettingsToStorage,
  loadSavedTheme,
  saveThemeToStorage,
  stepDhakaDate,
} from './services/store';

import { Header, ViewMode, ThemeMode } from './components/Header';
import { TabBar } from './components/TabBar';
import { CalendarModal } from './components/CalendarModal';
import { AIChatModal } from './components/AIChatModal';
import { RevisionSheetModal } from './components/RevisionSheetModal';
import { FlashcardsModal } from './components/FlashcardsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { DesktopAudioBar } from './components/DesktopAudioBar';

import { TodayView } from './views/TodayView';
import { PracticeView } from './views/PracticeView';
import { ArchiveView } from './views/ArchiveView';
import { PapersView } from './views/PapersView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [currentDate, setCurrentDate] = useState<string>(getTodayDhaka());
  const [allDigests, setAllDigests] = useState<Digest[]>([]);
  const [paperFilter, setPaperFilter] = useState<PaperId | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [highOnly, setHighOnly] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<SavedItem[]>(loadSavedBookmarks());
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>(loadSavedAnswers());
  const [activeTab, setActiveTab] = useState<
    'today' | 'practice' | 'archive' | 'papers' | 'settings'
  >('today');
  const [runStatus, setRunStatus] = useState<RunStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Web V2 States
  const [viewMode, setViewMode] = useState<ViewMode>('editorial');
  const [theme, setTheme] = useState<ThemeMode>(loadSavedTheme());
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isRevisionSheetOpen, setIsRevisionSheetOpen] = useState<boolean>(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    saveThemeToStorage(newTheme);
  };

  // In-app AI chat modal state
  const [chatModal, setChatModal] = useState<{
    isOpen: boolean;
    prompt: string;
    contextTitle: string;
  }>({
    isOpen: false,
    prompt: '',
    contextTitle: '',
  });

  // Settings
  const initialSettings = loadSettings();
  const [aiModel] = useState<string>(initialSettings.aiModel);
  const [summaryLanguage, setSummaryLanguage] = useState<string>(
    initialSettings.summaryLanguage
  );
  const [speechVoice, setSpeechVoice] = useState<string>(
    initialSettings.speechVoice
  );

  // Jump to specific paper & page in Papers view
  const [targetPaper, setTargetPaper] = useState<PaperId | null>(null);
  const [targetPage, setTargetPage] = useState<number>(1);

  // Sync theme attribute to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Fetch digests from server
  const fetchDigests = useCallback(async (dateTarget?: string) => {
    setIsLoading(true);
    try {
      const url = dateTarget ? `/api/digests?date=${dateTarget}` : '/api/digests';
      const res = await fetch(url);
      if (res.ok) {
        const data: Digest[] = await res.json();
        setAllDigests((prev) => {
          const map = new Map<number, Digest>();
          prev.forEach((d) => map.set(d.id, d));
          data.forEach((d) => map.set(d.id, d));
          return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
        });
      }
    } catch (err) {
      console.error('Failed to load digests:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch status
  const fetchStatus = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/status?date=${date}`);
      if (res.ok) {
        const statusData: RunStatus[] = await res.json();
        setRunStatus(statusData);
      }
    } catch (err) {
      console.error('Failed to load status:', err);
    }
  }, []);

  useEffect(() => {
    fetchDigests();
    fetchStatus(currentDate);
  }, [fetchDigests, fetchStatus, currentDate]);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (document.activeElement?.tagName || '')
        )
      ) {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsCalendarOpen(false);
        setIsRevisionSheetOpen(false);
        setIsFlashcardsOpen(false);
        setIsShortcutsOpen(false);
        setChatModal((prev) => ({ ...prev, isOpen: false }));
      } else if (e.key === '[' || e.key === 'h') {
        setCurrentDate((d) => stepDhakaDate(d, -1));
      } else if (e.key === ']' || e.key === 'l') {
        setCurrentDate((d) => stepDhakaDate(d, 1));
      } else if (e.key === 'm' || e.key === 'M') {
        setActiveTab('practice');
      } else if (e.key === 's' || e.key === 'S') {
        setIsRevisionSheetOpen(true);
      } else if (e.key === 't' || e.key === 'T' || e.key === 'd' || e.key === 'D') {
        setTheme((prev) => {
          const next = prev === 'dark' ? 'light' : 'dark';
          saveThemeToStorage(next);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Bookmarking
  const handleToggleBookmark = (item: SavedItem) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === item.id);
      const next = exists ? prev.filter((b) => b.id !== item.id) : [item, ...prev];
      saveBookmarksToStorage(next);
      return next;
    });
  };

  // MCQ Answering
  const handleAnswerQuestion = (questionId: string, option: string) => {
    setMcqAnswers((prev) => {
      const next = { ...prev, [questionId]: option };
      saveAnswersToStorage(next);
      return next;
    });
  };

  const handleResetAnswers = () => {
    setMcqAnswers({});
    saveAnswersToStorage({});
  };

  // Open specific page from ItemCard
  const handleOpenPage = (paperIdStr: string, pageNo: number) => {
    const pid = paperIdStr as PaperId;
    setTargetPaper(pid);
    setTargetPage(pageNo || 1);
    setActiveTab('papers');
  };

  // Open In-App AI Chat
  const handleOpenInAppChat = (prompt: string, contextTitle: string) => {
    setChatModal({
      isOpen: true,
      prompt,
      contextTitle,
    });
  };

  // Active digests for current date
  const dateDigests = allDigests.filter((d) => d.date === currentDate);
  const totalMcqCountForCurrentDate = dateDigests.reduce(
    (sum, d) => sum + d.mcqs.length,
    0
  );

  // Flatten stories for audio bar
  const storiesForAudio = dateDigests.flatMap((d) =>
    d.sections.flatMap((s) =>
      s.items.map((i) => ({
        headline: i.headline,
        bullets: i.bullets,
        content: i.excerpt,
        paper: d.paper,
      }))
    )
  );

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col antialiased selection:bg-[#007aff]/20 transition-colors duration-200">
      {/* Top Header (3-Zone Contract with Desktop & Mobile controls) */}
      <Header
        currentDate={currentDate}
        onDateChange={(d) => setCurrentDate(d)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'papers') setTargetPaper(null);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        theme={theme}
        onThemeChange={handleThemeChange}
        onOpenRevisionSheet={() => setIsRevisionSheetOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        mcqCount={totalMcqCountForCurrentDate}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        {activeTab === 'today' && (
          <TodayView
            currentDate={currentDate}
            digests={dateDigests}
            runStatus={runStatus}
            paperFilter={paperFilter}
            onPaperFilterChange={setPaperFilter}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            highOnly={highOnly}
            onHighOnlyToggle={() => setHighOnly(!highOnly)}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onOpenPage={handleOpenPage}
            onOpenInAppChat={handleOpenInAppChat}
            onNavigateToPractice={() => setActiveTab('practice')}
            isLoading={isLoading && dateDigests.length === 0}
            viewMode={viewMode}
            onOpenRevisionSheet={() => setIsRevisionSheetOpen(true)}
            onOpenFlashcards={() => setIsFlashcardsOpen(true)}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeView
            currentDate={currentDate}
            digests={dateDigests}
            answers={mcqAnswers}
            onAnswerQuestion={handleAnswerQuestion}
            onResetAnswers={handleResetAnswers}
            onOpenInAppChat={handleOpenInAppChat}
            onOpenFlashcards={() => setIsFlashcardsOpen(true)}
          />
        )}

        {activeTab === 'archive' && (
          <ArchiveView
            allDigests={allDigests}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onSelectDate={(d) => {
              setCurrentDate(d);
              setActiveTab('today');
            }}
            onOpenPage={handleOpenPage}
            onOpenInAppChat={handleOpenInAppChat}
          />
        )}

        {activeTab === 'papers' && (
          <PapersView
            initialPaper={targetPaper}
            initialPage={targetPage}
            onOpenInAppChat={handleOpenInAppChat}
          />
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <SettingsView
              theme={theme}
              onThemeChange={handleThemeChange}
              summaryLanguage={summaryLanguage}
              onSummaryLanguageChange={(l) => {
                setSummaryLanguage(l);
                saveSettingsToStorage({ aiModel, summaryLanguage: l, speechVoice, speechRate: 1.0 });
              }}
              speechVoice={speechVoice}
              onSpeechVoiceChange={(v) => {
                setSpeechVoice(v);
                saveSettingsToStorage({ aiModel, summaryLanguage, speechVoice: v, speechRate: 1.0 });
              }}
            />
          </div>
        )}
      </main>

      {/* Calendar Jump Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        currentDate={currentDate}
        onSelectDate={(newDate) => setCurrentDate(newDate)}
        availableDates={Array.from(new Set(allDigests.map((d) => d.date)))}
      />

      {/* Daily BCS Revision Broadsheet Modal */}
      <RevisionSheetModal
        isOpen={isRevisionSheetOpen}
        onClose={() => setIsRevisionSheetOpen(false)}
        date={currentDate}
        digests={dateDigests}
      />

      {/* Interactive Key Facts Flashcards Modal */}
      <FlashcardsModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
        digests={dateDigests}
      />

      {/* Keyboard Shortcuts Cheat Sheet */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* In-app AI Tutor Chat Modal */}
      <AIChatModal
        isOpen={chatModal.isOpen}
        onClose={() => setChatModal((prev) => ({ ...prev, isOpen: false }))}
        initialPrompt={chatModal.prompt}
        contextTitle={chatModal.contextTitle}
      />

      {/* Desktop Sticky Audio Player Bar */}
      <DesktopAudioBar
        stories={storiesForAudio}
        currentDate={currentDate}
      />

      {/* Mobile Bottom Tab Bar (hidden on lg viewports to give pure desktop feel) */}
      <div className="md:hidden">
        <TabBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== 'papers') setTargetPaper(null);
          }}
          mcqCount={totalMcqCountForCurrentDate}
        />
      </div>
    </div>
  );
}

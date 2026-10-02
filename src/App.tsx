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
} from './services/store';

import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { CalendarModal } from './components/CalendarModal';
import { AIChatModal } from './components/AIChatModal';

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
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

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
  const [aiModel, setAiModel] = useState<string>(initialSettings.aiModel);
  const [summaryLanguage, setSummaryLanguage] = useState<string>(
    initialSettings.summaryLanguage
  );
  const [speechVoice, setSpeechVoice] = useState<string>(
    initialSettings.speechVoice
  );

  // Jump to specific paper in Papers view
  const [targetPaper, setTargetPaper] = useState<PaperId | null>(null);

  // Fetch digests from server
  const fetchDigests = useCallback(async (dateTarget?: string) => {
    setIsLoading(true);
    try {
      const url = dateTarget ? `/api/digests?date=${dateTarget}` : '/api/digests';
      const res = await fetch(url);
      if (res.ok) {
        const data: Digest[] = await res.json();
        setAllDigests((prev) => {
          // Merge unique by id
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

  // Run digest now
  const handleRunDigestNow = async () => {
    setIsCompiling(true);
    try {
      const res = await fetch('/api/run-digest', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        await fetchDigests();
        await fetchStatus(currentDate);
      }
    } catch (err) {
      console.error('Run digest error:', err);
    } finally {
      setIsCompiling(false);
    }
  };

  // Open specific page from ItemCard
  const handleOpenPage = (paperIdStr: string, pageNo: number) => {
    const pid = paperIdStr as PaperId;
    setTargetPaper(pid);
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

  // Available digests for current date
  const dateDigests = allDigests.filter((d) => d.date === currentDate);
  const totalMcqCountForCurrentDate = dateDigests.reduce(
    (sum, d) => sum + d.mcqs.length,
    0
  );

  return (
    <div className="min-h-screen bg-[#f2f2f7] dark:bg-[#000000] text-neutral-900 dark:text-neutral-100 flex flex-col antialiased selection:bg-[#007aff]/20">
      {/* Top Header */}
      <Header
        currentDate={currentDate}
        onDateChange={(d) => setCurrentDate(d)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        activeTab={activeTab}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 pt-3">
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
            onRunDigestNow={handleRunDigestNow}
            isCompiling={isCompiling}
            isLoading={isLoading && dateDigests.length === 0}
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
            onOpenInAppChat={handleOpenInAppChat}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            aiModel={aiModel}
            onAiModelChange={(m) => {
              setAiModel(m);
              saveSettingsToStorage({ aiModel: m, summaryLanguage, speechVoice, speechRate: 1.0 });
            }}
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
            onRunDigestNow={handleRunDigestNow}
            isCompiling={isCompiling}
          />
        )}
      </main>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        currentDate={currentDate}
        onSelectDate={(newDate) => setCurrentDate(newDate)}
        availableDates={Array.from(new Set(allDigests.map((d) => d.date)))}
      />

      {/* In-app AI Tutor Chat Modal */}
      <AIChatModal
        isOpen={chatModal.isOpen}
        onClose={() => setChatModal((prev) => ({ ...prev, isOpen: false }))}
        initialPrompt={chatModal.prompt}
        contextTitle={chatModal.contextTitle}
      />

      {/* iOS Bottom Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'papers') setTargetPaper(null);
        }}
        mcqCount={totalMcqCountForCurrentDate}
      />
    </div>
  );
}

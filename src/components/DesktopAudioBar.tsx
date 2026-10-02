import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  X,
  Volume2,
  Headphones,
} from 'lucide-react';
import { PaperBadge } from './PaperBadge';
import { PaperId } from '../types';

interface DesktopAudioBarProps {
  stories: { headline: string; bullets?: string[]; content?: string; paper?: PaperId }[];
  currentDate: string;
}

export const DesktopAudioBar: React.FC<DesktopAudioBarProps> = ({
  stories,
  currentDate,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rate, setRate] = useState(1.0);
  const [isDismissed, setIsDismissed] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const getStoryText = (index: number): string => {
    if (!stories || stories.length === 0 || index >= stories.length) return '';
    const story = stories[index];
    return [story.headline, ...(story.bullets || []), story.content || '']
      .filter(Boolean)
      .join('. ');
  };

  const playStory = (index: number) => {
    if (!synthRef.current || stories.length === 0) return;
    synthRef.current.cancel();

    if (index >= stories.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex(index);
    const text = getStoryText(index);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;

    const isBangla = /[\u0980-\u09FF]/.test(text);
    const voices = synthRef.current.getVoices();
    if (isBangla) {
      const bnVoice = voices.find((v) => v.lang.startsWith('bn'));
      if (bnVoice) utterance.voice = bnVoice;
    } else {
      const enVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha'))
      );
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onend = () => {
      if (index + 1 < stories.length) {
        playStory(index + 1);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentIndex(0);
      }
    };

    synthRef.current.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
    setIsDismissed(false);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (synthRef.current) synthRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
    } else if (isPaused) {
      if (synthRef.current) synthRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      playStory(currentIndex);
    }
  };

  const handleStop = () => {
    if (synthRef.current) synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIndex(0);
    setIsDismissed(true);
  };

  const cycleRate = () => {
    const nextRate = rate === 1.0 ? 1.25 : rate === 1.25 ? 1.5 : rate === 1.5 ? 0.75 : 1.0;
    setRate(nextRate);
    if (isPlaying) {
      playStory(currentIndex);
    }
  };

  if (stories.length === 0 || isDismissed) return null;

  const currentStory = stories[currentIndex];

  return (
    <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-xl border-t border-[var(--border-subtle)] shadow-2xl py-2.5 px-6 animate-in slide-in-from-bottom duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Story Info */}
        <div className="flex items-center gap-3 min-w-0 max-w-md">
          {currentStory?.paper ? (
            <PaperBadge paper={currentStory.paper} size="sm" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-[#007aff]/10 text-[#007aff] flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
          )}

          <div className="truncate">
            <div className="text-xs font-bold text-[var(--text-primary)] truncate font-bangla">
              {currentStory?.headline || 'Daily News Briefing'}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-2">
              <span>Story {currentIndex + 1} of {stories.length}</span>
              <span>·</span>
              <span>{isPlaying ? 'Playing audio' : isPaused ? 'Paused' : 'Ready'}</span>
            </div>
          </div>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => playStory(Math.max(currentIndex - 1, 0))}
            disabled={currentIndex === 0}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] disabled:opacity-30 transition-colors"
            title="Previous story"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            className="w-10 h-10 rounded-full bg-[#007aff] text-white flex items-center justify-center shadow-md hover:bg-[#0062cc] active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => playStory(Math.min(currentIndex + 1, stories.length - 1))}
            disabled={currentIndex >= stories.length - 1}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] disabled:opacity-30 transition-colors"
            title="Next story"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right Settings */}
        <div className="flex items-center gap-3">
          <button
            onClick={cycleRate}
            className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 font-bold text-xs text-[var(--text-primary)] hover:bg-black/10 transition-colors"
            title="Change reading speed"
          >
            {rate}x speed
          </button>

          <button
            onClick={handleStop}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            title="Dismiss player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  X,
  Volume2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface ListenPillProps {
  stories: { headline: string; bullets?: string[]; content?: string }[];
  paperName: string;
  tintColor?: string;
}

export const ListenPill: React.FC<ListenPillProps> = ({
  stories,
  paperName,
  tintColor = '#007aff',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rate, setRate] = useState(1.0);
  const [speechSupported, setSpeechSupported] = useState(true);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      setSpeechSupported(false);
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
    const text = [
      story.headline,
      ...(story.bullets || []),
      story.content || '',
    ]
      .filter(Boolean)
      .join('. ');
    return text;
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
    utteranceRef.current = utterance;
    utterance.rate = rate;

    // Try finding Bangla voice if prothomalo or Bengali text
    const isBangla = /[\u0980-\u09FF]/.test(text);
    const voices = synthRef.current.getVoices();

    if (isBangla) {
      const bnVoice = voices.find((v) => v.lang.startsWith('bn'));
      if (bnVoice) utterance.voice = bnVoice;
    } else {
      const enVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
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

    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    synthRef.current.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleStart = () => {
    if (isPaused && synthRef.current) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      playStory(currentIndex);
    }
  };

  const handlePause = () => {
    if (synthRef.current) {
      synthRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIndex(0);
    setIsExpanded(false);
  };

  const handleNext = () => {
    playStory(Math.min(currentIndex + 1, stories.length - 1));
  };

  const handlePrev = () => {
    playStory(Math.max(currentIndex - 1, 0));
  };

  const cycleRate = () => {
    const nextRate = rate === 1.0 ? 1.25 : rate === 1.25 ? 1.5 : rate === 1.5 ? 0.75 : 1.0;
    setRate(nextRate);
    if (isPlaying) {
      playStory(currentIndex);
    }
  };

  if (!speechSupported || stories.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 z-40 select-none">
      {!isPlaying && !isPaused ? (
        // Closed / Initial Start Pill
        <button
          onClick={() => {
            setIsExpanded(true);
            handleStart();
          }}
          style={{ backgroundColor: tintColor }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white shadow-xl hover:opacity-95 active:scale-95 transition-all text-xs font-semibold"
        >
          <Headphones className="w-4 h-4" />
          <span>Read aloud</span>
        </button>
      ) : isExpanded ? (
        // Expanded Controls Bar
        <div className="bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 p-3 min-w-[280px] max-w-sm animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-black/5 dark:border-white/5 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: tintColor }}
              />
              <span className="truncate">
                {stories[currentIndex]?.headline || `Reading ${paperName}`}
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded"
              title="Fold into pill"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-neutral-500 mb-2 flex items-center justify-between">
            <span>
              Story {currentIndex + 1} of {stories.length}
            </span>
            <button
              onClick={cycleRate}
              className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 font-bold text-neutral-700 dark:text-neutral-300 hover:bg-black/10"
            >
              {rate}x
            </button>
          </div>

          {/* Player controls */}
          <div className="flex items-center justify-between gap-1 text-neutral-700 dark:text-neutral-300">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30"
              title="Previous story"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {isPlaying ? (
              <button
                onClick={handlePause}
                style={{ backgroundColor: tintColor }}
                className="p-3 rounded-full text-white shadow-md active:scale-90 transition-transform"
                title="Pause"
              >
                <Pause className="w-5 h-5 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleStart}
                style={{ backgroundColor: tintColor }}
                className="p-3 rounded-full text-white shadow-md active:scale-90 transition-transform"
                title="Resume"
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={currentIndex >= stories.length - 1}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30"
              title="Next story"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleStop}
              className="p-2 rounded-full hover:bg-rose-500/10 text-rose-500"
              title="Stop"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        // Folded small pill while active
        <button
          onClick={() => setIsExpanded(true)}
          style={{ backgroundColor: tintColor }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full text-white shadow-lg active:scale-95 transition-all text-xs font-semibold animate-pulse"
        >
          <Volume2 className="w-4 h-4" />
          <span>
            {isPlaying ? 'Reading…' : 'Paused'} ({currentIndex + 1}/{stories.length})
          </span>
          <ChevronUp className="w-3.5 h-3.5 opacity-80" />
        </button>
      )}
    </div>
  );
};

import { Digest, DigestItem, Mcq, PaperId, RunStatus, SavedItem } from '../types';

export interface AppState {
  digests: Digest[];
  currentDate: string; // YYYY-MM-DD
  paperFilter: PaperId | null;
  selectedCategory: string | null;
  highOnly: boolean;
  bookmarks: SavedItem[];
  mcqAnswers: Record<string, string>; // questionId -> selectedOption
  statusList: RunStatus[];
  isLoading: boolean;
  isCompiling: boolean;
  activeTab: 'today' | 'practice' | 'archive' | 'papers' | 'settings';
  aiModel: string;
  summaryLanguage: string;
  speechVoice: string;
  speechRate: number;
}

// Dhaka date helpers
export function getTodayDhaka(): string {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDhakaPretty(dateStr: string): string {
  if (!dateStr) return 'Today';
  const today = getTodayDhaka();

  const d = new Date(dateStr + 'T00:00:00');
  const todayDate = new Date(today + 'T00:00:00');
  const diffDays = Math.round((todayDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

export function stepDhakaDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const nextStr = `${yyyy}-${mm}-${dd}`;

  const today = getTodayDhaka();
  if (nextStr > today) return today;
  return nextStr;
}

// Local storage keys
const BOOKMARKS_KEY = 'newsdigest_bookmarks_v1';
const ANSWERS_KEY = 'newsdigest_answers_v1';
const SETTINGS_KEY = 'newsdigest_settings_v1';
const THEME_KEY = 'newsdigest_theme_v2';

export function loadSavedTheme(): 'light' | 'dark' | 'sepia' {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === 'dark' || raw === 'light' || raw === 'sepia') return raw;
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveThemeToStorage(theme: 'light' | 'dark' | 'sepia') {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme:', e);
  }
}

export function loadSavedBookmarks(): SavedItem[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookmarksToStorage(bookmarks: SavedItem[]) {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Failed to save bookmarks:', e);
  }
}

export function loadSavedAnswers(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ANSWERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAnswersToStorage(answers: Record<string, string>) {
  try {
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  } catch (e) {
    console.error('Failed to save answers:', e);
  }
}

export function loadSettings(): {
  aiModel: string;
  summaryLanguage: string;
  speechVoice: string;
  speechRate: number;
} {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw
      ? JSON.parse(raw)
      : {
          aiModel: 'auto',
          summaryLanguage: 'auto',
          speechVoice: 'natural',
          speechRate: 1.0,
        };
  } catch {
    return {
      aiModel: 'auto',
      summaryLanguage: 'auto',
      speechVoice: 'natural',
      speechRate: 1.0,
    };
  }
}

export function saveSettingsToStorage(settings: any) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

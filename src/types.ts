export type PaperId = 'dailystar' | 'prothomalo';

export const CATEGORIES = [
  'Bangladesh Affairs',
  'International Affairs',
  'Economy',
  'Science & Tech',
  'Environment',
  'Sports',
  'Others',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface DigestItem {
  headline: string;
  bullets: string[];
  keyFacts: string[];
  bcsRelevance: 'high' | 'medium';
  page: number;
  pageId?: string;
  sourceHeadline?: string;
  excerpt?: string;
  model?: string;
  source?: 'image' | 'text' | 'paper';
  story?: number;
}

export interface DigestSection {
  category: Category;
  items: DigestItem[];
}

export interface Mcq {
  question: string;
  options: string[];
  answer: string;
  model?: string;
  source?: 'image' | 'text';
}

export interface Digest {
  id: number;
  date: string; // YYYY-MM-DD
  paper: PaperId;
  sections: DigestSection[];
  mcqs: Mcq[];
  pageCount: number;
  sourceType?: 'supabase' | 'rss';
}

export interface RunStatus {
  date: string;
  paper: PaperId;
  state: 'ok' | 'login_expired' | 'challenge' | 'not_published' | 'error';
  message?: string;
  source?: 'supabase' | 'rss';
}

export interface SavedItem {
  id: string;
  date: string;
  paper: PaperId;
  category: Category;
  item: DigestItem;
  sourceType?: 'supabase' | 'rss';
}

export interface PaperInfo {
  id: PaperId;
  name: string;
  shortName: string;
  monogram: string;
  color: string;
  gradient: string;
  website: string;
  epaperUrl: string;
  hosts: string[];
}

export const PAPERS: Record<PaperId, PaperInfo> = {
  dailystar: {
    id: 'dailystar',
    name: 'The Daily Star',
    shortName: 'Daily Star',
    monogram: 'DS',
    color: '#005c9e',
    gradient: 'from-[#005c9e] to-[#003e6b]',
    website: 'https://www.thedailystar.net',
    epaperUrl: 'https://epaper.thedailystar.net',
    hosts: ['thedailystar.net'],
  },
  prothomalo: {
    id: 'prothomalo',
    name: 'Prothom Alo',
    shortName: 'প্রথম আলো',
    monogram: 'প্র',
    color: '#cc1a21',
    gradient: 'from-[#cc1a21] to-[#991116]',
    website: 'https://www.prothomalo.com',
    epaperUrl: 'https://epaper.prothomalo.com',
    hosts: ['prothomalo.com', 'eprothomalo.com'],
  },
};

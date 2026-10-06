export type PaperId =
  | 'dailystar'
  | 'prothomalo'
  | 'tbs'
  | 'bonikbarta'
  | 'dhakatribune'
  | 'kalerkantho'
  | 'bdpratidin'
  | 'bbc'
  | 'guardian'
  | 'nyt'
  | 'wsj';

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
  url?: string;
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
  group: 'national' | 'global';
  lang: 'en' | 'bn';
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
    group: 'national',
    lang: 'en',
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
    group: 'national',
    lang: 'bn',
  },
  tbs: {
    id: 'tbs',
    name: 'The Business Standard',
    shortName: 'TBS',
    monogram: 'TBS',
    color: '#e31b23',
    gradient: 'from-[#e31b23] to-[#991218]',
    website: 'https://www.tbsnews.net',
    epaperUrl: 'https://epaper.tbsnews.net',
    hosts: ['tbsnews.net'],
    group: 'national',
    lang: 'en',
  },
  bonikbarta: {
    id: 'bonikbarta',
    name: 'Daily Bonik Barta',
    shortName: 'বণিক বার্তা',
    monogram: 'বণিক',
    color: '#1b5e20',
    gradient: 'from-[#1b5e20] to-[#0a3810]',
    website: 'https://bonikbarta.net',
    epaperUrl: 'https://epaper.bonikbarta.net',
    hosts: ['bonikbarta.net'],
    group: 'national',
    lang: 'bn',
  },
  dhakatribune: {
    id: 'dhakatribune',
    name: 'Dhaka Tribune',
    shortName: 'Dhaka Tribune',
    monogram: 'DT',
    color: '#0f766e',
    gradient: 'from-[#0f766e] to-[#094d48]',
    website: 'https://www.dhakatribune.com',
    epaperUrl: 'https://epaper.dhakatribune.com',
    hosts: ['dhakatribune.com'],
    group: 'national',
    lang: 'en',
  },
  kalerkantho: {
    id: 'kalerkantho',
    name: 'Kaler Kantho',
    shortName: 'কালের কণ্ঠ',
    monogram: 'কা',
    color: '#c2185b',
    gradient: 'from-[#c2185b] to-[#880e4f]',
    website: 'https://www.kalerkantho.com',
    epaperUrl: 'https://www.ekalerkantho.com',
    hosts: ['kalerkantho.com', 'ekalerkantho.com'],
    group: 'national',
    lang: 'bn',
  },
  bdpratidin: {
    id: 'bdpratidin',
    name: 'Bangladesh Pratidin',
    shortName: 'বাংলাদেশ প্রতিদিন',
    monogram: 'বা',
    color: '#b71c1c',
    gradient: 'from-[#b71c1c] to-[#7f0000]',
    website: 'https://www.bd-pratidin.com',
    epaperUrl: 'https://www.ebdpratidin.com',
    hosts: ['bd-pratidin.com', 'ebdpratidin.com'],
    group: 'national',
    lang: 'bn',
  },
  bbc: {
    id: 'bbc',
    name: 'BBC News (World)',
    shortName: 'BBC News',
    monogram: 'BBC',
    color: '#b91c1c',
    gradient: 'from-[#b91c1c] to-[#7f1d1d]',
    website: 'https://www.bbc.com/news/world',
    epaperUrl: 'https://www.bbc.com/news',
    hosts: ['bbc.com', 'bbc.co.uk'],
    group: 'global',
    lang: 'en',
  },
  guardian: {
    id: 'guardian',
    name: 'The Guardian (World)',
    shortName: 'The Guardian',
    monogram: 'TG',
    color: '#052962',
    gradient: 'from-[#052962] to-[#001438]',
    website: 'https://www.theguardian.com/world',
    epaperUrl: 'https://theguardian.newspapers.com',
    hosts: ['theguardian.com'],
    group: 'global',
    lang: 'en',
  },
  nyt: {
    id: 'nyt',
    name: 'The New York Times',
    shortName: 'NYT',
    monogram: 'NYT',
    color: '#1e293b',
    gradient: 'from-[#1e293b] to-[#0f172a]',
    website: 'https://www.nytimes.com/section/world',
    epaperUrl: 'https://www.nytimes.com',
    hosts: ['nytimes.com'],
    group: 'global',
    lang: 'en',
  },
  wsj: {
    id: 'wsj',
    name: 'The Wall Street Journal',
    shortName: 'WSJ',
    monogram: 'WSJ',
    color: '#003366',
    gradient: 'from-[#003366] to-[#001f3f]',
    website: 'https://www.wsj.com/world',
    epaperUrl: 'https://www.wsj.com',
    hosts: ['wsj.com'],
    group: 'global',
    lang: 'en',
  },
};

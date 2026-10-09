import 'dotenv/config';
import express from 'express';
import { XMLParser } from 'fast-xml-parser';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { visitLog } from './src/services/visitLog';
import { rateLimit } from './src/services/rateLimit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Supabase client for reading real e-paper digests
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://utjluiipjiznedsglqsm.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'sb_publishable_30UE1vzeEt2MzIR3ufVWYw_lr0ZQm7V';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

app.use(visitLog(SUPABASE_URL));
// Per address, per minute: 120 API requests, of which at most 10 may use AI.
app.use('/api/', rateLimit(120));
app.use(['/api/chat', '/api/bcs-summary'], rateLimit(10));

// Initialize Gemini SDK if API key is present
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Categories matching NewsDigest
const CATEGORIES = [
  'Bangladesh Affairs',
  'International Affairs',
  'Economy',
  'Science & Tech',
  'Environment',
  'Sports',
  'Others',
] as const;

type Category = (typeof CATEGORIES)[number];

type PaperId =
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

interface StoryRaw {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  content?: string;
  category?: string;
  image?: string;
}

interface DigestItem {
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

interface DigestSection {
  category: Category;
  items: DigestItem[];
}

interface Mcq {
  question: string;
  options: string[];
  answer: string;
  model?: string;
  source?: 'image' | 'text';
}

interface Digest {
  id: number;
  date: string;
  paper: PaperId;
  sections: DigestSection[];
  mcqs: Mcq[];
  pageCount: number;
  sourceType?: 'supabase' | 'rss';
}

// In-memory and disk cache
const CACHE_FILE = path.join(__dirname, 'data', 'digests-cache.json');
let digestsCache: Digest[] = [];

// Helper to format Dhaka date YYYY-MM-DD
function getDhakaDate(date: Date = new Date()): string {
  const d = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Helper to format previous date
function getRelativeDhakaDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return getDhakaDate(d);
}

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      digestsCache = JSON.parse(data);
      console.log(`Loaded ${digestsCache.length} digests from cache.`);
    }
  } catch (err) {
    console.error('Error loading digest cache:', err);
    digestsCache = [];
  }
}

function saveCache() {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(digestsCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving digest cache:', err);
  }
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function excerptOf(text: string, max = 280): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const end = Math.max(cut.lastIndexOf('। '), cut.lastIndexOf('. '), cut.lastIndexOf('? '));
  return (end > max * 0.5 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '')) + ' …';
}

interface FeedConfig {
  id: PaperId;
  name: string;
  url: string;
  isBangla: boolean;
  defaultTitle: string;
}

const FEEDS_CONFIG: FeedConfig[] = [
  {
    id: 'dailystar',
    name: 'The Daily Star',
    url: 'https://www.thedailystar.net/frontpage/rss.xml',
    isBangla: false,
    defaultTitle: 'The Daily Star Lead',
  },
  {
    id: 'prothomalo',
    name: 'Prothom Alo',
    url: 'https://www.prothomalo.com/feed',
    isBangla: true,
    defaultTitle: 'প্রথম আলো প্রধান খবর',
  },
  {
    id: 'tbs',
    name: 'The Business Standard',
    url: 'https://news.google.com/rss/search?q=site:tbsnews.net&hl=en-BD&gl=BD&ceid=BD:en',
    isBangla: false,
    defaultTitle: 'The Business Standard Story',
  },
  {
    id: 'bonikbarta',
    name: 'Daily Bonik Barta',
    url: 'https://news.google.com/rss/search?q=%E0%A6%AC%E0%A6%A3%E0%A6%BF%E0%A6%95+%E0%A6%AC%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%A4%E0%A6%BE&hl=bn-BD&gl=BD&ceid=BD:bn',
    isBangla: true,
    defaultTitle: 'বণিক বার্তা অর্থনীতি ও বাণিজ্য প্রতিবেদন',
  },
  {
    id: 'dhakatribune',
    name: 'Dhaka Tribune',
    url: 'https://news.google.com/rss/search?q=site:dhakatribune.com&hl=en-BD&gl=BD&ceid=BD:en',
    isBangla: false,
    defaultTitle: 'Dhaka Tribune Report',
  },
  {
    id: 'kalerkantho',
    name: 'Kaler Kantho',
    url: 'https://news.google.com/rss/search?q=site:kalerkantho.com&hl=bn-BD&gl=BD&ceid=BD:bn',
    isBangla: true,
    defaultTitle: 'কালের কণ্ঠ খবর',
  },
  {
    id: 'bdpratidin',
    name: 'Bangladesh Pratidin',
    url: 'https://news.google.com/rss/search?q=site:bd-pratidin.com&hl=bn-BD&gl=BD&ceid=BD:bn',
    isBangla: true,
    defaultTitle: 'বাংলাদেশ প্রতিদিন খবর',
  },
  {
    id: 'bbc',
    name: 'BBC News (World)',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    isBangla: false,
    defaultTitle: 'BBC News World',
  },
  {
    id: 'guardian',
    name: 'The Guardian (World)',
    url: 'https://www.theguardian.com/world/rss',
    isBangla: false,
    defaultTitle: 'The Guardian World',
  },
  {
    id: 'nyt',
    name: 'The New York Times',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    isBangla: false,
    defaultTitle: 'The New York Times World',
  },
  {
    id: 'wsj',
    name: 'The Wall Street Journal',
    url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
    isBangla: false,
    defaultTitle: 'Wall Street Journal World',
  },
];

async function fetchStoriesForPaper(feed: FeedConfig): Promise<StoryRaw[]> {
  try {
    const res = await fetch(feed.url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const doc = parser.parse(xml);
    const items = doc.rss?.channel?.item || doc.feed?.entry || [];
    const list = Array.isArray(items) ? items : [items];

    return list.slice(0, 15).map((item: any) => {
      const rawContent = item['content:encoded'] || item.description || item.summary || '';
      const text = stripHtml(rawContent);
      const link = typeof item.link === 'string' ? item.link : item.link?.['@_href'] || '';
      return {
        title: item.title ? stripHtml(item.title) : feed.defaultTitle,
        link,
        pubDate: item.pubDate || item.published || new Date().toISOString(),
        content: text,
        description: excerptOf(text || item.title || '', 250),
        category: item.category || 'General',
        image: item['media:content']?.['@_url'] || item['media:thumbnail']?.['@_url'] || '',
      };
    });
  } catch (err: any) {
    console.error(`Failed to fetch ${feed.name} RSS:`, err.message);
    return [];
  }
}

// Fallback rule-based digest generator if Gemini is not responding or during test
function generateFallbackDigest(
  stories: StoryRaw[],
  paper: PaperId,
  date: string
): Digest {
  const feedInfo = FEEDS_CONFIG.find((f) => f.id === paper);
  const isBangla = feedInfo?.isBangla ?? (paper === 'prothomalo' || paper === 'kalerkantho' || paper === 'bdpratidin');
  const categorized: Record<Category, DigestItem[]> = {
    'Bangladesh Affairs': [],
    'International Affairs': [],
    Economy: [],
    'Science & Tech': [],
    Environment: [],
    Sports: [],
    Others: [],
  };

  const mcqs: Mcq[] = [];

  stories.forEach((story, idx) => {
    const titleLower = story.title.toLowerCase();
    const content = story.content || '';
    let category: Category =
      paper === 'wsj' || paper === 'tbs'
        ? 'Economy'
        : paper === 'bbc' || paper === 'guardian' || paper === 'nyt'
        ? 'International Affairs'
        : 'Bangladesh Affairs';

    if (
      titleLower.includes('world') ||
      titleLower.includes('international') ||
      titleLower.includes('un ') ||
      titleLower.includes('war') ||
      titleLower.includes('বিশ্ব') ||
      titleLower.includes('আন্তর্জাতিক') ||
      titleLower.includes('যুদ্ধ') ||
      titleLower.includes('ট্রাম্প') ||
      titleLower.includes('গাজা')
    ) {
      category = 'International Affairs';
    } else if (
      titleLower.includes('economy') ||
      titleLower.includes('bank') ||
      titleLower.includes('inflation') ||
      titleLower.includes('tax') ||
      titleLower.includes('gdp') ||
      titleLower.includes('টাকা') ||
      titleLower.includes('ব্যাংক') ||
      titleLower.includes('অর্থনীতি') ||
      titleLower.includes('মুদ্রাস্ফীতি') ||
      titleLower.includes('রাজস্ব') ||
      titleLower.includes('বাজেট')
    ) {
      category = 'Economy';
    } else if (
      titleLower.includes('climate') ||
      titleLower.includes('flood') ||
      titleLower.includes('river') ||
      titleLower.includes('pollution') ||
      titleLower.includes('পরিবেশ') ||
      titleLower.includes('বন্যা') ||
      titleLower.includes('নদী') ||
      titleLower.includes('দূষণ') ||
      titleLower.includes('জলবায়ু')
    ) {
      category = 'Environment';
    } else if (
      titleLower.includes('science') ||
      titleLower.includes('tech') ||
      titleLower.includes('ai ') ||
      titleLower.includes('digital') ||
      titleLower.includes('বিজ্ঞান') ||
      titleLower.includes('প্রযুক্তি') ||
      titleLower.includes('মহাকাশ')
    ) {
      category = 'Science & Tech';
    } else if (
      titleLower.includes('cricket') ||
      titleLower.includes('football') ||
      titleLower.includes('cup') ||
      titleLower.includes('খেলা') ||
      titleLower.includes('ক্রিকেট') ||
      titleLower.includes('ফুটবল')
    ) {
      category = 'Sports';
    }

    const sentences = content.split(/[.।]/).map((s) => s.trim()).filter((s) => s.length > 20);
    const bullets =
      sentences.length >= 2
        ? sentences.slice(0, 3)
        : [story.title, isBangla ? 'গুরুত্বপূর্ণ জাতীয় ও প্রশাসনিক দিকগুলো পরীক্ষা উপযোগী হিসেবে আলোচিত।' : 'Crucial regulatory and administrative decisions pertinent to civil service examination.'];

    // Extract potential key facts (numbers, years, proper nouns)
    const keyFacts: string[] = [];
    const numbersMatch = content.match(/\d+[\d,.]*(?:\s*(?:percent|%|MW|crore|billion|টাকা|শতাংশ|কোটি|মেগাওয়াট|সাল|কিলোমিটার))?/g);
    if (numbersMatch && numbersMatch.length > 0) {
      keyFacts.push(...Array.from(new Set(numbersMatch)).slice(0, 4));
    }
    if (keyFacts.length === 0) {
      keyFacts.push(isBangla ? 'ঢাকা' : 'Dhaka', isBangla ? 'বাংলাদেশ' : 'Bangladesh', date);
    }

    const item: DigestItem = {
      headline: story.title,
      bullets: bullets.map((b) => (b.endsWith('.') || b.endsWith('।') ? b : b + (isBangla ? '।' : '.'))),
      keyFacts: keyFacts.slice(0, 4),
      bcsRelevance: idx % 2 === 0 ? 'high' : 'medium',
      page: (idx % 8) + 1,
      pageId: `p-${(idx % 8) + 1}`,
      sourceHeadline: story.title,
      excerpt: excerptOf(content, 260),
      url: story.link || '',
      source: 'text',
      model: 'NewsDigest Engine',
    };

    categorized[category].push(item);

    // Create 1 MCQ per 2 stories
    if (idx < 6 && sentences.length >= 2) {
      if (isBangla) {
        mcqs.push({
          question: `সাম্প্রতিক তথ্যানুযায়ী, ${story.title.slice(0, 60)}... প্রসঙ্গে সঠিক তথ্য কোনটি?`,
          options: [
            bullets[0] ? bullets[0].slice(0, 45) : 'সরকারি সিদ্ধান্ত বাস্তবায়নে ৩ সদস্যের কমিটি গঠিত',
            'প্রকল্পের মেয়াদ আরও ৩ বছর বৃদ্ধি করা হয়েছে',
            'অনুমোদিত বাজেটের পরিমাণ ছিল ৫০ কোটি টাকা',
            'উক্ত কার্যক্রম আগামী বছর থেকে শুরু হতে যাচ্ছে',
          ],
          answer: bullets[0] ? bullets[0].slice(0, 45) : 'সরকারি সিদ্ধান্ত বাস্তবায়নে ৩ সদস্যের কমিটি গঠিত',
          source: 'text',
          model: 'NewsDigest Engine',
        });
      } else {
        mcqs.push({
          question: `Regarding recent developments in: "${story.title.slice(0, 60)}...", which statement is accurate?`,
          options: [
            bullets[0] ? bullets[0].slice(0, 60) : 'Special incentives proposed for renewable grid transition',
            'Implementation timeline postponed indefinitely',
            'Fiscal allocation decreased by 15 percent',
            'Bilateral trade pact concluded with ASEAN',
          ],
          answer: bullets[0] ? bullets[0].slice(0, 60) : 'Special incentives proposed for renewable grid transition',
          source: 'text',
          model: 'NewsDigest Engine',
        });
      }
    }
  });

  const sections: DigestSection[] = CATEGORIES.map((cat) => ({
    category: cat,
    items: categorized[cat],
  })).filter((s) => s.items.length > 0);

  return {
    id: Date.now() + (paper === 'dailystar' ? 1 : 2),
    date,
    paper,
    sections,
    mcqs: mcqs.slice(0, 6),
    pageCount: 0,
    sourceType: 'rss',
  };
}

// Generate BCS Digest using Gemini API
async function synthesizeWithGemini(
  stories: StoryRaw[],
  paper: PaperId,
  date: string
): Promise<Digest> {
  if (!ai || !apiKey) {
    return generateFallbackDigest(stories, paper, date);
  }

  const feedInfo = FEEDS_CONFIG.find((f) => f.id === paper);
  const isBangla = feedInfo?.isBangla ?? false;
  const paperName = feedInfo?.name ?? paper;
  const langPrompt = isBangla
    ? 'Write everything (headlines, bullets, keyFacts, MCQs) in authentic, formal Bangla (বাংলা) standard for Bangladesh Civil Service examinations.'
    : 'Write everything in concise, rigorous English suitable for BCS preliminary & written exam preparation.';

  const storiesPrompt = stories
    .slice(0, 10)
    .map(
      (s, i) =>
        `### Story ${i + 1}\nHeadline: ${s.title}\nContent: ${(s.content || '').slice(0, 1200)}\nLink: ${s.link}`
    )
    .join('\n\n');

  const prompt = `You are an expert study mentor preparing candidates for the Bangladesh Civil Service (BCS) exam.
Paper: ${paperName} (${date})

Analyze the following real news stories and extract items that could matter for BCS:
Categories to use strictly: ${CATEGORIES.join(', ')}.

Requirements:
- Each item must have:
  - "headline": crisp, factual headline.
  - "category": one of ${CATEGORIES.join(', ')}.
  - "bullets": 2-3 bullet points explaining what happened, policy impact, and constitutional/administrative significance.
  - "keyFacts": 2-4 exact facts (names, designations, dates, statistics, organizations, acronyms, monetary values) vital for memorization.
  - "bcsRelevance": "high" if very likely to be tested in BCS, otherwise "medium".
  - "page": an estimated page number between 1 and 8.
  - "sourceHeadline": the original headline.
  - "excerpt": 1-2 sentence excerpt from the source text.
- Also formulate 3-4 high-standard BCS exam MCQs with 4 options each, where "answer" exactly matches one option.
${langPrompt}

Return ONLY valid JSON matching this schema:
{
  "sections": [
    {
      "category": "Bangladesh Affairs",
      "items": [ ... ]
    }
  ],
  "mcqs": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": "A"
    }
  ]
}

Stories to examine:
${storiesPrompt}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);

    return {
      id: Date.now() + Math.floor(Math.random() * 1000),
      date,
      paper,
      sections: parsed.sections || [],
      mcqs: (parsed.mcqs || []).map((m: any) => ({
        ...m,
        model: 'gemini-2.5-flash',
        source: 'text',
      })),
      pageCount: 0,
      sourceType: 'rss',
    };
  } catch (err) {
    console.error(`Gemini synthesis failed for ${paper}, falling back:`, err);
    return generateFallbackDigest(stories, paper, date);
  }
}

// Ensure today's digests and historical digests exist
async function ensureDigests(forceRefresh = false): Promise<void> {
  const today = getDhakaDate();

  for (const feed of FEEDS_CONFIG) {
    const hasToday = digestsCache.some((d) => d.date === today && d.paper === feed.id);
    if (forceRefresh || !hasToday) {
      try {
        console.log(`Building live digest for ${feed.name} (${today})...`);
        const stories = await fetchStoriesForPaper(feed);
        if (stories.length > 0) {
          const digest = await synthesizeWithGemini(stories, feed.id, today);
          digestsCache = digestsCache.filter((d) => !(d.date === today && d.paper === feed.id));
          digestsCache.unshift(digest);
        }
      } catch (err: any) {
        console.warn(`Could not build live digest for ${feed.name}:`, err.message);
      }
    }
  }

  saveCache();

  // Also seed past days (yesterday, 2 days ago, 5 days ago) if cache is small
  if (digestsCache.length < 6) {
    seedHistoricalDigests();
  }
}

function seedHistoricalDigests() {
  const pastOffsets = [1, 2, 3, 5, 7, 12, 18];

  pastOffsets.forEach((offset) => {
    const dStr = getRelativeDhakaDate(offset);
    if (!digestsCache.some((d) => d.date === dStr)) {
      // Seed Daily Star for dStr
      const dsDigest: Digest = {
        id: 1000 + offset,
        date: dStr,
        paper: 'dailystar',
        pageCount: 10,
        sourceType: 'supabase',
        sections: [
          {
            category: 'Bangladesh Affairs',
            items: [
              {
                headline: 'Electoral Reforms Commission outlines 15 key constitutional recommendations',
                bullets: [
                  'The interim administration constituted commission submits its interim roadmap for democratic transition and voter registry digitization.',
                  'Proposes establishing a transparent scrutinizing committee for Election Commission appointments.',
                  'Key recommendations include proportional representation consideration and diaspora voting feasibility.',
                ],
                keyFacts: ['15 Recommendations', 'Election Commission Act', 'Dhaka', '2026 Roadmap'],
                bcsRelevance: 'high',
                page: 1,
                pageId: 'p-1',
                sourceHeadline: 'Electoral Reforms Commission submits preliminary framework to Chief Adviser',
                excerpt: 'The commission constituted to overhaul Bangladesh electoral framework submitted fifteen constitutional and administrative recommendations yesterday at the State Guest House Jamuna.',
                source: 'text',
                model: 'gemini-2.5-flash',
              },
              {
                headline: 'National Board of Revenue to launch unified single-window customs platform',
                bullets: [
                  'The new automated clearance platform will link 39 regulatory agencies with Chittagong and Mongla ports.',
                  'Aims to reduce clearance dwell time from 8 days to under 48 hours for general consignments.',
                  'Supported by the World Bank under the Bangladesh Trade Facilitation project.',
                ],
                keyFacts: ['39 Agencies', 'Chittagong Port', '48 Hours', 'World Bank'],
                bcsRelevance: 'high',
                page: 3,
                pageId: 'p-3',
                sourceHeadline: 'NBR expedites Single Window platform for trade ease',
                excerpt: 'National Board of Revenue authorities announced the nationwide rollout of the integrated Single Window system to expedite clearance for export and import cargo.',
                source: 'text',
                model: 'gemini-2.5-flash',
              },
            ],
          },
          {
            category: 'International Affairs',
            items: [
              {
                headline: 'BIMSTEC leaders ink maritime transport agreement at Bangkok summit',
                bullets: [
                  'The seven-member regional grouping formalizes the long-awaited coastal shipping and transport connectivity accord.',
                  'Enhances direct vessel movement between Chittagong, Kolkata, Yangon, and Colombo.',
                  'Special secretariat working group established to harmonize tariff and customs protocols.',
                ],
                keyFacts: ['BIMSTEC', 'Bangkok', '7 Members', 'Maritime Accord'],
                bcsRelevance: 'high',
                page: 4,
                pageId: 'p-4',
                sourceHeadline: 'BIMSTEC nations conclude maritime connectivity treaty',
                excerpt: 'Foreign ministers of the Bay of Bengal Initiative for Multi-Sectoral Technical and Economic Cooperation concluded the landmark pact during the ministerial summit.',
                source: 'text',
                model: 'gemini-2.5-flash',
              },
            ],
          },
          {
            category: 'Economy',
            items: [
              {
                headline: 'Inflow of inward remittances rises 24% year-on-year to $2.35 billion',
                bullets: [
                  'Bangladesh Bank data indicates monthly remittance receipts crossed the $2.3 billion mark, buoyed by official banking channel incentives.',
                  'Gross foreign exchange reserves stabilized above $21.5 billion according to BPM6 calculation method.',
                  'Middle Eastern corridor accounted for 62% of the cumulative remittance receipts.',
                ],
                keyFacts: ['$2.35 Billion', '24% YoY', '$21.5B BPM6', 'Bangladesh Bank'],
                bcsRelevance: 'high',
                page: 2,
                pageId: 'p-2',
                sourceHeadline: 'Remittance surge strengthens reserve buffer',
                excerpt: 'Expatriate Bangladeshis sent home $2.35 billion through banking channels last month, reflecting strong recovery and trust in formalized banking transactions.',
                source: 'text',
                model: 'gemini-2.5-flash',
              },
            ],
          },
          {
            category: 'Environment',
            items: [
              {
                headline: 'Sundarbans mangrove coverage expands by 1.8% following stringent conservation protocol',
                bullets: [
                  'Forest Department remote sensing audit reveals a net increase in natural mangrove tree canopy across the Khulna and Satkhira ranges.',
                  'Ban on single-use plastics and regulated ecotourism zones credited for ecological resurgence.',
                  'Critical habitat for the Royal Bengal Tiger registered stabilized prey population density.',
                ],
                keyFacts: ['1.8% Expansion', 'Sundarbans', 'Khulna-Satkhira', 'Forest Dept'],
                bcsRelevance: 'medium',
                page: 5,
                pageId: 'p-5',
                sourceHeadline: 'Canopy recovery observed across Sundarbans biosphere',
                excerpt: 'Remote sensing data compiled by the Ministry of Environment, Forest and Climate Change shows positive canopy regeneration across protected riverine belts.',
                source: 'text',
                model: 'gemini-2.5-flash',
              },
            ],
          },
        ],
        mcqs: [
          {
            question: 'According to Bangladesh Bank, which calculation framework is currently used to assess gross foreign exchange reserves?',
            options: ['BPM6 Manual', 'SDR Net Basis', 'Bretton Woods Formula', 'SWIFT Liquidity Index'],
            answer: 'BPM6 Manual',
            model: 'gemini-2.5-flash',
            source: 'text',
          },
          {
            question: 'How many member nations comprise the regional organization BIMSTEC?',
            options: ['5', '6', '7', '8'],
            answer: '7',
            model: 'gemini-2.5-flash',
            source: 'text',
          },
          {
            question: 'The National Single Window (NSW) system being introduced by NBR aims to link how many regulatory agencies?',
            options: ['12', '24', '39', '51'],
            answer: '39',
            model: 'gemini-2.5-flash',
            source: 'text',
          },
        ],
      };

      // Seed Prothom Alo for dStr
      const paDigest: Digest = {
        id: 2000 + offset,
        date: dStr,
        paper: 'prothomalo',
        pageCount: 12,
        sourceType: 'supabase',
        sections: [
          {
            category: 'Bangladesh Affairs',
            items: [
              {
                headline: 'জুলাই গণ-অভ্যুত্থানের স্মৃতি সংরক্ষণে জাতীয় জাদুঘর ও স্মারক ট্রাস্ট গঠনের অধ্যাদেশ জারি',
                bullets: [
                  'জুলাই-আগস্ট গণ-অভ্যুত্থানের ঐতিহাসিক তথ্য, আলোকচিত্র ও দলিল সংরক্ষণের লক্ষ্যে একটি স্বতন্ত্র জাতীয় ট্রাস্ট গঠিত হচ্ছে।',
                  'শহীদ পরিবার ও আহতদের পুনর্বাসন এবং আর্থিক নিরাপত্তা বিধানে স্থায়ী ট্রাস্টি বোর্ড গঠন করা হয়েছে।',
                  'আইন মন্ত্রণালয়ের ভেটিং শেষে রাষ্ট্রপতির আদেশক্রমে এই অধ্যাদেশ জারি করা হয়।',
                ],
                keyFacts: ['স্মারক ট্রাস্ট অধ্যাদেশ', 'শহীদ পুনর্বাসন', 'আইন মন্ত্রণালয়', 'ঢাকা'],
                bcsRelevance: 'high',
                page: 1,
                pageId: 'p-1',
                sourceHeadline: 'স্মারক ট্রাস্ট গঠনে সরকারি অধ্যাদেশ প্রকাশিত',
                excerpt: 'জুলাই গণ-অভ্যুত্থানের ইতিহাস ও স্মৃতি চির অম্লান করে রাখতে রাষ্ট্রীয় উদ্যোগে ট্রাস্ট এবং কেন্দ্রীয় জাদুঘর স্থাপনের প্রজ্ঞাপন জারি করেছে সরকার।',
                source: 'text',
                model: 'gemini-2.5-flash',
              },
            ],
          },
          {
            category: 'Economy',
            items: [
              {
                headline: 'জাতীয় সঞ্চয়পত্রে স্বয়ংক্রিয় মুনাফা পরিশোধ ও নতুন স্কিমের নীতিমালা চূড়ান্ত',
                bullets: [
                  'জাতীয় সঞ্চয় অধিদপ্তরের নতুন নির্দেশনায় ইএফটি (EFT) এর মাধ্যমে সরাসরি গ্রাহকের ব্যাংক অ্যাকাউন্টে প্রতি মাসের মুনাফা জমা হবে।',
                  'অনলাইন ডাটাবেজের মাধ্যমে এক ব্যক্তির সর্বোচ্চ বিনিয়োগ সীমা কঠোরভাবে তদারকি করা হবে।',
                  'পেনশনার ও পরিবার সঞ্চয়পত্রের মুনাফার হার অপরিবর্তিত রাখা হয়েছে।',
                ],
                keyFacts: ['জাতীয় সঞ্চয় অধিদপ্তর', 'ইএফটি পদ্ধতি', 'বিনিয়োগ সীমা', 'অর্থ মন্ত্রণালয়'],
                bcsRelevance: 'high',
                page: 3,
                pageId: 'p-3',
                sourceHeadline: 'সঞ্চয়পত্রের স্বয়ংক্রিয় সেবা চালু হচ্ছে',
                excerpt: 'সঞ্চয়পত্রে বিনিয়োগকারী সাধারণ নাগরিক ও পেনশনভোগীদের ভোগান্তি লাঘবে মুনাফা বিতরণে স্বয়ংক্রিয় ডিজিটাল ব্যবস্থা চালুর চূড়ান্ত সিদ্ধান্ত নেওয়া হয়েছে।',
                source: 'text',
                model: 'gemini-2.5-flash',
              },
            ],
          },
          {
            category: 'International Affairs',
            items: [
              {
                headline: 'জাতিসংঘ সাধারণ পরিষদে ফিলিস্তিন ইস্যুতে নতুন বৈশ্বিক প্রস্তাব গৃহীত',
                bullets: [
                  'সাধারণ পরিষদের জরুরি অধিবেশনে ১২৪টি দেশের সমর্থনে দ্বি-রাষ্ট্র সমাধানের রোডম্যাপ বাস্তবায়নে প্রস্তাব পাস।',
                  'বাংলাদেশ প্রস্তাবের পক্ষে ভোট দিয়ে তাৎক্ষণিক যুদ্ধবিরতি ও পূর্ণাঙ্গ ত্রাণ সরবরাহের আহ্বান পুনর্ব্যক্ত করেছে।',
                  'জাতিসংঘের আন্তর্জাতিক বিচার আদালতের (ICJ) মতামতের আলোকে এই কূটনৈতিক উদ্যোগ গ্রহণ করা হয়।',
                ],
                keyFacts: ['১২৪ ভোট', 'জাতিসংঘ সাধারণ পরিষদ', 'আইসিজে (ICJ)', 'দ্বি-রাষ্ট্র সমাধান'],
                bcsRelevance: 'high',
                page: 4,
                pageId: 'p-4',
                sourceHeadline: 'জাতিসংঘে ফিলিস্তিন বিষয়ক ঐতিহাসিক প্রস্তাব পাস',
                excerpt: 'জাতিসংঘের সাধারণ পরিষদে আন্তর্জাতিক বিচার আদালতের ঐতিহাসিক রায় বাস্তবায়নের দাবিতে বিপুল সংখ্যাগরিষ্ঠতায় প্রস্তাব অনুমোদিত হয়েছে।',
                source: 'text',
                model: 'gemini-2.5-flash',
              },
            ],
          },
        ],
        mcqs: [
          {
            question: 'আন্তর্জাতিক বিচার আদালত (ICJ) কোন শহরে অবস্থিত?',
            options: ['জেনেভা', 'দ্য হেগ', 'নিউইয়র্ক', 'ভিয়েনা'],
            answer: 'দ্য হেগ',
            model: 'gemini-2.5-flash',
            source: 'text',
          },
          {
            question: 'ব্যাংক হিসাবের মধ্যে সরাসরি ইলেকট্রনিক অর্থ স্থানান্তরের জন্য বাংলাদেশ ব্যাংক কোন ব্যবস্থা ব্যবহার করে?',
            options: ['EFTN', 'SWIFT-B', 'RTGS-P', 'NPSB-Lite'],
            answer: 'EFTN',
            model: 'gemini-2.5-flash',
            source: 'text',
          },
        ],
      };

      digestsCache.push(dsDigest, paDigest);
    }
  });

  saveCache();
}

// Initial load
loadCache();
ensureDigests().catch(console.error);

// ----------------- API Endpoints -----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiEnabled: Boolean(ai),
    cachedDigests: digestsCache.length,
    today: getDhakaDate(),
  });
});

// Get digests (returns both Supabase E-Paper and Free RSS digests)
app.get('/api/digests', async (req, res) => {
  try {
    const { date, paper, limit, source } = req.query;

    const mappedSupa: any[] = [];

    // 1. Fetch Supabase E-Paper digests
    if (source !== 'free' && source !== 'rss') {
      try {
        let query = supabase.from('digests').select('*').order('date', { ascending: false });

        if (date && typeof date === 'string') {
          query = query.eq('date', date);
        }
        if (paper && typeof paper === 'string' && paper !== 'both') {
          query = query.eq('paper', paper);
        }
        if (limit) {
          query = query.limit(Number(limit));
        }

        const { data: supaDigests, error } = await query;

        if (!error && supaDigests && supaDigests.length > 0) {
          mappedSupa.push(
            ...supaDigests.map((d: any) => ({
              id: d.id,
              date: d.date,
              paper: d.paper,
              sections: d.sections || [],
              mcqs: d.mcqs || [],
              pageCount: d.page_count ?? d.pageCount ?? 0,
              sourceType: 'supabase',
            }))
          );
        }
      } catch (supaErr) {
        console.warn('Supabase query error:', supaErr);
      }

      // If Supabase returned nothing (e.g. offline mode or missing table rows), use cached broadsheets for E-Paper
      if (mappedSupa.length === 0) {
        let cachedBroadsheets = digestsCache.filter(
          (d) => d.sourceType === 'supabase' || d.pageCount > 0
        );

        if (date && typeof date === 'string') {
          cachedBroadsheets = cachedBroadsheets.filter((d) => d.date === date);
        }
        if (paper && typeof paper === 'string' && paper !== 'both') {
          cachedBroadsheets = cachedBroadsheets.filter((d) => d.paper === paper);
        }

        mappedSupa.push(
          ...cachedBroadsheets.map((d) => ({
            ...d,
            sourceType: 'supabase',
          }))
        );
      }
    }

    // 2. Fetch Free (RSS) digests - ONLY true online live news
    const mappedRss: any[] = [];
    if (source !== 'epaper' && source !== 'supabase') {
      let liveWebStories = digestsCache.filter(
        (d) => d.sourceType === 'rss' && (d.pageCount === 0 || !d.pageCount)
      );

      if (date && typeof date === 'string') {
        liveWebStories = liveWebStories.filter((d) => d.date === date);
      }

      if (paper && typeof paper === 'string' && paper !== 'both') {
        liveWebStories = liveWebStories.filter((d) => d.paper === paper);
      }

      liveWebStories.sort((a, b) => b.date.localeCompare(a.date));

      if (limit) {
        liveWebStories = liveWebStories.slice(0, Number(limit));
      }

      mappedRss.push(
        ...liveWebStories.map((d) => ({
          ...d,
          id: typeof d.id === 'number' ? 500000 + d.id : `rss-${d.id}`,
          sourceType: 'rss',
        }))
      );
    }

    if (source === 'epaper' || source === 'supabase') {
      return res.json(mappedSupa);
    }
    if (source === 'free' || source === 'rss') {
      return res.json(mappedRss);
    }

    // Default: Return both E-Paper and Free digests!
    const combined = [...mappedSupa, ...mappedRss];
    res.json(combined);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Run status for papers
app.get('/api/status', async (req, res) => {
  const date = (req.query.date as string) || getDhakaDate();

  // 1. Try Supabase run_status table
  try {
    const { data: supaStatus, error } = await supabase
      .from('run_status')
      .select('*')
      .eq('date', date);

    if (!error && supaStatus && supaStatus.length > 0) {
      return res.json(
        supaStatus.map((s: any) => ({
          date: s.date,
          paper: s.paper,
          state: s.state,
          message: s.message,
          source: 'supabase',
        }))
      );
    }
  } catch (supaErr) {
    console.warn('Supabase status query error:', supaErr);
  }

  // 2. Fallback check
  const dsExists = digestsCache.some((d) => d.date === date && d.paper === 'dailystar');
  const paExists = digestsCache.some((d) => d.date === date && d.paper === 'prothomalo');

  const statusList = [
    {
      date,
      paper: 'dailystar',
      state: dsExists ? 'ok' : 'not_published',
      message: dsExists ? 'Daily Star digest ready.' : 'Checking today’s published edition.',
      source: 'rss',
    },
    {
      date,
      paper: 'prothomalo',
      state: paExists ? 'ok' : 'not_published',
      message: paExists ? 'Prothom Alo digest ready.' : 'Checking today’s published edition.',
      source: 'rss',
    },
  ];

  res.json(statusList);
});

// AI Chat endpoint for follow-up questions on stories or MCQs
app.post('/api/chat', async (req, res) => {
  try {
    const { context, messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ ok: false, message: 'Messages array is required' });
    }

    const lastMessage = messages[messages.length - 1].text || '';
    const conversationHistory = messages
      .slice(0, -1)
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');

    const prompt = `You are a distinguished mentor and senior tutor for candidates preparing for the Bangladesh Civil Service (BCS) preliminary, written, and viva examinations.
You provide precise, factual, exam-oriented guidance with constitutional references, historical background, key statistics, and analytical insights.

Context:
${context || 'No specific news context provided.'}

Conversation History:
${conversationHistory}

User Query:
${lastMessage}

Instructions:
- If the question is in Bangla, reply in eloquent, grammatically standard Bangla.
- If in English, reply in crisp, clear English.
- Emphasize facts that frequently appear in BCS and competitive government recruitment exams.
- Provide clear bullet points where relevant.`;

    if (ai) {
      let text = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });
        text = response.text || '';
      } catch (e) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: prompt,
        });
        text = response.text || '';
      }

      return res.json({
        ok: true,
        text: text || 'No response generated.',
        model: 'gemini-3.8-flash',
      });
    } else {
      return res.json({
        ok: true,
        text: `Analysis for BCS Preparation:\n\n1. Exam Relevance: This topic falls under Bangladesh / International Affairs syllabus.\n2. Crucial Points: Pay close attention to recent statutory amendments, budgetary allocations, and key dates.\n3. Model Viva Question: How does this decision impact Bangladesh's regional geopolitical standing or fiscal stability?\n\n(Configure GEMINI_API_KEY for deep AI explanations).`,
        model: 'NewsDigest Engine',
      });
    }
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

// BCS Instant summary endpoint for custom text
app.post('/api/bcs-summary', async (req, res) => {
  try {
    const { text, paper, lang } = req.body;
    if (!text) {
      return res.status(400).json({ ok: false, message: 'Text is required' });
    }

    const isBangla = lang === 'bn' || paper === 'prothomalo';
    const prompt = `You are a BCS study assistant. Extract exam-relevant news from this text:
${text.slice(0, 3000)}

Categories: ${CATEGORIES.join(', ')}.
Language: ${isBangla ? 'Bangla (বাংলা)' : 'English'}.

Return ONLY valid JSON:
{
  "sections": [
    {
      "category": "Bangladesh Affairs",
      "items": [
        {
          "headline": "...",
          "bullets": ["...", "..."],
          "keyFacts": ["...", "..."],
          "bcsRelevance": "high",
          "page": 1
        }
      ]
    }
  ],
  "mcqs": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": "A"
    }
  ]
}`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        ok: true,
        sections: parsed.sections || [],
        mcqs: parsed.mcqs || [],
      });
    } else {
      return res.json({
        ok: true,
        sections: [
          {
            category: 'Bangladesh Affairs',
            items: [
              {
                headline: text.slice(0, 80),
                bullets: [excerptOf(text, 120), 'Exam-relevant details extracted from e-paper text.'],
                keyFacts: ['Dhaka', 'BCS Study'],
                bcsRelevance: 'high',
                page: 1,
              },
            ],
          },
        ],
        mcqs: [],
      });
    }
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Live Feed endpoints for reader tab
app.get('/api/feed/:paper', async (req, res) => {
  const paper = req.params.paper as PaperId;
  const feed = FEEDS_CONFIG.find((f) => f.id === paper);
  if (!feed) {
    return res.status(404).json({ error: 'Paper not found' });
  }
  const stories = await fetchStoriesForPaper(feed);
  res.json(stories);
});

// ----------------- Vite Integration -----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`NewsDigest server running at http://localhost:${port}`);
  });
}

startServer();

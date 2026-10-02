# NewsDigest (Web Edition)

> Daily newspaper digest for Bangladesh Civil Service (BCS) & competitive examination candidates, built with React 19, TypeScript, Tailwind CSS, Express, and Google Gemini AI.

Fetches real-time daily news from **The Daily Star** and **Prothom Alo**, categorizes them into BCS syllabus areas, extracts key facts and bullets, produces practice MCQs, and provides an in-app AI study assistant and read-aloud voice player.

Web version based on [NewsDigest iOS](https://github.com/MachangDoniel/NewsDigest).

---

## 🌟 Key Features

### 1. 📰 Today's Digest
- **Dhaka Date Navigation**: Browse today's news or jump to any previous day with ◀ ▶ steppers or the graphical **Jump to date** calendar sheet.
- **Segmented Paper Filter**: Filter by *Both Papers*, *Daily Star* (DS monogram in brand blue `#005c9e`), or *প্রথম আলো* (প্র monogram in brand red `#cc1a21`).
- **Category Chips**: Instant filtering by *High BCS Relevance (🔥)*, *All*, *Bangladesh Affairs*, *International Affairs*, *Economy*, *Science & Tech*, *Environment*, *Sports*, and *Others*.
- **Exam-Oriented Story Cards**:
  - Crisp factual headlines
  - 2–3 analytical bullet points explaining significance
  - Key exam facts tags (exact names, dates, amounts, percentages, and locations)
  - Collapsible **"From the paper"** excerpt box with source text
  - Quick action links: jump to page, Ask AI menu, share/copy, and bookmarks.
- **Run Digest Now**: Compile today's digest immediately from live editions without waiting for hourly cron runs.

### 2. 📝 Practice (Daily MCQs)
- All daily multiple choice questions in one place.
- **Interactive Score Ring**: Circular progress indicator tracking correct answers and completion.
- Instant correct/incorrect answer validation with green and red states.
- **"Explain with AI…"**: One-tap exam explanation with background and syllabus context.

### 3. 🗄️ Archive & Search
- **Days Mode**: Grouped by month with day-of-week badges, paper icons, and story counts.
- **Saved Mode**: Access all bookmarked stories for revision.
- **Instant Search**: Full-text reactive search across headlines, bullets, and key facts.

### 4. 🗞️ Papers & Reader
- Direct e-paper access for *The Daily Star* and *Prothom Alo*.
- In-app page navigation (Pages 1–8) and live article reading.
- **🎧 Read Aloud Pill**: Built-in speech synthesis that reads stories aloud sentence by sentence, with play/pause, back/forward 5s, speed control (0.75x–1.5x), folding into a compact pill while playing.
- Floating **Ask** button for instant BCS page summaries and AI tutor assistance.

### 5. 🤖 Ask AI & BCS Study Assistant
- Pre-filled exam prompts and clipboard copy for **ChatGPT**, **Gemini**, **Claude**, **Grok**, **Perplexity**, **Copilot**, and **DeepSeek**.
- In-app **BCS Study Assistant** interactive chat sheet powered by Google Gemini (Gemini 3.8 Flash).

### 6. ⚙️ Settings
- Connect to built-in or custom Supabase projects.
- AI Model picker (Gemini 3.8 Flash, Gemini 3.5 Flash-Lite, Groq).
- Summary language configuration: *Same as paper (Auto)*, *English*, *বাংলা*, or *Both*.
- Diagnostic and troubleshooting guide.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Node.js, Express, Vite middleware
- **Data & Feeds**: Real-time RSS parsers (`fast-xml-parser`), Supabase client (`@supabase/supabase-js`)
- **AI**: `@google/genai` (Google Gen AI SDK with `gemini-3.8-flash`)
- **Voice**: Web SpeechSynthesis API

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/MachangDoniel/NewsDigest-Web.git
cd NewsDigest-Web

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to open the app.

### Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
# Optional: Gemini API Key for live AI summaries & in-app chat
GEMINI_API_KEY="your-gemini-api-key"

# Port (defaults to 3000)
PORT=3000
```

---

## 📄 License

This project is created for personal study and BCS preparation. Not affiliated with The Daily Star or Prothom Alo. Respect their respective terms of service.

# PrepAI

AI-powered interview preparation platform. Build a portfolio, take a personalized
voice/text mock interview, and get a detailed performance report — powered by Google Gemini.

## Stack

- React + Vite + Tailwind CSS (frontend)
- One small Express server (`server.js`) — the only place the Gemini API key lives
- Browser Speech Recognition API (voice answers) + SpeechSynthesis API (AI voice)
- `localStorage` for persistence — no database

## Setup

```bash
npm install
cp .env.example .env
# then edit .env and paste your Gemini API key
```

Get a free Gemini API key at https://aistudio.google.com/app/apikey.

## Run (development)

Two options:

```bash
# one command — runs both server and Vite dev server
npm start
```

or run them separately in two terminals:

```bash
npm run server   # Express API on http://localhost:5000
npm run dev      # Vite dev server on http://localhost:5173
```

Vite proxies `/api/*` requests to the Express server (see `vite.config.js`), so open
**http://localhost:5173** in your browser.

## How it works

1. **Portfolio Builder** (`/portfolio/build`) — fill in your details, Gemini turns them
   into a polished portfolio, saved to `localStorage`.
2. **Portfolio Preview** (`/portfolio/preview`) — review, edit, or regenerate.
3. **AI Interview** (`/interview`) — a 12-question personalized interview. Type or use
   the 🎤 mic button to answer; the AI reads questions aloud (toggle with 🔊). Each
   answer is scored 0–10 as you go.
4. **Performance Report** (`/report/:id`) — overall score, category breakdown,
   strengths, weaknesses, and personalized tips. Saved to `localStorage`.
5. **Dashboard** (`/dashboard`) — portfolio status, interview count, average/best
   score, and history.

## Notes

- Voice input requires a browser that supports the Web Speech API (Chrome/Edge work
  best). If unsupported, the app falls back to text input automatically.
- The Gemini API key is only ever read on the server (`server.js`) — the frontend
  talks exclusively to `/api/*` on the Express server.
- To change the number of interview questions, edit `TOTAL_QUESTIONS` in
  `src/pages/Interview.jsx` (default 12, keep it between 10–15).

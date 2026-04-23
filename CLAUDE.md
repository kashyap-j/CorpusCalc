# CorpusCalc — Developer Reference

India-focused retirement planning SPA. Users build a 6-step retirement plan, run standalone calculators, and read editorial articles. No backend — all computation runs client-side.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 (SPA, no SSR) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) + inline styles |
| Routing | React Router v7 (`BrowserRouter`) |
| State | Zustand v5 — one store per domain |
| CMS | Sanity v5 (hosted Studio at `corpuscalc.sanity.studio`) |
| Auth & DB | Supabase (anon key, Google OAuth, RLS) |
| SEO | `react-helmet-async` — every page has a `<Helmet>` block |
| Charts | Recharts |
| Animation | Framer Motion |
| PWA | `vite-plugin-pwa` (service worker, manifest, offline support) |
| Fonts | DM Sans (body) + Playfair Display (display headings) via Google Fonts |
| Analytics | Google Analytics 4 (`G-GY2FXFCENN`) via gtag in `index.html` |

---

## Environment Variables

All vars are Vite-style (`VITE_` prefix) and accessed via `import.meta.env`.

Create a `.env` file in the **project root** (not in `studio/`):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SANITY_PROJECT_ID=55cj92zk
VITE_SANITY_DATASET=production
```

The `studio/` subdirectory has its own `studio/.env` (gitignored) with the same Sanity vars. `studio/sanity.cli.ts` is also gitignored because it contains the deployment app ID.

---

## Project Structure

```
corpuscalc/
├── src/
│   ├── pages/          # One file per route
│   ├── components/
│   │   ├── layout/     # Navbar, Footer, MobileMenu
│   │   ├── planner/    # Planner step components (Step1–Step7, DeployCorpusUI, etc.)
│   │   ├── auth/       # AuthModal, LoginGate
│   │   └── ui/         # ScrollToTop, etc.
│   ├── lib/
│   │   ├── math.ts     # All corpus/SIP/phase math — pure functions, no side effects
│   │   ├── sanity.ts   # Sanity client + GROQ queries
│   │   └── supabase.ts # Supabase client + table helpers
│   └── store/
│       ├── plannerStore.ts  # Planner state (Zustand + localStorage persist)
│       └── authStore.ts     # Auth state (Zustand, no persist)
├── studio/             # Sanity Studio (separate Vite app inside the monorepo)
│   ├── schemaTypes/
│   │   ├── article.ts
│   │   └── glossaryTerm.ts
│   ├── sanity.config.ts
│   └── sanity.cli.ts   # gitignored
├── scripts/
│   └── generate-sitemap.mjs  # Runs before build, fetches articles from Sanity
├── public/
│   └── sitemap.xml     # Overwritten by generate-sitemap.mjs on every build
└── index.html          # GA4 script, fonts, PWA meta — no static <title> or <meta description>
```

---

## Routes

| URL | Component | Notes |
|---|---|---|
| `/` | `HomePage` | Landing page |
| `/plan` | `PlannerPage` | 6-step retirement planner |
| `/knowledge` | `LearnPage` | Article listing |
| `/knowledge/:slug` | `ArticlePage` | Article detail, fetches from Sanity by slug |
| `/calculators` | redirect | Redirects to `/calculators/sip-calculator` |
| `/calculators/sip-calculator` | `CalculatorsPage` | SIP Growth calculator |
| `/calculators/inflation-calculator` | `CalculatorsPage` | Inflation Reality calculator |
| `/calculators/fd-vs-mf-calculator` | `CalculatorsPage` | FD vs Mutual Fund calculator |
| `/glossary` | `GlossaryPage` | Static glossary (terms hardcoded in component) |
| `/faq` | `FAQPage` | 35 Q&As across 7 categories, details/summary accordions, JSON-LD FAQPage schema |
| `/about` | `AboutPage` | About page + feedback form |
| `/auth/callback` | `AuthCallback` | OAuth code exchange, always redirects away |
| `/account` | `AccountPage` | Auth-gated, shows saved plan summary |
| `/privacy` | `PrivacyPage` | Privacy policy |
| `/terms` | `TermsPage` | Terms of use |
| `/disclaimer` | `DisclaimerPage` | Disclaimer |
| `*` | `NotFoundPage` | 404 |

All routes are client-side. The Vite build outputs a standard SPA — the host must redirect all paths to `index.html`.

---

## Key Features

### Planner (`/plan`)
A 6-step wizard with two parallel tabs:
- **Tab 1** — Retirement corpus planning (Steps 1–4, then Step 5 Report → Step 6 Deploy → Step 7 Final)
- **Tab 2** — Kids goals planning (Steps 1–3, then Step 4 Kids → Step 5 Kids Invest → Step 6 Kids Deploy)

Steps:
1. Profile — name, current age, retirement age, life expectancy
2. Financial Picture — existing investments (quick/detailed), salary, additional income
3. Expenses — monthly + annual (quick/detailed breakdown)
4. SIP / Kids — SIP amount and growth mode (Tab 1) OR add kids with education/marriage goals (Tab 2)
5. Report / Kids Invest — corpus result with gap analysis (Tab 1) OR per-kid SIP requirements (Tab 2)
6. Deploy — allocate corpus into instruments (debt/equity) across retirement phases
7. Final — print-ready summary

State persists to `localStorage` under key `corpuscalc-plan-v2` via Zustand `persist` middleware. Only `state` is persisted (not UI state like `showErrors`).

### Math Engine (`src/lib/math.ts`)
All computation is pure TypeScript — no server round-trips. Key functions:
- `compute(S)` — main corpus calculation (Tab 1): grows existing investments, runs month-by-month SIP, computes required corpus using a multiplier (25×/30×/35× based on retirement duration)
- `computeTab2(S)` — Tab 2 variant using `retSipAmt`
- `calcSIPCorpus()` — month-by-month SIP with salary-linked or fixed annual step-up
- `simPhase(ph, instr)` — retirement phase simulation: debt principal constant, interest covers expenses, deficit drawn from equity then debt principal
- `buildPhases(S)` — auto-generates decade-by-decade retirement phases with inflation-adjusted defaults
- `kidGoalCalc()` / `calcAllKidGoals()` — future cost + SIP needed for each kid's UG/PG/marriage goals
- `parseAmt()` — accepts "2L", "50K", "1.5Cr", "rupees 500", commas, etc.
- `fmt()` — formats numbers as ₹ with Indian suffixes (Cr/L/K)

**Do not change math logic without verifying against known outputs.**

### Calculators (`/calculators/*`)
Three standalone calculators in a single `CalculatorsPage` component. Active tab is derived from the URL pathname — no `useState` for tab. Navigating between tabs calls `useNavigate`. Each tab has its own title, meta description, and canonical URL in Helmet.

### Articles (`/knowledge`)
Articles are stored in Sanity CMS. The `ArticlePage` fetches by slug via GROQ. Both Sanity-native articles and a legacy local fallback format (`LocalArticle`) are supported — the page tries Sanity first, falls back to a hardcoded local map.

### FAQ Page (`/faq`)
A static FAQ page with 35 Q&As organised into 7 categories:
1. **Retirement Planning Basics** (7 questions) — corpus size, 25x rule, how to calculate, how much to save
2. **FIRE and Early Retirement** (5 questions) — Lean/Fat/Barista FIRE, retiring at 40, FIRE investments
3. **SIP and Mutual Funds** (5 questions) — SIP amount, step-up SIP, expected returns, direct vs regular plans
4. **Inflation and Real Returns** (4 questions) — India inflation rate, real rate of return, healthcare inflation
5. **PPF, NPS, EPF and Tax Saving** (5 questions) — PPF vs NPS vs ELSS, 80CCD, EPF contribution
6. **Saving for Kids** (4 questions) — education costs, separate SIPs, marriage goal planning
7. **Using Your Corpus After Retirement** (5 questions) — bucket strategy, withdrawal rate, healthcare fund, longevity risk

Implementation details:
- Native `<details>`/`<summary>` HTML accordions — no JavaScript state, no third-party component
- Category jump-links rendered as pill-shaped anchor tags at the top
- JSON-LD `FAQPage` schema injected via `<script type="application/ld+json">` in Helmet (all 35 questions included)
- Full per-page SEO: `<title>`, `<meta name="description">`, `<meta name="robots" content="index, follow">`, `<link rel="canonical">`, `og:title`, `og:description`, `og:url`, `og:image`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- CTA block at the bottom links to `/plan`

### Feedback Form (`/about`)
Submits via `supabase.rpc('submit_feedback', { p_name, p_email, p_message })`. Name and email are required. Rate-limited client-side (1 submission per session via a flag).

---

## Supabase Tables

| Table | Purpose |
|---|---|
| `user_plans` | One row per user. Stores `user_id`, `inputs` (full planner state as JSON), `corpus_result` (number), `updated_at`. Upserted on conflict with `user_id`. |
| `visit_counter` | Single row (`id = 1`) with a `count` column. Incremented via `increment_visit_counter()` RPC on each `/plan` load. |
| `feedback` | Written via `submit_feedback(p_name, p_email, p_message)` RPC. RLS is enforced — the RPC is used instead of direct insert to respect row-level security. |

Auth uses Supabase Google OAuth. The `AuthCallback` page exchanges the OAuth code for a session and redirects to the pre-auth destination stored in `sessionStorage`.

---

## Sanity CMS

**Project ID:** `55cj92zk` | **Dataset:** `production`  
**Studio URL:** `https://corpuscalc.sanity.studio/`  
**API version used by client:** `2024-01-01`

### Document Types

**`article`** — Knowledge hub articles. Fields:
- `title`, `slug` (required), `excerpt` (max 200 chars), `readingTime`, `publishedAt`, `tags`
- `featuredImage` (image with `alt`), `youtubeVideos` (array of `{videoUrl, videoTitle, videoDescription}`)
- `body` — Portable Text array supporting `block`, `image`, and `table` (via `@sanity/table`)
- `ctaText`, `seoTitle` (max 60 chars), `seoDescription` (max 160 chars), `focusKeyword`
- `ogTitle`, `ogDescription`, `author`, `canonicalUrl`

**`glossaryTerm`** — Glossary entries. Fields: `term`, `letter`, `shortDefinition`, `fullDefinition` (Portable Text), `relatedLink`.  
Note: the Glossary page (`/glossary`) currently renders from a **hardcoded static array** in the component, not from Sanity. The schema exists for future use.

### Deploying the Studio
```bash
cd studio
npm install   # first time only
npx sanity deploy
```
`studio/sanity.cli.ts` is gitignored. Never commit it — it contains the deployment `appId`.

---

## Sitemap

`public/sitemap.xml` is **generated dynamically** at build time by `scripts/generate-sitemap.mjs`. It fetches all published articles from Sanity and combines them with static page entries. The file is then copied to `dist/sitemap.xml` by Vite automatically (standard `public/` handling).

**Static entries currently in sitemap:**
- `/` — `priority 1.0`, `changefreq daily`
- `/knowledge` — `priority 0.9`, `changefreq weekly`
- `/faq` — `priority 0.8`, `changefreq monthly`
- All Sanity articles — `priority 0.8`, `changefreq monthly`, `lastmod` from Sanity `publishedAt`

The build script is:
```json
"build": "node scripts/generate-sitemap.mjs && tsc -b && vite build"
```

To regenerate the sitemap without a full build:
```bash
node scripts/generate-sitemap.mjs
```

**Domain:** All sitemap URLs use `https://corpuscalc.com` (not `.in`).

---

## SEO Conventions

**Domain:** `https://corpuscalc.com` — used in all canonical URLs, og:url, og:image, and sitemap entries.

### index.html (site-wide fallbacks)
`index.html` has **no** static `<title>`, `<meta name="description">`, or `<link rel="canonical">` — react-helmet-async owns those per page. `index.html` does contain static site-wide fallback tags:
- `<meta name="keywords">`, `<meta name="author">`, `<meta name="robots" content="index, follow">`
- Open Graph: `og:type`, `og:url` (`https://corpuscalc.com`), `og:title`, `og:description`, `og:image` (`https://corpuscalc.com/og-image.png`), `og:image:width` (1200), `og:image:height` (628), `og:locale` (`en_IN`), `og:site_name`
- Twitter Card: `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`, `twitter:image`

### Per-page Helmet blocks
Every page implements its own full Helmet block with:
- `<title>` and `<meta name="description">`
- `<meta name="robots" content="index, follow">`
- `<link rel="canonical" href="https://corpuscalc.com/[path]">`
- `og:type`, `og:title`, `og:description`, `og:url`, `og:image`
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

### JSON-LD Structured Data
- `/faq` — `FAQPage` schema with all 35 questions as `Question`/`Answer` pairs, injected via `<script type="application/ld+json">` in the Helmet block
- Other pages: no JSON-LD currently (future candidates: `WebSite` on home, `Article` on knowledge articles)

### Article pages
Pull `seoTitle`/`seoDescription`/`ogTitle`/`ogDescription` from Sanity fields.

### Calculator sub-pages
Each has its own canonical URL (`/calculators/sip-calculator`, `/calculators/inflation-calculator`, `/calculators/fd-vs-mf-calculator`).

### Google Search Console status (as of April 2026)
8 pages indexed. `/faq` submitted for indexing. Not yet indexed pages are still being crawled.

---

## State Management Conventions

- **Planner state** lives entirely in `usePlannerStore` (Zustand). Update via `store.update({ field: value })`. Never mutate state directly.
- `PlannerState` is defined in `src/lib/math.ts` (co-located with the math that uses it).
- **Auth state** lives in `useAuthStore`. It initialises from the existing Supabase session and subscribes to `onAuthStateChange` for the app lifetime — the subscription is intentionally never unsubscribed.
- There is no React Context in this project. Global state = Zustand only.

---

## Styling Conventions

- **Tailwind utility classes** for layout/spacing/colours on the outer shell of pages.
- **Inline styles** for component-level styling (especially inside planner steps and calculators). This is intentional — the planner components were ported from a standalone HTML file and the inline style approach is preserved.
- **CSS variables** for fonts: `var(--font-body)` (DM Sans), `var(--font-display)` (Playfair Display).
- **Colour palette:** `#0f2318` (dark green, primary), `#e8622a` (orange, accent), `#F4C430` (yellow, highlight), `#16A34A` (positive/growth green).
- Do not mix Tailwind and inline styles on the same element.

---

## Performance

### Code Splitting / Lazy Loading
All 14 page components are lazy-loaded via `React.lazy()` in `src/App.tsx`:
`HomePage`, `PlannerPage`, `LearnPage`, `ArticlePage`, `CalculatorsPage`, `GlossaryPage`, `AboutPage`, `NotFoundPage`, `AuthCallback`, `AccountPage`, `PrivacyPage`, `TermsPage`, `DisclaimerPage`, `FAQPage`.

The `<Suspense>` fallback is a plain blank div — no spinner component:
```tsx
<Suspense fallback={<div style={{ minHeight: '100vh', background: '#f9f6f1' }} />}>
```
There is no `Spinner` component in the codebase — do not add one as a Suspense fallback.

### Font Loading
Fonts (DM Sans + Playfair Display) are loaded non-blocking via the preload pattern in `index.html`:
```html
<link rel="preload" href="https://fonts.googleapis.com/css2?..." as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="..."></noscript>
```
This prevents fonts from being render-blocking. Do not revert to a standard `<link rel="stylesheet">` for Google Fonts.

---

## Development Workflow

```bash
# Install dependencies
npm install

# Start dev server (port 5173, strictPort)
npm run dev

# Build (generates sitemap, TypeScript check, then Vite build)
npm run build

# Preview production build
npm run preview
```

The dev server runs on `http://localhost:5173`. Port is strict — if it's already in use the server will not start.

---

## Common Gotchas

- **`import.meta.env` vs `process.env`**: Vite injects `import.meta.env` at build time. Node scripts (e.g. `generate-sitemap.mjs`, `sanity.cli.ts`) run outside Vite and must use `process.env` or hardcoded fallbacks. Using `import.meta.env` in a Node script will silently fail.
- **Sanity drafts**: Documents with `_id` prefixed `drafts.` are drafts and will not appear in the public GROQ query `!(_id in path("drafts.**"))`. Publish in the Studio before they show on the site.
- **Planner math — corpus multiplier**: Required corpus = `annualExpensesAtRetirement × mult`, where `mult` is 25 (≤20yr retirement), 30 (≤30yr), or 35 (>30yr). The corpus is sized on **monthly expenses × 12 only** — yearly one-time expenses are handled separately in phase simulation.
- **Phase simulation**: Debt principal stays constant throughout a phase. Only interest income offsets expenses. Deficit is drawn from equity first, then debt principal. If both are exhausted the simulation stops early and reports `totUnf` (unfunded amount).
- **SIP growth modes**: `flat` = no step-up, `salary` = SIP grows at salary growth %, `fixed` = SIP increases by a fixed annual rupee amount.
- **Glossary data**: Currently hardcoded in `GlossaryPage.tsx`, not fetched from Sanity despite the schema existing.
- **`studio/sanity.cli.ts` is gitignored**: Do not commit it. It contains the deployment `appId`. The file must exist locally for `npx sanity deploy` to work.

---

## Work in Progress — Feature Status

### OG Tag Injection via Netlify Edge Function — STATUS: LIVE ✅

- **Problem:** `react-helmet-async` sets meta tags client-side. Bots don't execute JS so they were seeing homepage defaults from `index.html` for all article pages.
- **Solution:** Netlify Edge Function at `netlify/edge-functions/og-inject.ts`
- Intercepts `/knowledge/*` requests, detects bots by user-agent string
- Fetches article OG fields from Sanity REST API (no SDK needed in edge runtime)
- Injects 14 meta tags + `<title>` + `<meta name="description">` before `</head>` in the HTML
- Real users are unaffected — `context.next()` fires immediately for non-bots
- Verified working via: `curl -A "facebookexternalhit/1.1" [article-url]`
- Article-specific title, description, and featured image now correctly appear when sharing on WhatsApp, Twitter, LinkedIn, Facebook
- `netlify.toml` updated with `[[edge_functions]]` block for `/knowledge/*` path (placed after `[build.environment]`)

### YouTube Embed — STATUS: PAUSED

- Package `react-lite-youtube-embed` v3.5.1 is installed but unused
- `src/components/ui/YouTubeEmbed.tsx` exists with named export `YouTubeEmbed`
- Sanity GROQ query in `getArticleBySlug` already includes `youtubeVideos` in projection
- `ArticlePage.tsx` is fully reverted — no YouTube import, no JSX block
- **Root cause of failure:** Chrome service worker from production build was intercepting dev server requests and returning cached old bundle
- **Fix before next attempt:** Unregister service worker in Chrome DevTools → Application → Service Workers → Unregister `corpuscalc.com` scope, then clear site data for `localhost`, restart dev server, test in Incognito
- Three changes needed in `ArticlePage.tsx` when resuming (see `YOUTUBE_EMBED_SESSION_NOTES.md`)

### Social Share Buttons in ArticlePage — STATUS: NOT YET IMPLEMENTED

- `ShareSection` component exists but only has WhatsApp + Copy Link
- Needs upgrading to add Twitter/X and LinkedIn share buttons
- Needs to be placed in two locations: below article title and near bottom CTA
- Blocked on OG tags being correct first (now done ✅) — implement next session

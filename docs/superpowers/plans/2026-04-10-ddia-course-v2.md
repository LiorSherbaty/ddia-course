# DDIA Course v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the DDIA interview-prep study app with a voice-forward content system, a warm editorial visual identity with per-day accent colors, and a decomposed component architecture — without changing the stack (React + Vite + Tailwind, browser-only, `localStorage`).

**Architecture:** Extract the single-file `src/App.jsx` into `lib/`, `layout/`, `views/`, `blocks/`, `features/`, and `ui/` folders. Replace the CDN Tailwind with compiled Tailwind v4 via `@tailwindcss/vite` and a CSS-first `@theme` config. Add six new voice-forward block types and then rewrite the content of all 7 days to use them.

**Tech Stack:** React 18, Vite 5, Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first `@theme`), self-hosted fonts via `@fontsource/*`, `localStorage` with versioned keys.

**Execution notes for the implementer:**
- This is a personal tool — **no automated tests**. Verify each step by running `npm run dev` and looking at the browser.
- After every task ending in "Commit", stage only the files listed and write the exact commit message shown.
- Use the `src/App.jsx` line references in extraction tasks as the source of truth — copy the component verbatim, then only adjust imports/exports as instructed.
- Do not delete `src/App.jsx` during extraction — it becomes a thin shell at the end of Phase 2.
- Stay on `main`. No branches, no worktrees.

**Spec:** `docs/superpowers/specs/2026-04-10-ddia-course-v2-design.md`

---

## Phase 1 — Infrastructure

Goal: site builds and runs identically to today, but on compiled Tailwind v4, self-hosted fonts, and with empty target folders ready for extraction.

---

### Task 1: Install build dependencies

**Files:**
- Modify: `package.json` (via `npm install`)

- [ ] **Step 1: Install Tailwind v4 and the Vite plugin**

Run:
```bash
npm install -D tailwindcss@^4 @tailwindcss/vite@^4
```
Expected: `package.json` gains two devDependencies, no errors.

- [ ] **Step 2: Install self-hosted fonts**

Run:
```bash
npm install @fontsource/fraunces @fontsource/inter @fontsource/jetbrains-mono
```
Expected: `package.json` gains three dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add tailwind v4, vite plugin, and fontsource packages"
```

---

### Task 2: Wire `@tailwindcss/vite` into the build

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: Add the Tailwind plugin**

Replace the entire contents of `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

- [ ] **Step 2: Commit**

```bash
git add vite.config.js
git commit -m "build: wire @tailwindcss/vite plugin into vite config"
```

---

### Task 3: CSS-first Tailwind theme with the existing palette (no visual changes yet)

**Files:**
- Modify: `src/index.css`

We use Tailwind v4's CSS-first `@theme` directive. Phase 1 preserves the current blue palette and IBM Plex Sans exactly so the site looks unchanged. Phase 3 replaces these values.

- [ ] **Step 1: Replace the top of `src/index.css` with the Tailwind import and theme**

Open `src/index.css` and insert the following block **at the very top**, before the existing `*, *::before, *::after` rule:

```css
@import "tailwindcss";

@theme {
  --color-surface: #f3f8ff;
  --color-panel: #ffffff;
  --color-ink: #0f172a;
  --color-muted: #64748b;
  --color-faint: #dbeafe;
  --color-accent: #2563eb;
  --color-accent-soft: #e0f2fe;
  --color-accent-deep: #1d4ed8;
  --color-code: #0f172a;

  --font-display: "IBM Plex Sans", system-ui, sans-serif;
  --font-body: "IBM Plex Sans", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "Consolas", monospace;
}
```

Leave every existing rule in `src/index.css` untouched — they already use raw colors and will continue to work.

- [ ] **Step 2: Commit**

```bash
git add src/index.css
git commit -m "style: add tailwind @theme with existing palette for phase 1 parity"
```

---

### Task 4: Self-host fonts and remove CDN/Google Fonts references

**Files:**
- Create: `src/fonts.js`
- Modify: `src/main.jsx`
- Modify: `index.html`

- [ ] **Step 1: Create `src/fonts.js`**

```js
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

import '@fontsource/fraunces/400.css'
import '@fontsource/fraunces/500.css'
import '@fontsource/fraunces/600.css'
import '@fontsource/fraunces/700.css'

import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
```

(Phase 1 keeps IBM Plex Sans as the actual body font via the CSS theme variable above; Inter and Fraunces are pre-loaded here so Phase 3 can switch the font without another install step.)

- [ ] **Step 2: Import fonts from `src/main.jsx`**

At the very top of `src/main.jsx`, add:
```js
import './fonts'
```

- [ ] **Step 3: Remove the CDN script and Google Fonts links from `index.html`**

Open `index.html` and delete these lines entirely:
- `<script src="https://cdn.tailwindcss.com"></script>`
- `<link rel="preconnect" href="https://fonts.googleapis.com">`
- `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
- `<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">`
- The entire `<script>tailwind.config = { ... }</script>` block

After deletion, the `<head>` should contain only: charset, viewport, and title.

Also: install IBM Plex Sans for Phase 1 parity. Run:
```bash
npm install @fontsource/ibm-plex-sans
```
Then add to the top of `src/fonts.js`:
```js
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-sans/700.css'
```

- [ ] **Step 4: Verify parity**

Run:
```bash
npm run dev
```
Open the app. Verify: the site looks identical to before (blue palette, same layout, same fonts). Code blocks still render dark. Fonts still look like IBM Plex Sans.

Expected: identical appearance, but DevTools Network tab shows no requests to `cdn.tailwindcss.com` or `fonts.googleapis.com`.

- [ ] **Step 5: Commit**

```bash
git add src/fonts.js src/main.jsx index.html package.json package-lock.json
git commit -m "build: self-host fonts and remove tailwind CDN + google fonts links"
```

---

### Task 5: Create the empty target folder structure

**Files:**
- Create: `src/lib/.gitkeep`
- Create: `src/layout/.gitkeep`
- Create: `src/views/.gitkeep`
- Create: `src/blocks/.gitkeep`
- Create: `src/features/.gitkeep`
- Create: `src/ui/.gitkeep`

- [ ] **Step 1: Create the directories and placeholder files**

Run:
```bash
mkdir -p src/lib src/layout src/views src/blocks src/features src/ui
touch src/lib/.gitkeep src/layout/.gitkeep src/views/.gitkeep src/blocks/.gitkeep src/features/.gitkeep src/ui/.gitkeep
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/.gitkeep src/layout/.gitkeep src/views/.gitkeep src/blocks/.gitkeep src/features/.gitkeep src/ui/.gitkeep
git commit -m "chore: scaffold target folder structure for v2 extraction"
```

---

## Phase 2 — Component extraction

Goal: break `src/App.jsx` into the target folders with zero visual change. Every task ends with `npm run dev` + a visual check + a commit. Line ranges in each task refer to the **original** `src/App.jsx` (905 lines before Phase 2 begins). After earlier extractions those numbers drift — when line numbers no longer match, locate the component by its function name instead (e.g., `function Sidebar(`). After each extraction, remove the original block from `App.jsx` and re-import from the new location.

---

### Task 6: Extract `lib/storage.js` with v1→v2 migration

**Files:**
- Create: `src/lib/storage.js`
- Modify: `src/App.jsx` (remove lines 8–27, add import)

- [ ] **Step 1: Create `src/lib/storage.js`**

```js
const STORAGE_KEY_V2 = 'ddia_progress_v2'
const STORAGE_KEY_V1 = 'ddia_progress_v1'

export const defaultProgress = () => ({
  completedDays: [],
  labItems: {},
  quizAnswers: {},
  currentView: 'day-1',
  notes: {},
  questionNotes: {},
})

function migrateFromV1() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V1)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const merged = { ...defaultProgress(), ...parsed }
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(merged))
    return merged
  } catch {
    return null
  }
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2)
    if (raw) return { ...defaultProgress(), ...JSON.parse(raw) }
    const migrated = migrateFromV1()
    if (migrated) return migrated
    return defaultProgress()
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(p) {
  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(p))
  } catch {
    // localStorage full or disabled — fail silently, this is a personal tool
  }
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY_V2)
  // v1 key intentionally left in place as a safety net
}
```

Note: `questionNotes: {}` is a new field added proactively for the 25 Questions bug fix in Phase 7. Adding it here means no second migration is needed later.

- [ ] **Step 2: Delete the old storage block from `App.jsx` and import from `lib/storage`**

In `src/App.jsx`:
1. Delete lines 8–27 (the `STORAGE_KEY`, `defaultProgress`, `loadProgress`, `saveProgress` block, including the `// ─── localStorage ───` header comment).
2. Add this import near the top, directly under the `./data/labGuides` import:
```js
import { loadProgress, saveProgress, resetProgress } from './lib/storage'
```
3. The `Sidebar` component calls `localStorage.removeItem(STORAGE_KEY)` directly inside the Reset button (line 823). Replace that call:
```js
if (confirm('Reset all progress? This cannot be undone.')) {
  resetProgress(); window.location.reload()
}
```

- [ ] **Step 3: Verify**

Run `npm run dev`. Open the app. Check:
- Site loads.
- Progress is preserved (toggle a lab checkbox, reload — it persists).
- DevTools → Application → Local Storage shows a new `ddia_progress_v2` key. If you had a prior `ddia_progress_v1` key, both now exist with matching shapes.
- Reset Progress button in sidebar still clears `ddia_progress_v2`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/storage.js src/App.jsx
git commit -m "refactor: extract storage helpers to lib/storage with v1→v2 migration"
```

---

### Task 7: Extract `ui/Icons.jsx`

**Files:**
- Create: `src/ui/Icons.jsx`
- Modify: `src/App.jsx` (remove lines 29–59, add import)

- [ ] **Step 1: Create `src/ui/Icons.jsx` by copying lines 30–59 from the current `App.jsx`**

Copy the five icon components verbatim (`CheckIcon`, `CopyIcon`, `ChevronIcon`, `MenuIcon`, `CloseIcon`), wrap them in a module with `export` in front of each `const`:

```jsx
export const CheckIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

export const CopyIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

export const ChevronIcon = ({ open }) => (
  <svg className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180 text-sky-700' : 'text-slate-400'}`}
    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

export const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

export const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)
```

- [ ] **Step 2: Delete lines 29–59 from `App.jsx` and import from `ui/Icons`**

Add near the top of `App.jsx`:
```js
import { CheckIcon, CopyIcon, ChevronIcon, MenuIcon, CloseIcon } from './ui/Icons'
```

- [ ] **Step 3: Verify and commit**

Run `npm run dev`. Verify the sidebar toggle, copy buttons, and chevrons still render.
```bash
git add src/ui/Icons.jsx src/App.jsx
git commit -m "refactor: extract icon components to ui/Icons"
```

---

### Task 8: Extract UI primitives (`Card`, `SectionLabel`, `MetaChip`, `HeroNote`, `HeroStat`, `PageFrame`)

**Files:**
- Create: `src/ui/Card.jsx`
- Create: `src/ui/SectionLabel.jsx`
- Create: `src/ui/MetaChip.jsx`
- Create: `src/ui/HeroNote.jsx`
- Create: `src/ui/HeroStat.jsx`
- Create: `src/layout/PageFrame.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create each primitive file**

`src/ui/SectionLabel.jsx`:
```jsx
export default function SectionLabel({ children }) {
  return (
    <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">{children}</h3>
  )
}
```

`src/ui/Card.jsx`:
```jsx
export default function Card({ children, className = '' }) {
  return (
    <div className={`surface-panel rounded-[28px] p-5 sm:p-6 lg:p-7 ${className}`}>
      {children}
    </div>
  )
}
```

`src/layout/PageFrame.jsx`:
```jsx
export default function PageFrame({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 ${className}`}>
      {children}
    </div>
  )
}
```

`src/ui/MetaChip.jsx`:
```jsx
export default function MetaChip({ children }) {
  return (
    <span className="rounded-full border border-sky-200/80 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-800">
      {children}
    </span>
  )
}
```

`src/ui/HeroNote.jsx`:
```jsx
export default function HeroNote({ label, children }) {
  return (
    <div className="rounded-[24px] border border-white/80 bg-white/78 p-4 shadow-[0_14px_30px_rgba(148,163,184,0.08)]">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">{label}</p>
      <p className="text-sm leading-6 text-slate-600">{children}</p>
    </div>
  )
}
```

`src/ui/HeroStat.jsx`:
```jsx
export default function HeroStat({ label, value }) {
  return (
    <div className="rounded-[22px] border border-sky-100/80 bg-white/74 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  )
}
```

- [ ] **Step 2: Delete lines 408–456 from `App.jsx` and add imports**

Add to the top of `App.jsx`:
```js
import SectionLabel from './ui/SectionLabel'
import Card from './ui/Card'
import PageFrame from './layout/PageFrame'
import MetaChip from './ui/MetaChip'
import HeroNote from './ui/HeroNote'
import HeroStat from './ui/HeroStat'
```

Delete the original inline definitions in `App.jsx` (lines 408–456, including all six function declarations and their section comments).

- [ ] **Step 3: Verify and commit**

Run `npm run dev`. Every view should look identical. Check the sidebar, any day's hero, the card surfaces.
```bash
git add src/ui/SectionLabel.jsx src/ui/Card.jsx src/layout/PageFrame.jsx src/ui/MetaChip.jsx src/ui/HeroNote.jsx src/ui/HeroStat.jsx src/App.jsx
git commit -m "refactor: extract UI primitives into ui/ and layout/PageFrame"
```

---

### Task 9: Extract `features/SpeakTimer.jsx`

**Files:**
- Create: `src/features/SpeakTimer.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/features/SpeakTimer.jsx`**

Copy the body of `SpeakTimer` from `App.jsx` lines 62–133 verbatim into the new file. Add at the top:
```jsx
import { useState, useEffect, useRef } from 'react'

export default function SpeakTimer({ minutes }) {
```
and close with `}` at the end. (Replace the existing `function SpeakTimer({ minutes }) {` declaration.)

- [ ] **Step 2: Delete lines 61–133 from `App.jsx` and import from `features/SpeakTimer`**

Add to `App.jsx`:
```js
import SpeakTimer from './features/SpeakTimer'
```

- [ ] **Step 3: Verify and commit**

Run `npm run dev`. Navigate to any day, scroll to "Speak It Out Loud", click Start/Pause/Reset. All three must work.
```bash
git add src/features/SpeakTimer.jsx src/App.jsx
git commit -m "refactor: extract SpeakTimer to features/"
```

---

### Task 10: Extract `blocks/CodeBlock.jsx`

**Files:**
- Create: `src/blocks/CodeBlock.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/blocks/CodeBlock.jsx`**

```jsx
import { useState } from 'react'
import { CopyIcon } from '../ui/Icons'

export default function CodeBlock({ lang, code, label, wrap = false }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600) })
  }
  return (
    <div className="code-block my-4 overflow-hidden rounded-[24px] border border-slate-800/70">
      <div className="code-header">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-sky-100/80">{label || lang}</span>
        <button onClick={copy}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            copied ? 'bg-sky-500/20 text-sky-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}>
          <CopyIcon /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={wrap ? 'wrap-code' : ''}>{code}</pre>
    </div>
  )
}
```

- [ ] **Step 2: Delete lines 136–155 from `App.jsx` and import from `blocks/CodeBlock`**

Add to `App.jsx`:
```js
import CodeBlock from './blocks/CodeBlock'
```

- [ ] **Step 3: Verify and commit**

Run `npm run dev`. Open any day with code snippets (Day 1–6 all have some). The copy button must copy; pressing it should show "Copied" briefly.
```bash
git add src/blocks/CodeBlock.jsx src/App.jsx
git commit -m "refactor: extract CodeBlock to blocks/"
```

---

### Task 11: Extract all existing block components and the `ContentBlock` dispatcher

**Files:**
- Create: `src/blocks/TextBlock.jsx`
- Create: `src/blocks/SubheadingBlock.jsx`
- Create: `src/blocks/InterviewQuoteBlock.jsx`
- Create: `src/blocks/SayBlock.jsx`
- Create: `src/blocks/DontBlock.jsx`
- Create: `src/blocks/CalloutBlock.jsx`
- Create: `src/blocks/RadworkBlock.jsx`
- Create: `src/blocks/ListBlock.jsx`
- Create: `src/blocks/NumberedListBlock.jsx`
- Create: `src/blocks/TableBlock.jsx`
- Create: `src/blocks/ContentBlock.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create each block file**

Each file takes the exact JSX that currently lives inside the matching `case` arm in `App.jsx` lines 158–247. The pattern: each component accepts a `block` prop and returns the same JSX as the current case arm. Example:

`src/blocks/TextBlock.jsx`:
```jsx
export default function TextBlock({ block }) {
  return <p className="mb-3 text-[15px] leading-7 text-slate-600">{block.text}</p>
}
```

`src/blocks/SubheadingBlock.jsx`:
```jsx
export default function SubheadingBlock({ block }) {
  return <h4 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">{block.text}</h4>
}
```

`src/blocks/InterviewQuoteBlock.jsx`:
```jsx
export default function InterviewQuoteBlock({ block }) {
  return (
    <div className="my-4 rounded-[24px] border border-sky-200 bg-sky-50/80 px-5 py-4">
      <p className="text-[15px] italic leading-7 text-sky-900 whitespace-pre-line">{block.text}</p>
    </div>
  )
}
```

`src/blocks/SayBlock.jsx`:
```jsx
export default function SayBlock({ block }) {
  return (
    <div className="my-3 flex gap-3 rounded-[22px] border border-sky-200 bg-white/90 px-4 py-3">
      <span className="mt-0.5 flex-shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700">Say</span>
      <span className="text-[15px] italic leading-7 text-slate-700">"{block.text}"</span>
    </div>
  )
}
```

`src/blocks/DontBlock.jsx`:
```jsx
export default function DontBlock({ block }) {
  return (
    <div className="my-3 flex gap-3 rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-3">
      <span className="mt-0.5 flex-shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Avoid</span>
      <span className="text-[15px] italic leading-7 text-slate-700">"{block.text}"</span>
    </div>
  )
}
```

`src/blocks/CalloutBlock.jsx`:
```jsx
export default function CalloutBlock({ block }) {
  return (
    <div className="my-4 rounded-[22px] border border-sky-200 bg-sky-100/75 px-4 py-3">
      <p className="font-mono text-sm leading-7 text-sky-900 whitespace-pre-line">{block.text}</p>
    </div>
  )
}
```

`src/blocks/RadworkBlock.jsx`:
```jsx
export default function RadworkBlock({ block }) {
  return (
    <div className="my-4 rounded-[22px] border border-sky-100 bg-white/85 px-4 py-3">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">RadWork Transfer</p>
      <p className="text-[15px] leading-7 text-slate-600">{block.text}</p>
    </div>
  )
}
```

`src/blocks/ListBlock.jsx`:
```jsx
export default function ListBlock({ block }) {
  return (
    <ul className="my-3 space-y-2.5">
      {block.items.map((item, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-500" />
          <span className="text-[15px] leading-7 text-slate-600">{item}</span>
        </li>
      ))}
    </ul>
  )
}
```

`src/blocks/NumberedListBlock.jsx`:
```jsx
export default function NumberedListBlock({ block }) {
  return (
    <ol className="my-3 space-y-3">
      {block.items.map((item, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">{i + 1}</span>
          <span className="text-[15px] leading-7 text-slate-600">{item}</span>
        </li>
      ))}
    </ol>
  )
}
```

`src/blocks/TableBlock.jsx`:
```jsx
export default function TableBlock({ block }) {
  return (
    <div className="my-4 overflow-x-auto rounded-[24px] border border-sky-100 bg-white/80">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-sky-50/90">
            {block.headers.map((h, i) => (
              <th key={i} className="border-b border-sky-100 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-800">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white/80' : 'bg-sky-50/40'}>
              {row.map((cell, j) => (
                <td key={j} className="border-b border-sky-50 px-4 py-3 align-top text-[15px] leading-7 text-slate-600">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Create the dispatcher `src/blocks/ContentBlock.jsx`**

```jsx
import TextBlock from './TextBlock'
import SubheadingBlock from './SubheadingBlock'
import InterviewQuoteBlock from './InterviewQuoteBlock'
import SayBlock from './SayBlock'
import DontBlock from './DontBlock'
import CalloutBlock from './CalloutBlock'
import RadworkBlock from './RadworkBlock'
import ListBlock from './ListBlock'
import NumberedListBlock from './NumberedListBlock'
import TableBlock from './TableBlock'
import CodeBlock from './CodeBlock'

const REGISTRY = {
  text: TextBlock,
  subheading: SubheadingBlock,
  'interview-quote': InterviewQuoteBlock,
  say: SayBlock,
  dont: DontBlock,
  callout: CalloutBlock,
  radwork: RadworkBlock,
  list: ListBlock,
  'numbered-list': NumberedListBlock,
  table: TableBlock,
  code: CodeBlockAdapter,
}

function CodeBlockAdapter({ block }) {
  return <CodeBlock lang={block.lang} code={block.code} label={block.label} />
}

export default function ContentBlock({ block, dayId }) {
  const Component = REGISTRY[block.type]
  if (!Component) return null
  return <Component block={block} dayId={dayId} />
}
```

Note: `dayId` is passed through to every block even though the existing blocks ignore it. The new blocks in Phase 4 (`mental-model`, `echo`) will use it to pick accent colors.

- [ ] **Step 3: Delete lines 158–247 from `App.jsx` and import `ContentBlock`**

Add to `App.jsx`:
```js
import ContentBlock from './blocks/ContentBlock'
```

Also update the `DayView` call site (currently line 516):
```jsx
{sec.blocks.map((block, i) => <ContentBlock key={i} block={block} dayId={day.id} />)}
```

- [ ] **Step 4: Verify and commit**

Run `npm run dev`. Open every day 1–7 and scroll through each section. Every existing block type must render identically: text, subheadings, interview-quote, say, dont, callout, radwork, list, numbered-list, table, code.

```bash
git add src/blocks/ src/App.jsx
git commit -m "refactor: extract all block types into blocks/ and add ContentBlock dispatcher"
```

---

### Task 12: Extract `features/QuizSection.jsx`

**Files:**
- Create: `src/features/QuizSection.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/features/QuizSection.jsx`**

```jsx
import { ChevronIcon } from '../ui/Icons'
import { saveProgress } from '../lib/storage'

export default function QuizSection({ quiz, dayId, progress, setProgress }) {
  const toggle = (i) => {
    const key = `${dayId}-${i}`
    setProgress(p => {
      const updated = { ...p, quizAnswers: { ...p.quizAnswers, [key]: !p.quizAnswers[key] } }
      saveProgress(updated); return updated
    })
  }
  return (
    <div className="space-y-2.5">
      {quiz.map((item, i) => {
        const open = !!progress.quizAnswers[`${dayId}-${i}`]
        return (
          <div key={i} className={`overflow-hidden rounded-[22px] border transition-colors ${open ? 'border-sky-200 bg-sky-50/80' : 'border-sky-100 bg-white/80'}`}>
            <button onClick={() => toggle(i)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left">
              <span className="pr-4 text-sm leading-6 text-slate-700">
                <span className="mr-2 font-mono text-xs text-sky-600">Q{i + 1}</span>
                {item.q}
              </span>
              <ChevronIcon open={open} />
            </button>
            {open && (
              <div className="fade-in border-t border-sky-100 px-4 py-3">
                <p className="text-sm leading-7 text-slate-600">{item.a}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Delete lines 249–282 from `App.jsx`, add import**

```js
import QuizSection from './features/QuizSection'
```

- [ ] **Step 3: Verify and commit**

Run `npm run dev`. On any day, expand/collapse quiz items. Verify open state persists on reload.
```bash
git add src/features/QuizSection.jsx src/App.jsx
git commit -m "refactor: extract QuizSection to features/"
```

---

### Task 13: Extract `features/LabChecklist.jsx`

**Files:**
- Create: `src/features/LabChecklist.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/features/LabChecklist.jsx`**

```jsx
import { CheckIcon } from '../ui/Icons'
import { saveProgress } from '../lib/storage'

export default function LabChecklist({ lab, dayId, progress, setProgress }) {
  const toggle = (i) => {
    const key = `${dayId}-${i}`
    setProgress(p => {
      const updated = { ...p, labItems: { ...p.labItems, [key]: !p.labItems[key] } }
      saveProgress(updated); return updated
    })
  }
  const done = lab.filter((_, i) => progress.labItems[`${dayId}-${i}`]).length

  return (
    <div>
      <p className="mb-3 text-xs font-medium text-slate-500">{done}/{lab.length} complete</p>
      <div className="space-y-3">
        {lab.map((item, i) => {
          const checked = !!progress.labItems[`${dayId}-${i}`]
          return (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <div onClick={() => toggle(i)} className={`mt-0.5 flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded transition-all ${checked ? 'pop-in bg-sky-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)]' : 'border-2 border-sky-200 bg-white group-hover:border-sky-400'}`}>
                {checked && <CheckIcon />}
              </div>
              <span className={`text-sm leading-7 transition-colors ${checked ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{item}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Delete lines 284–313 from `App.jsx`, add import**

```js
import LabChecklist from './features/LabChecklist'
```

- [ ] **Step 3: Verify and commit**

Run `npm run dev`. Toggle checklist items on any day. Verify the counter updates and state persists.
```bash
git add src/features/LabChecklist.jsx src/App.jsx
git commit -m "refactor: extract LabChecklist to features/"
```

---

### Task 14: Extract `features/LabGuide.jsx`

**Files:**
- Create: `src/features/LabGuide.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/features/LabGuide.jsx`**

```jsx
import { useState } from 'react'
import { ChevronIcon } from '../ui/Icons'
import CodeBlock from '../blocks/CodeBlock'
import SectionLabel from '../ui/SectionLabel'
import { LAB_GUIDES } from '../data/labGuides'

export default function LabGuide({ dayId }) {
  const guide = LAB_GUIDES[dayId]
  const [openTask, setOpenTask] = useState(null)

  if (!guide) return null

  return (
    <div className="mt-6 border-t border-sky-100 pt-6">
      <SectionLabel>Step-by-Step Guide</SectionLabel>
      <div className="space-y-2.5">
        {guide.map((item, ti) => {
          const isOpen = openTask === ti
          return (
            <div key={ti} className="overflow-hidden rounded-[22px] border border-sky-100 bg-white/70">
              <button
                onClick={() => setOpenTask(isOpen ? null : ti)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-sky-50/70"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">{ti + 1}</span>
                <span className="flex-1 text-sm font-medium text-slate-700">{item.task}</span>
                <ChevronIcon open={isOpen} />
              </button>
              {isOpen && (
                <div className="fade-in border-t border-sky-100 bg-sky-50/35 px-4 pb-4 pt-2">
                  {item.steps.map((step, si) => (
                    <div key={si} className="mt-4 first:mt-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-white px-2 py-1 font-mono text-[11px] font-semibold text-sky-700">{ti + 1}.{si + 1}</span>
                        <h5 className="text-sm font-semibold text-slate-800">{step.title}</h5>
                      </div>
                      {step.text && <p className="mb-2 text-sm leading-7 text-slate-600 whitespace-pre-line">{step.text}</p>}
                      {step.code && <CodeBlock lang={step.lang || 'text'} code={step.code} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Delete lines 315–358 from `App.jsx`, remove the unused `LAB_GUIDES` import at the top, add new import**

Remove line 6 in `App.jsx`:
```js
import { LAB_GUIDES } from './data/labGuides'
```

Add:
```js
import LabGuide from './features/LabGuide'
```

- [ ] **Step 3: Verify and commit**

Run `npm run dev`. On any day, expand the lab guide accordion steps. Code blocks inside steps must still render.
```bash
git add src/features/LabGuide.jsx src/App.jsx
git commit -m "refactor: extract LabGuide to features/"
```

---

### Task 15: Extract `features/ClaudePrompts.jsx` and `features/NotesSection.jsx`

**Files:**
- Create: `src/features/ClaudePrompts.jsx`
- Create: `src/features/NotesSection.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/features/ClaudePrompts.jsx`**

```jsx
import { useState } from 'react'
import { CopyIcon } from '../ui/Icons'

export default function ClaudePrompts({ prompts }) {
  const [copied, setCopied] = useState(null)
  const copy = (text, i) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(i); setTimeout(() => setCopied(null), 1500) })
  }
  return (
    <div className="space-y-3">
      {prompts.map((p, i) => (
        <div key={i} className="rounded-[24px] border border-sky-100 bg-white/80 p-4">
          <p className="mb-4 font-mono text-sm leading-7 text-slate-600">{p}</p>
          <button onClick={() => copy(p, i)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${copied === i ? 'bg-sky-100 text-sky-800' : 'border border-sky-200 bg-white text-slate-600 hover:border-sky-300 hover:text-slate-900'}`}>
            <CopyIcon /> {copied === i ? 'Copied' : 'Copy prompt'}
          </button>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/features/NotesSection.jsx`**

```jsx
import { saveProgress } from '../lib/storage'

export default function NotesSection({ dayId, progress, setProgress }) {
  const val = progress.notes[dayId] || ''
  const onChange = (e) => {
    setProgress(p => {
      const updated = { ...p, notes: { ...p.notes, [dayId]: e.target.value } }
      saveProgress(updated); return updated
    })
  }
  const TEMPLATE = `Day: ${dayId}\nTopic:\n\nWhat problem is this topic solving?\n\nWhat are the 3 most important trade-offs?\n\nWhat would I say in an interview?\n\nWhat would I build in .NET?\n\nWhat can go wrong?\n\nWhat is still unclear to me?`

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-500">Auto-saved locally</span>
        {!val && (
          <button onClick={() => onChange({ target: { value: TEMPLATE } })}
            className="text-xs font-semibold text-sky-700 transition-colors hover:text-sky-900">
            Use template
          </button>
        )}
      </div>
      <textarea value={val} onChange={onChange} rows={10} placeholder="Write your notes here..." />
    </div>
  )
}
```

- [ ] **Step 3: Delete lines 360–406 from `App.jsx` and add imports**

```js
import ClaudePrompts from './features/ClaudePrompts'
import NotesSection from './features/NotesSection'
```

- [ ] **Step 4: Verify and commit**

Run `npm run dev`. On any day:
- Click "Copy prompt" — clipboard fills, label flips to "Copied".
- Type in the Notes textarea — reload, text persists.
- With empty notes, click "Use template" — template text appears.

```bash
git add src/features/ClaudePrompts.jsx src/features/NotesSection.jsx src/App.jsx
git commit -m "refactor: extract ClaudePrompts and NotesSection to features/"
```

---

### Task 16: Extract `views/DayView.jsx`

**Files:**
- Create: `src/views/DayView.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/views/DayView.jsx`**

Copy the `DayView` function body from `App.jsx` lines 459–556 verbatim. At the top of the new file add these imports:

```jsx
import { DAYS } from '../data/course'
import { CheckIcon } from '../ui/Icons'
import { saveProgress } from '../lib/storage'
import Card from '../ui/Card'
import PageFrame from '../layout/PageFrame'
import SectionLabel from '../ui/SectionLabel'
import MetaChip from '../ui/MetaChip'
import HeroNote from '../ui/HeroNote'
import HeroStat from '../ui/HeroStat'
import ContentBlock from '../blocks/ContentBlock'
import SpeakTimer from '../features/SpeakTimer'
import LabChecklist from '../features/LabChecklist'
import LabGuide from '../features/LabGuide'
import ClaudePrompts from '../features/ClaudePrompts'
import QuizSection from '../features/QuizSection'
import NotesSection from '../features/NotesSection'

export default function DayView({ day, progress, setProgress }) {
  // ...body unchanged from App.jsx lines 460–555...
}
```

Replace `function DayView(...)` with `export default function DayView(...)`.

- [ ] **Step 2: Delete lines 458–556 from `App.jsx` and import `DayView`**

```js
import DayView from './views/DayView'
```

- [ ] **Step 3: Verify and commit**

Run `npm run dev`. Open each of Day 1–7. Hero, sections, lab, speak timer, quiz, prompts, notes all render.
```bash
git add src/views/DayView.jsx src/App.jsx
git commit -m "refactor: extract DayView to views/"
```

---

### Task 17: Extract `views/MemoryMapView.jsx`, `views/InterviewQuestionsView.jsx`, `views/OneDayCrashView.jsx`

**Files:**
- Create: `src/views/MemoryMapView.jsx`
- Create: `src/views/InterviewQuestionsView.jsx`
- Create: `src/views/OneDayCrashView.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/views/MemoryMapView.jsx`**

Copy the body from `App.jsx` lines 559–598. Add imports:
```jsx
import { DAYS, MEMORY_MAP } from '../data/course'
import Card from '../ui/Card'
import PageFrame from '../layout/PageFrame'
import MetaChip from '../ui/MetaChip'
import HeroNote from '../ui/HeroNote'
import HeroStat from '../ui/HeroStat'

export default function MemoryMapView() {
  // ...body unchanged from App.jsx lines 560–597...
}
```

- [ ] **Step 2: Create `src/views/InterviewQuestionsView.jsx`**

Copy the body from `App.jsx` lines 601–682. Add imports:
```jsx
import { useState } from 'react'
import { INTERVIEW_QUESTIONS, STRONGER_ANSWERS } from '../data/course'
import { CheckIcon, ChevronIcon } from '../ui/Icons'
import { saveProgress } from '../lib/storage'
import Card from '../ui/Card'
import PageFrame from '../layout/PageFrame'
import SectionLabel from '../ui/SectionLabel'
import MetaChip from '../ui/MetaChip'
import HeroNote from '../ui/HeroNote'
import HeroStat from '../ui/HeroStat'

export default function InterviewQuestionsView({ progress, setProgress }) {
  // ...body unchanged from App.jsx lines 602–681...
}
```

Note: the textarea bug on line 660 (`<textarea rows={3} placeholder="Key points..." className="text-sm" />` missing `value`/`onChange`) stays broken in this extraction. It is fixed in Task 42 during the bonus views pass. Leave it as-is here so this task remains a pure extraction.

- [ ] **Step 3: Create `src/views/OneDayCrashView.jsx`**

Copy the body from `App.jsx` lines 685–742. Add imports:
```jsx
import { useState } from 'react'
import { ONE_DAY_TOPICS, MEGA_PROMPT } from '../data/course'
import { CopyIcon } from '../ui/Icons'
import Card from '../ui/Card'
import PageFrame from '../layout/PageFrame'
import SectionLabel from '../ui/SectionLabel'
import MetaChip from '../ui/MetaChip'
import HeroNote from '../ui/HeroNote'
import HeroStat from '../ui/HeroStat'
import CodeBlock from '../blocks/CodeBlock'

export default function OneDayCrashView() {
  // ...body unchanged from App.jsx lines 686–741...
}
```

- [ ] **Step 4: Delete lines 558–742 from `App.jsx` and add imports**

```js
import MemoryMapView from './views/MemoryMapView'
import InterviewQuestionsView from './views/InterviewQuestionsView'
import OneDayCrashView from './views/OneDayCrashView'
```

- [ ] **Step 5: Verify and commit**

Run `npm run dev`. Navigate to Memory Map, 25 Questions (check the checkbox + expand a question), and One Day Plan (copy the mega prompt). All three views render and interact as before.
```bash
git add src/views/MemoryMapView.jsx src/views/InterviewQuestionsView.jsx src/views/OneDayCrashView.jsx src/App.jsx
git commit -m "refactor: extract MemoryMap, InterviewQuestions, OneDayCrash views"
```

---

### Task 18: Extract `layout/Sidebar.jsx` and `layout/MobileHeader.jsx`; slim `App.jsx` to a shell

**Files:**
- Create: `src/layout/Sidebar.jsx`
- Create: `src/layout/MobileHeader.jsx`
- Create: `src/layout/AppShell.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/layout/Sidebar.jsx`**

Locate the `Sidebar` function in `App.jsx` by searching for `function Sidebar(`. Copy its entire body verbatim into the new file. It already calls `resetProgress()` because Task 6 updated it earlier. At the top of the new file add:

```jsx
import { DAYS } from '../data/course'
import { CloseIcon } from '../ui/Icons'
import { resetProgress } from '../lib/storage'

export default function Sidebar({ currentView, setView, progress, mobileOpen, setMobileOpen }) {
  // ...body copied verbatim from App.jsx...
}
```

- [ ] **Step 2: Create `src/layout/MobileHeader.jsx`**

```jsx
import { MenuIcon } from '../ui/Icons'

export default function MobileHeader({ onOpen }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/70 bg-white/70 px-4 py-3 backdrop-blur-xl lg:hidden">
      <button onClick={onOpen} className="rounded-full border border-sky-100 bg-white/80 p-2 text-slate-600 transition-colors hover:border-sky-200 hover:text-slate-900">
        <MenuIcon />
      </button>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">DDIA Course</p>
        <h1 className="text-sm font-semibold text-slate-800">System Design Interview Prep</h1>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Create `src/layout/AppShell.jsx`**

```jsx
import { useRef } from 'react'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'

export default function AppShell({ currentView, setView, progress, mobileOpen, setMobileOpen, children }) {
  const mainRef = useRef(null)

  return (
    <div className="app-shell flex min-h-screen">
      <Sidebar currentView={currentView} setView={setView} progress={progress}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader onOpen={() => setMobileOpen(true)} />
        <main ref={mainRef} className="content-scroll flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Replace `src/App.jsx` entirely with the slim shell**

Overwrite `src/App.jsx` with:

```jsx
import { useState, useCallback } from 'react'
import { DAYS } from './data/course'
import { loadProgress, saveProgress } from './lib/storage'
import AppShell from './layout/AppShell'
import DayView from './views/DayView'
import MemoryMapView from './views/MemoryMapView'
import InterviewQuestionsView from './views/InterviewQuestionsView'
import OneDayCrashView from './views/OneDayCrashView'

export default function App() {
  const [progress, setProgress] = useState(loadProgress)
  const [mobileOpen, setMobileOpen] = useState(false)
  const currentView = progress.currentView || 'day-1'

  const setView = useCallback((view) => {
    setProgress(p => {
      const updated = { ...p, currentView: view }
      saveProgress(updated); return updated
    })
    window.scrollTo(0, 0)
  }, [])

  const renderView = () => {
    if (currentView.startsWith('day-')) {
      const day = DAYS.find(d => d.id === parseInt(currentView.replace('day-', '')))
      if (day) return <DayView day={day} progress={progress} setProgress={setProgress} />
    }
    if (currentView === 'memory-map') return <MemoryMapView />
    if (currentView === 'interview-qs') return <InterviewQuestionsView progress={progress} setProgress={setProgress} />
    if (currentView === 'crash') return <OneDayCrashView />
    return null
  }

  return (
    <AppShell currentView={currentView} setView={setView} progress={progress}
      mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}>
      {renderView()}
    </AppShell>
  )
}
```

- [ ] **Step 5: Verify and commit**

Run `npm run dev`. Full smoke test:
- Click through all 7 days in the sidebar.
- Toggle a day-complete button.
- Expand a quiz question, a lab guide step.
- Check a lab item.
- Write a note, reload, verify it persists.
- Navigate to Memory Map, 25 Questions, One Day Plan.
- Resize to mobile width, open/close the sidebar via the menu button.

Confirm `src/App.jsx` is under 60 lines.

```bash
git add src/layout/Sidebar.jsx src/layout/MobileHeader.jsx src/layout/AppShell.jsx src/App.jsx
git commit -m "refactor: extract Sidebar, MobileHeader, AppShell and slim App.jsx to shell"
```

---

## Phase 3 — Visual system

Goal: swap the cool blue palette for warm cream + deep teal + burnt amber, switch fonts to Fraunces + Inter, add per-day accent colors, rework the day hero, and warm up code blocks. Content is unchanged in this phase.

---

### Task 19: Swap the Tailwind `@theme` palette to v2 colors and fonts

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace the `@theme` block with the v2 values**

In `src/index.css`, find the `@theme { ... }` block added in Task 3 and replace it entirely with:

```css
@theme {
  --color-surface: #faf7f2;
  --color-panel: #ffffff;
  --color-ink: #1a1714;
  --color-muted: #6b6458;
  --color-faint: #e8e1d4;
  --color-accent: #0d5f5f;
  --color-accent-deep: #094949;
  --color-accent-soft: #e8f0ee;
  --color-amber: #d97844;
  --color-amber-deep: #b85d29;
  --color-code: #1f1c1a;

  --color-day-1: #0d5f5f;
  --color-day-2: #5a6b3f;
  --color-day-3: #d97844;
  --color-day-4: #8b2e2e;
  --color-day-5: #3e3e7a;
  --color-day-6: #a0572f;
  --color-day-7: #b08a2c;

  --font-display: "Fraunces", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "Consolas", monospace;
}
```

Do not touch any other rule in `index.css` yet — the site will temporarily look broken (blue classes will no longer exist in the theme but old hex-coded rules still apply). This is expected and gets fixed in Tasks 20–22.

- [ ] **Step 2: Verify and commit**

Run `npm run dev`. Load any page. Do not fix the broken appearance yet. Confirm the server compiles without errors.

```bash
git add src/index.css
git commit -m "style: replace @theme with warm cream + deep teal v2 palette"
```

---

### Task 20: Switch body font to Inter and display font to Fraunces

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Update the base font in `body`**

In `src/index.css`, find the `body { ... }` rule and change the font-family line:

From:
```css
font-family: 'IBM Plex Sans', system-ui, sans-serif;
```
To:
```css
font-family: 'Inter', system-ui, sans-serif;
```

Also change the `background` in the same `body` rule. Replace the existing radial/linear gradient with a single warm cream tone:

```css
background: #faf7f2;
```

And change `color: #0f172a;` to `color: #1a1714;`.

- [ ] **Step 2: Drop `::selection` tint to warm amber**

Replace:
```css
::selection {
  background: rgba(96, 165, 250, 0.22);
}
```
With:
```css
::selection {
  background: rgba(217, 120, 68, 0.22);
}
```

- [ ] **Step 3: Verify and commit**

Run `npm run dev`. Body text should now render in Inter. Background is flat warm cream. Selection highlight is warm amber.
```bash
git add src/index.css
git commit -m "style: switch body font to Inter and flatten background to warm cream"
```

---

### Task 21: Rewrite `index.css` surface and hero rules for the warm palette

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace the surface/hero rules**

Replace the `.app-shell::before`, `.surface-panel`, `.hero-panel::before`, and `.hero-orbit` rules with these warm-palette equivalents. Find each rule and replace it:

```css
.app-shell::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 18% 12%, rgba(255, 255, 255, 0.5), transparent 28%),
    radial-gradient(circle at 82% 14%, rgba(232, 225, 212, 0.45), transparent 24%);
}

.surface-panel {
  position: relative;
  background: #ffffff;
  border: 1px solid #e8e1d4;
  box-shadow: 0 14px 40px rgba(107, 100, 88, 0.08);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.hero-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 16% 22%, rgba(255, 255, 255, 0.9), transparent 30%),
    radial-gradient(circle at 88% 16%, rgba(232, 225, 212, 0.6), transparent 30%),
    linear-gradient(135deg, #ffffff 0%, #faf7f2 100%);
  pointer-events: none;
}

.hero-orbit {
  display: none;
}
```

(The `hero-orbit` glow is replaced by the oversized day numeral in Task 23, so we hide it here.)

- [ ] **Step 2: Warm up code block surface**

Find the `.code-block` rule and replace its background:

```css
.code-block {
  background: #1f1c1a;
}

.code-block pre {
  margin: 0;
  overflow-x: auto;
  background: linear-gradient(180deg, #1f1c1a 0%, #2a251f 100%);
  color: #f0e4d7;
  padding: 1.35rem 1.5rem;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 0.82rem;
  line-height: 1.8;
  white-space: pre;
  tab-size: 2;
}
```

And `.code-header`:
```css
.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, #1f1c1a 0%, #2a251f 100%);
  border-bottom: 1px solid rgba(232, 225, 212, 0.12);
  padding: 0.8rem 1rem;
}
```

- [ ] **Step 3: Warm up the scrollbar and selection tints**

Find `.sidebar-scroll::-webkit-scrollbar-thumb` and replace its `background` with `rgba(107, 100, 88, 0.4)`.
Find `.content-scroll::-webkit-scrollbar-thumb` and replace its `background` with `rgba(107, 100, 88, 0.35)`.

Find the `textarea` rule and replace the relevant lines:
- `border: 1px solid #e8e1d4;`
- `background: #ffffff;`
- `color: #1a1714;`

Find `textarea:focus` and replace:
- `border-color: #0d5f5f;`
- `box-shadow: 0 0 0 4px rgba(13, 95, 95, 0.12);`

Find `textarea::placeholder` and replace `color: #9a9386;`.

Find `.sidebar-overlay` and replace its background with `rgba(26, 23, 20, 0.35)`.

- [ ] **Step 4: Verify and commit**

Run `npm run dev`. The site is no longer blue — surfaces are cream/white, borders are warm, code blocks are warm dark. Many component-level blue classes (from JSX files) are still showing as Tailwind blue because they use `text-sky-700`, `bg-sky-100`, etc. Those get swept in Task 22.

```bash
git add src/index.css
git commit -m "style: rewrite surface, hero, code, and textarea rules for warm palette"
```

---

### Task 22: Sweep component-level blue Tailwind classes to the v2 palette

**Files:**
- Modify: every file under `src/blocks/`, `src/features/`, `src/layout/`, `src/ui/`, `src/views/`

The current components use hard-coded Tailwind blue classes: `text-sky-700`, `bg-sky-50`, `border-sky-200`, etc. We replace these with warm palette equivalents. This is a bulk edit but the rules are mechanical.

- [ ] **Step 1: Apply the following class mappings**

Do a project-wide find-and-replace inside `src/blocks`, `src/features`, `src/layout`, `src/ui`, `src/views` (do **not** touch `src/data/` or `src/index.css`). Apply each mapping exactly:

| Find | Replace with |
|---|---|
| `text-sky-700` | `text-[color:var(--color-accent)]` |
| `text-sky-800` | `text-[color:var(--color-accent-deep)]` |
| `text-sky-900` | `text-[color:var(--color-accent-deep)]` |
| `text-sky-600` | `text-[color:var(--color-accent)]` |
| `text-sky-500` | `text-[color:var(--color-amber)]` |
| `text-sky-100/80` | `text-[color:var(--color-faint)]` |
| `text-sky-100` | `text-[color:var(--color-faint)]` |
| `bg-sky-100` | `bg-[color:var(--color-accent-soft)]` |
| `bg-sky-50/80` | `bg-[color:var(--color-accent-soft)]/70` |
| `bg-sky-50/90` | `bg-[color:var(--color-accent-soft)]/80` |
| `bg-sky-50/65` | `bg-[color:var(--color-accent-soft)]/60` |
| `bg-sky-50/70` | `bg-[color:var(--color-accent-soft)]/60` |
| `bg-sky-50/40` | `bg-[color:var(--color-accent-soft)]/40` |
| `bg-sky-50/35` | `bg-[color:var(--color-accent-soft)]/35` |
| `bg-sky-50` | `bg-[color:var(--color-accent-soft)]` |
| `bg-sky-100/75` | `bg-[color:var(--color-accent-soft)]` |
| `bg-sky-600` | `bg-[color:var(--color-accent)]` |
| `bg-sky-700` | `bg-[color:var(--color-accent-deep)]` |
| `border-sky-100` | `border-[color:var(--color-faint)]` |
| `border-sky-100/80` | `border-[color:var(--color-faint)]` |
| `border-sky-200` | `border-[color:var(--color-accent)]/30` |
| `border-sky-200/80` | `border-[color:var(--color-accent)]/20` |
| `border-sky-300` | `border-[color:var(--color-accent)]/50` |
| `border-sky-600` | `border-[color:var(--color-accent)]` |
| `divide-sky-100` | `divide-[color:var(--color-faint)]` |
| `text-slate-900` | `text-[color:var(--color-ink)]` |
| `text-slate-800` | `text-[color:var(--color-ink)]` |
| `text-slate-700` | `text-[color:#2d2723]` |
| `text-slate-600` | `text-[color:var(--color-muted)]` |
| `text-slate-500` | `text-[color:var(--color-muted)]` |
| `text-slate-400` | `text-[color:#9a9386]` |
| `border-slate-200` | `border-[color:var(--color-faint)]` |
| `bg-slate-50/80` | `bg-[color:#f5efe3]` |
| `bg-slate-100` | `bg-[color:#f5efe3]` |
| `from-sky-400` | `from-[color:var(--color-amber)]` |
| `to-blue-600` | `to-[color:var(--color-accent)]` |
| `rgba(37,99,235,0.22)` | `rgba(13,95,95,0.22)` |
| `rgba(37,99,235,0.24)` | `rgba(13,95,95,0.24)` |
| `rgba(37,99,235,0.2)` | `rgba(13,95,95,0.2)` |
| `rgba(37,99,235,0.18)` | `rgba(13,95,95,0.18)` |

Apply literal string replacement across all matched JSX files. Accept that a few classes may already be gone (e.g., earlier blocks don't have all of them) — that's fine, just skip any that don't appear.

Grep check after replacement:
```bash
grep -rn "sky-" src/blocks src/features src/layout src/ui src/views
```
Expected: no matches (or only matches inside legitimate color-scheme CSS vars — review any remaining).

- [ ] **Step 2: Fix hardcoded hex colors inside `SpeakTimer`**

In `src/features/SpeakTimer.jsx`, find the two `<circle>` strokes:
- `stroke="#dbeafe"` → `stroke="#e8e1d4"`
- `stroke="#2563eb"` → `stroke="#0d5f5f"`

- [ ] **Step 3: Verify and commit**

Run `npm run dev`. The entire site should now read as warm cream + deep teal instead of blue. Open every view (7 days + 3 bonus) and visually confirm there are no stray blue remnants.

```bash
git add src/blocks src/features src/layout src/ui src/views
git commit -m "style: sweep component classes to warm palette CSS vars"
```

---

### Task 23: Create `lib/theme.js` with `getDayAccent`

**Files:**
- Create: `src/lib/theme.js`

- [ ] **Step 1: Create the file**

```js
const DAY_ACCENTS = {
  1: { hex: '#0d5f5f', name: 'Deep Teal', varName: '--color-day-1' },
  2: { hex: '#5a6b3f', name: 'Moss Green', varName: '--color-day-2' },
  3: { hex: '#d97844', name: 'Burnt Amber', varName: '--color-day-3' },
  4: { hex: '#8b2e2e', name: 'Oxblood', varName: '--color-day-4' },
  5: { hex: '#3e3e7a', name: 'Indigo', varName: '--color-day-5' },
  6: { hex: '#a0572f', name: 'Clay', varName: '--color-day-6' },
  7: { hex: '#b08a2c', name: 'Gold', varName: '--color-day-7' },
}

export function getDayAccent(dayId) {
  const id = parseInt(dayId, 10)
  return DAY_ACCENTS[id] || DAY_ACCENTS[1]
}

export function dayAccentStyle(dayId) {
  const { hex } = getDayAccent(dayId)
  return { '--day-accent': hex }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/theme.js
git commit -m "feat: add lib/theme with per-day accent color helpers"
```

---

### Task 24: Rework the day hero — oversized outlined numeral + per-day accent

**Files:**
- Modify: `src/views/DayView.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Add the hero numeral rule to `src/index.css`**

Append at the bottom of `src/index.css`:

```css
.hero-numeral {
  position: absolute;
  right: 1rem;
  top: 0.5rem;
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(10rem, 24vw, 18rem);
  font-weight: 700;
  letter-spacing: -0.06em;
  line-height: 0.8;
  color: transparent;
  -webkit-text-stroke: 2px var(--day-accent, #0d5f5f);
  pointer-events: none;
  user-select: none;
  opacity: 0.55;
}

.hero-accent-bar {
  display: inline-block;
  width: 2.5rem;
  height: 3px;
  background: var(--day-accent, #0d5f5f);
  margin-right: 0.75rem;
  vertical-align: middle;
}

.section-pip {
  background: var(--day-accent, #0d5f5f);
}
```

- [ ] **Step 2: Update `src/views/DayView.jsx` hero**

Add imports at the top:
```js
import { getDayAccent, dayAccentStyle } from '../lib/theme'
```

Inside `DayView`, wrap the returned `<PageFrame>` so the hero div has the per-day style. Replace the existing hero block:

```jsx
<div className="surface-panel hero-panel relative overflow-hidden rounded-[32px] p-6 sm:p-8 lg:p-10"
  style={dayAccentStyle(day.id)}>
  <div className="relative z-10 space-y-8">
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em]"
        style={{ color: getDayAccent(day.id).hex }}>
        <span className="hero-accent-bar" /> Day {day.id} of {DAYS.length}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <MetaChip>{day.chapters}</MetaChip>
        <MetaChip>{day.duration}</MetaChip>
        <MetaChip>{day.sections.length} sections</MetaChip>
      </div>
      <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[color:var(--color-ink)] sm:text-5xl">
        {day.shortTitle}
      </h1>
      <p className="mt-3 max-w-4xl font-display text-xl font-normal italic leading-snug text-[color:var(--color-muted)] sm:text-2xl">
        {day.title}
      </p>
      <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--color-muted)] sm:text-lg">{day.theme}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button onClick={markComplete}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${isComplete ? 'bg-[color:var(--color-accent)] text-white shadow-[0_14px_30px_rgba(13,95,95,0.22)] hover:bg-[color:var(--color-accent-deep)]' : 'border border-[color:var(--color-faint)] bg-white text-[color:#2d2723] hover:border-[color:var(--color-accent)]/40'}`}>
          {isComplete && <CheckIcon />}
          {isComplete ? 'Completed' : 'Mark day complete'}
        </button>
        <span className="text-sm text-[color:var(--color-muted)]">All notes, quiz opens, and lab progress save locally.</span>
      </div>
    </div>

    <div className="grid gap-3 md:max-w-3xl">
      <HeroNote label="What interviewers test">{day.interviewerTesting}</HeroNote>
      <HeroNote label="Target outcome">{day.outcome}</HeroNote>
      <div className="grid grid-cols-3 gap-3">
        <HeroStat label="Lab" value={day.lab.length} />
        <HeroStat label="Quiz" value={day.quiz.length} />
        <HeroStat label="Drill" value={`${day.speakDrill.minutes}m`} />
      </div>
    </div>
  </div>
  <div className="hero-numeral" aria-hidden="true">
    {String(day.id).padStart(2, '0')}
  </div>
</div>
```

Key changes: title is now split into `shortTitle` (display heading) and `title` (italic subtitle), the hero-orbit div is replaced by `hero-numeral`, and the `Day X of Y` label is prefixed with an accent bar.

- [ ] **Step 3: Add per-day section pip to section headers**

In `DayView.jsx`, find the `<div className="mb-5 flex flex-col gap-3 border-b border-sky-100 pb-5 ...">` section header (already swept to warm palette). Replace the pip chip. Current:
```jsx
<span className="inline-flex rounded-full bg-sky-100 px-3 py-1 font-mono text-xs font-semibold text-sky-700">{sec.id}</span>
```
Becomes:
```jsx
<span className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--day-accent,var(--color-accent))]">
  <span className="section-pip inline-block h-2 w-2 rounded-full" />
  {sec.id}
</span>
```

Also wrap the `sec.blocks.map(...)` parent with `style={dayAccentStyle(day.id)}` so the pip picks up the day's color:
```jsx
<div className="space-y-4" style={dayAccentStyle(day.id)}>
  {day.sections.map(sec => (...))}
</div>
```

- [ ] **Step 4: Verify and commit**

Run `npm run dev`. Open each day:
- Day 1's hero numeral should outline in deep teal.
- Day 2 in moss green.
- Day 3 in burnt amber.
- Days 4–7 in oxblood, indigo, clay, gold.
- Section pips match the day's color.

```bash
git add src/index.css src/views/DayView.jsx
git commit -m "feat: add oversized day numeral and per-day accent coloring on hero"
```

---

### Task 25: Update `Sidebar` to use warm palette and per-day pips

**Files:**
- Modify: `src/layout/Sidebar.jsx`

- [ ] **Step 1: Replace the progress gradient**

In `src/layout/Sidebar.jsx`, find the progress bar and replace:
```jsx
<div className="progress-fill h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600" style={{ width: `${pct}%` }} />
```
with:
```jsx
<div className="progress-fill h-full rounded-full bg-gradient-to-r from-[color:var(--color-amber)] to-[color:var(--color-accent)]" style={{ width: `${pct}%` }} />
```

- [ ] **Step 2: Use the day accent color on the sidebar day pips**

Add import:
```js
import { getDayAccent } from '../lib/theme'
```

In the `NavBtn` component, when the nav item is a day (not bonus) and is active, tint the numeral circle using the day accent. Replace the existing numeral span:

```jsx
<div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${active ? 'text-white' : done ? 'text-white' : 'bg-[color:#f5efe3] text-[color:var(--color-muted)] group-hover:text-[color:var(--color-ink)]'}`}
  style={
    !isBonus && (active || done)
      ? { background: getDayAccent(item.num).hex }
      : undefined
  }>
  {done ? '✓' : isBonus ? '·' : item.num}
</div>
```

And update the surrounding button's active tint so the active pill uses the day accent too:
```jsx
<button onClick={() => handleNav(item.id)}
  className={`group flex w-full items-center gap-3 rounded-[20px] border px-3 py-3 text-left transition-all ${active ? 'border-transparent text-white shadow-[0_16px_36px_rgba(26,23,20,0.18)]' : 'border-transparent bg-transparent text-[color:var(--color-muted)] hover:border-[color:var(--color-faint)] hover:bg-white hover:text-[color:var(--color-ink)]'}`}
  style={active && !isBonus ? { background: getDayAccent(item.num).hex } : active && isBonus ? { background: 'var(--color-accent)' } : undefined}>
```

- [ ] **Step 3: Verify and commit**

Run `npm run dev`. Each day in the sidebar should have its own color. Completed days fill with that day's color. Active day's pill matches.
```bash
git add src/layout/Sidebar.jsx
git commit -m "style: sidebar uses warm palette and per-day accent colors"
```

---

### Task 26: Tighten vertical rhythm and add end-of-day mark

**Files:**
- Modify: `src/index.css`
- Modify: `src/views/DayView.jsx`

- [ ] **Step 1: Tighten the section gap**

In `src/views/DayView.jsx`, find the wrapper `<div className="space-y-4" ...>` (the section list) and change to `space-y-5` for a slightly tighter rhythm relative to the hero. Then find each `<Card key={sec.id}>` block padding. In `src/ui/Card.jsx`, the default padding is already `p-5 sm:p-6 lg:p-7` — no change.

- [ ] **Step 2: Add the end-of-day mark at the bottom of `DayView`**

At the end of `DayView`'s return (after the last `<Card>` for Personal Notes), before the closing `</PageFrame>`, add:

```jsx
<div className="flex flex-col items-center gap-3 py-10 opacity-70" style={dayAccentStyle(day.id)}>
  <div className="h-px w-16 bg-[color:var(--day-accent)]" />
  <span className="font-display text-3xl font-semibold tracking-tight text-[color:var(--day-accent)]">
    {String(day.id).padStart(2, '0')}
  </span>
  <div className="h-px w-16 bg-[color:var(--day-accent)]" />
  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-muted)]">End of day {day.id}</span>
</div>
```

- [ ] **Step 3: Verify and commit**

Run `npm run dev`. Scroll to the bottom of any day. You should see a centered vertical device with two short horizontal rules and the day numeral, in the day's accent color.
```bash
git add src/index.css src/views/DayView.jsx
git commit -m "style: tighten section rhythm and add end-of-day mark"
```

---

## Phase 4 — New block types

Goal: add six new voice-forward block types and register them in `ContentBlock`. Verify each renders in isolation by temporarily placing a demo example into Day 1 and reading it in the browser.

---

### Task 27: Create `MentalModelBlock`

**Files:**
- Create: `src/blocks/MentalModelBlock.jsx`

- [ ] **Step 1: Create the file**

```jsx
import { dayAccentStyle } from '../lib/theme'

export default function MentalModelBlock({ block, dayId }) {
  return (
    <figure className="my-6 border-l-4 pl-5 pr-2 py-2" style={{ ...dayAccentStyle(dayId), borderColor: 'var(--day-accent)' }}>
      <p className="font-display text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--day-accent)]">
        Mental model
      </p>
      <blockquote className="mt-2 font-display text-xl italic leading-snug text-[color:var(--color-ink)] sm:text-2xl">
        {block.text}
      </blockquote>
    </figure>
  )
}
```

Data shape: `{ type: 'mental-model', text: 'Replication is a tradeoff between freshness and availability.' }`

---

### Task 28: Create `TradeOffBlock`

**Files:**
- Create: `src/blocks/TradeOffBlock.jsx`

- [ ] **Step 1: Create the file**

```jsx
export default function TradeOffBlock({ block }) {
  return (
    <div className="my-5 overflow-hidden rounded-[22px] border border-[color:var(--color-faint)] bg-white">
      <div className="grid grid-cols-1 divide-y divide-[color:var(--color-faint)] md:grid-cols-2 md:divide-x md:divide-y-0">
        <div className="p-5">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
            {block.left.label}
          </p>
          <ul className="space-y-2">
            {block.left.points.map((p, i) => (
              <li key={i} className="flex gap-2 text-[15px] leading-7 text-[color:var(--color-muted)]">
                <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[color:var(--color-accent)]" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-5 bg-[color:var(--color-accent-soft)]/40">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-amber-deep)]">
            {block.right.label}
          </p>
          <ul className="space-y-2">
            {block.right.points.map((p, i) => (
              <li key={i} className="flex gap-2 text-[15px] leading-7 text-[color:var(--color-muted)]">
                <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[color:var(--color-amber-deep)]" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
```

Data shape: `{ type: 'trade-off', left: { label: 'Synchronous', points: [...] }, right: { label: 'Asynchronous', points: [...] } }`

---

### Task 29: Create `FollowUpBlock`

**Files:**
- Create: `src/blocks/FollowUpBlock.jsx`

- [ ] **Step 1: Create the file**

```jsx
export default function FollowUpBlock({ block }) {
  return (
    <div className="my-5 rounded-[22px] border border-[color:var(--color-faint)] bg-white p-5">
      <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
        Follow-up
      </p>
      <p className="mb-3 font-mono text-sm font-semibold uppercase tracking-[0.03em] text-[color:var(--color-ink)]">
        {block.question}
      </p>
      <p className="text-[15px] italic leading-7 text-[color:#2d2723]">
        "{block.answer}"
      </p>
    </div>
  )
}
```

Data shape: `{ type: 'follow-up', question: 'WHY NOT JUST USE A SECOND DATABASE?', answer: 'Because...' }`

---

### Task 30: Create `RedFlagBlock`

**Files:**
- Create: `src/blocks/RedFlagBlock.jsx`

- [ ] **Step 1: Create the file**

```jsx
export default function RedFlagBlock({ block }) {
  return (
    <div className="my-4 flex gap-3 rounded-[22px] border border-[color:#8b2e2e]/30 bg-[color:#8b2e2e]/5 px-4 py-3">
      <span className="mt-0.5 flex-shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[color:#8b2e2e]">
        Red flag
      </span>
      <span className="text-[15px] italic leading-7 text-[color:#2d2723]">
        "{block.text}"
      </span>
    </div>
  )
}
```

Data shape: `{ type: 'red-flag', text: 'We just add more replicas if the database is slow.' }`

---

### Task 31: Create `LevelUpBlock`

**Files:**
- Create: `src/blocks/LevelUpBlock.jsx`

- [ ] **Step 1: Create the file**

```jsx
export default function LevelUpBlock({ block }) {
  const levels = [
    { label: 'Weak', text: block.weak, opacity: 'opacity-55', weight: 'font-normal' },
    { label: 'Strong', text: block.strong, opacity: 'opacity-85', weight: 'font-medium' },
    { label: 'Senior', text: block.senior, opacity: 'opacity-100', weight: 'font-semibold' },
  ]
  return (
    <div className="my-5 space-y-3 rounded-[22px] border border-[color:var(--color-faint)] bg-white p-5">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
        Level up the answer
      </p>
      {levels.map((lvl, i) => (
        <div key={i} className={`flex gap-4 border-l-2 border-[color:var(--color-accent)]/${20 + i * 30} pl-4 ${lvl.opacity}`}>
          <span className="mt-1 w-16 flex-shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
            {lvl.label}
          </span>
          <span className={`text-[15px] italic leading-7 text-[color:#2d2723] ${lvl.weight}`}>
            "{lvl.text}"
          </span>
        </div>
      ))}
    </div>
  )
}
```

Data shape: `{ type: 'level-up', weak: '...', strong: '...', senior: '...' }`

---

### Task 32: Create `EchoBlock`

**Files:**
- Create: `src/blocks/EchoBlock.jsx`

- [ ] **Step 1: Create the file**

```jsx
import { getDayAccent } from '../lib/theme'

export default function EchoBlock({ block }) {
  const accent = getDayAccent(block.refDay)
  return (
    <div className="my-4 border-l-2 pl-4 py-1" style={{ borderColor: accent.hex }}>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent.hex }}>
        See Day {block.refDay}{block.refSection ? `.${block.refSection}` : ''}
      </p>
      <p className="mt-1 text-[14px] leading-6 text-[color:var(--color-muted)]">
        {block.text}
      </p>
    </div>
  )
}
```

Data shape: `{ type: 'echo', refDay: 3, refSection: '3.2', text: 'This is the outbox pattern from Day 3 applied to...' }`

---

### Task 33: Register new block types and verify with demo examples

**Files:**
- Modify: `src/blocks/ContentBlock.jsx`
- Modify: `src/data/course.js` (temporary demo insertions)

- [ ] **Step 1: Register the six new types in the dispatcher**

Open `src/blocks/ContentBlock.jsx` and add imports:
```js
import MentalModelBlock from './MentalModelBlock'
import TradeOffBlock from './TradeOffBlock'
import FollowUpBlock from './FollowUpBlock'
import RedFlagBlock from './RedFlagBlock'
import LevelUpBlock from './LevelUpBlock'
import EchoBlock from './EchoBlock'
```

Add to the `REGISTRY` object:
```js
'mental-model': MentalModelBlock,
'trade-off': TradeOffBlock,
'follow-up': FollowUpBlock,
'red-flag': RedFlagBlock,
'level-up': LevelUpBlock,
echo: EchoBlock,
```

- [ ] **Step 2: Add one demo block of each new type to Day 1's first section for verification**

Open `src/data/course.js`. Find the first `sections: [` entry inside Day 1 (id 1). Find its first section's `blocks: [ ... ]` array. Append these six temporary demo blocks at the **end** of that array:

```js
{ type: 'mental-model', text: 'Reliability is the budget you spend before a system surprises you.' },
{ type: 'trade-off', left: { label: 'Vertical scale', points: ['Simple to reason about', 'Cap on RAM/CPU', 'Single point of failure'] }, right: { label: 'Horizontal scale', points: ['Adds operational cost', 'Needs partitioning', 'Linear headroom'] } },
{ type: 'follow-up', question: 'WHAT IF THE DATABASE FAILS AT 3AM?', answer: 'I design for failure: replicas plus a promotion path, and I practice the runbook before I need it.' },
{ type: 'red-flag', text: 'We just add more servers if things get slow.' },
{ type: 'level-up', weak: 'It depends.', strong: 'It depends on the read/write ratio and the freshness budget.', senior: 'It depends on the read/write ratio, the freshness budget, and whether the consumer can tolerate a brief stale window — if it can, I lean async; if not, I pay the latency tax.' },
{ type: 'echo', refDay: 3, refSection: '3.2', text: 'We come back to this in Day 3 when we talk about replication lag.' },
```

- [ ] **Step 3: Verify in the browser**

Run `npm run dev`. Open Day 1. Scroll to the first section. All six new blocks should render with distinct visual treatments. Check each:
- `mental-model` shows a bordered figure with "Mental model" label in Day 1's deep teal
- `trade-off` shows two columns
- `follow-up` shows the all-caps Q and italic A
- `red-flag` shows in oxblood muted warning tint
- `level-up` shows three stacked quotes with increasing weight
- `echo` shows a left border in Day 3's burnt amber with "See Day 3.2"

- [ ] **Step 4: Remove the demo blocks from Day 1**

Once verified, delete the six demo blocks from `src/data/course.js`. They'll be re-added as real content during the Day 1 rewrite in Phase 5.

- [ ] **Step 5: Commit**

```bash
git add src/blocks/ContentBlock.jsx src/blocks/MentalModelBlock.jsx src/blocks/TradeOffBlock.jsx src/blocks/FollowUpBlock.jsx src/blocks/RedFlagBlock.jsx src/blocks/LevelUpBlock.jsx src/blocks/EchoBlock.jsx src/data/course.js
git commit -m "feat: add six voice-forward block types and register in ContentBlock"
```

---

## Phase 5–6 — Content rewrites (Days 1–7)

Goal: apply the voice-forward rewrite rules from the spec to each day sequentially. Each task below is a rewrite pass on one day's `sections` array inside `src/data/course.js`.

**Rewrite rules — apply to every day:**

1. **Ratio.** Flat `text` blocks drop from ~60% of content to ~25% — they become `say`, `dont`, `follow-up`, `level-up`, `trade-off`, `mental-model`, `interview-quote`, or `red-flag` blocks.
2. **Every section ends with a `mental-model`.** Exactly one, and it should be a sentence the reader can repeat under pressure.
3. **Every trade-off becomes a `trade-off` block.** No more comparison-as-prose.
4. **Every section where an interviewer would reasonably push back gets a `follow-up`.** Question in all caps (mono treatment), answer in spoken voice.
5. **Every "common junior-sounding mistake" gets a `red-flag`.** Short, specific, literal.
6. **Level-up blocks** for the most important answers in each day — at least one per day, ideally two.
7. **From Day 2 onward, add `echo` blocks** that reference earlier days. Example: when Day 3 talks about the outbox pattern, add an `echo` back to Day 1's reliability discussion.
8. Keep every existing `interview-quote`, `say`, `dont`, `radwork`, `code`, `callout`, `list`, `numbered-list`, and `table` block unless it's weakened by the rewrite. These carry voice and are part of what already works.
9. **Do not change** `id`, `title`, `shortTitle`, `theme`, `chapters`, `duration`, `interviewerTesting`, `outcome`, `lab[]`, `claudePrompts[]`, `quiz[]`, `speakDrill` on any day. Only the `sections[].blocks[]` content changes.

Each day's task follows the same 5-step rhythm. I repeat the steps per day so the engineer can follow them out of order.

---

### Task 34: Rewrite Day 1 content

**Files:**
- Modify: `src/data/course.js` — only the Day 1 (`id: 1`) entry's `sections` field

- [ ] **Step 1: Read Day 1 as it stands**

Read the full Day 1 object in `src/data/course.js` to understand the current sections, then list each section's existing blocks mentally.

- [ ] **Step 2: For each section of Day 1, apply the rewrite rules above**

Produce the rewritten `blocks` array per section. For each section:
- Keep any `interview-quote`, `say`, `dont`, `radwork`, `code`, `list`, `numbered-list`, `table`, `callout` block that already carries voice
- Replace prose `text` blocks with voice blocks where possible
- Add at least one `trade-off` block if the section discusses two approaches
- Add at least one `follow-up` block
- Add at least one `red-flag` block if there's a junior-sounding mistake to flag
- Add at least one `level-up` block somewhere in the day (not necessarily every section)
- End every section with exactly one `mental-model` block
- **Day 1 does NOT add `echo` blocks** (it's the first day)

- [ ] **Step 3: Replace the Day 1 `sections` field**

Overwrite only the `sections: [ ... ]` array of the Day 1 object. Leave every other field untouched.

- [ ] **Step 4: Verify in the browser**

Run `npm run dev`. Navigate to Day 1. Read through each section top-to-bottom. Confirm:
- Every section ends with a `mental-model` block
- Ratio of flat `text` blocks is visibly lower
- No block type crashes
- Visual hierarchy is still readable (rhythm not cluttered)

- [ ] **Step 5: Commit**

```bash
git add src/data/course.js
git commit -m "content: rewrite Day 1 sections using voice-forward block types"
```

---

### Task 35: Rewrite Day 2 content

**Files:**
- Modify: `src/data/course.js` — only the Day 2 (`id: 2`) entry's `sections` field

- [ ] **Step 1: Read Day 2 as it stands**

Read Day 2's current `sections` array in `src/data/course.js`.

- [ ] **Step 2: Apply the rewrite rules**

Same rules as Task 34. Day 2 covers storage engines (B-trees, LSM, OLTP vs OLAP, schema evolution). High-value `trade-off` candidates: B-tree vs LSM, row store vs column store, schema-on-write vs schema-on-read.

**From Day 2 onward, add `echo` blocks** referencing Day 1 where relevant. Example: when talking about crash recovery in storage engines, add an `echo { refDay: 1, text: 'This is Day 1's reliability question in a different clothing.' }`.

- [ ] **Step 3: Replace the Day 2 `sections` field**

- [ ] **Step 4: Verify in the browser**

Run `npm run dev`. Open Day 2. Check: `mental-model` at end of each section, at least one `trade-off`, at least one `follow-up`, at least one `red-flag`, at least one `echo` pointing to Day 1.

- [ ] **Step 5: Commit**

```bash
git add src/data/course.js
git commit -m "content: rewrite Day 2 sections with voice-forward blocks and day-1 echoes"
```

---

### Task 36: Rewrite Day 3 content

**Files:**
- Modify: `src/data/course.js` — only the Day 3 (`id: 3`) entry's `sections` field

- [ ] **Step 1: Read Day 3 as it stands**

- [ ] **Step 2: Apply the rewrite rules**

Day 3 covers replication, partitioning, and the outbox pattern. Strong `trade-off` candidates: sync vs async replication, hash vs range partitioning, dual-write vs outbox. Strong `follow-up` candidates: "what happens during failover?", "what if a replica is behind?". Add `echo` blocks back to Day 1 (reliability) and Day 2 (durability/WAL).

- [ ] **Step 3: Replace the Day 3 `sections` field**

- [ ] **Step 4: Verify in the browser**

- [ ] **Step 5: Commit**

```bash
git add src/data/course.js
git commit -m "content: rewrite Day 3 sections (replication/partitioning/outbox)"
```

---

### Task 37: Rewrite Day 4 content

**Files:**
- Modify: `src/data/course.js` — only the Day 4 (`id: 4`) entry's `sections` field

- [ ] **Step 1: Read Day 4 as it stands**

- [ ] **Step 2: Apply the rewrite rules**

Day 4 covers transactions, isolation levels, and idempotency. Strong `trade-off` candidates: optimistic vs pessimistic locking, read-committed vs snapshot isolation vs serializable. Strong `red-flag` candidates: "we just wrap it in a transaction". Add `echo` blocks back to Day 3 (replication consistency is a form of isolation) and Day 2 (WAL provides the atomicity base).

- [ ] **Step 3: Replace the Day 4 `sections` field**

- [ ] **Step 4: Verify in the browser**

- [ ] **Step 5: Commit**

```bash
git add src/data/course.js
git commit -m "content: rewrite Day 4 sections (transactions/isolation/idempotency)"
```

---

### Task 38: Rewrite Day 5 content

**Files:**
- Modify: `src/data/course.js` — only the Day 5 (`id: 5`) entry's `sections` field

- [ ] **Step 1: Read Day 5 as it stands**

- [ ] **Step 2: Apply the rewrite rules**

Day 5 covers distributed systems, consistency models, consensus. Strong `trade-off` candidates: strong vs eventual consistency, linearizability vs serializability, quorum reads vs reads from one replica. Strong `follow-up` candidates: "what if the leader is partitioned?". This is the day with the most chances for `level-up` blocks — consistency is the most commonly-flubbed interview topic. Add `echo` blocks to Day 3 (replication is where consistency first shows up) and Day 4 (serializability).

- [ ] **Step 3: Replace the Day 5 `sections` field**

- [ ] **Step 4: Verify in the browser**

- [ ] **Step 5: Commit**

```bash
git add src/data/course.js
git commit -m "content: rewrite Day 5 sections (distributed systems/consistency/consensus)"
```

---

### Task 39: Rewrite Day 6 content

**Files:**
- Modify: `src/data/course.js` — only the Day 6 (`id: 6`) entry's `sections` field

- [ ] **Step 1: Read Day 6 as it stands**

- [ ] **Step 2: Apply the rewrite rules**

Day 6 covers batch, streams, CDC, and event sourcing. Strong `trade-off` candidates: batch vs stream, at-least-once vs exactly-once, event sourcing vs state-stored. Strong `follow-up` candidates: "what if the consumer is slow?". Add `echo` blocks to Day 3 (CDC is a replication pattern in disguise) and Day 4 (event sourcing interacts with transactional boundaries).

- [ ] **Step 3: Replace the Day 6 `sections` field**

- [ ] **Step 4: Verify in the browser**

- [ ] **Step 5: Commit**

```bash
git add src/data/course.js
git commit -m "content: rewrite Day 6 sections (batch/streams/CDC/event sourcing)"
```

---

### Task 40: Rewrite Day 7 content

**Files:**
- Modify: `src/data/course.js` — only the Day 7 (`id: 7`) entry's `sections` field

- [ ] **Step 1: Read Day 7 as it stands**

- [ ] **Step 2: Apply the rewrite rules**

Day 7 is the synthesis/capstone day. It should be the most voice-forward day in the course — every section is about how to **say** a system design answer. Heavy use of `level-up` and `follow-up`. End every section with a `mental-model`. This day should feel like the condensed version of the interview coaching in one page. Add `echo` blocks to every earlier day where a core mental model lives (Days 1–6), because Day 7 is where they all come together.

- [ ] **Step 3: Replace the Day 7 `sections` field**

- [ ] **Step 4: Verify in the browser**

- [ ] **Step 5: Commit**

```bash
git add src/data/course.js
git commit -m "content: rewrite Day 7 (synthesis/capstone) with voice-forward interview framing"
```

---

## Phase 7 — Bonus views

Goal: bring the three bonus views (Memory Map, 25 Questions, One-Day Crash) up to the v2 voice and fix the textarea persistence bug.

---

### Task 41: Group Memory Map by day with per-day color coding

**Files:**
- Modify: `src/data/course.js` — `MEMORY_MAP` export
- Modify: `src/views/MemoryMapView.jsx`

- [ ] **Step 1: Add a `day` field to each `MEMORY_MAP` entry**

Open `src/data/course.js`. Find the `MEMORY_MAP` export (an array of `{ term, desc }` objects). For each entry, add a `day` field pointing to the day that introduced it (1–7). Example:
```js
{ term: 'WAL', desc: '...', day: 2 },
{ term: 'Outbox', desc: '...', day: 3 },
```

Use your judgment to assign each term to its most natural day. Terms that span multiple days go to the first day they're introduced.

- [ ] **Step 2: Rewrite `MemoryMapView` to group by day**

Open `src/views/MemoryMapView.jsx`. Replace the flat list rendering with a grouped render. Add imports:
```js
import { getDayAccent } from '../lib/theme'
```

Replace the Card that renders the flat list:
```jsx
<Card>
  <div className="divide-y divide-sky-100">
    {MEMORY_MAP.map((item, i) => (...))}
  </div>
</Card>
```

With grouped-by-day rendering:
```jsx
<Card>
  <div className="space-y-8">
    {DAYS.map(day => {
      const terms = MEMORY_MAP.filter(t => t.day === day.id)
      if (terms.length === 0) return null
      const accent = getDayAccent(day.id)
      return (
        <div key={day.id}>
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: accent.hex }} />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent.hex }}>
              Day {day.id} · {day.shortTitle}
            </span>
          </div>
          <div className="divide-y divide-[color:var(--color-faint)]">
            {terms.map((item, i) => (
              <div key={i} className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:gap-8">
                <span className="w-full flex-shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.14em] sm:w-40"
                  style={{ color: accent.hex }}>
                  {item.term}
                </span>
                <span className="text-[15px] leading-7 text-[color:var(--color-muted)]">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )
    })}
  </div>
</Card>
```

- [ ] **Step 3: Verify and commit**

Run `npm run dev`. Open Memory Map. Terms are now grouped by day with each day's accent color on the heading and term labels.
```bash
git add src/data/course.js src/views/MemoryMapView.jsx
git commit -m "feat: memory map groups terms by day with per-day accent colors"
```

---

### Task 42: Fix the 25 Questions textarea persistence bug

**Files:**
- Modify: `src/views/InterviewQuestionsView.jsx`

- [ ] **Step 1: Wire the textarea to `progress.questionNotes`**

Open `src/views/InterviewQuestionsView.jsx`. Add import:
```js
import { saveProgress } from '../lib/storage'
```

(It's already imported via `togglePracticed`, no need to add twice.)

Add a `setNote` handler inside the component body:
```jsx
const setNote = (i, value) => {
  setProgress(p => {
    const updated = { ...p, questionNotes: { ...(p.questionNotes || {}), [i]: value } }
    saveProgress(updated); return updated
  })
}
```

Find the broken textarea (currently `<textarea rows={3} placeholder="Key points..." className="text-sm" />`) and replace with:
```jsx
<textarea
  rows={3}
  placeholder="Key points..."
  value={(progress.questionNotes && progress.questionNotes[i]) || ''}
  onChange={(e) => setNote(i, e.target.value)}
  className="text-sm"
/>
```

- [ ] **Step 2: Verify and commit**

Run `npm run dev`. Open 25 Questions. Expand a question. Type some notes. Navigate away to another view. Come back — your notes persist. Reload the page — they still persist.

```bash
git add src/views/InterviewQuestionsView.jsx
git commit -m "fix: persist 25 Questions textarea notes to progress.questionNotes"
```

---

### Task 43: Apply voice treatment to One-Day Crash view

**Files:**
- Modify: `src/views/OneDayCrashView.jsx`

- [ ] **Step 1: Rewrite the hero `<p>` framing**

In `src/views/OneDayCrashView.jsx`, find the hero paragraph:
```jsx
<p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
  If time collapses to a single day, this view keeps the sequence focused instead of trying to reread everything.
</p>
```
Replace with a voice-forward version:
```jsx
<p className="mt-4 max-w-2xl font-display text-xl italic leading-snug text-[color:var(--color-muted)] sm:text-2xl">
  One day. No time to panic. Read the priority topics, run the mega prompt, then speak the answer out loud — twice.
</p>
```

- [ ] **Step 2: Add a `LevelUpBlock` between Priority Topics and Mega Prompt**

Import at the top of `src/views/OneDayCrashView.jsx`:
```js
import LevelUpBlock from '../blocks/LevelUpBlock'
```

Between the Priority Topics `Card` and the Mega Prompt `Card`, add:
```jsx
<Card>
  <SectionLabel>How the answer should sound by the end</SectionLabel>
  <LevelUpBlock block={{
    weak: 'I would use a microservice and a queue.',
    strong: 'I would split read and write paths — the write path uses an outbox for reliability, the read path uses a replica for latency.',
    senior: 'The core trade-off is freshness versus availability. I bias toward async replication with an outbox for writes, because losing a write is a worse failure than reading a stale one — and I can always add a synchronous read of the primary for the cases where freshness actually matters.'
  }} />
</Card>
```

- [ ] **Step 3: Verify and commit**

Run `npm run dev`. Open One Day Plan. The hero paragraph now reads as voice. A new card between topics and mega prompt shows the weak→strong→senior progression.
```bash
git add src/views/OneDayCrashView.jsx
git commit -m "content: voice-forward treatment on One-Day Crash view"
```

---

## Phase 8 — Final review

Goal: read every page in the browser, catch residual inconsistencies, fix them.

---

### Task 44: End-to-end review pass

**Files:**
- Potentially modify: any file discovered to have issues

- [ ] **Step 1: Fresh browser read-through**

Run `npm run dev`. Open the app in an incognito window (no saved progress). Walk through every view from top to bottom:

1. Day 1 through Day 7 in sequence. For each day, confirm:
   - Hero numeral renders in that day's accent color
   - Section pips match the day's accent
   - Every section ends with a `mental-model` block
   - At least one `trade-off`, `follow-up`, and `red-flag` block per day
   - From Day 2 onward, at least one `echo` block
   - End-of-day mark renders in the day's accent
   - Lab checklist, quiz, speak timer, claude prompts, notes textarea all work
2. Memory Map — grouped by day with correct colors
3. 25 Questions — can expand, check off, write notes, and notes persist
4. One Day Plan — hero reads as voice, level-up block renders, mega prompt copies

- [ ] **Step 2: Residual blue scan**

Run:
```bash
grep -rn "sky-\|blue-\|indigo-\|cyan-" src/
```
Expected: only inside `src/index.css` (if any `#dbeafe` or similar remain — replace them with warm palette hex codes) and `src/lib/theme.js` (Day 5 "Indigo" name is fine — it's just a label).

If any JSX files still contain `sky-*` or `blue-*` classes, fix them using the Task 22 mapping.

- [ ] **Step 3: File size check**

Run:
```bash
find src -name "*.jsx" -exec wc -l {} + | sort -n
```
Expected: no file over ~250 lines except possibly `src/data/course.js` (content file, exempt) and `src/data/labGuides.js` (content file, exempt). Any runaway .jsx file should be split into smaller components.

- [ ] **Step 4: Smoke test persistence**

1. In the browser, toggle some lab items, expand some quizzes, write notes on a day, write a note on a 25 Questions item, mark Day 1 complete.
2. Close the browser.
3. Reopen the app.
4. Confirm: all the state you set is still there.

- [ ] **Step 5: Update `context.md`**

Open `context.md` at the repo root. Update:
- The File Map section to reflect the new folder structure (`src/lib/`, `src/layout/`, etc.)
- The Design Direction section with the new warm palette + per-day accent description
- Add a new Update Log entry: `- 2026-04-10: DDIA course v2 rebuild — voice-forward content, warm palette with per-day accents, decomposed component architecture.`

- [ ] **Step 6: Commit**

```bash
git add context.md
git commit -m "docs: update context.md to reflect v2 architecture and visual direction"
```

If the review pass found any fixes, include them in additional commits with appropriate messages.

---

## Done

Every task above ends at a natural commit boundary. At the end of Phase 8, the site should look, read, and feel like the v2 spec describes: warm editorial palette, per-day identity colors, voice-forward content, a sane component architecture, and all the original features still working.






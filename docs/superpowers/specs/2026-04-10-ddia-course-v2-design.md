# DDIA Course v2 — Design Spec

**Date:** 2026-04-10
**Status:** Approved for implementation planning
**Scope:** Full rebuild of the DDIA interview-prep study app — content, visual system, and component architecture.

---

## 1. Context

### What exists today

`ddia-course` is a browser-only, single-page React study app for a 7-day *Designing Data-Intensive Applications* interview-prep course aimed at a mid-level .NET engineer. It is built on React 18 + Vite 5 + Tailwind (loaded via CDN). All learner state persists to `localStorage` under `ddia_progress_v1`.

Content lives in `src/data/course.js` (~1,200 lines) as structured JavaScript objects. Lab walkthroughs live in `src/data/labGuides.js` (~1,700 lines). Almost all UI is concentrated in `src/App.jsx` (~900 lines, single file).

The 7 days cover: reliability/scalability/data models (Day 1), storage/indexing/OLTP-OLAP/schema evolution (Day 2), replication/partitioning/outbox (Day 3), transactions/isolation/idempotency (Day 4), distributed systems/consistency/consensus (Day 5), batch/streams/CDC/event sourcing (Day 6), and interview synthesis (Day 7). Bonus views: Memory Map, 25 Interview Questions, One-Day Crash.

The existing content is substantive and opinionated. Two running examples — OrderFlow (e-commerce) and RadWork (healthcare imaging worklist) — thread through all 7 days.

### Why this rebuild

The owner will continue using this tool for personal interview prep. Two specific weaknesses drove this design:

1. **Content** — The "Say / Avoid / Interviewer quote" blocks are the strongest part of the course because they give the reader words to *say* under interview pressure. But regular `text` blocks dominate the current content and they read flat — they carry information but don't model the voice an interviewer wants to hear.

2. **Visual polish** — The current "light blue minimal" aesthetic works but feels sterile. It doesn't make the owner *want* to open the site daily. A warmer, more opinionated visual system with per-day identity would make the tool more inviting and help the 7 days feel less like 7 identical modules.

Retention features (spaced repetition, flashcards), practice-realism features (timed simulators, voice recording), and study-flow features (search, previous/next nav, persistent question notes) are **not** the focus — they were explicitly deprioritized during brainstorming. One small exception: the "25 Questions" view has a `textarea` with no `value`/`onChange`, so notes there are currently not persisted. That's a latent bug and gets fixed as part of the bonus-views pass.

### Audience and constraints

- Single user (the owner). No public launch. No SEO, analytics, a11y compliance, or social sharing concerns.
- Stay on React + Vite + Tailwind. No framework swap, no MDX, no alternative tooling.
- `localStorage` is the only persistence. No multi-device sync.
- Everything runs in the browser, no backend.
- The owner drafts approval, Claude drafts content — i.e., Claude proposes voice-forward rewrites and the owner reads/ships them.

---

## 2. Goals and non-goals

### Goals

- **Voice-forward content.** Reduce flat `text` blocks from ~60% to ~25% of content. Replace them with blocks that model what a confident interview answer sounds like. Every section ends with a one-sentence mental model anchor.
- **Expand the block vocabulary.** Add six new block types — `mental-model`, `trade-off`, `follow-up`, `red-flag`, `level-up`, `echo` — that each capture a specific interview-voice move.
- **Warmer, more opinionated visual system.** Swap the cool blue palette for warm cream + deep teal + burnt amber. Give each of the 7 days a distinct sub-accent color. Swap the display font for an editorial serif. Tighten vertical rhythm.
- **Break up `App.jsx`.** Extract views, blocks, features, layout, and UI primitives into their own folders. Keep every file under ~250 lines.
- **Compile Tailwind.** Move from CDN to `@tailwindcss/vite` with a real `tailwind.config.js`. Self-host fonts.
- **Ship day-by-day.** After infrastructure + visual system + new blocks land, rewrite the content of all 7 days sequentially, one day per pass.

### Non-goals

- Learning-science features (spaced repetition, flashcards, streak tracking, retention analytics).
- Practice-realism features (timed mock-interview simulator, voice recording, AI grader).
- Accessibility compliance, SEO, analytics, social sharing, mobile PWA install.
- Dark mode toggle. The visual system is light-base.
- MDX, Astro, Next, or any framework swap. Staying on React + Vite.
- Multi-device sync or cloud persistence.
- Automated tests. Personal tool, YAGNI.

---

## 3. Content direction

### Guiding rules for the rewrite

Every concept should be speakable in an interviewer's office. Concrete rules, applied during Day 1–7 rewrites:

- If a sentence can't be spoken out loud in an interview without sounding like a textbook, it becomes a voice block (`say`, `dont`, `interview-quote`, `level-up`, `follow-up`).
- Every section ends with a `mental-model` block — one sentence the reader should remember under pressure.
- Every concept that has a trade-off gets a `trade-off` block instead of paragraph prose.
- Every section where interviewers would push back gets a `follow-up` block.
- Every common junior-sounding mistake gets a `red-flag` block.
- From Day 2 onward, `echo` blocks reference earlier days explicitly to make the mental models build visibly across the course.

### Block vocabulary

Existing blocks — kept as-is: `text`, `subheading`, `interview-quote`, `say`, `dont`, `callout`, `radwork`, `list`, `numbered-list`, `table`, `code`. The `text` block is retained but used less.

New block types:

| Block | Purpose | Data shape | Visual treatment |
|---|---|---|---|
| `mental-model` | One-sentence anchor at the end of a section | `{ type, text }` | Oversized quote frame, day's accent color, lives flush at section end |
| `trade-off` | Explicit X vs Y comparison | `{ type, left: { label, points[] }, right: { label, points[] } }` | Two-column card, dividing line in accent, each side has a header and bullet list |
| `follow-up` | "Interviewer then asks…" Q→A | `{ type, question, answer }` | Dialog-style: Q in mono uppercase, A in voice |
| `red-flag` | "If you hear yourself saying this, stop" | `{ type, text }` | Warning-tinted (muted oxblood), label reads "Red flag" |
| `level-up` | Weak → Strong → Senior answer progression | `{ type, weak, strong, senior }` | Three stacked quotes, weight/color intensifies top to bottom |
| `echo` | Cross-day reference | `{ type, refDay, refSection, text }` | Subtle left border in the referenced day's color, small "See Day X.Y" label |

Each new block has a matching React component in `src/blocks/`. The `ContentBlock.jsx` dispatcher gets new `case` arms.

---

## 4. Visual system

### Palette

Replaces the current cool blue. Light base retained.

- **Background base:** warm cream `#faf7f2` (replaces the cool blue-white gradient shell)
- **Ink:** warm near-black `#1a1714`
- **Muted text:** warm stone `#6b6458`
- **Faint border:** `#e8e1d4`
- **Primary anchor:** deep teal `#0d5f5f` — warmer than blue, gravitas, not cliched
- **Primary deep:** `#094949` for hover/active on primary
- **Secondary accent:** burnt amber `#d97844` — used for hover accents, highlight states, progress fills
- **Code surface:** warm slate `#1f1c1a` (replaces pure navy) with ember-tinted text, so code blocks feel part of the warm family

### Per-day identity colors

Each of the 7 days gets one sub-accent, applied to:
- The day's hero numeral
- The sidebar pip
- The section divider on that day's pages
- Link/hover states on that day's content
- `mental-model` block tint when rendered inside that day

Mapping:

| Day | Theme | Sub-accent |
|---|---|---|
| 1 | Foundations (reliability/scalability/data models) | Deep teal `#0d5f5f` |
| 2 | Storage engines | Moss green `#5a6b3f` |
| 3 | Replication/partitioning/outbox | Burnt amber `#d97844` |
| 4 | Transactions/isolation | Oxblood `#8b2e2e` |
| 5 | Distributed systems | Indigo `#3e3e7a` |
| 6 | Batch/streams/CDC | Clay `#a0572f` |
| 7 | Synthesis/capstone | Gold `#b08a2c` |

A helper `getDayAccent(dayId)` in `lib/theme.js` exposes this mapping.

### Typography

- **Display** (hero titles, section titles, day numerals): **Fraunces** — an editorial serif with character and slight playfulness. Available via `@fontsource/fraunces`.
- **Body:** **Inter** — clean sans, replaces IBM Plex Sans. Available via `@fontsource/inter`.
- **Mono:** **JetBrains Mono** — kept. Available via `@fontsource/jetbrains-mono`.
- All fonts self-hosted via `@fontsource/*` packages; no Google Fonts request at load.

Hero treatment: the day numeral ("01", "02", …) renders as an **oversized outlined numeral** in the day's accent color, fixed to the hero's right side. This is the single most distinctive character moment of the new design.

### Density and rhythm

- Tighter vertical rhythm between blocks — less airy whitespace.
- Consistent section dividers — horizontal rules in faint border color, not pale glows.
- Each day ends with a quiet "end of day" mark: a small horizontal device plus the day numeral again, so the reader feels a completed unit.
- Code blocks tighten their corner radius and warm up their surface color.

---

## 5. Component architecture

### Current state

`src/App.jsx` is 905 lines. It contains: storage helpers, six SVG icon components, `SpeakTimer`, `CodeBlock`, `ContentBlock` (with all 11 block type arms inline), `QuizSection`, `LabChecklist`, `LabGuide`, `ClaudePrompts`, `NotesSection`, `SectionLabel`, `Card`, `PageFrame`, `MetaChip`, `HeroNote`, `HeroStat`, `DayView`, `MemoryMapView`, `InterviewQuestionsView`, `OneDayCrashView`, `Sidebar`, and the `App` shell.

### Target structure

```
src/
  App.jsx                   ← shell + routing only, ~80 lines
  main.jsx
  index.css
  lib/
    storage.js              ← localStorage + migration helper
    theme.js                ← per-day color helpers, getDayAccent(id)
  layout/
    AppShell.jsx
    Sidebar.jsx
    MobileHeader.jsx
    PageFrame.jsx
  views/
    DayView.jsx
    MemoryMapView.jsx
    InterviewQuestionsView.jsx
    OneDayCrashView.jsx
  blocks/
    ContentBlock.jsx        ← dispatcher
    TextBlock.jsx
    SubheadingBlock.jsx
    InterviewQuoteBlock.jsx
    SayBlock.jsx
    DontBlock.jsx
    CalloutBlock.jsx
    RadworkBlock.jsx
    ListBlock.jsx
    NumberedListBlock.jsx
    TableBlock.jsx
    CodeBlock.jsx
    MentalModelBlock.jsx    ← new
    TradeOffBlock.jsx       ← new
    FollowUpBlock.jsx       ← new
    RedFlagBlock.jsx        ← new
    LevelUpBlock.jsx        ← new
    EchoBlock.jsx           ← new
  features/
    SpeakTimer.jsx
    LabChecklist.jsx
    LabGuide.jsx
    QuizSection.jsx
    ClaudePrompts.jsx
    NotesSection.jsx
  ui/
    Card.jsx
    SectionLabel.jsx
    MetaChip.jsx
    HeroNote.jsx
    HeroStat.jsx
    Icons.jsx
  data/
    course.js               ← content (rewritten)
    labGuides.js            ← kept as-is
```

### Conventions

- No file over ~250 lines. If a file grows past that, split it.
- No state management library. State lives in `App` and flows down via props, same pattern as today.
- No prop types or TypeScript — personal project, keep friction low.
- Each `blocks/*Block.jsx` exports a default component that accepts a `block` prop.
- `ContentBlock.jsx` is a thin dispatcher that imports each block component and maps `block.type` to it.
- `lib/storage.js` exposes `loadProgress()`, `saveProgress(p)`, `resetProgress()`, and an internal `migrate(raw, version)` helper. Key becomes `ddia_progress_v2`; v1 data is migrated once on first load.
- `lib/theme.js` exposes `getDayAccent(dayId)` returning an object with `{ hex, tailwindText, tailwindBg, tailwindBorder }` style tokens.

---

## 6. Tech infrastructure fixes

### Tailwind

- Install `tailwindcss`, `@tailwindcss/vite`, and `autoprefixer`. Delete the CDN `<script src="https://cdn.tailwindcss.com">` from `index.html`.
- Create a real `tailwind.config.js` that extends the theme with the new palette (surface, ink, muted, faint, accent, accent-deep, accent-soft, code) and font families (display → Fraunces, body → Inter, mono → JetBrains Mono).
- The existing inline Tailwind config in `index.html` gets moved into this file.
- Wire the Tailwind plugin into `vite.config.js`.

### Fonts

- Install `@fontsource/fraunces`, `@fontsource/inter`, and `@fontsource/jetbrains-mono`.
- Import the needed weights in `src/main.jsx` (or a dedicated `src/fonts.js` imported once).
- Remove the Google Fonts `<link>` tags from `index.html`.

### localStorage

- Move all storage logic out of `App.jsx` into `src/lib/storage.js`.
- Version the key: new storage uses `ddia_progress_v2`.
- Provide a one-shot migration path: on first `loadProgress()`, if `ddia_progress_v2` is missing but `ddia_progress_v1` exists, read the v1 shape, merge it into the default v2 shape, save under the new key, and continue. The v1 key is left in place (not deleted) as a safety net.
- No schema change is actually required for v2 yet — the versioning is to make future migrations safe.

### Package changes summary

New dev dependencies: `tailwindcss`, `@tailwindcss/vite`, `autoprefixer`.
New runtime dependencies: `@fontsource/fraunces`, `@fontsource/inter`, `@fontsource/jetbrains-mono`.
Nothing is removed.

---

## 7. Rollout plan

Sequential, one continuous effort. Each step is a natural commit boundary so rollback is cheap.

1. **Infrastructure.** Install compiled Tailwind + fontsource packages. Wire `@tailwindcss/vite` into `vite.config.js`. Create `tailwind.config.js` with the **existing** (unchanged) color and font extensions moved out of the inline `index.html` config. Delete the Tailwind CDN `<script>` and the Google Fonts `<link>` tags from `index.html`. Import fontsource packages from `src/main.jsx`. Create the empty folder structure (`lib/`, `layout/`, `views/`, `blocks/`, `features/`, `ui/`). End state: site builds and runs identically to today, but on compiled Tailwind, self-hosted fonts, and with empty target folders ready for extraction. No code moved yet.

2. **Component extraction.** Extract storage helpers into `lib/storage.js` with the new `ddia_progress_v2` key and v1→v2 migration. Break `App.jsx` into the target files — one component per file — into `layout/`, `views/`, `blocks/`, `features/`, and `ui/`. `App.jsx` shrinks to shell + routing only. No visual changes. End state: functional parity with today, file sizes sane, all imports wired.

3. **Visual system.** Apply the new palette in `tailwind.config.js`. Swap fonts. Add `lib/theme.js` with `getDayAccent`. Rework the hero treatment (oversized outlined day numeral). Tighten vertical rhythm. Warm up code blocks. Add the "end of day" mark. End state: site looks like v2 but content is unchanged.

4. **New block types.** Build `MentalModelBlock`, `TradeOffBlock`, `FollowUpBlock`, `RedFlagBlock`, `LevelUpBlock`, `EchoBlock`. Register them in `ContentBlock.jsx`. End state: all 6 new types render correctly in isolation (verified by adding one temporary example per type into Day 1 and reviewing it in the browser).

5. **Content rewrite — Day 1.** Claude drafts the full Day 1 content rewrite using the new block types and the voice-forward rules. Replace flat `text` blocks where they go flat. Inject `mental-model` at the end of each section. Convert comparison prose to `trade-off`. Add at least one `follow-up` per section where interviewers would push back. Add `red-flag` for common junior-sounding mistakes. Owner reviews and ships.

6. **Content rewrite — Days 2 through 7.** Same pattern as Day 1, one day per pass. From Day 2 onward, inject `echo` blocks that reference earlier days where the mental models chain.

7. **Bonus views pass.** Memory Map gets section grouping (not a flat alphabetical list) and per-day color coding on terms. 25 Questions view fixes the persistence bug on the "key points" textarea (currently missing `value`/`onChange`) and wires it to `progress.notes['iq-{i}']` or similar. One-Day Crash view gets the voice treatment — rewrite its framing text and add a `level-up` block.

8. **Final review pass.** Read all 7 days end-to-end in the browser. Fix inconsistencies in tone, block usage, and color application. Ensure every section ends with a `mental-model`. Ensure `echo` blocks cross-reference correctly. Ensure per-day accent colors are applied consistently.

---

## 8. Known small issues folded into this work

- **25 Questions textarea not persisted.** `InterviewQuestionsView` in `src/App.jsx` renders `<textarea rows={3} placeholder="Key points..." />` with no `value` or `onChange`. Notes written there are thrown away on navigation. Fix as part of step 7 by wiring it to `progress.notes['iq-{i}']` or a dedicated `questionNotes` map on the progress shape.
- **localStorage is read-once.** Not a bug, but worth noting that opening the site in two tabs can produce last-write-wins races on progress. Acceptable for a personal single-device tool.

---

## 9. Explicit out-of-scope list

- Learning-science features: spaced repetition, flashcards, retention scoring, streak tracking.
- Practice-realism features: timed interview simulator, voice recording, AI grading integration, custom timer presets.
- Accessibility audits, SEO metadata, analytics, social sharing, OpenGraph images, PWA install.
- Dark mode toggle.
- Switching away from React + Vite + Tailwind (no MDX, Astro, Next).
- Multi-device sync, cloud persistence, account system.
- Automated tests.

---

## 10. Approval

This design was approved for spec writing on 2026-04-10 during the brainstorming session. Next step: write an implementation plan from this spec using the `writing-plans` skill.

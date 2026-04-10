## Project Snapshot

- Name: `ddia-course`
- Purpose: a browser-only study app for a 7-day *Designing Data-Intensive
  Applications* interview-prep course aimed at mid-level .NET engineers
- Runtime: React 18 + Vite 5, with no backend and no server-side rendering
- Persistence: all learner state is stored in `localStorage`

## File Map

- `index.html`
  - Mounts the React app into `#root`
- `src/main.jsx`
  - Bootstraps React and renders `App`
- `src/App.jsx`
  - Thin wrapper around `AppShell`
- `src/index.css`
  - Tailwind v4 `@theme` tokens (warm cream + teal accent palette, per-day
    color vars, display/body/mono font stacks)
  - Global custom surfaces: hero numeral, end-mark flourish, warm textarea,
    backdrop-blur panels, dark code surfaces
- `src/layout/`
  - `AppShell.jsx` — top-level state, view routing, progress persistence
  - `Sidebar.jsx` — left nav rail with progress and day navigation
  - `MobileHeader.jsx` — hamburger header for small screens
  - `PageFrame.jsx` — shared responsive page container
- `src/views/`
  - `DayView.jsx` — main day detail view with hero numeral and end mark
  - `MemoryMapView.jsx` — flash-recall map grouped by day with per-day accents
  - `InterviewQuestionsView.jsx` — 25 interview questions with persistent notes
  - `OneDayCrashView.jsx` — compressed one-day prep plan with level-up block
- `src/features/`
  - `LabChecklist.jsx`, `LabGuide.jsx`, `QuizSection.jsx`
  - `NotesSection.jsx`, `SpeakTimer.jsx`, `ClaudePrompts.jsx`
- `src/blocks/`
  - `ContentBlock.jsx` — dispatch registry for all block types
  - Content: `TextBlock`, `SubheadingBlock`, `InterviewQuoteBlock`, `SayBlock`,
    `DontBlock`, `CalloutBlock`, `RadworkBlock`, `ListBlock`,
    `NumberedListBlock`, `TableBlock`, `CodeBlock`
  - Voice-forward: `MentalModelBlock`, `TradeOffBlock`, `FollowUpBlock`,
    `RedFlagBlock`, `LevelUpBlock`, `EchoBlock`
- `src/ui/`
  - `Card.jsx`, `MetaChip.jsx`, `HeroNote.jsx`, `HeroStat.jsx`,
    `SectionLabel.jsx`, `Icons.jsx`
- `src/lib/`
  - `storage.js` — localStorage load/save under `ddia_progress_v2`
  - `theme.js` — `getDayAccent(dayId)` and `dayAccentStyle(dayId)` helpers
- `src/data/course.js`
  - Core course content exports:
    - `DAYS` (7-day voice-forward content)
    - `MEMORY_MAP` (terms tagged with originating day)
    - `INTERVIEW_QUESTIONS`
    - `STRONGER_ANSWERS`
    - `ONE_DAY_TOPICS`
    - `MEGA_PROMPT`
- `src/data/labGuides.js`
  - Day-keyed walkthroughs used by the mini-lab guide accordion

## Runtime Model

1. `main.jsx` mounts `App`.
2. `AppShell` loads saved progress from `localStorage` via `loadProgress()`.
3. `currentView` behaves like a lightweight route:
   - `day-{n}`
   - `memory-map`
   - `interview-qs`
   - `crash`
4. The chosen view renders one of the top-level view components.
5. Any progress change is immediately saved back to `localStorage`.

## State Shape

`defaultProgress()` returns:

```js
{
  completedDays: [],
  labItems: {},
  quizAnswers: {},
  currentView: 'day-1',
  notes: {},
  questionNotes: {},
}
```

Meaning:

- `completedDays`: list of finished day IDs
- `labItems`: boolean map for both day lab checklist items and interview
  question practice toggles
- `quizAnswers`: boolean map controlling quiz answer expansion
- `currentView`: current SPA section
- `notes`: per-day freeform notes
- `questionNotes`: per-question freeform notes in 25 Questions view

## Content Model

Each `DAYS` entry includes:

- metadata such as `id`, `title`, `shortTitle`, `chapters`, `theme`, and
  `duration`
- interview framing:
  - `interviewerTesting`
  - `outcome`
- `sections`, where each section contains `blocks` and ends with a
  `mental-model` block
- interactive learning support:
  - `lab`
  - `claudePrompts`
  - `quiz`
  - `speakDrill`

The UI supports these block types in `ContentBlock`:

- `text`, `subheading`, `interview-quote`, `say`, `dont`, `callout`
- `radwork`, `list`, `numbered-list`, `table`, `code`
- Voice-forward: `mental-model`, `trade-off`, `follow-up`, `red-flag`,
  `level-up`, `echo`

## UI Structure

- Left navigation rail:
  - progress summary
  - day navigation
  - bonus views
  - reset action
- Main study area:
  - day detail views with per-day accent colors (hero numeral, section
    chips, end mark)
  - memory map view grouped by day
  - interview questions tracker with persistent notes
  - one-day crash plan with voice-forward hero and level-up block
- Shared interactive patterns:
  - copy-to-clipboard for code and prompts
  - expandable quiz answers
  - expandable lab guide steps
  - notes textarea with template seeding
  - speak-aloud timer

## Design Direction

Current visual direction after the 2026-04-10 v2 rebuild:

- warm cream surface (`#faf7f2`) with deep teal accent (`#0d5f5f`) and
  burnt amber highlight (`#d97844`)
- editorial voice: Fraunces display serif for hero numerals, section
  titles, and italic quote-like content; Inter for body text; JetBrains
  Mono for labels and code
- per-day identity colors thread through each day via the `--day-accent`
  CSS variable: Day 1 teal, Day 2 moss, Day 3 amber, Day 4 oxblood,
  Day 5 indigo, Day 6 clay, Day 7 gold
- voice-forward content blocks — every section ends with a mental model,
  and each day includes trade-offs, follow-ups, red flags, level-up
  progressions, and cross-day echoes
- dark styling reserved for code-like surfaces only

## Constraints And Tradeoffs

- The app is intentionally offline/simple, so there is no sync across devices
- `localStorage` key is versioned (`ddia_progress_v2`) — future shape changes
  should bump the version and include a migration helper
- Tailwind v4 `@theme` tokens are the source of truth for colors and fonts;
  hardcoded hex values are discouraged outside `index.css` and `lib/theme.js`

## Update Log

- 2026-04-02: Documented project architecture and refreshed the UI toward a
  blue minimal aesthetic with dark code surfaces only.
- 2026-04-02: Updated the design direction to favor a single-column long-scroll
  layout and straighter sans-serif typography.
- 2026-04-10: DDIA course v2 rebuild — voice-forward content, warm palette
  with per-day accents, decomposed component architecture.

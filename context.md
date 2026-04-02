## Project Snapshot

- Name: `ddia-course`
- Purpose: a browser-only study app for a 7-day *Designing Data-Intensive
  Applications* interview-prep course aimed at mid-level .NET engineers
- Runtime: React 18 + Vite 5, with no backend and no server-side rendering
- Persistence: all learner state is stored in `localStorage`

## File Map

- `index.html`
  - Loads Tailwind via CDN
  - Defines shared font families in the inline Tailwind config
  - Mounts the React app into `#root`
- `src/main.jsx`
  - Bootstraps React and renders `App`
- `src/App.jsx`
  - Main SPA shell and almost all interactive UI
  - Owns view routing, persistence, navigation, timers, quizzes, notes, and
    rendering of content blocks
- `src/index.css`
  - Global styles, custom surfaces, animations, scrollbars, textarea styles,
    and dark code block styling
- `src/data/course.js`
  - Core course content exports:
    - `DAYS`
    - `MEMORY_MAP`
    - `INTERVIEW_QUESTIONS`
    - `STRONGER_ANSWERS`
    - `ONE_DAY_TOPICS`
    - `MEGA_PROMPT`
- `src/data/labGuides.js`
  - Day-keyed walkthroughs used by the mini-lab guide accordion

## Runtime Model

1. `main.jsx` mounts `App`.
2. `App` loads saved progress from `localStorage` using `STORAGE_KEY`.
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
}
```

Meaning:

- `completedDays`: list of finished day IDs
- `labItems`: boolean map for both day lab checklist items and interview
  question practice toggles
- `quizAnswers`: boolean map controlling quiz answer expansion
- `currentView`: current SPA section
- `notes`: per-day freeform notes

## Content Model

Each `DAYS` entry includes:

- metadata such as `id`, `title`, `shortTitle`, `chapters`, `theme`, and
  `duration`
- interview framing:
  - `interviewerTesting`
  - `outcome`
- `sections`, where each section contains `blocks`
- interactive learning support:
  - `lab`
  - `claudePrompts`
  - `quiz`
  - `speakDrill`

The UI currently supports these block types in `ContentBlock`:

- `text`
- `subheading`
- `interview-quote`
- `say`
- `dont`
- `callout`
- `radwork`
- `list`
- `numbered-list`
- `table`
- `code`

## UI Structure

- Left navigation rail:
  - progress summary
  - day navigation
  - bonus views
  - reset action
- Main study area:
  - day detail views
  - memory map view
  - interview questions tracker
  - one-day crash plan
- Shared interactive patterns:
  - copy-to-clipboard for code and prompts
  - expandable quiz answers
  - expandable lab guide steps
  - notes textarea with template seeding
  - speak-aloud timer

## Design Direction

Current visual direction after the 2026-04-02 refresh:

- light blue minimal shell
- airy white and pale-blue surfaces
- strong hierarchy through spacing, typography, and full-width sectional flow
- straight sans-serif typography instead of decorative serif headlines
- dark styling reserved for code-like surfaces only:
  - code examples
  - prompt/code presentation blocks

## Constraints And Tradeoffs

- Most UI logic still lives in `src/App.jsx`, so feature work can become
  harder to reason about if the file keeps growing
- Tailwind is CDN-driven rather than compiled from a local config pipeline
- The app is intentionally offline/simple, so there is no sync across devices
- `localStorage` key changes would break continuity unless migrated carefully

## Good Future Refactors

- Split `src/App.jsx` into view-level and section-level components
- Extract design tokens and shared UI primitives into a small component layer
- Add lightweight tests around persistence and view selection
- Add a localStorage migration helper before changing saved state shape

## Update Log

- 2026-04-02: Documented project architecture and refreshed the UI toward a
  blue minimal aesthetic with dark code surfaces only.
- 2026-04-02: Updated the design direction to favor a single-column long-scroll
  layout and straighter sans-serif typography.

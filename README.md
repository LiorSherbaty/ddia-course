# DDIA Interview Course

A 7-day interactive study guide for *Designing Data-Intensive Applications* (Martin Kleppmann), built for mid-level .NET engineers preparing for system design interviews.

## Features

- **Structured 7-day curriculum** covering replication, partitioning, transactions, batch/stream processing, and more
- **Interactive quizzes** and lab checklists per day
- **Speak-aloud drills** with built-in timer to practice interview delivery
- **Memory map** — a one-page reference sheet for quick review
- **25 curated interview questions** with guidance on strong answers
- **One-day crash course** mode for last-minute prep
- **Claude/ChatGPT mock interview prompt** included
- **Progress tracking** saved to localStorage — pick up where you left off

## Tech Stack

| Layer | Tech |
|-------|------|
| UI | React 18 |
| Build | Vite 5 |
| Styling | Tailwind CSS (CDN) + custom CSS |
| Persistence | localStorage |

No backend required — runs entirely in the browser.

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
index.html              Entry HTML (Tailwind config, fonts)
src/
  main.jsx              React entry point
  App.jsx               All UI components (single-file SPA)
  index.css             Global styles, dark theme, code blocks
  data/
    course.js           Structured course content (~1200 lines)
DDIA_Course_Final.md    Master course document (markdown source)
```

## Running Examples

The course uses two recurring domains for code examples:

- **OrderFlow** — an e-commerce order system (used for .NET/C# examples throughout)
- **RadWork** — a healthcare imaging worklist (used as a transfer bridge to apply concepts in a different context)

## License

This project is for personal/educational use.

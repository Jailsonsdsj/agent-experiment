# agent-experiment

An experiment in AI-assisted software development. The goal is to use the **Claude Code agent** to build a complete web system for creating and grading academic exams — and to reflect on the strengths and limitations of using an agent for this kind of work.

## What the system does

- Teachers create and manage a bank of multiple-choice questions
- Teachers assemble exams from the question bank and configure identification mode (letters A/B/C or powers of two 1/2/4/8)
- The system generates N randomized exam PDFs (one per student copy) and a matching answer key CSV
- Students fill out paper exams; their answers are uploaded as a CSV
- The system grades the responses (strict or lenient mode) and returns a detailed report

## Repository structure

```
agent-experiment/
├── System/
│   ├── Frontend/   React + TypeScript SPA
│   └── Backend/    Node.js + Express stateless API
├── DS Ref/         Visual design reference screenshots
└── README.md
```

## Architecture

The backend is **fully stateless** — it holds no data between requests. All application state (questions, exams) lives in the browser's `localStorage`. The backend only receives data, processes it (PDF generation, grading), and returns the result.

## Running locally

Both projects must run at the same time. Open two terminals:

```bash
# Terminal 1 — Backend
cd System/Backend
npm install
cp .env.example .env   # then fill in values
npm run dev

# Terminal 2 — Frontend
cd System/Frontend
npm install
cp .env.example .env   # then fill in values
npm run dev
```

Frontend runs at `http://localhost:5173` by default.
Backend runs at `http://localhost:3333` by default.

## Sub-project READMEs

- [Frontend →](System/Frontend/README.md)
- [Backend →](System/Backend/README.md)

## Important note on `.env.example`

The root `.gitignore` contains `.env.*` which also matches `.env.example`. If you intend to commit the example files, add a negation rule:

```gitignore
.env.*
!.env.example
```

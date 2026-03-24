# Sample AGENTS.md file

## Project Context

This project is a web-based system for creating, managing, generating, and grading multiple-choice exams.

The application enables users to build question banks, assemble exams, generate randomized exam versions in PDF format, and automatically grade student responses based on predefined answer keys.

## Tech Stack

**Frontend:** React + TypeScript
**Backend:** Node.js + TypeScript
**Testing:** Cucumber (Gherkin)

## Root Project Structure

```
agent-experiment/
├── System/
│   ├── Frontend/     ← React + TypeScript + Tailwind project
│   └── backend/      ← Express + TypeScript project
```

## Frontend Component Convention

- **Non-UI components** use the folder pattern: `components/<ComponentName>/index.tsx`
- **UI primitives** in `components/UI/` remain flat files (no subfolders)
- **AppLayout** is an exception — stays as a flat file

## Git Flow Instruction 
- Commit format: [<commit_type>]: <Short description >
- Commits types:
  - Feature
  - Refactor
  - Fix
  - Chore

Rules:

- Never stash any files, only commit the stashed files.


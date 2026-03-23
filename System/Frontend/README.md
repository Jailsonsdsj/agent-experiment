# Frontend — Exam Management System

React + TypeScript SPA for creating, managing, and grading academic exams.

## Stack

| Layer         | Technology                              |
|---------------|-----------------------------------------|
| Framework     | React 19 + TypeScript (strict)          |
| Build tool    | Vite 8                                  |
| Styling       | Tailwind CSS v4 (Vite plugin)           |
| Routing       | React Router v7                         |
| HTTP client   | Axios                                   |
| CSV parsing   | PapaParse                               |
| Linting       | ESLint + Prettier                       |

## Running locally

```bash
npm install
cp .env.example .env   # fill in VITE_API_BASE_URL
npm run dev            # http://localhost:5173
```

## Available scripts

| Script             | Description                        |
|--------------------|------------------------------------|
| `npm run dev`      | Start Vite dev server with HMR     |
| `npm run build`    | Type-check + production build      |
| `npm run preview`  | Serve the production build         |
| `npm run lint`     | Run ESLint                         |
| `npm run lint:fix` | Auto-fix lint issues               |
| `npm run format`   | Format with Prettier               |

## Environment variables

Copy `.env.example` to `.env` before starting:

| Variable            | Description               | Default                 |
|---------------------|---------------------------|-------------------------|
| `VITE_API_BASE_URL` | Base URL of the backend API | `http://localhost:3333` |

> Variables must be prefixed with `VITE_` to be exposed to the browser by Vite.

## Folder structure

```
src/
├── assets/                    Static files (images, icons)
├── components/                Reusable UI primitives
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── DesignPreview.tsx      Visual token reference (dev only)
│   ├── FormLayout.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── PageHeader.tsx
│   ├── Table.tsx
│   └── Textarea.tsx
├── hooks/                     Custom React hooks (useQuestions, useExams)
├── pages/
│   ├── questions/             Question management pages
│   └── exams/                 Exam management pages
├── services/
│   ├── apiService.ts          Axios instance — all backend calls go here
│   └── localStorageService.ts All localStorage read/write
├── types/
│   └── index.ts               Shared TypeScript interfaces
└── utils/                     Pure helper functions
```

## Design system

Tailwind v4 custom tokens are defined in `src/index.css` under `@theme {}`. All tokens are namespaced with `agt-`:

- **Colors**: `bg-agt-base`, `bg-agt-surface`, `text-agt-primary`, `text-agt-error`, etc.
- **Typography**: `text-agt-h1` → `text-agt-xs`, `font-agt-sans`, `font-agt-mono`
- **Spacing**: `p-agt-4`, `gap-agt-6`, `m-agt-8`, etc.
- **Radius**: `rounded-agt-sm` → `rounded-agt-full`
- **Shadows**: `shadow-agt-sm`, `shadow-agt-md`, `shadow-agt-lg`

## Key conventions

- Never call `localStorage` directly — always go through `localStorageService.ts`
- Never hardcode API URLs in components — always use `apiService.ts`
- All component props interfaces are exported and named `{ComponentName}Props`
- All components use only `agt-*` Tailwind tokens — no hardcoded colors or sizes
- `strict: true` is enabled — never use implicit `any`

## 1. Project Overview

This is the **frontend** of a web system for creating and grading academic tests.

Key responsibilities of the frontend:

- Manage questions (CRUD) and store them in localStorage
- Manage exams (CRUD) and store them in localStorage
- Trigger PDF and answer key CSV generation (via backend API)
- Upload student response CSVs and display grading reports (via backend API)

The **backend is stateless** — it does not store any data. All application state lives in the browser's localStorage.

------

## 2. Tech Stack

| Layer       | Technology            |
| ----------- | --------------------- |
| Framework   | React with TypeScript |
| Styling     | Tailwind CSS          |
| HTTP Client | Axios                 |
| CSV Parsing | PapaParse             |
| Build Tool  | Vite                  |
| Linting     | ESLint + Prettier     |

------

## 3. Folder Structure

Always place files in the correct folder. Never create files outside this structure without ask or justification.

```
src/
├── assets/           # Static files (images, icons)
├── components/
│   ├── AppLayout.tsx       # Root layout with sidebar navigation (exception: flat file)
│   ├── DesignPreview/      # Dev-only design token reference page
│   │   └── index.tsx
│   ├── ExamCard/           # Exam card with generate/edit/delete actions
│   │   └── index.tsx
│   ├── QuestionCard/       # Question card with edit/delete actions
│   │   └── index.tsx
│   └── UI/                 # Reusable UI primitives (flat files, no subfolders)
│       ├── AlternativeItem.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── FormLayout.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── PageHeader.tsx
│       ├── Table.tsx
│       └── Textarea.tsx
├── hooks/            # Custom React hooks — no JSX, named use<Domain>.ts
│   ├── useExamForm.ts
│   ├── useExams.ts
│   ├── useQuestionForm.ts
│   └── useQuestions.ts
├── pages/            # Page-level components mapped to routes
│   ├── DashboardPage.tsx
│   ├── questions/
│   │   ├── QuestionListPage.tsx
│   │   ├── QuestionCreatePage.tsx
│   │   └── QuestionEditPage.tsx
│   └── exams/
│       ├── ExamListPage.tsx
│       ├── ExamFormPage.tsx
│       ├── ExamEditPage.tsx
│       ├── ExamDetailPage.tsx
│       └── GradeReportPage.tsx
├── services/
│   ├── localStorageService.ts   # All localStorage read/write operations
│   └── apiService.ts            # All Axios calls to the backend
├── types/            # Shared TypeScript interfaces and enums
│   └── index.ts
└── utils/            # Pure helper functions (formatting, validation, etc.)
```

## 4. Data Layer – localStorage

**All question and exam data is persisted in localStorage.** There is no backend database.

- Always use `localStorageService.ts` for reading and writing data — never call `localStorage` directly from a component or hook.
- Use the following storage keys:

```ts
const STORAGE_KEYS = {
  QUESTIONS: 'agt:questions',
  EXAMS: 'agt:exams',
};
```

- Always serialize with `JSON.stringify` and deserialize with `JSON.parse`.
- Always wrap localStorage operations in `try/catch` to handle quota or parse errors.
- Return typed arrays — never return `any`.

------

## 5. TypeScript Conventions

- `strict: true` is enabled. Never use implicit `any`.
- All props, state, function parameters, and return types must be explicitly typed.
- All domain types live in `src/types/index.ts`. Key interfaces:

```ts
export type ExamIdentificationMode = 'letters' | 'powers-of-two';

export interface Alternative {
  id: string;
  description: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  statement: string;
  alternatives: Alternative[];
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  teacherName: string;
  description?: string;
  questionIds: string[];
  identificationMode: ExamIdentificationMode;
  createdAt: string;
}

export interface GeneratedExam {
  examNumber: number;
  questions: Question[];
}

export interface AnswerKey {
  examNumber: number;
  answers: string[];
}

export interface StudentResponse {
  examNumber: number;
  answers: string[];
  studentName?: string;
}

export interface GradingResult {
  studentName: string;
  examNumber: number;
  scores: number[];
  total: number;
}

export interface GradeReport {
  results: GradingResult[];
  totalStudents: number;
  averageScore: number;
}
```

- Use `interface` for objects, `type` for unions and aliases.
- Use `enum` only when values are truly fixed and semantic. Prefer string union types otherwise.

------

## 6. Component Conventions

- One component per file. File name matches the component name in PascalCase.
- Use **functional components** only. No class components.
- Use `React.FC<Props>` or explicit return type annotation.
- Keep components small and focused. If a component exceeds ~150 lines, consider splitting it.
- **Non-UI components** follow the folder pattern: `components/<ComponentName>/index.tsx`. Exception: `AppLayout.tsx` stays as a flat file.
- **UI primitives** (Button, Input, Modal, etc.) live flat inside `src/components/UI/` — no subfolders.
- Page components live in `src/pages/` and are responsible for layout and data orchestration only — not business logic.

------

## 7. Custom Hooks

- Extract all localStorage interactions and derived state into custom hooks.
- Hooks live in `src/hooks/` and are named `use<Domain>.ts`.
- Hooks must not contain JSX.

------

## 8. API Communication

- All calls to the backend live in `src/services/apiService.ts`.
- Use Axios with a configured base instance:

```ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default api;
```

- Never hardcode URLs in components or hooks — always use `apiService.ts`.
- Export named async functions for each endpoint (e.g. `generatePdf`). Each function defines its own payload interface locally in `apiService.ts` and returns a typed promise. Use `responseType: 'blob'` for binary responses (ZIP, PDF).

------

## 9. Styling Conventions

- Use **Tailwind CSS utility classes** exclusively. Do not write custom CSS unless absolutely necessary (e.g., a CSS animation not supported by Tailwind).
- Never use inline `style={{}}` props.
- Design tokens (colors, font sizes, spacing) are defined in `tailwind.config.js` under `theme.extend`. Always use those tokens — never hardcode color hex values in JSX.
- Responsive design is required. Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`).

------

## 10. Code Quality Rules

- **No commented-out code** in committed files.
- **No console.log** in committed files. Use a utility logger or remove debug statements before committing.
- **No magic numbers or strings** — extract them into named constants.
- Every function must do one thing. If a function has more than one responsibility, split it.
- Prefer `const` over `let`. Never use `var`.
- Use `async/await` over `.then()` chains.
- Always handle errors explicitly — never silently swallow exceptions.

------

## 11. Git Conventions

- Branch naming: `feature/P{phase}-{code}-{short-slug}` (e.g., `feature/P4-01-question-crud`)
- Commit message format (Conventional Commits):
  - `<task_code> feat: add question creation form`
  - `<task_code> fix: correct localStorage key collision`
  - `<task_code> refactor: extract useQuestions hook`
  - `<task_code> test: add Gherkin scenarios for exam CRUD`
  - `<task_code> docs: update README with localStorage notes`
- Commit small and often — one logical change per commit.
- If the task code was not provided, ask the user.
------

## 12. What to Avoid

- Do not install new dependencies without confirming with the user first.
- Do not create global state (e.g., Context, Zustand) unless explicitly requested.
- Do not call `localStorage` directly outside of `localStorageService.ts`.
- Do not use `any` type — ever.
- Do not create new folders outside the defined structure without justification.
- Do not write backend logic in the frontend. CSV generation and grading live in the backend.
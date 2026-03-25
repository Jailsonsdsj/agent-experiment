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

---

## Accessing the system

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL to the backend URL
npm run dev            # http://localhost:5173
```

The backend must also be running for PDF generation and grading to work. Questions and exams can be managed without the backend.

> **Data storage** — questions and exams are saved in the browser's `localStorage`. Clearing site data or switching browsers will erase all stored content.

---

## How to use

### Question bank

Go to **Questions** in the sidebar.

- **Create** — click **Create new question**, write a statement, add 2–8 alternatives, mark at least one as correct, and save.
- **Edit** — open a question card's menu and choose **Edit**.
- **Delete** — open a question card's menu and choose **Delete**.
- **Bulk import from CSV** — go to **Admin** in the sidebar, upload a `.csv` file and click **Import**. See [How to import questions via CSV](../../Docs/How%20to%20import%20questions%20via%20CSV.md) for the required format.

### Exams

Go to **Exams** in the sidebar.

- **Create** — click **Create exam**, fill in the title, teacher name, optional description, choose an identification mode, and select at least one question from the bank.
- **Edit** — open an exam card's menu and choose **Edit**.
- **Delete** — open an exam card's menu and choose **Delete**.

**Identification modes** control how alternatives are labelled on printed exams:

| Mode | Labels | Answer key format |
|------|--------|-------------------|
| Letters | A, B, C… | Circle letters; multi-correct written as `AC` |
| Powers of 2 | 1, 2, 4, 8… | Write the sum of selected values |

### PDF generation

From the **Exams** list, open a card and click **Generate PDF**.

1. Enter the number of copies.
2. Click **Generate PDF**.
3. A `.zip` downloads automatically containing:
   - One PDF per copy (`exam_1.pdf`, `exam_2.pdf`, …) — each copy has its own independently shuffled question and alternative order.
   - `answer_key.csv` — one row per copy with the correct answers matching that copy's shuffled layout.

Requires the backend to be running.

### Grading

From the **Exams** list, open a card and click **Grade**.

1. Upload the **answer key CSV** (the `answer_key.csv` from the generated ZIP).
2. Upload the **student responses CSV** (exported from Google Forms or equivalent).
3. Choose a **grading mode**:
   - **Strict** — full marks only if the selection exactly matches the answer key; any wrong or missing alternative scores zero for that question.
   - **Lenient** — score is proportional to the share of alternatives handled correctly (correctly selected + correctly not selected).
4. Click **Grade exams**.

Results show each student's per-question scores, their total, and the class average.

**Student responses CSV format:**

```
student_name,exam_number,q1,q2,q3,...
João Silva,1,A,B,D
Maria Costa,2,C,AC,B
```

Requires the backend to be running.

---

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
| `npm test`         | Run Cucumber acceptance tests      |

## Environment variables

Copy `.env.example` to `.env` before starting:

| Variable            | Description               | Default                 |
|---------------------|---------------------------|-------------------------|
| `VITE_API_BASE_URL` | Base URL of the backend API | `http://localhost:3333` |

> Variables must be prefixed with `VITE_` to be exposed to the browser by Vite.

## Folder structure

```
src/
├── assets/                        Static files (images, icons)
├── components/
│   ├── AppLayout.tsx              Root layout with sidebar navigation
│   ├── DesignPreview/
│   │   └── index.tsx              Dev-only design token reference page
│   ├── ExamCard/
│   │   └── index.tsx              Card displayed on the Exams list
│   ├── QuestionCard/
│   │   └── index.tsx              Card displayed on the Questions list
│   └── UI/
│       ├── AlternativeItem.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── FileInput.tsx
│       ├── FormLayout.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── PageHeader.tsx
│       ├── Table.tsx
│       └── Textarea.tsx
├── hooks/
│   ├── useExamForm.ts             Form state for exam creation/editing
│   ├── useExams.ts                Exam list state (load, delete)
│   ├── useQuestionForm.ts         Form state for question creation/editing
│   └── useQuestions.ts            Question list state (load, delete)
├── pages/
│   ├── AdminPage.tsx              Bulk question import via CSV
│   ├── DashboardPage.tsx
│   ├── questions/
│   │   ├── QuestionCreatePage.tsx
│   │   ├── QuestionEditPage.tsx
│   │   └── QuestionListPage.tsx
│   └── exams/
│       ├── ExamDetailPage.tsx     PDF generation
│       ├── ExamEditPage.tsx
│       ├── ExamFormPage.tsx       Exam creation
│       ├── ExamListPage.tsx
│       └── GradeReportPage.tsx    Grading upload + results table
├── services/
│   ├── apiService.ts              Axios instance — all backend calls go here
│   └── localStorageService.ts     All localStorage read/write
├── types/
│   └── index.ts                   Shared TypeScript interfaces
└── utils/
    └── questionCsvParser.ts       Parses CSV files for bulk question import
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

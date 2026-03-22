## 1. Project Overview

This is the **backend** of a web system for creating and grading academic tests.

The backend is **fully stateless**. It does not own any data and does not use a database.  
Every request must carry all the data needed to process it. The backend receives data from the frontend, processes it, and returns a result. Nothing is stored between requests.

Key responsibilities:
- Generate N randomized exam PDFs from exam data received in the request body (using pdfkit)
- Generate an answer key CSV alongside the PDFs
- Receive student response CSVs + answer key CSVs and compute grading results (strict or lenient)
- Return all results directly in the HTTP response

---

## 2. Tech Stack

| Layer            | Technology                        |
|------------------|-----------------------------------|
| Runtime          | Node.js (LTS)                     |
| Framework        | Express                           |
| Language         | TypeScript (strict mode)          |
| PDF Generation   | pdfkit                            |
| CSV Parsing      | csv-parse                         |
| File Uploads     | multer                            |
| Environment Vars | dotenv                            |
| CORS             | cors                              |
| Dev Server       | ts-node + nodemon                 |
| Linting          | ESLint + Prettier                 |

---

## 3. Folder Structure

Always place files in the correct folder. Never create files outside this structure without justification.

```
src/
├── controllers/      # Route handler functions (thin — delegate to services)
│   ├── pdfController.ts
│   └── gradingController.ts
├── routes/           # Express router definitions
│   ├── pdfRoutes.ts
│   └── gradingRoutes.ts
├── services/         # Business logic (PDF generation, grading, CSV building)
│   ├── pdfService.ts
│   ├── csvService.ts
│   └── gradingService.ts
├── middlewares/      # Express middlewares (error handler, upload config)
│   ├── errorHandler.ts
│   └── uploadMiddleware.ts
├── types/            # Shared TypeScript interfaces and enums
│   └── index.ts
├── utils/            # Pure helper functions (math, formatting, randomization)
│   └── shuffle.ts
└── index.ts          # App entry point — server bootstrap only
```

---

## 4. Stateless Architecture Rules

This is the most critical constraint of this backend. Enforce it strictly:

- **No database.** Do not install or suggest any database driver, ORM, or query builder.
- **No file system persistence.** Do not write data to disk between requests. Temporary files during a single request lifecycle are acceptable if cleaned up before the response is sent.
- **No in-memory global state.** Do not use module-level variables to store request data across requests (e.g., a global `questions` array). Each request is independent.
- **All input comes from the request.** Every piece of data the backend needs must arrive in the request body, query params, or uploaded files.
- **All output goes in the response.** PDFs, CSVs, and grading results are returned directly in the HTTP response — never saved to disk for later retrieval.

---

## 5. TypeScript Conventions

- `strict: true` is enabled. Never use implicit `any`.
- All function parameters, return types, and object shapes must be explicitly typed.
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
}

export interface Exam {
  id: string;
  title: string;
  questions: Question[];
  identificationMode: ExamIdentificationMode;
}

export interface GeneratedExam {
  examNumber: number;
  questions: ShuffledQuestion[];
}

export interface ShuffledQuestion {
  original: Question;
  shuffledAlternatives: Alternative[];
}

export interface AnswerKeyRow {
  examNumber: number;
  answers: string[];
}

export interface StudentResponse {
  examNumber: number;
  studentName: string;
  answers: string[];
}

export type GradingMode = 'strict' | 'lenient';

export interface GradingResult {
  studentName: string;
  examNumber: number;
  scores: number[];
  total: number;
}
```

- Use `interface` for objects, `type` for unions and aliases.
- Never use `any`, `object`, or `{}` as a type. Use `unknown` if the type is truly unknown, then narrow it.

---

## 6. API Design Conventions

### Routes

| Method | Path           | Description                                      |
|--------|----------------|--------------------------------------------------|
| GET    | /health        | Health check — returns `{ status: 'ok' }`        |
| POST   | /generate-pdf  | Generate N exam PDFs + answer key CSV            |
| POST   | /grade         | Grade student responses, return GradingResult[]  |

### Request / Response rules

- Use JSON for all request bodies except file uploads (which use `multipart/form-data` via multer).
- Always return JSON for error responses.
- Always return appropriate HTTP status codes:
  - `200` — success
  - `400` — bad request (missing or invalid input)
  - `500` — internal server error
- For file responses (PDF, CSV), set correct `Content-Type` and `Content-Disposition` headers.
- Never expose stack traces in production error responses.

### Error response shape

```ts
{
  "error": "Human-readable message describing what went wrong"
}
```

---

## 7. PDF Generation – pdfkit

- All PDF logic lives in `src/services/pdfService.ts`.
- Use `pdfkit` only. Do not suggest alternative PDF libraries.
- Each generated exam PDF must include:
  - **Header**: course name, instructor, date (received from the request)
  - **Body**: questions with shuffled alternatives, identified by letters (A, B, C…) or powers of 2 (1, 2, 4, 8…) depending on `identificationMode`
    - For letter mode: blank space after each question for the student to write selected letters
    - For power-of-2 mode: blank space for the student to write the sum of selected alternatives
  - **Footer**: exam number on every page
  - **Last page**: space for student name and CPF
- Question and alternative order must be independently randomized per exam copy.
- When generating N exams, stream all PDFs into a single ZIP archive returned in the response. Use the `archiver` package for ZIP creation.
- The answer key CSV must be generated in the same request and included in the ZIP.

---

## 8. CSV Logic

- All CSV logic lives in `src/services/csvService.ts`.
- Use `csv-parse` for parsing incoming CSV files (student responses).
- Build outgoing CSVs (answer key) manually as strings — no external CSV writer library needed.
- Answer key CSV format:
  ```
  exam_number,q1,q2,q3,...
  1,A,B,C
  2,C,A,B
  ```
- Student response CSV format (Google Forms export):
  ```
  student_name,exam_number,q1,q2,q3,...
  João Silva,1,A,B,D
  ```
- Always validate CSV structure before processing. Return a `400` error with a clear message if the format is invalid.

---

## 9. Grading Logic

- All grading logic lives in `src/services/gradingService.ts`.
- The grading service receives: `AnswerKeyRow[]`, `StudentResponse[]`, and `GradingMode`.
- **Strict mode**: if any alternative is incorrectly selected or any correct alternative is missing, the question scores 0. Full marks only if the selection exactly matches the answer key.
- **Lenient mode**: score is proportional to the percentage of correctly handled alternatives (correctly selected + correctly not selected) out of the total number of alternatives in the question.
- Return a `GradingResult[]` array — one entry per student response row.
- Do not mix grading mode logic in the same function. Use separate functions `gradeStrict` and `gradeLenient`, both called from a single `gradeQuestion` dispatcher.

---

## 10. Middleware Conventions

- **Error handler** (`src/middlewares/errorHandler.ts`): a single Express error-handling middleware registered last in `index.ts`. All thrown errors must be caught and forwarded to this middleware via `next(error)`.
- **Upload middleware** (`src/middlewares/uploadMiddleware.ts`): configure multer for memory storage (`multer.memoryStorage()`). Never save uploaded files to disk.
- **CORS** (`index.ts`): configure `cors` to allow requests from the frontend origin defined in the `FRONTEND_URL` environment variable.

---

## 11. Environment Variables

All environment variables are defined in `.env` and accessed via `process.env`. Never hardcode values.

| Variable      | Description                                      |
|---------------|--------------------------------------------------|
| PORT          | Port the Express server listens on (default 3333)|
| FRONTEND_URL  | Allowed CORS origin (e.g., http://localhost:5173)|

Always validate that required env variables are present at startup. If a required variable is missing, log a clear error and exit the process.

---

## 12. Code Quality Rules

- **Controllers are thin.** They validate input, call a service, and send the response. No business logic in controllers.
- **Services are pure logic.** They receive typed inputs and return typed outputs. No Express `req`/`res` objects inside services.
- **No commented-out code** in committed files.
- **No `console.log`** in committed files. Use a simple logger utility or remove before committing.
- **No magic numbers or strings** — extract into named constants.
- Every function must do one thing. If a function exceeds ~60 lines, consider splitting it.
- Prefer `const` over `let`. Never use `var`.
- Use `async/await` over `.then()` chains.
- Always handle errors explicitly — never silently swallow exceptions.
- Always `await` async calls — never fire and forget.

---

## 13. Git Conventions

- Branch naming: `feature/P{phase}-{code}-{short-slug}` (e.g., `feature/P4-12-pdf-generation`)
- Commit message format (Conventional Commits):
  - `<task_code> feat: add question creation form`
  - `<task_code> fix: correct localStorage key collision`
  - `<task_code> refactor: extract useQuestions hook`
  - `<task_code> test: add Gherkin scenarios for exam CRUD`
  - `<task_code> docs: update README with localStorage notes`
- Commit small and often — one logical change per commit.

---

## 14. What to Avoid

- Do not install a database driver, ORM, or cache layer of any kind.
- Do not write uploaded files or generated files to disk permanently.
- Do not store any data in module-level or global variables between requests.
- Do not put business logic in controllers or route files.
- Do not put Express-specific code (`req`, `res`, `next`) inside service files.
- Do not use `any` type — ever.
- Do not suggest alternative PDF libraries — use pdfkit only.
- Do not create new folders outside the defined structure without justification.
- Do not install new dependencies without confirming with the user first.
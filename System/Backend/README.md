# Backend — Exam Management System

Stateless Node.js + Express API for PDF generation and exam grading.

## Stack

| Layer          | Technology                     |
|----------------|--------------------------------|
| Runtime        | Node.js LTS                    |
| Framework      | Express 5                      |
| Language       | TypeScript (strict)            |
| PDF generation | pdfkit                         |
| ZIP bundling   | archiver                       |
| CSV parsing    | csv-parse                      |
| File uploads   | multer (memory storage)        |
| CORS           | cors                           |
| Env vars       | dotenv                         |
| Dev server     | ts-node-dev                    |
| Testing        | Cucumber + supertest           |
| Linting        | ESLint + Prettier              |

---

## Setup

```bash
npm install
cp .env.example .env   # fill in PORT and FRONTEND_URL
npm run dev            # http://localhost:3333
```

The server exits on startup if `FRONTEND_URL` is not set.

## Available scripts

| Script             | Description                            |
|--------------------|----------------------------------------|
| `npm run dev`      | Start dev server with auto-reload      |
| `npm run build`    | Compile TypeScript to `dist/`          |
| `npm run start`    | Run compiled output (production)       |
| `npm test`         | Run Cucumber acceptance tests          |
| `npm run lint`     | Run ESLint                             |
| `npm run lint:fix` | Auto-fix lint issues                   |
| `npm run format`   | Format with Prettier                   |

## Environment variables

Copy `.env.example` to `.env` before starting:

| Variable       | Required | Description                     | Default  |
|----------------|----------|---------------------------------|----------|
| `PORT`         | No       | Port the server listens on      | `3333`   |
| `FRONTEND_URL` | **Yes**  | Allowed CORS origin             | —        |

---

## API reference

All error responses share this shape:

```json
{ "error": "Human-readable description of what went wrong" }
```

---

### `GET /health`

Health check.

**Response `200`**

```json
{ "status": "ok" }
```

---

### `POST /generate-pdf`

Generates N randomized exam copies as PDFs and an answer key CSV, bundled into a single ZIP file.

**Request** — `Content-Type: application/json`

```json
{
  "exam": {
    "id": "uuid",
    "title": "Midterm Exam",
    "teacherName": "Prof. Silva",
    "identificationMode": "letters",
    "questionIds": ["uuid-1", "uuid-2"],
    "createdAt": "2026-03-25T10:00:00.000Z"
  },
  "questions": [
    {
      "id": "uuid-1",
      "statement": "What is 2 + 2?",
      "alternatives": [
        { "id": "alt-1", "description": "3",  "isCorrect": false },
        { "id": "alt-2", "description": "4",  "isCorrect": true  },
        { "id": "alt-3", "description": "5",  "isCorrect": false }
      ],
      "createdAt": "2026-03-25T10:00:00.000Z"
    }
  ],
  "copies": 30
}
```

| Field | Type | Rules |
|-------|------|-------|
| `exam.title` | string | Required, non-blank |
| `exam.teacherName` | string | Required, non-blank |
| `exam.identificationMode` | `"letters"` \| `"powers-of-two"` | Required |
| `questions` | array | Required, at least 1 item |
| `questions[].statement` | string | Required, non-blank |
| `questions[].alternatives` | array | Required, at least 1 item |
| `copies` | integer | Required, ≥ 1 |

**Response `200`** — `Content-Type: application/zip`

A ZIP archive downloaded as `<exam title>.zip` containing:

- `exam_1.pdf` … `exam_N.pdf` — one PDF per copy; question and alternative order are independently shuffled per copy. Each PDF includes a header (title, teacher, date), numbered questions with labelled alternatives, a per-page footer with the exam number, and a name/CPF field on the last page.
- `answer_key.csv` — one row per copy with the correct answers in that copy's shuffled order.

```
exam_number,q1,q2,q3
1,B,AC,A
2,A,C,B
```

Alternative labels depend on `identificationMode`:
- `letters` — `A`, `B`, `C`… Multi-correct answers are concatenated: `AC`
- `powers-of-two` — `1`, `2`, `4`, `8`… Multi-correct answers are the sum: `5`

**Response `400`** — missing or invalid fields

---

### `POST /grade`

Grades student responses against an answer key and returns one result per student.

**Request** — `Content-Type: multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `answerKey` | file (CSV) | Answer key — the `answer_key.csv` from the ZIP produced by `/generate-pdf` |
| `responses` | file (CSV) | Student responses CSV |
| `gradingMode` | string field | `"strict"` or `"lenient"` |

**Answer key CSV format:**

```
exam_number,q1,q2,q3
1,B,AC,A
2,A,C,B
```

**Student responses CSV format:**

```
student_name,exam_number,q1,q2,q3
João Silva,1,B,A,A
Maria Costa,2,A,C,B
```

**Grading modes:**

| Mode | Scoring rule |
|------|-------------|
| `strict` | Score `1` only if the selection exactly matches the key. Any wrong or missing alternative → `0`. |
| `lenient` | Score = `(correctly handled alternatives) / (total alternatives)`, rounded to 2 decimal places. An alternative is "correctly handled" when the student selected it and it was correct, or did not select it and it was wrong. |

**Response `200`** — `Content-Type: application/json`

```json
[
  {
    "studentName": "João Silva",
    "examNumber": 1,
    "scores": [1, 0, 1],
    "total": 2
  },
  {
    "studentName": "Maria Costa",
    "examNumber": 2,
    "scores": [1, 1, 1],
    "total": 3
  }
]
```

A student referencing an exam number not found in the answer key receives all zeros.

**Response `400`** — missing files or invalid/missing `gradingMode`

**Response `500`** — CSV structure error (missing required columns, no data rows)

---

## Running tests

Tests use [Cucumber](https://cucumber.io/) with TypeScript step definitions. No running server is needed — endpoint tests use `supertest` against an in-process Express app.

```bash
npm test
```

An HTML report is written to `reports/cucumber-report.html` after each run.

### Test structure

```
features/
├── grading.feature                     # Service-level grading scenarios
├── grading_scenarios.feature           # Extended grading scenarios (batch, unknown exam)
├── pdf_generation.feature              # Service-level PDF/ZIP scenarios
├── generate_pdf_endpoint.feature       # HTTP scenarios for POST /generate-pdf
├── grade_endpoint.feature              # HTTP scenarios for POST /grade
├── step_definitions/
│   ├── grading.steps.ts
│   ├── pdf_generation.steps.ts
│   ├── generate_pdf_endpoint.steps.ts
│   └── grade_endpoint.steps.ts
└── support/
    ├── testApp.ts                      # Minimal Express app for supertest (no .listen())
    ├── world.ts                        # Shared Cucumber world type
    ├── hooks.ts                        # Before/After hooks
    └── zipPdfUtils.ts                  # ZIP reader + PDF text extractor utilities
```

See [How to test](../../Docs/How%20to%20test.md) for guidance on writing new scenarios and step definitions.

---

## Folder structure

```
src/
├── controllers/
│   ├── helloController.ts         GET /hello — smoke-test response
│   ├── pdfController.ts           POST /generate-pdf — validates input, calls pdfService
│   └── gradingController.ts       POST /grade — validates files/mode, calls gradingService
├── routes/
│   ├── helloRoutes.ts
│   ├── pdfRoutes.ts
│   └── gradingRoutes.ts           Mounts multer upload middleware before gradingController
├── services/
│   ├── pdfService.ts              Builds per-copy PDFs (pdfkit), bundles into ZIP (archiver)
│   ├── csvService.ts              Builds answer key CSV strings; parses incoming CSV files
│   └── gradingService.ts          gradeStrict / gradeLenient logic, gradeExams entry point
├── middlewares/
│   ├── errorHandler.ts            Global Express error handler — returns { error } JSON
│   └── uploadMiddleware.ts        Multer configured with memoryStorage()
├── types/
│   └── index.ts                   All shared TypeScript interfaces and type aliases
├── utils/
│   └── shuffle.ts                 Fisher-Yates shuffle
└── server.ts                      Express bootstrap: CORS, routes, error handler, listen
```

---

## Architecture constraints

This backend is **intentionally stateless**:

- No database — never install a DB driver or ORM
- No disk persistence — uploaded files and generated files exist only in memory during the request lifecycle
- No global state — every request is fully independent
- All input comes from the request body or uploaded files
- All output is returned directly in the HTTP response

## Key conventions

- **Controllers are thin** — validate input, call a service, send the response
- **Services are pure** — typed inputs and outputs, no `req`/`res` objects inside
- Uploaded files use `multer.memoryStorage()` — never written to disk
- All errors are forwarded via `next(error)` to the global `errorHandler`
- `strict: true` is enabled — never use implicit `any`

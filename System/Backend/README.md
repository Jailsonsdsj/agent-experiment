# Backend — Exam Management System

Stateless Node.js + Express API for PDF generation and exam grading.

## Stack

| Layer          | Technology                     |
|----------------|--------------------------------|
| Runtime        | Node.js LTS                    |
| Framework      | Express 5                      |
| Language       | TypeScript (strict)            |
| PDF generation | pdfkit                         |
| CSV parsing    | csv-parse                      |
| File uploads   | multer (memory storage)        |
| CORS           | cors                           |
| Env vars       | dotenv                         |
| Dev server     | ts-node-dev                    |
| Linting        | ESLint + Prettier              |

## Running locally

```bash
npm install
cp .env.example .env   # fill in PORT and FRONTEND_URL
npm run dev            # http://localhost:3333
```

## Available scripts

| Script             | Description                            |
|--------------------|----------------------------------------|
| `npm run dev`      | Start dev server with auto-reload      |
| `npm run build`    | Compile TypeScript to `dist/`          |
| `npm run start`    | Run compiled output (production)       |
| `npm run lint`     | Run ESLint                             |
| `npm run lint:fix` | Auto-fix lint issues                   |
| `npm run format`   | Format with Prettier                   |

## Environment variables

Copy `.env.example` to `.env` before starting:

| Variable       | Description                        | Default                    |
|----------------|------------------------------------|----------------------------|
| `PORT`         | Port the server listens on         | `3333`                     |
| `FRONTEND_URL` | Allowed CORS origin                | `http://localhost:5173`    |

## API reference

| Method | Path            | Description                                      |
|--------|-----------------|--------------------------------------------------|
| GET    | `/health`       | Health check — returns `{ status: "ok" }`        |
| GET    | `/hello`        | Smoke-test endpoint — returns `{ message: "Hello World" }` |
| POST   | `/generate-pdf` | Generate N randomized exam PDFs + answer key CSV |
| POST   | `/grade`        | Grade student responses, return GradingResult[]  |

### Error response shape

```json
{ "error": "Human-readable description of what went wrong" }
```

## Folder structure

```
src/
├── controllers/
│   ├── helloController.ts     GET /hello
│   ├── pdfController.ts       POST /generate-pdf
│   └── gradingController.ts   POST /grade
├── routes/
│   ├── helloRoutes.ts
│   ├── pdfRoutes.ts
│   └── gradingRoutes.ts
├── services/
│   ├── pdfService.ts          PDF generation logic (pdfkit)
│   ├── csvService.ts          CSV build + parse logic
│   └── gradingService.ts      Strict and lenient grading
├── middlewares/
│   ├── errorHandler.ts        Global Express error handler
│   └── uploadMiddleware.ts    Multer (memory storage) config
├── types/
│   └── index.ts               Shared TypeScript interfaces
├── utils/
│   └── shuffle.ts             Fisher-Yates shuffle
└── server.ts                  Bootstrap: Express app + routes
```

## Architecture constraints

This backend is **intentionally stateless**:

- No database — never install a DB driver or ORM
- No disk persistence — uploaded files and generated files live only in memory during the request lifecycle
- No global state — every request is fully independent
- All input comes from the request body or uploaded files
- All output is returned directly in the HTTP response

## Key conventions

- **Controllers are thin** — validate input, call a service, send the response
- **Services are pure** — typed inputs and outputs, no `req`/`res` objects inside
- Uploaded files use `multer.memoryStorage()` — never written to disk
- All errors are forwarded via `next(error)` to the global `errorHandler`
- `strict: true` is enabled — never use implicit `any`

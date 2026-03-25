import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../support/testApp';
import type { AppWorld } from '../support/world';
import { type ZipEntry, readZipEntries } from '../support/zipPdfUtils';

// ── Types ─────────────────────────────────────────────────────

interface ExamPayload {
  id: string;
  title: string;
  teacherName: string;
  identificationMode: string;
  questionIds: string[];
  createdAt: string;
}

interface QuestionPayload {
  id: string;
  statement: string;
  alternatives: { id: string; description: string; isCorrect: boolean }[];
  createdAt: string;
}

interface RequestBody {
  exam?: Partial<ExamPayload>;
  questions?: Partial<QuestionPayload>[];
  copies?: number;
}

// ── Fixtures ──────────────────────────────────────────────────

function makeQuestion(index: number, altCount: number): QuestionPayload {
  return {
    id: crypto.randomUUID(),
    statement: `Question ${index}`,
    alternatives: Array.from({ length: altCount }, (_, i) => ({
      id: crypto.randomUUID(),
      description: `Alt ${i + 1}`,
      isCorrect: i === 0,
    })),
    createdAt: new Date().toISOString(),
  };
}

function makeExam(title: string, teacherName: string, mode: string, questionIds: string[]): ExamPayload {
  return {
    id: crypto.randomUUID(),
    title,
    teacherName,
    identificationMode: mode,
    questionIds,
    createdAt: new Date().toISOString(),
  };
}

// ── World ─────────────────────────────────────────────────────

interface EndpointWorld extends Omit<AppWorld, 'requestBody'> {
  requestBody: RequestBody;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBuffer: Buffer | null;
  responseJson: Record<string, unknown> | null;
  zipEntries: ZipEntry[];
}

// ── Given ─────────────────────────────────────────────────────

Given(
  'a valid exam payload titled {string} by teacher {string} with {string} mode',
  function (this: EndpointWorld, title: string, teacherName: string, mode: string) {
    this.zipEntries = [];
    this.responseBuffer = null;
    this.responseJson = null;
    this.requestBody = { exam: makeExam(title, teacherName, mode, []), questions: [] };
  },
);

Given(
  'the payload includes {int} questions with {int} alternatives each',
  function (this: EndpointWorld, qCount: number, altCount: number) {
    const questions = Array.from({ length: qCount }, (_, i) => makeQuestion(i + 1, altCount));
    const questionIds = questions.map((q) => q.id);
    this.requestBody = {
      ...this.requestBody,
      questions,
      exam: { ...this.requestBody.exam, questionIds },
    };
  },
);

// ── When – success path ───────────────────────────────────────

When(
  /I POST the payload to \/generate-pdf with (\d+) cop(?:y|ies)/,
  async function (this: EndpointWorld, copies: string) {
    const body: RequestBody = { ...this.requestBody, copies: Number(copies) };
    const res = await request(app)
      .post('/generate-pdf')
      .send(body)
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      });

    this.responseStatus = res.status;
    this.responseHeaders = res.headers as Record<string, string>;

    if (res.status === 200) {
      this.responseBuffer = res.body as Buffer;
      this.zipEntries = readZipEntries(this.responseBuffer);
    } else {
      this.responseBuffer = null;
      this.responseJson = res.body as Record<string, unknown>;
    }
  },
);

// ── When – invalid payloads ───────────────────────────────────

async function postInvalid(world: EndpointWorld, body: RequestBody): Promise<void> {
  const res = await request(app).post('/generate-pdf').send(body);
  world.responseStatus = res.status;
  world.responseJson = res.body as Record<string, unknown>;
}

When('I POST to \\/generate-pdf without an exam object', async function (this: EndpointWorld) {
  await postInvalid(this, { questions: this.requestBody.questions, copies: 1 });
});

When(
  'I POST to \\/generate-pdf with a blank teacherName',
  async function (this: EndpointWorld) {
    await postInvalid(this, {
      exam: { ...this.requestBody.exam, teacherName: '   ' },
      questions: this.requestBody.questions,
      copies: 1,
    });
  },
);

When(
  'I POST to \\/generate-pdf with copies set to {int}',
  async function (this: EndpointWorld, copies: number) {
    await postInvalid(this, { ...this.requestBody, copies });
  },
);

When(
  'I POST to \\/generate-pdf with an empty questions array',
  async function (this: EndpointWorld) {
    await postInvalid(this, { ...this.requestBody, questions: [], copies: 1 });
  },
);

When(
  'I POST to \\/generate-pdf with a question that has no alternatives',
  async function (this: EndpointWorld) {
    const badQuestion = { id: crypto.randomUUID(), statement: 'No alts', alternatives: [], createdAt: new Date().toISOString() };
    await postInvalid(this, { ...this.requestBody, questions: [badQuestion], copies: 1 });
  },
);

// ── Then – response metadata ──────────────────────────────────

Then('the response status should be {int}', function (this: EndpointWorld, status: number) {
  assert.equal(this.responseStatus, status);
});

Then(
  'the response Content-Type should include {string}',
  function (this: EndpointWorld, expected: string) {
    const ct = this.responseHeaders['content-type'] ?? '';
    assert.ok(ct.includes(expected), `Content-Type "${ct}" does not include "${expected}"`);
  },
);

Then(
  'the response Content-Disposition should include {string}',
  function (this: EndpointWorld, expected: string) {
    const cd = this.responseHeaders['content-disposition'] ?? '';
    assert.ok(cd.includes(expected), `Content-Disposition "${cd}" does not include "${expected}"`);
  },
);

Then(
  'the response body should contain an "error" field',
  function (this: EndpointWorld) {
    assert.ok(
      this.responseJson && typeof this.responseJson['error'] === 'string',
      `Expected response body to have an "error" string field. Got: ${JSON.stringify(this.responseJson)}`,
    );
  },
);

// Note: the following Then steps are defined in pdf_generation.steps.ts and
// shared globally across all feature files (Cucumber loads all step definitions):
//   - the ZIP should contain {int} files
//   - the ZIP should contain {string}
//   - the answer key CSV should have {int} data rows
//   - each answer in the answer key CSV should be a valid letter label
//   - each answer in the answer key CSV should be a valid power-of-2 label

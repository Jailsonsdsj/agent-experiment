import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../support/testApp';

// ── World ──────────────────────────────────────────────────────

interface GradeEndpointWorld {
  answerKeyCsv: string | null;
  responsesCsv: string | null;
  responseStatus: number;
  responseJson: unknown;
}

// ── Given ──────────────────────────────────────────────────────

Given(
  'an answer key CSV with content:',
  function (this: GradeEndpointWorld, docString: string) {
    this.answerKeyCsv = docString.trim();
    if (this.responsesCsv === undefined) this.responsesCsv = null;
  },
);

Given(
  'a responses CSV with content:',
  function (this: GradeEndpointWorld, docString: string) {
    this.responsesCsv = docString.trim();
    if (this.answerKeyCsv === undefined) this.answerKeyCsv = null;
  },
);

// ── When – helpers ─────────────────────────────────────────────

async function postToGrade(
  world: GradeEndpointWorld,
  gradingMode: string | null,
  includeAnswerKey: boolean,
  includeResponses: boolean,
): Promise<void> {
  let req = request(app).post('/grade');

  if (includeAnswerKey && world.answerKeyCsv !== null) {
    req = req.attach('answerKey', Buffer.from(world.answerKeyCsv), {
      filename: 'answer_key.csv',
      contentType: 'text/csv',
    });
  }

  if (includeResponses && world.responsesCsv !== null) {
    req = req.attach('responses', Buffer.from(world.responsesCsv), {
      filename: 'responses.csv',
      contentType: 'text/csv',
    });
  }

  if (gradingMode !== null) {
    req = req.field('gradingMode', gradingMode);
  }

  const res = await req;
  world.responseStatus = res.status;
  world.responseJson = res.body;
}

// ── When ───────────────────────────────────────────────────────

When(
  /I POST to \/grade with gradingMode "([^"]+)"/,
  async function (this: GradeEndpointWorld, mode: string) {
    await postToGrade(this, mode, true, true);
  },
);

When(
  /I POST to \/grade without the answerKey file/,
  async function (this: GradeEndpointWorld) {
    await postToGrade(this, 'strict', false, true);
  },
);

When(
  /I POST to \/grade without the responses file/,
  async function (this: GradeEndpointWorld) {
    await postToGrade(this, 'strict', true, false);
  },
);

When(
  /I POST to \/grade without a gradingMode/,
  async function (this: GradeEndpointWorld) {
    await postToGrade(this, null, true, true);
  },
);

// ── Then ───────────────────────────────────────────────────────

Then(
  'the response should be a JSON array with {int} result(s)',
  function (this: GradeEndpointWorld, count: number) {
    assert.ok(Array.isArray(this.responseJson), `Expected array, got: ${JSON.stringify(this.responseJson)}`);
    assert.equal(
      (this.responseJson as unknown[]).length,
      count,
      `Expected ${count} results, got ${(this.responseJson as unknown[]).length}`,
    );
  },
);

Then(
  'the result for {string} should have total {float}',
  function (this: GradeEndpointWorld, studentName: string, expected: number) {
    assert.ok(Array.isArray(this.responseJson), `Expected array response`);
    const results = this.responseJson as Array<{ studentName: string; total: number }>;
    const result = results.find((r) => r.studentName === studentName);
    assert.ok(result, `No result found for "${studentName}"`);
    assert.equal(result.total, expected, `Total for "${studentName}": expected ${expected}, got ${result.total}`);
  },
);

Then(
  'the grading response body should contain an "error" field',
  function (this: GradeEndpointWorld) {
    const body = this.responseJson as Record<string, unknown>;
    assert.ok(
      body && typeof body['error'] === 'string',
      `Expected body to have an "error" string field. Got: ${JSON.stringify(body)}`,
    );
  },
);

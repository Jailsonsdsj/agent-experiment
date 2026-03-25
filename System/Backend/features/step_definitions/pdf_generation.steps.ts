import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { generateExamZip } from '../../src/services/pdfService';
import type {
  Alternative,
  ExamIdentificationMode,
  ExamPayload,
  QuestionPayload,
} from '../../src/types';
import type { AppWorld } from '../support/world';
import {
  type ZipEntry,
  readZipEntries,
  extractPdfText,
  getCsvEntry,
  getCsvDataRows,
} from '../support/zipPdfUtils';

// ── Fixtures ──────────────────────────────────────────────────

function makeAlt(description: string, isCorrect: boolean): Alternative {
  return { id: crypto.randomUUID(), description, isCorrect };
}

function makeQuestion(statement: string, altCount: number): QuestionPayload {
  const alternatives = Array.from({ length: altCount }, (_, i) =>
    makeAlt(`Alt ${i + 1}`, i === 0),
  );
  return {
    id: crypto.randomUUID(),
    statement,
    alternatives,
    createdAt: new Date().toISOString(),
  };
}

function makeExamPayload(
  title: string,
  teacherName: string,
  mode: ExamIdentificationMode,
  questionIds: string[],
): ExamPayload {
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

interface PdfWorld extends AppWorld {
  examPayload: ExamPayload;
  questions: QuestionPayload[];
  zipEntries: ZipEntry[];
}

// ── Given ─────────────────────────────────────────────────────

Given(
  'an exam titled {string} by teacher {string} with {string} identification',
  function (this: PdfWorld, title: string, teacherName: string, mode: string) {
    this.questions = [];
    this.examPayload = makeExamPayload(title, teacherName, mode as ExamIdentificationMode, []);
  },
);

Given(
  'the exam has {int} questions with {int} alternatives each and one correct alternative per question',
  function (this: PdfWorld, qCount: number, altCount: number) {
    this.questions = Array.from({ length: qCount }, (_, i) =>
      makeQuestion(`Question ${i + 1}`, altCount),
    );
    this.examPayload = {
      ...this.examPayload,
      questionIds: this.questions.map((q) => q.id),
    };
  },
);

// ── When ──────────────────────────────────────────────────────

When(/I generate (\d+) exam cop(?:y|ies)/, async function (this: PdfWorld, copies: number) {
  const zipBuffer = await generateExamZip({
    exam: this.examPayload,
    questions: this.questions,
    copies: Number(copies),
  });
  this.zipEntries = readZipEntries(zipBuffer);
});

// ── Then – ZIP structure ──────────────────────────────────────

Then('the ZIP should contain {int} files', function (this: PdfWorld, count: number) {
  assert.equal(
    this.zipEntries.length,
    count,
    `Expected ${count} files, got ${this.zipEntries.length}: ${this.zipEntries.map((e) => e.name).join(', ')}`,
  );
});

Then('the ZIP should contain {string}', function (this: PdfWorld, fileName: string) {
  const found = this.zipEntries.some((e) => e.name === fileName);
  assert.ok(
    found,
    `"${fileName}" not found in ZIP. Files: ${this.zipEntries.map((e) => e.name).join(', ')}`,
  );
});

// ── Then – PDF content ────────────────────────────────────────

Then(
  'PDF {string} should contain the text {string}',
  function (this: PdfWorld, fileName: string, text: string) {
    const entry = this.zipEntries.find((e) => e.name === fileName);
    assert.ok(entry, `"${fileName}" not found in ZIP`);
    const content = extractPdfText(entry.data);
    assert.ok(content.includes(text), `PDF "${fileName}" does not contain "${text}"`);
  },
);

// ── Then – Answer key CSV ─────────────────────────────────────

Then(
  'each answer in the answer key CSV should be a valid letter label',
  function (this: PdfWorld) {
    const csv = getCsvEntry(this.zipEntries);
    const dataRows = getCsvDataRows(csv);
    for (const [, ...answers] of dataRows) {
      for (const answer of answers) {
        assert.match(
          answer.trim(),
          /^[A-H]+$/,
          `"${answer.trim()}" is not a valid letter label`,
        );
      }
    }
  },
);

Then(
  'each answer in the answer key CSV should be a valid power-of-2 label',
  function (this: PdfWorld) {
    const VALID_POWERS = new Set(['1', '2', '4', '8', '16', '32', '64', '128']);
    const csv = getCsvEntry(this.zipEntries);
    const dataRows = getCsvDataRows(csv);
    for (const [, ...answers] of dataRows) {
      for (const answer of answers) {
        assert.ok(
          VALID_POWERS.has(answer.trim()),
          `"${answer.trim()}" is not a valid power-of-2 label`,
        );
      }
    }
  },
);

Then(
  'the answer key CSV header row should be {string}',
  function (this: PdfWorld, expectedHeader: string) {
    const csv = getCsvEntry(this.zipEntries);
    const header = csv.split('\n')[0].trim();
    assert.equal(header, expectedHeader);
  },
);

Then(
  'the answer key CSV should have {int} data rows',
  function (this: PdfWorld, count: number) {
    const csv = getCsvEntry(this.zipEntries);
    const dataRows = getCsvDataRows(csv);
    assert.equal(dataRows.length, count);
  },
);

Then('not all answer key rows should be identical', function (this: PdfWorld) {
  const csv = getCsvEntry(this.zipEntries);
  const dataRows = getCsvDataRows(csv);
  const answerFingerprints = new Set(dataRows.map(([, ...answers]) => answers.join(',')));
  assert.ok(
    answerFingerprints.size > 1,
    'All exam copies have identical answer key rows — shuffle may not be working',
  );
});

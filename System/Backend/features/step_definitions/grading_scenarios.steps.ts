import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { gradeExams } from '../../src/services/gradingService';
import type { AnswerKeyRow, GradingMode, GradingResult, StudentResponse } from '../../src/types';

// ── World ──────────────────────────────────────────────────────

interface GradingWorld {
  answerKey: AnswerKeyRow[];
  responses: StudentResponse[];
  results: GradingResult[];
}

// ── Given ──────────────────────────────────────────────────────

Given('the grading service is available', function (this: GradingWorld) {
  this.answerKey = [];
  this.responses = [];
  this.results = [];
});

Given(
  'an answer key for exam {int} with answers {string}',
  function (this: GradingWorld, examNumber: number, rawAnswers: string) {
    const answers = rawAnswers.split(',').map((a) => a.trim());
    this.answerKey.push({ examNumber, answers });
  },
);

Given(
  'student {string} answered exam {int} with {string}',
  function (this: GradingWorld, studentName: string, examNumber: number, rawAnswers: string) {
    const answers = rawAnswers.split(',').map((a) => a.trim());
    this.responses.push({ studentName, examNumber, answers });
  },
);

// ── When ───────────────────────────────────────────────────────

When('I grade using {string} mode', function (this: GradingWorld, mode: string) {
  this.results = gradeExams(this.answerKey, this.responses, mode as GradingMode);
});

// ── Then ───────────────────────────────────────────────────────

Then(
  'the score for {string} on question {int} should be {float}',
  function (this: GradingWorld, studentName: string, questionNumber: number, expected: number) {
    const result = this.results.find((r) => r.studentName === studentName);
    assert.ok(result, `No result found for student "${studentName}"`);
    const score = result.scores[questionNumber - 1];
    assert.equal(score, expected, `Score for Q${questionNumber}: expected ${expected}, got ${score}`);
  },
);

Then(
  'the total for {string} should be {float}',
  function (this: GradingWorld, studentName: string, expected: number) {
    const result = this.results.find((r) => r.studentName === studentName);
    assert.ok(result, `No result found for student "${studentName}"`);
    assert.equal(result.total, expected, `Total for "${studentName}": expected ${expected}, got ${result.total}`);
  },
);

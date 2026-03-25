import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import {
  getExams,
  saveExam,
  updateExam,
  deleteExam,
} from '../../src/services/localStorageService.ts';
import type { Exam, ExamIdentificationMode } from '../../src/types/index.ts';
import type { AppWorld } from '../support/world.ts';

// Mirrors the isValid rule from useExamForm
function isValidExam(
  title: string,
  teacherName: string,
  selectedQuestionIds: string[],
): boolean {
  return title.trim() !== '' && teacherName.trim() !== '' && selectedQuestionIds.length >= 1;
}

function makeFakeQuestionIds(count: number): string[] {
  return Array.from({ length: count }, () => crypto.randomUUID());
}

interface ExamWorld extends AppWorld {
  title: string;
  teacherName: string;
  identificationMode: ExamIdentificationMode;
  selectedQuestionIds: string[];
  savedExam: Exam | null;
  validationResult: boolean;
}

// ── Background ──────────────────────────────────────────────

Given('the exam store is empty', function (this: ExamWorld) {
  this.title = '';
  this.teacherName = '';
  this.identificationMode = 'letters';
  this.selectedQuestionIds = [];
  this.savedExam = null;
  this.validationResult = false;
  assert.equal(getExams().length, 0);
});

// ── Build exam ───────────────────────────────────────────────

Given(
  'I have an exam titled {string} by teacher {string}',
  function (this: ExamWorld, title: string, teacherName: string) {
    this.title = title;
    this.teacherName = teacherName;
    this.selectedQuestionIds = [];
  },
);

Given('the identification mode is {string}', function (this: ExamWorld, mode: string) {
  this.identificationMode = mode as ExamIdentificationMode;
});

Given(
  'the exam includes {int} selected questions',
  function (this: ExamWorld, count: number) {
    this.selectedQuestionIds = makeFakeQuestionIds(count);
  },
);

Given('no questions are selected', function (this: ExamWorld) {
  this.selectedQuestionIds = [];
});

// ── Saved exam shortcuts ──────────────────────────────────────

Given(
  'a saved exam titled {string} by teacher {string}',
  function (this: ExamWorld, title: string, teacherName: string) {
    this.savedExam = saveExam({
      title,
      teacherName,
      identificationMode: 'letters',
      questionIds: makeFakeQuestionIds(2),
    });
  },
);

Given(
  'a saved exam titled {string} by teacher {string} with {string} mode',
  function (this: ExamWorld, title: string, teacherName: string, mode: string) {
    this.savedExam = saveExam({
      title,
      teacherName,
      identificationMode: mode as ExamIdentificationMode,
      questionIds: makeFakeQuestionIds(2),
    });
  },
);

// ── Actions ───────────────────────────────────────────────────

When('I save the exam', function (this: ExamWorld) {
  this.savedExam = saveExam({
    title: this.title,
    teacherName: this.teacherName,
    identificationMode: this.identificationMode,
    questionIds: this.selectedQuestionIds,
  });
});

When('I validate the exam', function (this: ExamWorld) {
  this.validationResult = isValidExam(this.title, this.teacherName, this.selectedQuestionIds);
});

When(
  'I update the exam title to {string}',
  function (this: ExamWorld, newTitle: string) {
    assert.ok(this.savedExam, 'No saved exam to update');
    this.savedExam = updateExam({ ...this.savedExam, title: newTitle });
  },
);

When(
  'I update the identification mode to {string}',
  function (this: ExamWorld, mode: string) {
    assert.ok(this.savedExam, 'No saved exam to update');
    this.savedExam = updateExam({
      ...this.savedExam,
      identificationMode: mode as ExamIdentificationMode,
    });
  },
);

When('I delete the exam', function (this: ExamWorld) {
  assert.ok(this.savedExam, 'No saved exam to delete');
  deleteExam(this.savedExam.id);
});

// ── Assertions ────────────────────────────────────────────────

Then(
  'the exam store should contain {int} exam',
  function (this: ExamWorld, count: number) {
    assert.equal(getExams().length, count);
  },
);

Then('the exam store should be empty', function (this: ExamWorld) {
  assert.equal(getExams().length, 0);
});

Then(
  'the saved exam title should be {string}',
  function (this: ExamWorld, expected: string) {
    const exams = getExams();
    assert.ok(exams.length > 0, 'No exams in store');
    assert.equal(exams[0].title, expected);
  },
);

Then(
  'the saved exam identification mode should be {string}',
  function (this: ExamWorld, expected: string) {
    const exams = getExams();
    assert.ok(exams.length > 0, 'No exams in store');
    assert.equal(exams[0].identificationMode, expected);
  },
);

Then('the exam should be invalid', function (this: ExamWorld) {
  assert.equal(this.validationResult, false);
});

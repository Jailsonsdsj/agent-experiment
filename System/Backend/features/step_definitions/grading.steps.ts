import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { gradeExams } from '../../src/services/gradingService';
import type { AppWorld } from '../support/world';
import type { AnswerKeyRow, StudentResponse, GradingMode, GradingResult } from '../../src/types';

interface GradingWorld extends AppWorld {
  answerKey: AnswerKeyRow[];
  studentResponses: StudentResponse[];
  gradingResults: GradingResult[];
}

Given('the grading service is available', function (this: GradingWorld) {
  this.answerKey = [];
  this.studentResponses = [];
  this.gradingResults = [];
});

Given(
  'an answer key with question {int} correct answer {string}',
  function (this: GradingWorld, questionIndex: number, answer: string) {
    if (this.answerKey.length === 0) {
      this.answerKey.push({ examNumber: 1, answers: [] });
    }
    this.answerKey[0].answers[questionIndex - 1] = answer;
  },
);

Given(
  'a student response with question {int} answer {string}',
  function (this: GradingWorld, questionIndex: number, answer: string) {
    if (this.studentResponses.length === 0) {
      this.studentResponses.push({ examNumber: 1, studentName: 'Test Student', answers: [] });
    }
    this.studentResponses[0].answers[questionIndex - 1] = answer;
  },
);

When('I grade using {string} mode', function (this: GradingWorld, mode: string) {
  this.gradingResults = gradeExams(this.answerKey, this.studentResponses, mode as GradingMode);
});

Then(
  'the student score for question {int} should be {int}',
  function (this: GradingWorld, questionIndex: number, expectedScore: number) {
    const result = this.gradingResults[0];
    assert.ok(result, 'No grading result found');
    assert.equal(result.scores[questionIndex - 1], expectedScore);
  },
);

Then(
  'the student score for question {int} should be greater than {int}',
  function (this: GradingWorld, questionIndex: number, lowerBound: number) {
    const result = this.gradingResults[0];
    assert.ok(result, 'No grading result found');
    assert.ok(
      result.scores[questionIndex - 1] > lowerBound,
      `Expected score > ${lowerBound}, got ${result.scores[questionIndex - 1]}`,
    );
  },
);

Then(
  'the student score for question {int} should be less than {int}',
  function (this: GradingWorld, questionIndex: number, upperBound: number) {
    const result = this.gradingResults[0];
    assert.ok(result, 'No grading result found');
    assert.ok(
      result.scores[questionIndex - 1] < upperBound,
      `Expected score < ${upperBound}, got ${result.scores[questionIndex - 1]}`,
    );
  },
);

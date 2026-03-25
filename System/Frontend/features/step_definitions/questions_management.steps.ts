import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import {
  getQuestions,
  saveQuestion,
  updateQuestion,
  deleteQuestion,
} from '../../src/services/localStorageService.ts';
import type { Alternative, Question } from '../../src/types/index.ts';
import type { AppWorld } from '../support/world.ts';

// Mirrors the isValid rule from useQuestionForm
function isValidQuestion(statement: string, alternatives: Alternative[]): boolean {
  return (
    statement.trim() !== '' &&
    alternatives.every((a) => a.description.trim() !== '') &&
    alternatives.some((a) => a.isCorrect)
  );
}

function makeAlternative(description: string, isCorrect = false): Alternative {
  return { id: crypto.randomUUID(), description, isCorrect };
}

function makeQuestion(statement: string, alternatives: Alternative[]): Question {
  return {
    id: crypto.randomUUID(),
    statement,
    alternatives,
    createdAt: new Date().toISOString(),
  };
}

interface QuestionWorld extends AppWorld {
  statement: string;
  alternatives: Alternative[];
  savedQuestion: Question | null;
  validationResult: boolean;
  thrownError: Error | null;
}

// ── Background ──────────────────────────────────────────────

Given('the question store is empty', function (this: QuestionWorld) {
  this.statement = '';
  this.alternatives = [];
  this.savedQuestion = null;
  this.validationResult = false;
  this.thrownError = null;
  assert.equal(getQuestions().length, 0);
});

// ── Build question ───────────────────────────────────────────

Given('I have a question with statement {string}', function (this: QuestionWorld, statement: string) {
  this.statement = statement;
  this.alternatives = [];
});

Given(
  'the question has alternatives {string} and {string}',
  function (this: QuestionWorld, first: string, second: string) {
    this.alternatives = [makeAlternative(first), makeAlternative(second)];
  },
);

Given('alternative {string} is marked as correct', function (this: QuestionWorld, description: string) {
  this.alternatives = this.alternatives.map((a) =>
    a.description === description ? { ...a, isCorrect: true } : a,
  );
});

Given('no alternative is marked as correct', function (this: QuestionWorld) {
  this.alternatives = this.alternatives.map((a) => ({ ...a, isCorrect: false }));
});

// ── Saved question shortcuts ──────────────────────────────────

Given('a saved question with statement {string}', function (this: QuestionWorld, statement: string) {
  const question = makeQuestion(statement, [
    makeAlternative('Option A', true),
    makeAlternative('Option B'),
  ]);
  saveQuestion(question);
  this.savedQuestion = question;
});

Given(
  'a saved question with statement {string} with alternatives {string} and {string}',
  function (this: QuestionWorld, statement: string, first: string, second: string) {
    const question = makeQuestion(statement, [makeAlternative(first), makeAlternative(second)]);
    saveQuestion(question);
    this.savedQuestion = question;
  },
);

Given(
  'the alternative {string} is initially marked as correct',
  function (this: QuestionWorld, description: string) {
    assert.ok(this.savedQuestion, 'No saved question in context');
    const updated: Question = {
      ...this.savedQuestion,
      alternatives: this.savedQuestion.alternatives.map((a) => ({
        ...a,
        isCorrect: a.description === description,
      })),
    };
    updateQuestion(updated);
    this.savedQuestion = updated;
  },
);

// ── Actions ───────────────────────────────────────────────────

When('I save the question', function (this: QuestionWorld) {
  const question = makeQuestion(this.statement, this.alternatives);
  saveQuestion(question);
  this.savedQuestion = question;
});

When('I validate the question', function (this: QuestionWorld) {
  this.validationResult = isValidQuestion(this.statement, this.alternatives);
});

When('I update the question statement to {string}', function (this: QuestionWorld, newStatement: string) {
  assert.ok(this.savedQuestion, 'No saved question to update');
  const updated: Question = { ...this.savedQuestion, statement: newStatement };
  updateQuestion(updated);
  this.savedQuestion = updated;
});

When(
  'I mark alternative {string} as correct instead',
  function (this: QuestionWorld, description: string) {
    assert.ok(this.savedQuestion, 'No saved question to update');
    const updated: Question = {
      ...this.savedQuestion,
      alternatives: this.savedQuestion.alternatives.map((a) => ({
        ...a,
        isCorrect: a.description === description,
      })),
    };
    updateQuestion(updated);
    this.savedQuestion = updated;
  },
);

When('I delete the question', function (this: QuestionWorld) {
  assert.ok(this.savedQuestion, 'No saved question to delete');
  deleteQuestion(this.savedQuestion.id);
});

When('I delete a question with a random id', function (this: QuestionWorld) {
  try {
    deleteQuestion(crypto.randomUUID());
  } catch (err) {
    this.thrownError = err instanceof Error ? err : new Error(String(err));
  }
});

// ── Assertions ────────────────────────────────────────────────

Then('the question store should contain {int} question', function (this: QuestionWorld, count: number) {
  assert.equal(getQuestions().length, count);
});

Then('the question store should be empty', function (this: QuestionWorld) {
  assert.equal(getQuestions().length, 0);
});

Then('the saved question statement should be {string}', function (this: QuestionWorld, expected: string) {
  const questions = getQuestions();
  assert.ok(questions.length > 0, 'No questions in store');
  assert.equal(questions[0].statement, expected);
});

Then('the alternative {string} should be stored as correct', function (this: QuestionWorld, description: string) {
  const questions = getQuestions();
  assert.ok(questions.length > 0, 'No questions in store');
  const alt = questions[0].alternatives.find((a) => a.description === description);
  assert.ok(alt, `Alternative "${description}" not found`);
  assert.equal(alt.isCorrect, true);
});

Then(
  'the alternative {string} should not be stored as correct',
  function (this: QuestionWorld, description: string) {
    const questions = getQuestions();
    assert.ok(questions.length > 0, 'No questions in store');
    const alt = questions[0].alternatives.find((a) => a.description === description);
    assert.ok(alt, `Alternative "${description}" not found`);
    assert.equal(alt.isCorrect, false);
  },
);

Then('the question should be invalid', function (this: QuestionWorld) {
  assert.equal(this.validationResult, false);
});

Then('an error should be thrown', function (this: QuestionWorld) {
  assert.ok(this.thrownError, 'Expected an error to be thrown but none was');
});

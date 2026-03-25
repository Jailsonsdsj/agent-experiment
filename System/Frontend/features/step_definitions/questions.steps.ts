import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { parseQuestionCsv } from '../../src/utils/questionCsvParser.ts';
import type { QuestionCsvParseResult } from '../../src/utils/questionCsvParser.ts';
import type { AppWorld } from '../support/world.ts';

interface QuestionWorld extends AppWorld {
  csvText: string;
  parseResult: QuestionCsvParseResult;
}

Given('a CSV with the content:', function (this: QuestionWorld, docString: string) {
  this.csvText = docString;
});

When('I parse the CSV', function (this: QuestionWorld) {
  this.parseResult = parseQuestionCsv(this.csvText);
});

Then(
  'I should get {int} question with no errors',
  function (this: QuestionWorld, count: number) {
    assert.equal(this.parseResult.questions.length, count);
    assert.equal(this.parseResult.errors.length, 0);
  },
);

Then('I should get {int} questions', function (this: QuestionWorld, count: number) {
  assert.equal(this.parseResult.questions.length, count);
});

Then(
  'the question statement should be {string}',
  function (this: QuestionWorld, statement: string) {
    assert.equal(this.parseResult.questions[0].statement, statement);
  },
);

Then(
  'alternative {int} should be marked as correct',
  function (this: QuestionWorld, altIndex: number) {
    const alt = this.parseResult.questions[0].alternatives[altIndex - 1];
    assert.ok(alt, `Alternative ${altIndex} not found`);
    assert.equal(alt.isCorrect, true);
  },
);

Then(
  'there should be a parse error mentioning {string}',
  function (this: QuestionWorld, keyword: string) {
    const hasMatch = this.parseResult.errors.some((e) =>
      e.message.toLowerCase().includes(keyword.toLowerCase()),
    );
    assert.ok(hasMatch, `No error message contains "${keyword}". Errors: ${JSON.stringify(this.parseResult.errors)}`);
  },
);

Then('there should be a row error on row {int}', function (this: QuestionWorld, rowNumber: number) {
  const hasMatch = this.parseResult.errors.some((e) => e.row === rowNumber);
  assert.ok(hasMatch, `No error for row ${rowNumber}. Errors: ${JSON.stringify(this.parseResult.errors)}`);
});

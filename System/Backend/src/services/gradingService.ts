import { AnswerKeyRow, GradingMode, GradingResult, StudentResponse } from '../types';

export function gradeExams(
  _answerKey: AnswerKeyRow[],
  _responses: StudentResponse[],
  _mode: GradingMode,
): GradingResult[] {
  throw new Error('Not implemented');
}

function gradeStrict(_correct: string[], _given: string[]): number {
  throw new Error('Not implemented');
}

function gradeLenient(_correct: string[], _given: string[], _totalAlternatives: number): number {
  throw new Error('Not implemented');
}

export function gradeQuestion(
  correct: string[],
  given: string[],
  totalAlternatives: number,
  mode: GradingMode,
): number {
  if (mode === 'strict') return gradeStrict(correct, given);
  return gradeLenient(correct, given, totalAlternatives);
}

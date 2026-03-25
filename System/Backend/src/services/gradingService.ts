import { AnswerKeyRow, GradingMode, GradingResult, StudentResponse } from '../types';

// Splits an answer string into individual label tokens.
// Letters mode  — "AC"  → ['A', 'C']
// Powers-of-2   — "5"   → ['5']  (the sum is the canonical token; strict comparison still works)
function parseAnswerTokens(answer: string): string[] {
  const trimmed = answer.trim().toUpperCase();
  if (/^\d+$/.test(trimmed)) return [trimmed];
  return trimmed.split('');
}

function gradeStrict(correct: string[], given: string[]): number {
  if (correct.length !== given.length) return 0;
  const sortedCorrect = [...correct].sort();
  const sortedGiven = [...given].sort();
  for (let i = 0; i < sortedCorrect.length; i++) {
    if (sortedCorrect[i] !== sortedGiven[i]) return 0;
  }
  return 1;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function gradeLenient(_correct: string[], _given: string[], _totalAlternatives: number): number {
  throw new Error('Lenient grading is not yet implemented.');
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

export function gradeExams(
  answerKey: AnswerKeyRow[],
  responses: StudentResponse[],
  mode: GradingMode,
): GradingResult[] {
  return responses.map((response) => {
    const keyRow = answerKey.find((k) => k.examNumber === response.examNumber);

    if (!keyRow) {
      return {
        studentName: response.studentName,
        examNumber: response.examNumber,
        scores: response.answers.map(() => 0),
        total: 0,
      };
    }

    const scores = response.answers.map((givenRaw, i) => {
      const correctRaw = keyRow.answers[i] ?? '';
      return gradeQuestion(
        parseAnswerTokens(correctRaw),
        parseAnswerTokens(givenRaw),
        keyRow.answers.length,
        mode,
      );
    });

    return {
      studentName: response.studentName,
      examNumber: response.examNumber,
      scores,
      total: scores.reduce((sum, s) => sum + s, 0),
    };
  });
}

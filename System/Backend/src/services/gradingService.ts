import { AnswerKeyRow, GradingMode, GradingResult, StudentResponse } from '../types';

// Splits an answer string into individual alternative labels.
//
// Letters mode  — "AC" → ['A', 'C']
// Powers-of-2   — "5"  → ['1', '4']  (decomposes the sum into its constituent powers)
// Empty / "0"   → []  (no alternatives selected)
function parseAnswerTokens(answer: string): string[] {
  const trimmed = answer.trim().toUpperCase();
  if (trimmed === '' || trimmed === '0') return [];

  if (/^\d+$/.test(trimmed)) {
    const n = parseInt(trimmed, 10);
    const labels: string[] = [];
    for (let bit = 0; (1 << bit) <= n; bit++) {
      if (n & (1 << bit)) labels.push(String(1 << bit));
    }
    return labels;
  }

  return trimmed.split('');
}

// Detects whether tokens are powers-of-2 labels (numeric strings) or letter labels.
function isPowersMode(tokens: string[]): boolean {
  return tokens.length > 0 && /^\d+$/.test(tokens[0]);
}

// Builds the full ordered set of alternatives for a question.
//
// Letters mode: contiguous range A … max-letter.
//   correct=['A','C'], given=['A']  →  max='C'  →  ['A','B','C']  (total 3)
//
// Powers-of-2 mode: all bit positions 2⁰ … 2^(highest-bit).
//   correct=['1','4'], given=['1']  →  max power=4=2²  →  ['1','2','4']  (total 3)
//
// Using the contiguous-range convention is the best approximation possible
// when the original question structure is not part of the CSV payload.
function buildFullAlternativeSet(correct: string[], given: string[]): string[] {
  const union = [...new Set([...correct, ...given])];
  if (union.length === 0) return [];

  if (isPowersMode(union)) {
    const maxPower = Math.max(...union.map(Number));
    const highestBit = Math.floor(Math.log2(maxPower));
    return Array.from({ length: highestBit + 1 }, (_, i) => String(1 << i));
  }

  const maxCode = Math.max(...union.map((l) => l.charCodeAt(0)));
  const total = maxCode - 64; // 'A'=65 → 1, 'C'=67 → 3
  return Array.from({ length: total }, (_, i) => String.fromCharCode(65 + i));
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

// Score = (correctly selected + correctly NOT selected) / total alternatives.
// A fraction rounded to two decimal places (0.00 – 1.00).
function gradeLenient(correct: string[], given: string[], totalAlternatives: number): number {
  if (totalAlternatives === 0) return 0;

  const correctSet = new Set(correct);
  const givenSet = new Set(given);
  const allAlternatives = buildFullAlternativeSet(correct, given);

  let correctlyHandled = 0;
  for (const alt of allAlternatives) {
    const shouldSelect = correctSet.has(alt);
    const didSelect = givenSet.has(alt);
    if (shouldSelect === didSelect) correctlyHandled++;
  }

  return Math.round((correctlyHandled / totalAlternatives) * 100) / 100;
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
      const correctTokens = parseAnswerTokens(keyRow.answers[i] ?? '');
      const givenTokens = parseAnswerTokens(givenRaw);
      const totalAlternatives = buildFullAlternativeSet(correctTokens, givenTokens).length;
      return gradeQuestion(correctTokens, givenTokens, totalAlternatives, mode);
    });

    return {
      studentName: response.studentName,
      examNumber: response.examNumber,
      scores,
      total: Math.round(scores.reduce((sum, s) => sum + s, 0) * 100) / 100,
    };
  });
}

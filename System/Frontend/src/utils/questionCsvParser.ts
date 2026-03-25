import Papa from 'papaparse';
import type { Alternative, Question } from '../types';

// CSV format (one row per question):
//
//   statement, alt_1, alt_2, alt_3, alt_4, alt_5, correct
//
// - statement : required — the question text
// - alt_1 … alt_5 : at least alt_1 and alt_2 are required; alt_3–alt_5 are optional
// - correct : comma-separated 1-based indices of the correct alternatives
//             e.g. "2" → only alt_2 is correct
//             e.g. "1,3" → alt_1 and alt_3 are correct

const ALT_COLUMNS = ['alt_1', 'alt_2', 'alt_3', 'alt_4', 'alt_5'] as const;
const REQUIRED_COLUMNS = ['statement', 'alt_1', 'alt_2', 'correct'];

export interface ParseError {
  row: number;
  message: string;
}

export interface QuestionCsvParseResult {
  questions: Question[];
  errors: ParseError[];
}

export function parseQuestionCsv(csvText: string): QuestionCsvParseResult {
  const questions: Question[] = [];
  const errors: ParseError[] = [];

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
    transform: (v) => v.trim(),
  });

  const columns: string[] = parsed.meta.fields ?? [];
  for (const col of REQUIRED_COLUMNS) {
    if (!columns.includes(col)) {
      errors.push({ row: 0, message: `Missing required column: "${col}"` });
      return { questions, errors };
    }
  }

  parsed.data.forEach((row, index) => {
    const rowNumber = index + 2; // +1 for header, +1 for 1-based

    const statement = row['statement'] ?? '';
    if (!statement) {
      errors.push({ row: rowNumber, message: 'Statement is empty.' });
      return;
    }

    const altTexts = ALT_COLUMNS.map((col) => row[col] ?? '').filter((t) => t.length > 0);

    if (altTexts.length < 2) {
      errors.push({
        row: rowNumber,
        message: `At least 2 alternatives are required (found ${altTexts.length}).`,
      });
      return;
    }

    const correctRaw = row['correct'] ?? '';
    if (!correctRaw) {
      errors.push({ row: rowNumber, message: 'Column "correct" is empty.' });
      return;
    }

    const correctIndices = correctRaw.split(',').map((s) => parseInt(s.trim(), 10));
    const invalidIndices = correctIndices.filter(
      (i) => isNaN(i) || i < 1 || i > altTexts.length,
    );

    if (invalidIndices.length > 0) {
      errors.push({
        row: rowNumber,
        message: `Invalid value(s) in "correct": ${invalidIndices.join(', ')}. Must be integers between 1 and ${altTexts.length}.`,
      });
      return;
    }

    const correctSet = new Set(correctIndices);
    const alternatives: Alternative[] = altTexts.map((description, i) => ({
      id: crypto.randomUUID(),
      description,
      isCorrect: correctSet.has(i + 1),
    }));

    questions.push({
      id: crypto.randomUUID(),
      statement,
      alternatives,
      createdAt: new Date().toISOString(),
    });
  });

  return { questions, errors };
}

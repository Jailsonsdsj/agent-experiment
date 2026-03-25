import { parse } from 'csv-parse/sync';
import { AnswerKeyRow, StudentResponse } from '../types';

const ANSWER_KEY_REQUIRED_COLUMNS = ['exam_number'];
const STUDENT_RESPONSE_REQUIRED_COLUMNS = ['student_name', 'exam_number'];

function parseRecords(csv: string): Record<string, string>[] {
  return parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];
}

function getQuestionAnswers(
  record: Record<string, string>,
  nonQuestionKeys: string[],
): string[] {
  const skip = new Set(nonQuestionKeys);
  return Object.entries(record)
    .filter(([key]) => !skip.has(key))
    .map(([, value]) => value);
}

function validateColumns(
  records: Record<string, string>[],
  required: string[],
  label: string,
): void {
  if (records.length === 0) {
    throw new Error(`${label} CSV has no data rows.`);
  }
  const columns = Object.keys(records[0]);
  for (const col of required) {
    if (!columns.includes(col)) {
      throw new Error(`${label} CSV is missing required column: "${col}".`);
    }
  }
  const questionColumns = columns.filter((c) => !required.includes(c));
  if (questionColumns.length === 0) {
    throw new Error(`${label} CSV has no question columns.`);
  }
}

export function parseAnswerKey(csv: string): AnswerKeyRow[] {
  const records = parseRecords(csv);
  validateColumns(records, ANSWER_KEY_REQUIRED_COLUMNS, 'Answer key');

  return records.map((record) => ({
    examNumber: parseInt(record['exam_number'], 10),
    answers: getQuestionAnswers(record, ANSWER_KEY_REQUIRED_COLUMNS),
  }));
}

export function parseStudentResponses(csv: string): StudentResponse[] {
  const records = parseRecords(csv);
  validateColumns(records, STUDENT_RESPONSE_REQUIRED_COLUMNS, 'Student responses');

  return records.map((record) => ({
    studentName: record['student_name'],
    examNumber: parseInt(record['exam_number'], 10),
    answers: getQuestionAnswers(record, STUDENT_RESPONSE_REQUIRED_COLUMNS),
  }));
}

export function buildAnswerKeyCsv(rows: AnswerKeyRow[]): string {
  if (rows.length === 0) return '';

  const questionCount = Math.max(...rows.map((r) => r.answers.length));

  const headers = ['exam_number', ...Array.from({ length: questionCount }, (_, i) => `q${i + 1}`)];

  const dataRows = rows.map((row) => {
    const answers = Array.from({ length: questionCount }, (_, i) => row.answers[i] ?? '');
    return [String(row.examNumber), ...answers].join(',');
  });

  return [headers.join(','), ...dataRows].join('\n');
}

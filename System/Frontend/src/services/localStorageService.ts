import type { Exam, Question } from '../types';

const STORAGE_KEYS = {
  QUESTIONS: 'agt:questions',
  EXAMS: 'agt:exams',
} as const;

export function getQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    return raw ? (JSON.parse(raw) as Question[]) : [];
  } catch {
    return [];
  }
}

export function saveQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch {
    throw new Error('Failed to save questions to localStorage');
  }
}

export function getExams(): Exam[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    return raw ? (JSON.parse(raw) as Exam[]) : [];
  } catch {
    return [];
  }
}

export function saveExams(exams: Exam[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  } catch {
    throw new Error('Failed to save exams to localStorage');
  }
}

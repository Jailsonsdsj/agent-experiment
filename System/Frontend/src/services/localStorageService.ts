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

export function saveQuestion(question: Question): void {
  const questions = getQuestions();
  saveQuestions([...questions, question]);
}

export function updateQuestion(updated: Question): void {
  const questions = getQuestions();
  const index = questions.findIndex((q) => q.id === updated.id);
  if (index === -1) throw new Error(`Question with id "${updated.id}" not found`);
  const next = [...questions];
  next[index] = updated;
  saveQuestions(next);
}

export function deleteQuestion(id: string): void {
  const questions = getQuestions();
  const next = questions.filter((q) => q.id !== id);
  if (next.length === questions.length) throw new Error(`Question with id "${id}" not found`);
  saveQuestions(next);
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

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
  } catch (err) {
    console.error('Failed to load exams from localStorage', err);
    return [];
  }
}

function saveExams(exams: Exam[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  } catch {
    throw new Error('Failed to save exams to localStorage');
  }
}

export function saveExam(exam: Omit<Exam, 'id' | 'createdAt'>): Exam {
  const created: Exam = {
    ...exam,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const exams = getExams();
  saveExams([...exams, created]);
  return created;
}

export function updateExam(updatedExam: Exam): Exam {
  const exams = getExams();
  const index = exams.findIndex((e) => e.id === updatedExam.id);
  if (index === -1) throw new Error(`Exam with id "${updatedExam.id}" not found`);
  const next = exams.map((e, i) => (i === index ? updatedExam : e));
  saveExams(next);
  return updatedExam;
}

export function deleteExam(id: string): void {
  try {
    const exams = getExams();
    saveExams(exams.filter((e) => e.id !== id));
  } catch (err) {
    console.error(`Failed to delete exam with id "${id}"`, err);
  }
}

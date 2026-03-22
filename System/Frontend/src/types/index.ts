export type ExamIdentificationMode = 'letters' | 'powers-of-two';

export interface Alternative {
  id: string;
  description: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  statement: string;
  alternatives: Alternative[];
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  questionIds: string[];
  identificationMode: ExamIdentificationMode;
  createdAt: string;
}

export interface GeneratedExam {
  examNumber: number;
  questions: Question[];
}

export interface AnswerKey {
  examNumber: number;
  answers: string[];
}

export interface StudentResponse {
  examNumber: number;
  answers: string[];
  studentName?: string;
}

export interface GradingResult {
  studentName: string;
  examNumber: number;
  scores: number[];
  total: number;
}

export interface GradeReport {
  results: GradingResult[];
  totalStudents: number;
  averageScore: number;
}

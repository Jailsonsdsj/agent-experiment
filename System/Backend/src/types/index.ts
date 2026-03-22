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
}

export interface Exam {
  id: string;
  title: string;
  questions: Question[];
  identificationMode: ExamIdentificationMode;
}

export interface ShuffledQuestion {
  original: Question;
  shuffledAlternatives: Alternative[];
}

export interface GeneratedExam {
  examNumber: number;
  questions: ShuffledQuestion[];
}

export interface AnswerKeyRow {
  examNumber: number;
  answers: string[];
}

export interface StudentResponse {
  examNumber: number;
  studentName: string;
  answers: string[];
}

export type GradingMode = 'strict' | 'lenient';

export interface GradingResult {
  studentName: string;
  examNumber: number;
  scores: number[];
  total: number;
}

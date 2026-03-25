import axios from 'axios';
import type { Exam, GradingMode, GradingResult, Question } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default api;

interface GeneratePdfPayload {
  exam: Exam;
  questions: Question[];
  copies: number;
}

export async function generatePdf(payload: GeneratePdfPayload): Promise<Blob> {
  const response = await api.post<Blob>('/generate-pdf', payload, {
    responseType: 'blob',
  });
  return response.data;
}

export async function gradeExam(
  answerKey: File,
  responses: File,
  gradingMode: GradingMode,
): Promise<GradingResult[]> {
  const formData = new FormData();
  formData.append('answerKey', answerKey);
  formData.append('responses', responses);
  formData.append('gradingMode', gradingMode);
  const response = await api.post<GradingResult[]>('/grade', formData);
  return response.data;
}

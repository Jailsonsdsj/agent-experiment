import axios from 'axios';
import type { Exam, Question } from '../types';

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

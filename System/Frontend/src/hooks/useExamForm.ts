import { useState } from 'react';
import type { ExamIdentificationMode } from '../types';

export interface UseExamFormReturn {
  title: string;
  identificationMode: ExamIdentificationMode;
  selectedQuestionIds: string[];
  isValid: boolean;
  setTitle: (value: string) => void;
  setIdentificationMode: (value: ExamIdentificationMode) => void;
  toggleQuestion: (id: string) => void;
  isQuestionSelected: (id: string) => boolean;
}

export function useExamForm(): UseExamFormReturn {
  const [title, setTitle] = useState<string>('');
  const [identificationMode, setIdentificationMode] = useState<ExamIdentificationMode>('letters');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  const isValid = title.trim() !== '' && selectedQuestionIds.length >= 1;

  function toggleQuestion(id: string): void {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id],
    );
  }

  function isQuestionSelected(id: string): boolean {
    return selectedQuestionIds.includes(id);
  }

  return {
    title,
    identificationMode,
    selectedQuestionIds,
    isValid,
    setTitle,
    setIdentificationMode,
    toggleQuestion,
    isQuestionSelected,
  };
}

import { useState } from 'react';
import type { Exam, ExamIdentificationMode } from '../types';

export interface UseExamFormReturn {
  title: string;
  teacherName: string;
  description: string;
  identificationMode: ExamIdentificationMode;
  selectedQuestionIds: string[];
  isValid: boolean;
  setTitle: (value: string) => void;
  setTeacherName: (value: string) => void;
  setDescription: (value: string) => void;
  setIdentificationMode: (value: ExamIdentificationMode) => void;
  toggleQuestion: (id: string) => void;
  isQuestionSelected: (id: string) => boolean;
}

export function useExamForm(initialData?: Exam): UseExamFormReturn {
  const [title, setTitle] = useState<string>(() => initialData?.title ?? '');
  const [teacherName, setTeacherName] = useState<string>(() => initialData?.teacherName ?? '');
  const [description, setDescription] = useState<string>(() => initialData?.description ?? '');
  const [identificationMode, setIdentificationMode] = useState<ExamIdentificationMode>(
    () => initialData?.identificationMode ?? 'letters',
  );
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(
    () => initialData?.questionIds ?? [],
  );

  const isValid = title.trim() !== '' && teacherName.trim() !== '' && selectedQuestionIds.length >= 1;

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
    teacherName,
    description,
    identificationMode,
    selectedQuestionIds,
    isValid,
    setTitle,
    setTeacherName,
    setDescription,
    setIdentificationMode,
    toggleQuestion,
    isQuestionSelected,
  };
}

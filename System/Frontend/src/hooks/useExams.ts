import { useCallback, useEffect, useState } from 'react';
import type { Exam } from '../types';
import {
  deleteExam as deleteExamFromStorage,
  getExams,
} from '../services/localStorageService';

export interface UseExamsReturn {
  exams: Exam[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  refresh: () => void;
  deleteExam: (id: string) => void;
}

export function useExams(): UseExamsReturn {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadExams = useCallback((): void => {
    setIsLoading(true);
    setError(null);
    try {
      const stored = getExams();
      setExams(stored);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exams.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  function refresh(): void {
    loadExams();
  }

  function deleteExam(id: string): void {
    setError(null);
    try {
      deleteExamFromStorage(id);
      setExams((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete exam.');
    }
  }

  return {
    exams,
    isLoading,
    error,
    isEmpty: exams.length === 0,
    refresh,
    deleteExam,
  };
}

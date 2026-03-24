import { useCallback, useEffect, useState } from 'react';
import type { Question } from '../types';
import {
  deleteQuestion as deleteQuestionFromStorage,
  getQuestions,
} from '../services/localStorageService';

export interface UseQuestionsReturn {
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  refresh: () => void;
  deleteQuestion: (id: string) => void;
}

export function useQuestions(): UseQuestionsReturn {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = useCallback((): void => {
    setIsLoading(true);
    setError(null);
    try {
      const stored = getQuestions();
      setQuestions(stored);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  function refresh(): void {
    loadQuestions();
  }

  function deleteQuestion(id: string): void {
    setError(null);
    try {
      deleteQuestionFromStorage(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question.');
    }
  }

  return {
    questions,
    isLoading,
    error,
    isEmpty: questions.length === 0,
    refresh,
    deleteQuestion,
  };
}

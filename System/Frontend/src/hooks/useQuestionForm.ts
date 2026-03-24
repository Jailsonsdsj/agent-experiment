import { useState } from 'react';
import type { Alternative, Question } from '../types';

interface QuestionFormState {
  statement: string;
  alternatives: Alternative[];
}

function makeAlternative(): Alternative {
  return { id: crypto.randomUUID(), description: '', isCorrect: false };
}

function emptyState(): QuestionFormState {
  return { statement: '', alternatives: [makeAlternative(), makeAlternative()] };
}

function stateFromQuestion(question: Question): QuestionFormState {
  return { statement: question.statement, alternatives: question.alternatives };
}

export interface UseQuestionFormReturn {
  statement: string;
  alternatives: Alternative[];
  isValid: boolean;
  setStatement: (value: string) => void;
  addAlternative: () => void;
  removeAlternative: (id: string) => void;
  updateAlternative: (id: string, changes: Partial<Alternative>) => void;
  toggleCorrect: (id: string) => void;
  setFormData: (question: Question) => void;
  reset: () => void;
}

export function useQuestionForm(initialData?: Question): UseQuestionFormReturn {
  const [state, setState] = useState<QuestionFormState>(() =>
    initialData ? stateFromQuestion(initialData) : emptyState(),
  );

  const isValid =
    state.statement.trim() !== '' &&
    state.alternatives.every((a) => a.description.trim() !== '') &&
    state.alternatives.some((a) => a.isCorrect);

  function setStatement(value: string): void {
    setState((prev) => ({ ...prev, statement: value }));
  }

  function addAlternative(): void {
    setState((prev) => {
      if (prev.alternatives.length >= 6) return prev;
      return { ...prev, alternatives: [...prev.alternatives, makeAlternative()] };
    });
  }

  function removeAlternative(id: string): void {
    setState((prev) => {
      if (prev.alternatives.length <= 2) return prev;
      return { ...prev, alternatives: prev.alternatives.filter((a) => a.id !== id) };
    });
  }

  function updateAlternative(id: string, changes: Partial<Alternative>): void {
    setState((prev) => ({
      ...prev,
      alternatives: prev.alternatives.map((a) => (a.id === id ? { ...a, ...changes } : a)),
    }));
  }

  function toggleCorrect(id: string): void {
    setState((prev) => ({
      ...prev,
      alternatives: prev.alternatives.map((a) =>
        a.id === id ? { ...a, isCorrect: !a.isCorrect } : a,
      ),
    }));
  }

  function setFormData(question: Question): void {
    setState(stateFromQuestion(question));
  }

  function reset(): void {
    setState(initialData ? stateFromQuestion(initialData) : emptyState());
  }

  return {
    statement: state.statement,
    alternatives: state.alternatives,
    isValid,
    setStatement,
    addAlternative,
    removeAlternative,
    updateAlternative,
    toggleCorrect,
    setFormData,
    reset,
  };
}

import { useState } from 'react';
import type { Alternative } from '../types';

interface QuestionFormState {
  statement: string;
  alternatives: Alternative[];
}

function makeAlternative(): Alternative {
  return { id: crypto.randomUUID(), description: '', isCorrect: false };
}

function initialState(): QuestionFormState {
  return { statement: '', alternatives: [makeAlternative(), makeAlternative()] };
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
  reset: () => void;
}

export function useQuestionForm(): UseQuestionFormReturn {
  const [state, setState] = useState<QuestionFormState>(initialState);

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

  function reset(): void {
    setState(initialState());
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
    reset,
  };
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/UI/PageHeader';
import FormLayout from '../../components/UI/FormLayout';
import Input from '../../components/UI/Input';
import Textarea from '../../components/UI/Textarea';
import Button from '../../components/UI/Button';
import { useExamForm } from '../../hooks/useExamForm';
import { useQuestions } from '../../hooks/useQuestions';
import { saveExam } from '../../services/localStorageService';
import type { ExamIdentificationMode } from '../../types';

const IDENTIFICATION_MODES: { value: ExamIdentificationMode; label: string; description: string }[] = [
  {
    value: 'letters',
    label: 'Letters',
    description: 'Student marks the letter of each correct alternative (A, B, C…)',
  },
  {
    value: 'powers-of-two',
    label: 'Powers of 2',
    description: 'Student writes the sum of selected alternatives (1, 2, 4, 8, 16, 32…)',
  },
];

export default function ExamFormPage() {
  const navigate = useNavigate();
  const {
    title,
    description,
    identificationMode,
    selectedQuestionIds,
    isValid,
    setTitle,
    setDescription,
    setIdentificationMode,
    toggleQuestion,
    isQuestionSelected,
  } = useExamForm();
  const { questions, isLoading, isEmpty } = useQuestions();

  const [saveError, setSaveError] = useState<string | null>(null);

  const titleError =
    title.length > 0 && title.trim().length < 3
      ? 'Title must be at least 3 characters.'
      : undefined;

  function handleSave(): void {
    setSaveError(null);
    if (!isValid) return;
    try {
      saveExam({ title: title.trim(), description: description.trim() || undefined, identificationMode, questionIds: selectedQuestionIds });
      navigate('/exams');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save exam.');
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="New Exam" />

      <FormLayout onSubmit={handleSave}>
        <Input
          label="Exam title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Midterm — Introduction to Algorithms"
          required
          error={titleError}
        />

        <Textarea
          label="Description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes about this exam…"
          rows={3}
        />

        {/* Identification mode */}
        <div className="flex flex-col gap-agt-3">
          <span className="text-agt-sm font-medium text-agt-text-muted font-agt-sans">
            Identification mode <span className="text-agt-error" aria-hidden="true">*</span>
          </span>
          <div className="flex gap-agt-3">
            {IDENTIFICATION_MODES.map((mode) => {
              const isActive = identificationMode === mode.value;
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setIdentificationMode(mode.value)}
                  className={[
                    'flex-1 text-left px-agt-4 py-agt-3 rounded-agt-md border',
                    'font-agt-sans transition-colors duration-150',
                    isActive
                      ? 'bg-agt-primary-subtle border-agt-primary text-agt-primary'
                      : 'bg-agt-elevated border-agt-border text-agt-text hover:border-agt-border-strong',
                  ].join(' ')}
                >
                  <p className="text-agt-sm font-bold leading-none mb-agt-1">{mode.label}</p>
                  <p className="text-agt-xs text-agt-text-muted leading-snug">{mode.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question picker */}
        <div className="flex flex-col gap-agt-3">
          <div className="flex items-center justify-between">
            <span className="text-agt-sm font-medium text-agt-text-muted font-agt-sans">
              Questions <span className="text-agt-error" aria-hidden="true">*</span>
            </span>
            {selectedQuestionIds.length > 0 && (
              <span className="text-agt-xs text-agt-text-muted font-agt-sans">
                {selectedQuestionIds.length} selected
              </span>
            )}
          </div>

          {isLoading && (
            <p className="text-agt-sm text-agt-text-muted font-agt-sans">Loading questions…</p>
          )}

          {!isLoading && isEmpty && (
            <p className="text-agt-sm text-agt-text-muted font-agt-sans">
              No questions available. Create questions first.
            </p>
          )}

          {!isLoading && !isEmpty && (
            <div className="flex flex-col gap-agt-2 max-h-72 overflow-y-auto rounded-agt-md border border-agt-border">
              {questions.map((question) => {
                const selected = isQuestionSelected(question.id);
                return (
                  <label
                    key={question.id}
                    className={[
                      'flex items-start gap-agt-3 px-agt-4 py-agt-3 cursor-pointer',
                      'border-b border-agt-border last:border-0',
                      'transition-colors duration-150',
                      selected ? 'bg-agt-primary-subtle' : 'hover:bg-agt-elevated',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleQuestion(question.id)}
                      className="mt-agt-1 w-agt-4 h-agt-4 shrink-0 cursor-pointer accent-[var(--color-agt-primary)]"
                    />
                    <span className="text-agt-sm font-agt-sans text-agt-text line-clamp-2 leading-snug">
                      {question.statement}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {saveError && (
          <p role="alert" className="text-agt-sm text-agt-error font-agt-sans">
            {saveError}
          </p>
        )}

        <div className="flex justify-end gap-agt-3 pt-agt-4 border-t border-agt-border">
          <Button
            label="Cancel"
            variant="ghost"
            onClick={() => navigate('/exams')}
          />
          <Button
            label="Save exam"
            variant="primary"
            onClick={handleSave}
            disabled={!isValid}
          />
        </div>
      </FormLayout>
    </div>
  );
}

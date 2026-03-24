import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/UI/PageHeader';
import FormLayout from '../../components/UI/FormLayout';
import Textarea from '../../components/UI/Textarea';
import Button from '../../components/UI/Button';
import AlternativeItem from '../../components/UI/AlternativeItem';
import { useQuestionForm } from '../../hooks/useQuestionForm';
import { getQuestions, updateQuestion } from '../../services/localStorageService';
import type { Question } from '../../types';

export default function QuestionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [question] = useState<Question | undefined>(() =>
    getQuestions().find((q) => q.id === id),
  );

  const {
    statement,
    alternatives,
    isValid,
    setStatement,
    addAlternative,
    removeAlternative,
    updateAlternative,
    toggleCorrect,
  } = useQuestionForm(question);

  const [saveError, setSaveError] = useState<string | null>(null);

  const statementError =
    statement.length > 0 && statement.trim().length < 10
      ? 'Statement must be at least 10 characters.'
      : undefined;

  const correctCount = alternatives.filter((a) => a.isCorrect).length;

  function handleSave(): void {
    setSaveError(null);
    if (!isValid || !question) return;
    const updated: Question = {
      id: question.id,
      createdAt: question.createdAt,
      statement: statement.trim(),
      alternatives,
    };
    try {
      updateQuestion(updated);
      navigate('/questions');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save question.');
    }
  }

  if (!question) {
    return (
      <div className="max-w-2xl">
        <PageHeader title="Edit Question" />
        <p className="text-agt-error font-agt-sans text-agt-body">Question not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Edit Question" />

      <FormLayout onSubmit={handleSave}>
        <Textarea
          label="Question statement"
          name="statement"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="Enter the question text…"
          rows={4}
          required
          error={statementError}
        />

        <div className="flex items-center justify-between pt-agt-2">
          <h3 className="text-agt-h5 font-bold text-agt-heading font-agt-sans">Alternatives</h3>
          <Button
            label="Add alternative"
            variant="secondary"
            size="sm"
            onClick={addAlternative}
            disabled={alternatives.length >= 6}
          />
        </div>

        <div className="flex flex-col gap-agt-3">
          {alternatives.map((alt, i) => (
            <AlternativeItem
              key={alt.id}
              alternative={alt}
              index={i}
              onUpdate={updateAlternative}
              onToggleCorrect={toggleCorrect}
              onRemove={removeAlternative}
              canRemove={alternatives.length > 2}
            />
          ))}
        </div>

        <p
          className={`text-agt-sm font-agt-sans ${
            correctCount === 0 ? 'text-agt-error' : 'text-agt-text-muted'
          }`}
        >
          {correctCount} correct answer{correctCount !== 1 ? 's' : ''} selected
        </p>

        {saveError && (
          <p role="alert" className="text-agt-sm text-agt-error font-agt-sans">
            {saveError}
          </p>
        )}

        <div className="flex justify-end gap-agt-3 pt-agt-4 border-t border-agt-border">
          <Button
            label="Cancel"
            variant="ghost"
            onClick={() => navigate('/questions')}
          />
          <Button
            label="Save question"
            variant="primary"
            onClick={handleSave}
            disabled={!isValid}
          />
        </div>
      </FormLayout>
    </div>
  );
}

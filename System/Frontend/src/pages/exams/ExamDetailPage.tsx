import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/UI/PageHeader';
import FormLayout from '../../components/UI/FormLayout';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import { getExams, getQuestions } from '../../services/localStorageService';
import { generatePdf } from '../../services/apiService';
import type { Exam, Question } from '../../types';

const IDENTIFICATION_MODE_LABELS: Record<Exam['identificationMode'], string> = {
  letters: 'Letters',
  'powers-of-two': 'Powers of 2',
};

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [exam] = useState<Exam | undefined>(() =>
    getExams().find((e) => e.id === id),
  );

  const [questions] = useState<Question[]>(() => {
    if (!exam) return [];
    const all = getQuestions();
    return exam.questionIds
      .map((qid) => all.find((q) => q.id === qid))
      .filter((q): q is Question => q !== undefined);
  });

  const [copies, setCopies] = useState<string>('1');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const copiesValue = parseInt(copies, 10);
  const isValid = !isNaN(copiesValue) && copiesValue >= 1;

  async function handleGenerate(): Promise<void> {
    if (!exam || !isValid) return;
    setIsGenerating(true);
    setError(null);
    try {
      const blob = await generatePdf({ exam, questions, copies: copiesValue });
      triggerDownload(blob, `${exam.title}.zip`);
    } catch {
      setError('Failed to generate PDF. Check the backend connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  if (!exam) {
    return (
      <div className="max-w-2xl">
        <PageHeader title="Generate PDF" />
        <p className="text-agt-error font-agt-sans text-agt-body">Exam not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Generate PDF" subtitle={exam.title} />

      {/* Exam metadata */}
      <div className="bg-agt-surface rounded-agt-lg border border-agt-border px-agt-6 py-agt-5 flex flex-col gap-agt-3 mb-agt-6">
        <div className="flex items-center gap-agt-3">
          <span className="text-agt-sm text-agt-text-muted font-agt-sans w-28 shrink-0">Teacher</span>
          <span className="text-agt-sm text-agt-text font-agt-sans">{exam.teacherName}</span>
        </div>
        <div className="flex items-center gap-agt-3">
          <span className="text-agt-sm text-agt-text-muted font-agt-sans w-28 shrink-0">Mode</span>
          <Badge label={IDENTIFICATION_MODE_LABELS[exam.identificationMode]} variant="primary" />
        </div>
        <div className="flex items-center gap-agt-3">
          <span className="text-agt-sm text-agt-text-muted font-agt-sans w-28 shrink-0">Questions</span>
          <span className="text-agt-sm text-agt-text font-agt-sans">
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </span>
        </div>
        {exam.description && (
          <div className="flex items-start gap-agt-3">
            <span className="text-agt-sm text-agt-text-muted font-agt-sans w-28 shrink-0">Description</span>
            <span className="text-agt-sm text-agt-text-muted font-agt-sans">{exam.description}</span>
          </div>
        )}
      </div>

      <FormLayout onSubmit={handleGenerate}>
        <Input
          label="Number of copies"
          name="copies"
          type="number"
          value={copies}
          onChange={(e) => setCopies(e.target.value)}
          placeholder="e.g. 30"
          required
        />

        {error && (
          <p role="alert" className="text-agt-sm text-agt-error font-agt-sans">
            {error}
          </p>
        )}

        <div className="flex justify-end pt-agt-4 border-t border-agt-border">
          <Button
            label="Generate PDF"
            variant="primary"
            onClick={handleGenerate}
            isLoading={isGenerating}
            disabled={isGenerating || !isValid}
          />
        </div>
      </FormLayout>
    </div>
  );
}

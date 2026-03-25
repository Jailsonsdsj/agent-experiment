import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/UI/PageHeader';
import FileInput from '../../components/UI/FileInput';
import Button from '../../components/UI/Button';
import Table from '../../components/UI/Table';
import type { Column } from '../../components/UI/Table';
import { getExams } from '../../services/localStorageService';
import { gradeExam } from '../../services/apiService';
import type { GradingMode, GradingResult } from '../../types';

const GRADING_MODE_LABELS: Record<GradingMode, string> = {
  strict: 'Strict',
  lenient: 'Lenient',
};

type ResultRow = {
  studentName: string;
  examNumber: number;
  scores: string;
  total: number;
  [key: string]: unknown;
};

const RESULT_COLUMNS: Column<ResultRow>[] = [
  { key: 'studentName', header: 'Student' },
  { key: 'examNumber', header: 'Exam #' },
  { key: 'scores', header: 'Scores per question' },
  { key: 'total', header: 'Total' },
];

function toResultRows(results: GradingResult[]): ResultRow[] {
  return results.map((r) => ({
    studentName: r.studentName,
    examNumber: r.examNumber,
    scores: r.scores.join(', '),
    total: r.total,
  }));
}

function average(results: GradingResult[]): string {
  if (results.length === 0) return '0';
  const sum = results.reduce((acc, r) => acc + r.total, 0);
  return (sum / results.length).toFixed(2);
}

export default function GradeReportPage() {
  const { id } = useParams<{ id: string }>();

  const [examTitle] = useState<string>(() => {
    const exam = getExams().find((e) => e.id === id);
    return exam?.title ?? `Exam ${id}`;
  });

  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [responsesFile, setResponsesFile] = useState<File | null>(null);
  const [gradingMode, setGradingMode] = useState<GradingMode>('strict');
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GradingResult[] | null>(null);

  const isValid = answerKeyFile !== null && responsesFile !== null;

  async function handleGrade(): Promise<void> {
    if (!isValid) return;
    setIsGrading(true);
    setError(null);
    try {
      const data = await gradeExam(answerKeyFile, responsesFile, gradingMode);
      setResults(data);
    } catch {
      setError('Failed to grade exams. Check the backend connection and try again.');
    } finally {
      setIsGrading(false);
    }
  }

  function handleReset(): void {
    setResults(null);
    setAnswerKeyFile(null);
    setResponsesFile(null);
    setError(null);
  }

  if (results !== null) {
    return (
      <div className="max-w-4xl">
        <PageHeader
          title="Grade Report"
          subtitle={examTitle}
          action={<Button label="Grade again" variant="secondary" onClick={handleReset} />}
        />

        <div className="flex items-center gap-agt-6 mb-agt-6 px-agt-5 py-agt-4 bg-agt-surface rounded-agt-lg border border-agt-border">
          <div className="flex flex-col gap-agt-1">
            <span className="text-agt-xs text-agt-text-muted font-agt-sans uppercase tracking-wide">
              Students graded
            </span>
            <span className="text-agt-h2 font-bold text-agt-heading font-agt-sans">
              {results.length}
            </span>
          </div>
          <div className="w-px h-10 bg-agt-border" />
          <div className="flex flex-col gap-agt-1">
            <span className="text-agt-xs text-agt-text-muted font-agt-sans uppercase tracking-wide">
              Average score
            </span>
            <span className="text-agt-h2 font-bold text-agt-heading font-agt-sans">
              {average(results)}
            </span>
          </div>
          <div className="w-px h-10 bg-agt-border" />
          <div className="flex flex-col gap-agt-1">
            <span className="text-agt-xs text-agt-text-muted font-agt-sans uppercase tracking-wide">
              Mode
            </span>
            <span className="text-agt-body font-medium text-agt-text font-agt-sans">
              {GRADING_MODE_LABELS[gradingMode]}
            </span>
          </div>
        </div>

        <Table
          columns={RESULT_COLUMNS}
          data={toResultRows(results)}
          emptyMessage="No results returned."
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Grade Report" subtitle={examTitle} />

      <div className="flex flex-col gap-agt-5">
        <FileInput
          label="Answer key CSV"
          name="answerKey"
          accept=".csv"
          onChange={setAnswerKeyFile}
          fileName={answerKeyFile?.name}
          required
        />

        <FileInput
          label="Student responses CSV"
          name="responses"
          accept=".csv"
          onChange={setResponsesFile}
          fileName={responsesFile?.name}
          required
        />

        <div className="flex flex-col gap-agt-2">
          <span className="text-agt-sm text-agt-text-muted font-medium font-agt-sans">
            Grading mode
            <span className="text-agt-error ml-agt-1" aria-hidden="true">
              *
            </span>
          </span>
          <div className="flex gap-agt-2">
            {(['strict', 'lenient'] as GradingMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setGradingMode(mode)}
                className={[
                  'px-agt-4 py-agt-2 text-agt-sm font-medium font-agt-sans rounded-agt-md border',
                  'transition-[background-color,border-color,color] duration-150 cursor-pointer',
                  gradingMode === mode
                    ? 'bg-agt-primary text-agt-heading border-agt-primary'
                    : 'bg-transparent text-agt-text border-agt-border hover:bg-agt-elevated',
                ].join(' ')}
              >
                {GRADING_MODE_LABELS[mode]}
              </button>
            ))}
          </div>
          <p className="text-agt-xs text-agt-text-muted font-agt-sans">
            {gradingMode === 'strict'
              ? 'Strict — any incorrect or missing selection scores zero for that question.'
              : 'Lenient — score is proportional to the percentage of correctly handled alternatives.'}
          </p>
        </div>

        {error && (
          <p role="alert" className="text-agt-sm text-agt-error font-agt-sans">
            {error}
          </p>
        )}

        <div className="flex justify-end pt-agt-4 border-t border-agt-border">
          <Button
            label="Grade exams"
            variant="primary"
            onClick={handleGrade}
            isLoading={isGrading}
            disabled={isGrading || !isValid}
          />
        </div>
      </div>
    </div>
  );
}

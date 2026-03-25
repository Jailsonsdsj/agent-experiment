import { useState } from 'react';
import PageHeader from '../components/UI/PageHeader';
import FileInput from '../components/UI/FileInput';
import Button from '../components/UI/Button';
import { getQuestions, saveQuestions } from '../services/localStorageService';
import { parseQuestionCsv } from '../utils/questionCsvParser';
import type { QuestionCsvParseResult } from '../utils/questionCsvParser';
import type { Question } from '../types';

type ImportState = 'idle' | 'ready' | 'success';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<QuestionCsvParseResult | null>(null);
  const [importState, setImportState] = useState<ImportState>('idle');
  const [importedCount, setImportedCount] = useState<number>(0);

  function handleFileChange(selected: File | null): void {
    setFile(selected);
    setParseResult(null);
    setImportState('idle');

    if (!selected) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseQuestionCsv(text);
      setParseResult(result);
      setImportState('ready');
    };
    reader.readAsText(selected);
  }

  function handleImport(): void {
    if (!parseResult || parseResult.questions.length === 0) return;

    const existing: Question[] = getQuestions();
    saveQuestions([...existing, ...parseResult.questions]);

    setImportedCount(parseResult.questions.length);
    setImportState('success');
    setFile(null);
    setParseResult(null);
  }

  function handleReset(): void {
    setFile(null);
    setParseResult(null);
    setImportState('idle');
    setImportedCount(0);
  }

  const canImport = parseResult !== null && parseResult.questions.length > 0;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Admin" subtitle="Testing tools and utilities." />

      {/* ── Import Questions section ───────────────── */}
      <div className="bg-agt-surface rounded-agt-lg border border-agt-border px-agt-6 py-agt-5 flex flex-col gap-agt-5">
        <h2 className="text-agt-h3 font-bold text-agt-heading font-agt-sans">
          Import questions from CSV
        </h2>

        {importState === 'success' ? (
          <div className="flex flex-col gap-agt-4">
            <p className="text-agt-body font-agt-sans text-agt-text">
              <span className="font-bold text-agt-heading">{importedCount}</span>{' '}
              {importedCount === 1 ? 'question' : 'questions'} imported successfully. They are now
              available on the Questions page and can be added to exams.
            </p>
            <div>
              <Button label="Import another file" variant="secondary" onClick={handleReset} />
            </div>
          </div>
        ) : (
          <>
            <FileInput
              label="CSV file"
              name="questionsCsv"
              accept=".csv"
              onChange={handleFileChange}
              fileName={file?.name}
              required
            />

            {parseResult !== null && (
              <div className="flex flex-col gap-agt-3">
                {/* Summary */}
                <div className="flex items-center gap-agt-4 text-agt-sm font-agt-sans">
                  <span className="text-agt-text">
                    <span className="font-bold text-agt-heading">
                      {parseResult.questions.length}
                    </span>{' '}
                    {parseResult.questions.length === 1 ? 'question' : 'questions'} ready
                  </span>
                  {parseResult.errors.length > 0 && (
                    <span className="text-agt-error">
                      <span className="font-bold">{parseResult.errors.length}</span>{' '}
                      {parseResult.errors.length === 1 ? 'row' : 'rows'} with errors
                    </span>
                  )}
                </div>

                {/* Question preview */}
                {parseResult.questions.length > 0 && (
                  <div className="rounded-agt-md border border-agt-border overflow-hidden">
                    {parseResult.questions.slice(0, 5).map((q, i) => (
                      <div
                        key={q.id}
                        className="px-agt-4 py-agt-3 text-agt-sm font-agt-sans border-b border-agt-border last:border-0 flex items-start gap-agt-3"
                      >
                        <span className="text-agt-text-muted shrink-0 w-5 text-right">{i + 1}.</span>
                        <span className="text-agt-text truncate">{q.statement}</span>
                        <span className="text-agt-text-muted shrink-0 ml-auto">
                          {q.alternatives.length} alt
                          {q.alternatives.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                    {parseResult.questions.length > 5 && (
                      <div className="px-agt-4 py-agt-3 text-agt-sm font-agt-sans text-agt-text-muted bg-agt-elevated">
                        …and {parseResult.questions.length - 5} more
                      </div>
                    )}
                  </div>
                )}

                {/* Row errors */}
                {parseResult.errors.length > 0 && (
                  <div className="flex flex-col gap-agt-1">
                    {parseResult.errors.map((err, i) => (
                      <p key={i} className="text-agt-xs font-agt-sans text-agt-error">
                        {err.row === 0 ? 'File' : `Row ${err.row}`}: {err.message}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-agt-2 border-t border-agt-border">
              <Button
                label={
                  canImport
                    ? `Import ${parseResult.questions.length} ${parseResult.questions.length === 1 ? 'question' : 'questions'}`
                    : 'Import questions'
                }
                variant="primary"
                onClick={handleImport}
                disabled={!canImport}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

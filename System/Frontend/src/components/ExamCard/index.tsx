import Badge from '../UI/Badge';
import Button from '../UI/Button';
import type { Exam } from '../../types';

export interface ExamCardProps {
  exam: Exam;
  onEdit: (id: string) => void;
  onGenerate: (id: string) => void;
  onGrade: (id: string) => void;
  onDelete: (id: string) => void;
}

const IDENTIFICATION_MODE_LABELS: Record<Exam['identificationMode'], string> = {
  letters: 'Letters',
  'powers-of-two': 'Powers of 2',
};

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ExamCard({ exam, onEdit, onGenerate, onGrade, onDelete }: ExamCardProps) {
  return (
    <div className="bg-agt-surface rounded-agt-lg border border-agt-border shadow-agt-sm flex flex-col min-h-[220px]">
      {/* Body */}
      <div className="px-agt-5 pt-agt-5 pb-agt-4 flex flex-col gap-agt-3 flex-1">
        <p className="text-agt-body font-bold text-agt-heading font-agt-sans leading-snug">
          {exam.title}
        </p>

        {exam.description && (
          <p className="text-agt-sm font-agt-sans text-agt-text-muted line-clamp-2">
            {exam.description}
          </p>
        )}

        <div className="flex items-center gap-agt-2 flex-wrap">
          <Badge label={IDENTIFICATION_MODE_LABELS[exam.identificationMode]} variant="primary" />
          <span className="text-agt-xs text-agt-text-muted font-agt-sans">
            {exam.questionIds.length} question{exam.questionIds.length !== 1 ? 's' : ''}
          </span>
        </div>

        <p className="text-agt-xs text-agt-text-muted font-agt-sans mt-auto">
          Created {formatDate(exam.createdAt)}
        </p>
      </div>

      {/* Dotted divider */}
      <div className="mx-agt-5 border-t border-dotted border-agt-border" />

      {/* Action bar */}
      <div className="px-agt-5 py-agt-3 flex items-center justify-between">
        <Button
          label="Edit"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(exam.id)}
        />
        <div className="flex items-center gap-agt-2">
          <Button
            label="Generate PDF"
            variant="secondary"
            size="sm"
            onClick={() => onGenerate(exam.id)}
          />
          <Button
            label="Grade"
            variant="ghost"
            size="sm"
            onClick={() => onGrade(exam.id)}
          />
          <Button
            label="Delete"
            variant="danger"
            size="sm"
            onClick={() => onDelete(exam.id)}
          />
        </div>
      </div>
    </div>
  );
}

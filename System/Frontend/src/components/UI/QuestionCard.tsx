import Button from './Button';
import type { Question } from '../../types';

export interface QuestionCardProps {
  question: Question;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function QuestionCard({ question, onEdit, onDelete }: QuestionCardProps) {
  const correctAlternative = question.alternatives.find((a) => a.isCorrect);

  return (
    <div className="bg-agt-surface rounded-agt-lg border border-agt-border shadow-agt-sm flex flex-col">
      {/* Body */}
      <div className="px-agt-5 pt-agt-5 pb-agt-4 flex flex-col gap-agt-3 flex-1">
        <p className="text-agt-body font-bold text-agt-heading font-agt-sans leading-snug line-clamp-2">
          {question.statement}
        </p>

        {correctAlternative && (
          <p className="text-agt-sm font-agt-sans text-agt-success">
            ✓ {correctAlternative.description}
          </p>
        )}
      </div>

      {/* Dotted divider */}
      <div className="mx-agt-5 border-t border-dotted border-agt-border" />

      {/* Action bar */}
      <div className="px-agt-5 py-agt-3 flex items-center justify-between">
        <Button
          label="Edit"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(question.id)}
        />
        <Button
          label="Delete"
          variant="danger"
          size="sm"
          onClick={() => onDelete(question.id)}
        />
      </div>
    </div>
  );
}

import Input from './Input';
import Button from './Button';
import type { Alternative } from '../../types';

export interface AlternativeItemProps {
  alternative: Alternative;
  index: number;
  onUpdate: (id: string, changes: Partial<Alternative>) => void;
  onToggleCorrect: (id: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export default function AlternativeItem({
  alternative,
  index,
  onUpdate,
  onToggleCorrect,
  onRemove,
  canRemove,
}: AlternativeItemProps) {
  const letter = String.fromCharCode(65 + index);

  return (
    <div
      className={[
        'rounded-agt-md border p-agt-4 flex flex-col gap-agt-3',
        'transition-colors duration-150',
        alternative.isCorrect
          ? 'bg-agt-success-subtle border-agt-success'
          : 'bg-agt-surface border-agt-border',
      ].join(' ')}
    >
      <div className="flex items-end gap-agt-3">
        <div className="flex-1">
          <Input
            label={letter}
            name={`alternative-${alternative.id}`}
            value={alternative.description}
            onChange={(e) => onUpdate(alternative.id, { description: e.target.value })}
            placeholder={`Enter alternative ${letter} text…`}
          />
        </div>
        <Button
          label="Remove"
          variant="danger"
          size="sm"
          onClick={() => onRemove(alternative.id)}
          disabled={!canRemove}
        />
      </div>

      <label className="flex items-center gap-agt-2 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={alternative.isCorrect}
          onChange={() => onToggleCorrect(alternative.id)}
          className="w-agt-4 h-agt-4 cursor-pointer accent-[var(--color-agt-success)]"
        />
        <span className="text-agt-sm font-agt-sans text-agt-text">Correct answer</span>
      </label>
    </div>
  );
}

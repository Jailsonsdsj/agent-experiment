import { useRef } from 'react';

export interface FileInputProps {
  label: string;
  name: string;
  accept?: string;
  onChange: (file: File | null) => void;
  fileName?: string;
  error?: string;
  required?: boolean;
}

export default function FileInput({
  label,
  name,
  accept,
  onChange,
  fileName,
  error,
  required = false,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = `file-${name}`;
  const errorId = `file-${name}-error`;
  const hasError = Boolean(error);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    onChange(e.target.files?.[0] ?? null);
  }

  return (
    <div className="flex flex-col gap-agt-2">
      <label
        htmlFor={inputId}
        className="text-agt-sm text-agt-text-muted font-medium font-agt-sans"
      >
        {label}
        {required && (
          <span className="text-agt-error ml-agt-1" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div
        className={[
          'flex items-center gap-agt-3 w-full px-agt-3 py-agt-2',
          'bg-agt-surface rounded-agt-md border',
          'transition-[border-color] duration-150',
          hasError ? 'border-agt-error' : 'border-agt-border',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="shrink-0 px-agt-3 py-agt-1 text-agt-sm font-medium font-agt-sans rounded-agt-sm border border-agt-border bg-agt-elevated text-agt-text hover:bg-agt-surface transition-colors duration-150 cursor-pointer"
        >
          Choose file
        </button>
        <span className="text-agt-sm font-agt-sans text-agt-text-muted truncate">
          {fileName ?? 'No file selected'}
        </span>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        onChange={handleChange}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        className="sr-only"
      />

      {hasError && (
        <p id={errorId} role="alert" className="text-agt-xs text-agt-error font-agt-sans">
          {error}
        </p>
      )}
    </div>
  );
}

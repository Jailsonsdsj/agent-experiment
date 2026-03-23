export interface TextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  disabled = false,
  required = false,
}: TextareaProps) {
  const textareaId = `textarea-${name}`;
  const errorId = `textarea-${name}-error`;
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-agt-2">
      <label
        htmlFor={textareaId}
        className="text-agt-sm text-agt-text-muted font-medium font-agt-sans"
      >
        {label}
        {required && (
          <span className="text-agt-error ml-agt-1" aria-hidden="true">*</span>
        )}
      </label>

      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        className={[
          'w-full px-agt-3 py-agt-2 font-agt-sans text-agt-body text-agt-text',
          'bg-agt-surface rounded-agt-md border outline-none resize-y',
          'placeholder:text-agt-text-muted',
          'transition-[border-color,box-shadow] duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          hasError
            ? 'border-agt-error focus:border-agt-error focus:shadow-[0_0_0_3px_var(--color-agt-error-subtle)]'
            : 'border-agt-border focus:border-agt-primary focus:shadow-[0_0_0_3px_var(--color-agt-primary-subtle)]',
        ].join(' ')}
      />

      {hasError && (
        <p id={errorId} role="alert" className="text-agt-xs text-agt-error font-agt-sans">
          {error}
        </p>
      )}
    </div>
  );
}

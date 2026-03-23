export interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'number' | 'password';
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  disabled = false,
  required = false,
}: InputProps) {
  const inputId = `input-${name}`;
  const errorId = `input-${name}-error`;
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-agt-2">
      <label
        htmlFor={inputId}
        className="text-agt-sm text-agt-text-muted font-medium font-agt-sans"
      >
        {label}
        {required && (
          <span className="text-agt-error ml-agt-1" aria-hidden="true">*</span>
        )}
      </label>

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        className={[
          'w-full px-agt-3 py-agt-2 font-agt-sans text-agt-body text-agt-text',
          'bg-agt-surface rounded-agt-md border outline-none',
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

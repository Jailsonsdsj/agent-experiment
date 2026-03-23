export interface ButtonProps {
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'bg-agt-primary text-agt-heading border-agt-primary hover:bg-agt-primary-hover hover:border-agt-primary-hover',
  secondary: 'bg-transparent text-agt-primary border-agt-primary hover:bg-agt-primary-subtle',
  ghost:     'bg-transparent text-agt-text border-transparent hover:bg-agt-elevated',
  danger:    'bg-agt-error text-agt-heading border-agt-error hover:opacity-85',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-agt-3 py-agt-1 text-agt-sm rounded-agt-sm',
  md: 'px-agt-4 py-agt-2 text-agt-sm rounded-agt-md',
  lg: 'px-agt-6 py-agt-3 text-agt-body rounded-agt-md',
};

export default function Button({
  label,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
}: ButtonProps) {
  const isInert = disabled || isLoading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isInert}
      className={[
        'inline-flex items-center justify-center gap-agt-2',
        'border font-agt-sans font-medium leading-none',
        'transition-[background-color,border-color,opacity] duration-150',
        'cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
      ].join(' ')}
    >
      {isLoading && (
        <svg
          className="animate-spin h-agt-4 w-agt-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {label}
    </button>
  );
}

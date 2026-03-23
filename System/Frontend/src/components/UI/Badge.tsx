export interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'primary';
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  success: 'bg-agt-success-subtle text-agt-success border-agt-success',
  warning: 'bg-agt-warning-subtle text-agt-warning border-agt-warning',
  danger:  'bg-agt-error-subtle text-agt-error border-agt-error',
  neutral: 'bg-agt-elevated text-agt-text-muted border-agt-border',
  primary: 'bg-agt-primary-subtle text-agt-primary border-agt-primary',
};

export default function Badge({ label, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-agt-2 py-agt-1',
        'text-agt-xs font-medium font-agt-sans leading-none',
        'rounded-agt-full border',
        variantClasses[variant],
      ].join(' ')}
    >
      {label}
    </span>
  );
}

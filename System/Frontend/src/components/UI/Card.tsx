export interface CardProps {
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  className?: string;
}

export default function Card({ children, title, footer, className }: CardProps) {
  return (
    <div
      className={[
        'bg-agt-surface rounded-agt-lg border border-agt-border shadow-agt-md',
        'flex flex-col',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {title && (
        <div className="px-agt-6 py-agt-4 border-b border-agt-border">
          <h3 className="text-agt-h5 font-bold text-agt-heading font-agt-sans">{title}</h3>
        </div>
      )}

      <div className="px-agt-6 py-agt-6 flex-1">{children}</div>

      {footer && (
        <div className="px-agt-6 py-agt-4 border-t border-agt-border">
          {footer}
        </div>
      )}
    </div>
  );
}

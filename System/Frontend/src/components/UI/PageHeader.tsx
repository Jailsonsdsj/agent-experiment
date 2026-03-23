export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-agt-4 mb-agt-8">
      <div className="flex flex-col gap-agt-1">
        <h1 className="text-agt-h1 font-bold text-agt-heading font-agt-sans leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-agt-body text-agt-text-muted font-agt-sans">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0 mt-agt-1">{action}</div>}
    </div>
  );
}

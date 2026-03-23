export interface FormLayoutProps {
  children: React.ReactNode;
  onSubmit: () => void;
  title?: string;
}

export default function FormLayout({ children, onSubmit, title }: FormLayoutProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      onSubmit();
    }
  }

  return (
    <div role="form" onKeyDown={handleKeyDown} className="flex flex-col gap-agt-5">
      {title && (
        <h2 className="text-agt-h3 font-bold text-agt-heading font-agt-sans">{title}</h2>
      )}
      {children}
    </div>
  );
}

import PageHeader from '../components/UI/PageHeader';

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your question bank and exams."
      />
      <p className="text-agt-text-muted font-agt-sans text-agt-body">
        This page will show stats, recent exams, and quick actions.
      </p>
    </div>
  );
}

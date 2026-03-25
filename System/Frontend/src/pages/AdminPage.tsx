import PageHeader from '../components/UI/PageHeader';

export default function AdminPage() {
  return (
    <div>
      <PageHeader
        title="Admin"
        subtitle="Manage testing tools and utilities."
      />
      <p className="text-agt-text-muted font-agt-sans text-agt-body">
        Testing features will be added here.
      </p>
    </div>
  );
}

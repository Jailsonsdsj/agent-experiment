import { useParams } from 'react-router-dom';
import PageHeader from '../../components/UI/PageHeader';

export default function GradeReportPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <PageHeader
        title="Grade Report"
        subtitle={`Results for exam ${id}`}
      />
      <p className="text-agt-text-muted font-agt-sans text-agt-body">
        Grading results table will be implemented here.
      </p>
    </div>
  );
}

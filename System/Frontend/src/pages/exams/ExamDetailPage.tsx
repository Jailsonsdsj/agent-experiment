import { useParams } from 'react-router-dom';
import PageHeader from '../../components/UI/PageHeader';

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <PageHeader
        title="Exam Detail"
        subtitle={`Exam ID: ${id}`}
      />
      <p className="text-agt-text-muted font-agt-sans text-agt-body">
        PDF generation and grading upload will be implemented here.
      </p>
    </div>
  );
}

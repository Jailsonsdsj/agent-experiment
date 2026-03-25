import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';

export default function ExamListPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Exams"
        subtitle="Create and manage your exam sets."
        action={
          <Button
            label="Create exam"
            variant="primary"
            onClick={() => navigate('/exams/new')}
          />
        }
      />
      <p className="text-agt-text-muted font-agt-sans text-agt-body">
        Exam list will be implemented here.
      </p>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import ExamCard from '../../components/ExamCard';
import { useExams } from '../../hooks/useExams';

export default function ExamListPage() {
  const navigate = useNavigate();
  const { exams, isLoading, error, isEmpty, deleteExam } = useExams();

  function handleEdit(id: string): void {
    navigate(`/exams/${id}/edit`);
  }

  function handleGenerate(id: string): void {
    navigate(`/exams/${id}`);
  }

  function handleGrade(id: string): void {
    navigate(`/exams/${id}/report`);
  }

  function handleDelete(id: string): void {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    deleteExam(id);
  }

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

      {isLoading && (
        <p className="text-agt-text-muted font-agt-sans text-agt-body">Loading exams…</p>
      )}

      {!isLoading && error && (
        <p className="text-agt-error font-agt-sans text-agt-body">{error}</p>
      )}

      {!isLoading && !error && isEmpty && (
        <p className="text-agt-text-muted font-agt-sans text-agt-body">No exams created yet.</p>
      )}

      {!isLoading && !error && !isEmpty && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-agt-4">
          {exams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onEdit={handleEdit}
              onGenerate={handleGenerate}
              onGrade={handleGrade}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

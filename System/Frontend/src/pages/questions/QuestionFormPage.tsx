import { useParams } from 'react-router-dom';
import PageHeader from '../../components/UI/PageHeader';

export default function QuestionFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Edit Question' : 'New Question'}
        subtitle={isEditing ? `Editing question ${id}` : 'Create a new multiple-choice question.'}
      />
      <p className="text-agt-text-muted font-agt-sans text-agt-body">
        Question form will be implemented here.
      </p>
    </div>
  );
}

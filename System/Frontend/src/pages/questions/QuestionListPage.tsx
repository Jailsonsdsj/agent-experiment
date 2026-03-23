import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';

export default function QuestionListPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Question Bank"
        subtitle="Manage your pool of multiple-choice questions."
        action={
          <Button
            label="Create new question"
            variant="primary"
            onClick={() => navigate('/questions/new')}
          />
        }
      />
      <p className="text-agt-text-muted font-agt-sans text-agt-body">
        Question list will be implemented here.
      </p>
    </div>
  );
}

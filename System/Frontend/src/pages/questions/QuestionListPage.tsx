import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import QuestionCard from '../../components/QuestionCard';
import { useQuestions } from '../../hooks/useQuestions';

export default function QuestionListPage() {
  const navigate = useNavigate();
  const { questions, isLoading, error, isEmpty, deleteQuestion } = useQuestions();
  const [query, setQuery] = useState('');

  function handleEdit(id: string): void {
    navigate(`/questions/edit/${id}`);
  }

  function handleDelete(id: string): void {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    deleteQuestion(id);
  }

  const filtered = questions.filter((q) =>
    q.statement.toLowerCase().includes(query.toLowerCase()),
  );

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

      {!isLoading && !error && !isEmpty && (
        <div className="mb-agt-5">
          <input
            className="input max-w-sm"
            type="search"
            placeholder="Search questions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search questions"
          />
        </div>
      )}

      {isLoading && (
        <p className="text-agt-text-muted font-agt-sans text-agt-body">Loading questions…</p>
      )}

      {!isLoading && error && (
        <p className="text-agt-error font-agt-sans text-agt-body">{error}</p>
      )}

      {!isLoading && !error && isEmpty && (
        <p className="text-agt-text-muted font-agt-sans text-agt-body">No questions created yet.</p>
      )}

      {!isLoading && !error && !isEmpty && filtered.length === 0 && (
        <p className="text-agt-text-muted font-agt-sans text-agt-body">No questions match your search.</p>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-agt-4">
          {filtered.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

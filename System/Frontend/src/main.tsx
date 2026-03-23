import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import QuestionListPage from './pages/questions/QuestionListPage';
import QuestionFormPage from './pages/questions/QuestionFormPage';
import ExamListPage from './pages/exams/ExamListPage';
import ExamFormPage from './pages/exams/ExamFormPage';
import ExamDetailPage from './pages/exams/ExamDetailPage';
import GradeReportPage from './pages/exams/GradeReportPage';
import DesignPreview from './components/DesignPreview';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'questions', element: <QuestionListPage /> },
      { path: 'questions/new', element: <QuestionFormPage /> },
      { path: 'questions/:id/edit', element: <QuestionFormPage /> },
      { path: 'exams', element: <ExamListPage /> },
      { path: 'exams/new', element: <ExamFormPage /> },
      { path: 'exams/:id', element: <ExamDetailPage /> },
      { path: 'exams/:id/report', element: <GradeReportPage /> },
      { path: 'design', element: <DesignPreview /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

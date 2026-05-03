import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import AuthLayout from '@/components/layout/AuthLayout';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import TasksPage from '@/pages/TasksPage';
import MembersPage from '@/pages/MembersPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFoundPage from '@/pages/NotFoundPage';

function RequireAuth({ children }) {
  const token = useAuthStore((s) => s.token);
  const loc = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

function GuestOnly({ children }) {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route element={<GuestOnly><AuthLayout /></GuestOnly>}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

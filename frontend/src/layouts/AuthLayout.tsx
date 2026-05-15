import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

    <main className="flex-1 flex items-center justify-center p-lg">
      <Outlet />
    </main>
}

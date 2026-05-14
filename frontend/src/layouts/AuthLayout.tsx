import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { useAuthStore } from '../store/authStore';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md antialiased">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-lg">
        <Outlet />
      </main>
    </div>
  );
}

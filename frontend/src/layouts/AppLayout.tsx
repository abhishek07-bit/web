import { Outlet, Navigate } from 'react-router-dom';
import { Navbar, Footer } from '../components/common';
import { useAuthStore } from '../store/authStore';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md antialiased">
      <Navbar />
      <main className="flex-1 px-lg md:px-container-padding py-lg max-w-max-width mx-auto w-full animate-fade-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

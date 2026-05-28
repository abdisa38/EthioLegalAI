import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/shared/hooks';
import { PageLoader } from '@/shared/components';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader text="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

"use client";
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please log in to access this page');
      router.push('/');
    }
    
    if (!loading && user && requiredRole && user.role !== requiredRole) {
      toast.error('You do not have permission to access this page');
    }
  }, [user, loading, router, requiredRole]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Access Denied</div>
      </div>
    );
  }

  return <>{children}</>;
}
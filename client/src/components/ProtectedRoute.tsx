import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { state } = useApp();

  if (!state.analysisResult) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import HeroSection from './components/Hero/HeroSection';
import InputWizard from './components/InputWizard/InputWizard';
import RiskDashboard from './components/RiskDashboard/RiskDashboard';
import RecommendationsPanel from './components/RecommendationsPanel/RecommendationsPanel';
import RootErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import './index.css';

// ============================================================
// Page transition variants
// ============================================================

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = {
  duration: 0.35,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

function AnimatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// Guards
// ============================================================

/**
 * Ensures analysis data exists before allowing access to result pages.
 * On hard reload or direct deep-link, in-memory state is lost — send
 * the user back to the wizard.
 */
function ResultsGuard({
  children,
  requireRecommendations = false,
}: {
  children: React.ReactNode;
  requireRecommendations?: boolean;
}) {
  const { state } = useApp();
  if (!state.analysisResult) return <Navigate to="/wizard" replace />;
  if (requireRecommendations && state.recommendations.length === 0) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

// ============================================================
// Inner App (has access to router + context)
// ============================================================

function AppContent() {
  const location = useLocation();

  // Lock body overscroll on the 3D hero, relax it everywhere else
  useEffect(() => {
    document.body.style.overscrollBehavior = location.pathname === '/' ? 'none' : 'auto';
    return () => {
      document.body.style.overscrollBehavior = 'auto';
    };
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <AnimatedRoute>
              <HeroSection />
            </AnimatedRoute>
          }
        />
        <Route
          path="/wizard"
          element={
            <AnimatedRoute>
              <InputWizard />
            </AnimatedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AnimatedRoute>
              <ResultsGuard>
                <RiskDashboard />
              </ResultsGuard>
            </AnimatedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <AnimatedRoute>
              <ResultsGuard requireRecommendations>
                <RecommendationsPanel />
              </ResultsGuard>
            </AnimatedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// ============================================================
// Root App with providers
// ============================================================

export default function App() {
  return (
    <RootErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ToastProvider>
    </RootErrorBoundary>
  );
}

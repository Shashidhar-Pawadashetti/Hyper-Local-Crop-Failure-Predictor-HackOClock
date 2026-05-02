import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HeroSection from './components/Hero/HeroSection';
import InputWizard from './components/InputWizard/InputWizard';
import RiskDashboard from './components/RiskDashboard/RiskDashboard';
import RecommendationsPanel from './components/RecommendationsPanel/RecommendationsPanel';
import ProtectedRoute from './components/ProtectedRoute';
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

// ============================================================
// Inner App (has access to context + router)
// ============================================================

function AppContent() {
  const location = useLocation();

  // Prevent body scroll on hero (Three.js handles scroll)
  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    return () => { document.body.style.overscrollBehavior = 'auto'; };
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        <Routes location={location}>
          <Route path="/" element={<HeroSection />} />
          <Route path="/analyze" element={<InputWizard />} />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <RiskDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results/recommendations"
            element={
              <ProtectedRoute>
                <RecommendationsPanel />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
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

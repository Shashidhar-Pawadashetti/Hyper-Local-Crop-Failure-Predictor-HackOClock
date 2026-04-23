import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { speakRecommendations, stopSpeaking } from '../../utils/speech';
import RecommendationCard from './RecommendationCard';
import LanguageToggle from './LanguageToggle';
import PDFExport from './PDFExport';
import CostSummary from './CostSummary';

export default function RecommendationsPanel() {
  const navigate = useNavigate();
  const { state, setLanguage, resetForm } = useApp();
  const { recommendations, recommendationSummary, district, crop, stage, language } = state;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakRecommendations(recommendations, language);
    // Stop state after rough duration
    const totalChars = recommendations.reduce(
      (sum, r) => sum + (r.voiceText ?? r.description[language]).length,
      0,
    );
    const approxMs = (totalChars / 8) * 1000; // ~8 chars/sec
    setTimeout(() => setIsSpeaking(false), approxMs);
  };

  const riskColor =
    recommendationSummary?.overallRisk === 'critical'
      ? '#ef4444'
      : recommendationSummary?.overallRisk === 'high'
      ? '#f97316'
      : recommendationSummary?.overallRisk === 'moderate'
      ? '#facc15'
      : '#22c55e';

  return (
    <div
      style={{
        minHeight: '100svh',
        background: 'linear-gradient(135deg, #020a02 0%, #0a1f0a 60%, #041a1a 100%)',
        paddingBottom: '6rem',
      }}
    >
      {/* === Sticky top navigation === */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(2,10,2,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0.875rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            flexShrink: 0,
          }}
        >
          ← Dashboard
        </button>

        <div
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            color: '#4ade80',
            fontSize: '0.95rem',
          }}
          className="hidden sm:block"
        >
          FasalRakshak
        </div>

        <LanguageToggle value={language} onChange={setLanguage} size="sm" />
      </div>

      {/* === Responsive content wrapper === */}
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Summary banner - always full width */}
        {recommendationSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '1.25rem',
              borderRadius: '1rem',
              background: `${riskColor}10`,
              border: `1px solid ${riskColor}30`,
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: riskColor,
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                {recommendationSummary.overallRisk.toUpperCase()} RISK
              </span>
              {recommendationSummary.actionRequired && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171',
                    borderRadius: '99px',
                    padding: '0.2rem 0.6rem',
                    fontWeight: 600,
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  ⚡ Action Required
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              {recommendationSummary.primaryConcern}
            </p>
          </motion.div>
        )}

        {/* Desktop: cards on the left, sidebar on the right. Mobile: stacked. */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
          {/* ===================== MAIN COLUMN ===================== */}
          <div>
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
                gap: '0.75rem',
              }}
            >
              <div>
                <h2
                  className="heading-section"
                  style={{ fontSize: '1.25rem', color: 'white', marginBottom: '0.25rem' }}
                >
                  Smart Recommendations
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
                  {district?.name} · {crop?.name.en} · {stage?.name.en}
                </p>
              </div>

              {/* Voice button */}
              <button
                id="voice-readout-btn"
                className={`btn-voice ${isSpeaking ? 'speaking' : ''}`}
                onClick={handleSpeak}
                title={isSpeaking ? 'Stop reading' : 'Read aloud'}
              >
                {isSpeaking ? '⏹️' : '🔊'}
                <span style={{ fontSize: '0.82rem' }}>
                  {isSpeaking ? 'Stop' : language === 'kn' ? 'ಓದು' : language === 'hi' ? 'पढ़ें' : 'Listen'}
                </span>
              </button>
            </motion.div>

            {/* Recommendation cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AnimatePresence>
                {recommendations.map((rec, i) => (
                  <motion.div
                    key={`${rec.id}-${language}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <RecommendationCard recommendation={rec} language={language} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {recommendations.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: '0.9rem',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🌾</div>
                  Loading recommendations...
                </div>
              )}
            </div>
          </div>

          {/* ===================== SIDEBAR ===================== */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
            {/* Cost Summary */}
            {recommendations.length > 0 && (
              <CostSummary recommendations={recommendations} language={language} />
            )}

            {/* PDF Export */}
            <PDFExport />

            {/* Start Over */}
            <button
              onClick={() => {
                resetForm();
                navigate('/wizard');
              }}
              className="btn-secondary"
              style={{ width: '100%', fontSize: '0.9rem' }}
            >
              🔄 Analyze Another Field
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

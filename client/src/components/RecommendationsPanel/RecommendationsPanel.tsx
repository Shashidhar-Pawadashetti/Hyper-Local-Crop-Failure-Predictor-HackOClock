import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { Language, RecommendationItem } from '../../types';
import { speakRecommendations, stopSpeaking } from '../../utils/speech';
import RecommendationCard from './RecommendationCard';
import LanguageToggle from './LanguageToggle';
import PDFExport from './PDFExport';
import CostSummary from './CostSummary';

export default function RecommendationsPanel() {
  const { state, setLanguage } = useApp();
  const navigate = useNavigate();
  const { recommendations, recommendationSummary, district, crop, stage, language } = state;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    
    speakRecommendations(
      recommendations, 
      language,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const riskColor = recommendationSummary?.overallRisk === 'critical' ? '#ef4444'
    : recommendationSummary?.overallRisk === 'high' ? '#f97316'
    : recommendationSummary?.overallRisk === 'moderate' ? '#facc15'
    : '#22c55e';

  return (
    <div style={{
      minHeight: '100svh',
      background: 'linear-gradient(135deg, #020a02 0%, #0a1f0a 60%, #041a1a 100%)',
      paddingBottom: '6rem',
    }}>
      {/* Top nav */}
      <div style={{
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
      }}>
        <button
          onClick={() => navigate('/results')}
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

        <LanguageToggle value={language} onChange={setLanguage} size="sm" />
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>
        {/* Summary banner */}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: riskColor,
                fontFamily: 'Outfit, sans-serif',
              }}>
                {recommendationSummary.overallRisk.toUpperCase()} RISK
              </span>
              {recommendationSummary.actionRequired && (
                <span style={{
                  fontSize: '0.72rem',
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171',
                  borderRadius: '99px',
                  padding: '0.2rem 0.6rem',
                  fontWeight: 600,
                  fontFamily: 'Outfit, sans-serif',
                }}>
                  ⚡ Action Required
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              {recommendationSummary.primaryConcern}
            </p>
          </motion.div>
        )}

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}
        >
          <div>
            <h2 className="heading-section" style={{ fontSize: '1.25rem', color: 'white', marginBottom: '0.25rem' }}>
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
            <span style={{ fontSize: '0.82rem' }}>{isSpeaking ? 'Stop' : language === 'kn' ? 'ಓದು' : language === 'hi' ? 'पढ़ें' : 'Listen'}</span>
          </button>
        </motion.div>

        {/* Recommendation Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <AnimatePresence>
            {recommendations.map((rec, i) => (
              <motion.div
                key={`${rec.id}-${language}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.1 }}
              >
                <RecommendationCard recommendation={rec} language={language} />
              </motion.div>
            ))}
          </AnimatePresence>

          {recommendations.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.9rem',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🌾</div>
              Loading recommendations...
            </div>
          )}
        </div>

        {/* Cost Summary */}
        {recommendations.length > 0 && (
          <CostSummary recommendations={recommendations} language={language} />
        )}

        {/* PDF Export */}
        <PDFExport />

        {/* Start Over */}
        <button
          onClick={() => { navigate('/analyze'); }}
          className="btn-secondary"
          style={{ width: '100%', marginTop: '1rem', fontSize: '0.9rem' }}
        >
          🔄 Analyze Another Field
        </button>
      </div>
    </div>
  );
}

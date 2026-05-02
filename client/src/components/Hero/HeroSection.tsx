import { useEffect, useRef, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Lazy-load Three.js scene for performance
const ThreeScene = lazy(() => import('./ThreeScene'));

export default function HeroSection() {
  const navigate = useNavigate();
  const hasWebGL = useRef(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      hasWebGL.current = !!ctx;
    } catch {
      hasWebGL.current = false;
    }
  }, []);

  return (
    <section className="hero-section" style={{
      position: 'relative',
      minHeight: '100svh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #020a02 0%, #0a1f0a 40%, #041a1a 100%)',
    }}>
      {/* Three.js Canvas or Fallback */}
      <Suspense fallback={<HeroGradientFallback />}>
        {hasWebGL.current ? <ThreeScene /> : <HeroGradientFallback />}
      </Suspense>

      {/* Overlay gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(2,10,2,0.95) 0%, rgba(2,10,2,0.4) 50%, transparent 100%)',
        zIndex: 2,
      }} />

      {/* Animated particles */}
      <HeroParticles />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        padding: '1.5rem',
        maxWidth: '700px',
        width: '100%',
      }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 1rem',
            borderRadius: '99px',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.25)',
            marginBottom: '1.5rem',
          }}
        >
          <span style={{ fontSize: '0.75rem' }}>🌿</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4ade80', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.05em' }}>
            AI-POWERED CROP INTELLIGENCE
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="heading-display"
          style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', marginBottom: '1rem' }}
        >
          <span style={{ color: 'white' }}>ಫಸಲ್ ರಕ್ಷಕ</span>
          <br />
          <span className="text-gradient-green">FasalRakshak</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '0.75rem',
            lineHeight: 1.6,
          }}
        >
          AI-Powered Crop Health &amp; Risk Prediction
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '2.5rem',
          }}
        >
          ನಿಮ್ಮ ಫಸಲಿನ ರಕ್ಷಣೆ ನಮ್ಮ ಜವಾಬ್ದಾರಿ · Your crop's guardian
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Crop Types', value: '12+', icon: '🌾' },
            { label: 'Districts', value: '30+', icon: '📍' },
            { label: 'Risk Channels', value: '3', icon: '📊' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#4ade80' }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <button
            id="hero-cta-btn"
            className="btn-primary animate-pulse-glow"
            onClick={() => navigate('/analyze')}
            style={{ fontSize: '1.1rem', padding: '1rem 2.5rem', minWidth: '200px' }}
          >
            🌾 Start Analysis
          </button>
          <button className="btn-secondary" onClick={() => {
            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            How it works ↓
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}
      >
        <div className="animate-float" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>SCROLL</span>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, rgba(34,197,94,0.6), transparent)' }} />
        </div>
      </motion.div>

      {/* How it works section */}
      <HowItWorks onStart={() => navigate('/analyze')} />
    </section>
  );
}

// ============================================================
// Gradient Fallback (low-end devices)
// ============================================================

function HeroGradientFallback() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse at 30% 40%, rgba(34,197,94,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(56,189,248,0.08) 0%, transparent 50%)',
      zIndex: 1,
    }} />
  );
}

// ============================================================
// Floating particles
// ============================================================

function HeroParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 4,
    duration: 3 + Math.random() * 4,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: p.id % 3 === 0 ? 'rgba(34,197,94,0.6)' : p.id % 3 === 1 ? 'rgba(56,189,248,0.4)' : 'rgba(250,204,21,0.4)',
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// How It Works section below hero fold
// ============================================================

function HowItWorks({ onStart }: { onStart: () => void }) {
  const steps = [
    { icon: '📍', title: 'Select Location', desc: 'Choose your district from 30+ Indian locations', color: '#38bdf8' },
    { icon: '🌾', title: 'Pick Your Crop', desc: 'Select crop type and current growth stage', color: '#22c55e' },
    { icon: '🤖', title: 'AI Analysis', desc: 'Satellite + weather data processed by AI', color: '#a78bfa' },
    { icon: '📊', title: 'Get Insights', desc: 'Risk score, forecast & smart recommendations', color: '#facc15' },
  ];

  return (
    <div
      id="how-it-works"
      style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        padding: '4rem 1.5rem',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        marginTop: '100vh',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="heading-section"
          style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '0.75rem', color: 'white' }}
        >
          How FasalRakshak Works
        </motion.h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginBottom: '3rem', fontSize: '0.95rem' }}>
          From field to insights in under 30 seconds
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass card-hover"
              style={{ padding: '1.5rem', textAlign: 'center' }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: `${step.color}18`,
                border: `2px solid ${step.color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '1.5rem',
              }}>
                {step.icon}
              </div>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: step.color,
                marginBottom: '0.5rem',
                fontFamily: 'Outfit, sans-serif',
              }}>
                STEP {i + 1}
              </div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'white', marginBottom: '0.5rem' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginTop: '3rem' }}
        >
          <button
            id="how-it-works-cta"
            className="btn-primary"
            onClick={onStart}
            style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}
          >
            🚀 Start Free Analysis
          </button>
        </motion.div>
      </div>
    </div>
  );
}

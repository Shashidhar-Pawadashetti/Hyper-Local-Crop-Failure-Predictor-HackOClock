import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ScoreGauge from './ScoreGauge';
import ChannelBar from './ChannelBar';
import ForecastChart from './ForecastChart';
import WeatherForecast from './WeatherForecast';
import DistrictMap from '../Map/DistrictMap';

export default function RiskDashboard() {
  const navigate = useNavigate();
  const { state, resetForm } = useApp();
  const { analysisResult, district, crop, stage } = state;

  if (!analysisResult) return null;

  const { riskScores, weather, ndvi, forecast7Day } = analysisResult;
  const compositeScore = riskScores.composite.score;
  const compositeLevel = riskScores.composite.level;

  // Weather summary quick stats
  const weatherStats = [
    { label: 'Max Temp', value: `${weather.current.temperature.max}°C`, icon: '🌡️', color: '#f97316' },
    { label: 'Humidity', value: `${weather.current.humidity.value}%`, icon: '💧', color: '#38bdf8' },
    { label: 'Rainfall', value: `${weather.current.precipitation.value}mm`, icon: '🌧️', color: '#818cf8' },
    { label: 'Wind', value: `${weather.current.windSpeed.value}km/h`, icon: '🌬️', color: '#94a3b8' },
  ];

  const mapCenter: [number, number] = district ? [district.lat, district.lon] : [15.3173, 75.7139];

  // Data freshness: treat weather as the lead signal
  const isDataFresh = weather.isFresh !== false && ndvi.isFresh !== false;
  const freshnessLabel = isDataFresh ? 'LIVE' : 'CACHED';
  const freshnessColor = isDataFresh ? '#22c55e' : '#facc15';

  return (
    <div
      style={{
        minHeight: '100svh',
        background: 'linear-gradient(135deg, #020a02 0%, #0a1f0a 60%, #041a1a 100%)',
        padding: '0 0 6rem',
      }}
    >
      {/* === Sticky top navigation === */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(2,10,2,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0.875rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => {
            resetForm();
            navigate('/wizard');
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0',
          }}
        >
          ← New Analysis
        </button>
        <div
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            color: '#4ade80',
            fontSize: '0.95rem',
          }}
        >
          FasalRakshak
        </div>
        <button
          id="go-to-recommendations-btn"
          onClick={() => navigate('/recommendations')}
          style={{
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: '0.5rem',
            color: '#4ade80',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            padding: '0.375rem 0.75rem',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          💡 Advice →
        </button>
      </div>

      {/* === Responsive content wrapper === */}
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Context badge - always full-width */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 1rem',
            borderRadius: '99px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>📍 {district?.name}</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
            {crop?.icon} {crop?.name.en}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
            {stage?.icon} {stage?.name.en}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: freshnessColor,
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            <span
              aria-hidden
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: freshnessColor,
                boxShadow: `0 0 8px ${freshnessColor}`,
              }}
            />
            {freshnessLabel}
          </span>
        </motion.div>

        {/* Desktop: 2-column grid. Mobile: single column */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6">
          {/* ===================== LEFT COLUMN ===================== */}
          <div className="flex flex-col gap-5">
            {/* === COMPOSITE SCORE CARD === */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass"
              style={{ padding: '2rem', textAlign: 'center' }}
            >
              <h2
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '1.5rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Composite Risk Score
              </h2>

              <ScoreGauge score={compositeScore} size="lg" animated showLabel level={compositeLevel} />

              <p
                style={{
                  marginTop: '1.25rem',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                }}
              >
                {compositeLevel === 'healthy' && '✅ Your crop is in good health. Continue current practices.'}
                {compositeLevel === 'at-risk' && '⚠️ Moderate risk detected. Preventive action recommended.'}
                {compositeLevel === 'critical' && '🚨 High risk! Immediate action required to protect your crop.'}
              </p>

              {/* NDVI Badge */}
              {ndvi && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.625rem',
                    marginTop: '1rem',
                    background:
                      ndvi.status === 'healthy'
                        ? 'rgba(34,197,94,0.1)'
                        : ndvi.status === 'stressed'
                        ? 'rgba(250,204,21,0.1)'
                        : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${
                      ndvi.status === 'healthy'
                        ? 'rgba(34,197,94,0.25)'
                        : ndvi.status === 'stressed'
                        ? 'rgba(250,204,21,0.25)'
                        : 'rgba(239,68,68,0.25)'
                    }`,
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>🛰️ NDVI</span>
                  <span style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: 'white' }}>
                    {ndvi.value.toFixed(2)}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: ndvi.anomaly < 0 ? '#ef4444' : '#4ade80',
                    }}
                  >
                    {ndvi.anomaly < 0 ? '↓' : '↑'} {Math.abs(ndvi.anomaly).toFixed(2)}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                      color:
                        ndvi.status === 'healthy'
                          ? '#4ade80'
                          : ndvi.status === 'stressed'
                          ? '#facc15'
                          : '#ef4444',
                    }}
                  >
                    {ndvi.status}
                  </span>
                </div>
              )}
            </motion.div>

            {/* === RISK CHANNELS === */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass"
              style={{ padding: '1.5rem' }}
            >
              <h3
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '1.25rem',
                }}
              >
                Risk Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <ChannelBar
                  label="Drought Stress"
                  value={riskScores.droughtStress.score}
                  level={riskScores.droughtStress.level}
                  icon="☀️"
                />
                <ChannelBar
                  label="Pest Pressure"
                  value={riskScores.pestPressure.score}
                  level={riskScores.pestPressure.level}
                  icon="🐛"
                />
                <ChannelBar
                  label="Nutrient Deficiency"
                  value={riskScores.nutrientDeficiency.score}
                  level={riskScores.nutrientDeficiency.level}
                  icon="🌱"
                />
              </div>
            </motion.div>

            {/* === CTA === */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ display: 'flex', gap: '0.875rem', flexDirection: 'column' }}
            >
              <button
                id="view-recommendations-btn"
                className="btn-primary animate-pulse-glow"
                onClick={() => navigate('/recommendations')}
                style={{ width: '100%', fontSize: '1.05rem', padding: '1rem' }}
              >
                💡 View Smart Recommendations →
              </button>
            </motion.div>
          </div>

          {/* ===================== RIGHT COLUMN ===================== */}
          <div className="flex flex-col gap-5">
            {/* === GEOSPATIAL FIELD VIEW === */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass overflow-hidden"
              style={{ padding: '0' }}
            >
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Field Monitoring
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 600 }}>LIVE VIEW</span>
              </div>
              <DistrictMap
                center={mapCenter}
                selectedLocation={mapCenter}
                onLocationSelect={() => {}} // No selection on dashboard
                className="rounded-none border-none"
              />
            </motion.div>

            {/* === WEATHER QUICK STATS === */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {weatherStats.map(stat => (
                <div key={stat.label} className="glass" style={{ padding: '0.875rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: stat.color,
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '0.95rem',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* === 7-DAY WEATHER STRIP === */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass"
              style={{ padding: '1.25rem' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.875rem',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  7-Day Weather
                </h3>
                {weather.isFresh === false && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: '#facc15',
                      fontWeight: 600,
                      fontFamily: 'Outfit, sans-serif',
                      background: 'rgba(250,204,21,0.1)',
                      border: '1px solid rgba(250,204,21,0.25)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '99px',
                    }}
                  >
                    Cached
                  </span>
                )}
              </div>
              <WeatherForecast data={weather.forecast} />
            </motion.div>

            {/* === 7-DAY RISK FORECAST === */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass"
              style={{ padding: '1.5rem' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  7-Day Risk Forecast
                </h3>
                {riskScores.composite.trend && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color:
                        riskScores.composite.trend === 'improving'
                          ? '#4ade80'
                          : riskScores.composite.trend === 'stable'
                          ? '#facc15'
                          : '#ef4444',
                      fontWeight: 600,
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {riskScores.composite.trend === 'improving'
                      ? '↗ Improving'
                      : riskScores.composite.trend === 'stable'
                      ? '→ Stable'
                      : '↘ Declining'}
                  </span>
                )}
              </div>
              <ForecastChart data={forecast7Day} height={200} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

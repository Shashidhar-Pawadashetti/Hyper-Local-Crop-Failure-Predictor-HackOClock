import { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DISTRICTS, CROPS, GROWTH_STAGES, getMockAnalysis, getMockRecommendations } from '../../data/staticData';
import { analysisApi, recommendationsApi } from '../../api/client';
import { useToast } from '../Toast';
import LoadingScreen from '../LoadingScreen';
import type { District, Crop, GrowthStage } from '../../types';

const TOTAL_STEPS = 3;

export default function InputWizard() {
  const { state, setDistrict, setCrop, setStage, setAnalysisResult, setRecommendations } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [districtSearch, setDistrictSearch] = useState('');

  const filteredDistricts = DISTRICTS.filter(d =>
    d.name.toLowerCase().includes(districtSearch.toLowerCase()) ||
    d.state.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const canNext = () => {
    if (step === 1) return !!state.district;
    if (step === 2) return !!state.crop;
    if (step === 3) return !!state.stage;
    return false;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(s => s + 1);
    else handleAnalyze();
  };

  const handleBack = () => {
    if (step === 1) navigate('/');
    else setStep(s => s - 1);
  };

  const handleAnalyze = async () => {
    if (!state.district || !state.crop || !state.stage) return;
    setLoading(true);
    setError(null);

    let isOffline = false;

    try {
      let analysisData;
      try {
        const res = await analysisApi.analyze({
          district: { id: state.district.id, name: state.district.name, state: state.district.state, lat: state.district.lat, lon: state.district.lon },
          crop: { id: state.crop.id, name: state.crop.name.en },
          stage: { id: state.stage.id, name: state.stage.name.en },
        });
        analysisData = res.data;
        console.info('[InputWizard] ✅ Using live API data');
        toast('Live satellite & weather data loaded', { variant: 'success' });
      } catch {
        // Use mock data if API is unavailable
        analysisData = getMockAnalysis(state.district.name, state.crop.id, state.stage.id);
        isOffline = true;
        console.warn('[InputWizard] ⚠ API unavailable — using offline estimation');
        toast('Backend offline — using cached estimates', { variant: 'warning', duration: 4500 });
      }

      setAnalysisResult(analysisData);

      // Fetch recommendations
      try {
        const recRes = await recommendationsApi.recommend({
          district: { id: state.district.id, name: state.district.name, state: state.district.state },
          crop: { id: state.crop.id, name: state.crop.name.en },
          stage: { id: state.stage.id, name: state.stage.name.en },
          riskPayload: analysisData,
          language: state.language,
        });
        setRecommendations(recRes.data.recommendations, recRes.data.summary);
      } catch {
        const mockRecs = getMockRecommendations(state.language);
        setRecommendations(mockRecs, {
          overallRisk: 'moderate',
          primaryConcern: isOffline
            ? '⚡ Using offline estimation. Connect to server for real-time data.'
            : 'Drought stress is elevated. Monitor soil moisture.',
          actionRequired: true,
        });
      }

      navigate('/dashboard');
    } catch {
      setError('Analysis failed. Please try again.');
      toast('Analysis failed — please retry', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div style={{
      minHeight: '100svh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #020a02 0%, #0a1f0a 60%, #041a1a 100%)',
      position: 'relative',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '-10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ width: '100%', maxWidth: '500px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button
            onClick={handleBack}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.625rem',
              padding: '0.5rem 0.875rem',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              transition: 'all 0.2s ease',
            }}
          >
            ← Back
          </button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#4ade80', fontSize: '0.9rem' }}>
              FasalRakshak
            </span>
          </div>
          <div style={{ width: '80px' }} />
        </div>

        {/* Progress Stepper */}
        <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} />
      </div>

      {/* Step Content */}
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <Step1District
                selected={state.district}
                onSelect={d => { setDistrict(d); }}
                search={districtSearch}
                onSearch={setDistrictSearch}
                districts={filteredDistricts}
              />
            )}
            {step === 2 && (
              <Step2Crop
                selected={state.crop}
                onSelect={c => { setCrop(c); }}
              />
            )}
            {step === 3 && (
              <Step3Stage
                selected={state.stage}
                onSelect={s => { setStage(s); }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div style={{
            padding: '0.875rem 1rem',
            borderRadius: '0.75rem',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#f87171',
            fontSize: '0.9rem',
            marginTop: '1rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
          <button
            className="btn-secondary"
            onClick={handleBack}
            style={{ flex: 1 }}
          >
            ← {step === 1 ? 'Home' : 'Back'}
          </button>
          <button
            id={`wizard-next-step-${step}`}
            className="btn-primary"
            onClick={handleNext}
            disabled={!canNext() || loading}
            style={{
              flex: 2,
              opacity: canNext() ? 1 : 0.5,
              cursor: canNext() ? 'pointer' : 'not-allowed',
            }}
          >
            {step === TOTAL_STEPS ? '🔍 Analyze My Crop' : `Next → Step ${step + 1}`}
          </button>
        </div>

        {/* Step hint */}
        <p style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.8rem',
          marginTop: '1rem',
        }}>
          {step === 1 && 'Select your farming district'}
          {step === 2 && 'Choose the crop you are growing'}
          {step === 3 && 'Pick the current growth stage'}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Step Progress Indicator
// ============================================================

function StepProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const n = i + 1;
          const isComplete = n < currentStep;
          const isActive = n === currentStep;
          return (
            <Fragment key={`step-${n}`}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif',
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                  background: isComplete ? '#22c55e' : isActive ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)',
                  border: isActive ? '2px solid #22c55e' : isComplete ? '2px solid #22c55e' : '2px solid rgba(255,255,255,0.1)',
                  color: isComplete || isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                }}
              >
                {isComplete ? '✓' : n}
              </div>
              {n < totalSteps && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    borderRadius: '1px',
                    background: isComplete ? '#22c55e' : 'rgba(255,255,255,0.08)',
                    transition: 'background 0.4s ease',
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, letterSpacing: '0.04em' }}>
        {['District', 'Crop', 'Stage'].map((label, idx) => {
          const n = idx + 1;
          const isActive = n === currentStep;
          const isComplete = n < currentStep;
          return (
            <span
              key={label}
              style={{
                color: isActive ? '#4ade80' : isComplete ? 'rgba(74,222,128,0.7)' : 'rgba(255,255,255,0.35)',
                transition: 'color 0.3s ease',
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Step 1: District
// ============================================================

import DistrictMap from '../Map/DistrictMap';

function findNearestDistrict(lat: number, lon: number): District {
  return DISTRICTS.reduce((prev, curr) => {
    const prevDist = Math.sqrt(Math.pow(prev.lat - lat, 2) + Math.pow(prev.lon - lon, 2));
    const currDist = Math.sqrt(Math.pow(curr.lat - lat, 2) + Math.pow(curr.lon - lon, 2));
    return currDist < prevDist ? curr : prev;
  });
}

function Step1District({ selected, onSelect, search, onSearch, districts }: {
  selected: District | null;
  onSelect: (d: District) => void;
  search: string;
  onSearch: (s: string) => void;
  districts: District[];
}) {
  const mapCenter: [number, number] = selected ? [selected.lat, selected.lon] : [15.3173, 75.7139]; // Default to Karnataka center

  return (
    <div>
      <h2 className="heading-section" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>
        📍 Select Your District
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
        We'll use local weather and satellite data for your area
      </p>

      {/* Map View */}
      <DistrictMap
        center={mapCenter}
        selectedLocation={selected ? [selected.lat, selected.lon] : null}
        onLocationSelect={(lat, lon) => {
          const nearest = findNearestDistrict(lat, lon);
          onSelect(nearest);
        }}
        className="mb-6"
      />

      <input
        id="district-search"
        type="text"
        placeholder="🔍 Search district or state..."
        className="input-field"
        value={search}
        onChange={e => onSearch(e.target.value)}
        style={{ marginBottom: '0.875rem' }}
      />

      <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }} className="no-scrollbar">
        {districts.slice(0, 20).map(district => (
          <button
            key={district.id}
            id={`district-${district.id}`}
            onClick={() => onSelect(district)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.875rem 1rem',
              borderRadius: '0.75rem',
              border: selected?.id === district.id ? '2px solid #22c55e' : '1px solid rgba(255,255,255,0.08)',
              background: selected?.id === district.id ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minHeight: '52px',
              width: '100%',
              color: 'white',
              textAlign: 'left',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{district.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>{district.state}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{district.stateCode}</span>
              {selected?.id === district.id && <span style={{ color: '#4ade80', fontSize: '1rem' }}>✓</span>}
            </div>
          </button>
        ))}
        {districts.length === 0 && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem', fontSize: '0.9rem' }}>
            No districts found. Try a different search.
          </div>
        )}
      </div>

      {selected && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>✅</span>
          <span style={{ fontSize: '0.9rem', color: '#4ade80', fontWeight: 500 }}>
            Selected: {selected.name}, {selected.state}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Step 2: Crop
// ============================================================

function Step2Crop({ selected, onSelect }: { selected: Crop | null; onSelect: (c: Crop) => void }) {
  return (
    <div>
      <h2 className="heading-section" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>
        🌾 Select Your Crop
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
        Choose the crop you are currently growing
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {CROPS.map(crop => (
          <button
            key={crop.id}
            id={`crop-${crop.id}`}
            className={`crop-card ${selected?.id === crop.id ? 'selected' : ''}`}
            onClick={() => onSelect(crop)}
          >
            <span style={{ fontSize: '2rem' }}>{crop.icon}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{crop.name.en}</span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{crop.category}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div style={{
          marginTop: '1.25rem',
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>{selected.icon}</span>
          <span style={{ fontSize: '0.9rem', color: '#4ade80', fontWeight: 500 }}>
            {selected.name.en} · {selected.name.kn}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Step 3: Growth Stage
// ============================================================

function Step3Stage({ selected, onSelect }: { selected: GrowthStage | null; onSelect: (s: GrowthStage) => void }) {
  return (
    <div>
      <h2 className="heading-section" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>
        🌱 Current Growth Stage
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
        Risk thresholds differ at each stage — accuracy matters!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {GROWTH_STAGES.map(stage => (
          <button
            key={stage.id}
            id={`stage-${stage.id}`}
            className={`stage-btn ${selected?.id === stage.id ? 'selected' : ''}`}
            onClick={() => onSelect(stage)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{stage.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'white', fontFamily: 'Outfit, sans-serif' }}>
                  {stage.name.en}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
                  {stage.description.en}
                </div>
              </div>
              {selected?.id === stage.id && (
                <span style={{ marginLeft: 'auto', color: '#38bdf8', fontSize: '1.1rem', flexShrink: 0 }}>✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

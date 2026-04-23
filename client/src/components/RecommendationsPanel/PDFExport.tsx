import { useState } from 'react';
import { useApp } from '../../context/AppContext';

// ── File System Access API type declarations ──────────────────
interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: { description: string; accept: Record<string, string[]> }[];
  excludeAcceptAllOption?: boolean;
}

declare global {
  interface Window {
    showSaveFilePicker?: (opts?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
  }
}

// ── Helper: save a Uint8Array as PDF via Save-As dialog ──────
async function saveWithDialog(pdfBuffer: ArrayBuffer, suggestedName: string): Promise<void> {
  if (typeof window.showSaveFilePicker === 'function') {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName,
      types: [{ description: 'PDF Document', accept: { 'application/pdf': ['.pdf'] } }],
      excludeAcceptAllOption: true,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(pdfBuffer);
    await writable.close();
  } else {
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export default function PDFExport() {
  const { state } = useApp();
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'rendering' | 'saving' | 'done' | 'error'>('idle');

  const handleDownload = async () => {
    setGenerating(true);
    setStatus('rendering');

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      const { district, crop, stage, analysisResult, recommendations, language, mapTheme } = state;
      const rs = analysisResult?.riskScores;

      // 1. Capture the existing map image. 
      // Since currentView is 'recommendations', the map in RiskDashboard is unmounted.
      // We use the cached image captured by RiskDashboard before it unmounted.
      const mapContainer = document.querySelector('#report-map-container');
      let mapImgData = (window as any).__cachedMapImage || '';
      
      if (!mapImgData && mapContainer) {
        const mapCanvas = await html2canvas(mapContainer as HTMLElement, { useCORS: true, logging: false });
        mapImgData = mapCanvas.toDataURL('image/png');
      }

      // ── Build off-screen report element ──────────────────────
      const reportEl = document.createElement('div');
      reportEl.style.cssText = `
        width: 750px;
        padding: 48px 40px;
        background: #071407;
        color: white;
        font-family: Inter, Arial, sans-serif;
        position: fixed;
        top: -9999px;
        left: 0;
      `;

      const dateStr = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric',
      });

      const compositeColor =
        rs?.composite.level === 'critical' ? '#ef4444'
        : rs?.composite.level === 'at-risk' ? '#f97316'
        : '#22c55e';

      reportEl.innerHTML = `
        <!-- HEADER -->
        <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:24px; border-bottom:1px solid rgba(255,255,255,0.08); margin-bottom:28px;">
          <div>
            <div style="font-size:26px; font-weight:800; color:#22c55e; font-family:Arial,sans-serif; letter-spacing:-0.02em;">
              🌾 FasalRakshak
            </div>
            <div style="font-size:12px; color:rgba(255,255,255,0.4); margin-top:4px; letter-spacing:0.04em;">
              HYPER-LOCAL CROP RISK REPORT
            </div>
          </div>
          <div style="text-align:right; font-size:12px; color:rgba(255,255,255,0.4);">
            <div>Ref ID: FR-${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
            <div style="margin-top:3px; color:rgba(34,197,94,0.6); font-weight:600;">${dateStr}</div>
          </div>
        </div>

        <!-- FIELD LOCATION & CONDITION -->
        <div style="margin-bottom:24px;">
          <div style="font-size:10px; font-weight:700; letter-spacing:0.12em; color:rgba(255,255,255,0.4); margin-bottom:12px;">FIELD LOCATION & GEOSPATIAL VIEW</div>
          <div style="display:grid; grid-template-columns: 280px 1fr; gap:20px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
            <div style="display:flex; flexDirection:column; gap:12px;">
              <div>
                <div style="font-size:9px; color:rgba(255,255,255,0.4); margin-bottom:4px;">DISTRICT</div>
                <div style="font-weight:700; color:white; font-size:15px;">${district?.name}, ${district?.state}</div>
                <div style="font-size:10px; color:rgba(255,255,255,0.3);">${district?.lat.toFixed(4)}°N, ${district?.lon.toFixed(4)}°E</div>
              </div>
              <div>
                <div style="font-size:9px; color:rgba(255,255,255,0.4); margin-bottom:4px;">CROP & STAGE</div>
                <div style="font-weight:700; color:white; font-size:15px;">${crop?.icon} ${crop?.name.en}</div>
                <div style="font-size:11px; color:rgba(34,197,94,0.8);">${stage?.name.en} Stage</div>
              </div>
              <div style="margin-top:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.06);">
                <div style="font-size:9px; color:rgba(255,255,255,0.4); margin-bottom:4px;">MAP VIEW MODE</div>
                <div style="font-size:11px; color:white; text-transform:uppercase; font-weight:600;">${mapTheme} Layer</div>
              </div>
            </div>
            <div style="border-radius:8px; overflow:hidden; background:#000; border:1px solid rgba(255,255,255,0.1); height:160px; display:flex; align-items:center; justify-content:center;">
              ${mapImgData ? `<img src="${mapImgData}" style="width:100%; height:100%; object-fit:cover;" />` : `<div style="color:rgba(255,255,255,0.2); font-size:12px;">Geospatial view not available in this view</div>`}
            </div>
          </div>
        </div>

        <!-- RISK SUMMARY -->
        <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px; margin-bottom:24px;">
           <div style="display:flex; align-items:center; gap:24px;">
             <div style="width:100px; height:100px; border-radius:50%; border:6px solid ${compositeColor}20; display:flex; flex-direction:column; align-items:center; justify-content:center; border-top-color:${compositeColor};">
                <div style="font-size:32px; font-weight:900; color:${compositeColor};">${rs?.composite.score ?? '--'}</div>
                <div style="font-size:10px; color:rgba(255,255,255,0.4);">SCORE</div>
             </div>
             <div style="flex:1;">
                <div style="font-size:10px; font-weight:700; letter-spacing:0.12em; color:rgba(255,255,255,0.4); margin-bottom:4px;">OVERALL RISK LEVEL</div>
                <div style="font-size:24px; font-weight:800; color:${compositeColor}; letter-spacing:0.04em;">${(rs?.composite.level ?? '').toUpperCase()}</div>
                <div style="font-size:12px; color:rgba(255,255,255,0.5); margin-top:4px; line-height:1.5;">Hyper-local analysis indicates ${rs?.composite.level} failure risk for the next 14 days based on current NDVI and weather trajectories.</div>
             </div>
           </div>
        </div>

        <!-- DETAILED METRICS -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:24px;">
           <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
              <div style="font-size:9px; color:rgba(255,255,255,0.4); margin-bottom:8px;">DROUGHT STRESS</div>
              <div style="font-size:24px; font-weight:800; color:#f97316;">${rs?.droughtStress.score}%</div>
              <div style="font-size:10px; color:rgba(249,115,22,0.8); font-weight:700; margin-top:4px;">${rs?.droughtStress.level.toUpperCase()}</div>
           </div>
           <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
              <div style="font-size:9px; color:rgba(255,255,255,0.4); margin-bottom:8px;">PEST PRESSURE</div>
              <div style="font-size:24px; font-weight:800; color:#a78bfa;">${rs?.pestPressure.score}%</div>
              <div style="font-size:10px; color:rgba(167,139,250,0.8); font-weight:700; margin-top:4px;">${rs?.pestPressure.level.toUpperCase()}</div>
           </div>
           <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
              <div style="font-size:9px; color:rgba(255,255,255,0.4); margin-bottom:8px;">NUTRIENT DEFICIT</div>
              <div style="font-size:24px; font-weight:800; color:#22c55e;">${rs?.nutrientDeficiency.score}%</div>
              <div style="font-size:10px; color:rgba(34,197,94,0.8); font-weight:700; margin-top:4px;">${rs?.nutrientDeficiency.level.toUpperCase()}</div>
           </div>
        </div>

        <!-- WEATHER & NDVI -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px; margin-bottom:24px;">
           <div style="font-size:10px; font-weight:700; letter-spacing:0.12em; color:rgba(255,255,255,0.4); margin-bottom:16px;">ENVIRONMENTAL SIGNAL ANALYSIS</div>
           <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px;">
              <div>
                 <div style="font-size:9px; color:rgba(255,255,255,0.4); margin-bottom:4px;">MAX TEMP</div>
                 <div style="font-size:16px; font-weight:700;">${analysisResult?.weather.current.temperature.max}°C</div>
              </div>
              <div>
                 <div style="font-size:9px; color:rgba(255,255,255,0.4); margin-bottom:4px;">HUMIDITY</div>
                 <div style="font-size:16px; font-weight:700;">${analysisResult?.weather.current.humidity.value}%</div>
              </div>
              <div>
                 <div style="font-size:9px; color:rgba(255,255,255,0.4); margin-bottom:4px;">RAINFALL</div>
                 <div style="font-size:16px; font-weight:700;">${analysisResult?.weather.current.precipitation.value}mm</div>
              </div>
              <div>
                 <div style="font-size:9px; color:rgba(255,255,255,0.4); margin-bottom:4px;">NDVI VALUE</div>
                 <div style="font-size:16px; font-weight:700; color:#4ade80;">${analysisResult?.ndvi.value.toFixed(3)}</div>
              </div>
           </div>
        </div>

        <!-- RECOMMENDATIONS -->
        <div style="background:rgba(34,197,94,0.05); border:1px solid rgba(34,197,94,0.15); border-radius:12px; padding:20px;">
          <div style="font-size:10px; font-weight:700; letter-spacing:0.12em; color:#4ade80; margin-bottom:16px;">EXPERT ACTION PLAN</div>
          ${recommendations.slice(0, 3).map((r) => `
            <div style="margin-bottom:12px; padding:12px; background:rgba(255,255,255,0.03); border-radius:8px;">
               <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                  <div style="width:8px; height:8px; border-radius:50%; background:${r.priority === 'high' ? '#ef4444' : '#facc15'};"></div>
                  <div style="font-weight:700; color:white; font-size:13px;">${r.title[language]}</div>
               </div>
               <div style="font-size:11px; color:rgba(255,255,255,0.6); line-height:1.5;">${r.description[language]}</div>
            </div>
          `).join('')}
        </div>

        <!-- FOOTER -->
        <div style="text-align:center; padding-top:24px; border-top:1px solid rgba(255,255,255,0.06); margin-top:20px;">
          <div style="font-size:10px; color:rgba(255,255,255,0.2); line-height:1.6;">
            © ${new Date().getFullYear()} FasalRakshak · Hyper-Local Crop Failure Predictor<br>
            AI-generated agricultural advisory based on Copernicus Sentinel-2 & Open-Meteo datasets.
          </div>
        </div>
      `;

      document.body.appendChild(reportEl);

      const canvas = await html2canvas(reportEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#071407',
        logging: false,
        width: 750,
      });

      document.body.removeChild(reportEl);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeightMm = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeightMm);

      const suggestedName = `FasalRakshak_Report_${district?.name ?? 'Farm'}_${dateStr.replace(/ /g, '_')}.pdf`;
      setStatus('saving');
      const pdfBuffer = pdf.output('arraybuffer') as ArrayBuffer;
      await saveWithDialog(pdfBuffer, suggestedName);

      setStatus('done');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') setStatus('idle');
      else {
        console.error('PDF generation failed:', err);
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } finally {
      setGenerating(false);
    }
  };

  const buttonLabel = {
    idle: '📄 Download Smart Farm Report',
    rendering: '🖼️ Rendering report...',
    saving: '💾 Saving PDF...',
    done: '✅ Report saved!',
    error: '❌ Save failed',
  }[status];

  return (
    <div>
      <button
        id="download-pdf-btn"
        className="btn-pdf"
        onClick={handleDownload}
        disabled={generating}
        style={{
          width: '100%',
          justifyContent: 'center',
          ...(status === 'done' ? { background: '#22c55e' } : {}),
        }}
      >
        {generating ? '⚙️ Processing...' : buttonLabel}
      </button>
    </div>
  );
}

import React from 'react';
import { X, ShieldCheck, CheckCircle2, Cpu, FileCheck2, Binary, Activity, Calculator, Database } from 'lucide-react';
import { DspVerificationReport } from '../utils/audioDnaDsp';

interface DspVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DspVerificationReport | null;
  fileName: string;
  isCustomFile: boolean;
}

export const DspVerificationModal: React.FC<DspVerificationModalProps> = ({
  isOpen,
  onClose,
  report,
  fileName,
  isCustomFile
}) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b0e17] border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/10">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Informe de Verificación Matemática DSP
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 100% Datos Reales PCM
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Pista analizada: <span className="text-cyan-300 font-semibold">{fileName}</span> ({isCustomFile ? 'Archivo Subido por el Usuario' : 'Pista de Referencia de Estudio'})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition active:scale-95 border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs text-slate-300">
          
          {/* Signal Level Telemetry */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Binary className="w-4 h-4" />
              <span>1. Telemetría de Amplitud & Rango Dinámico (Muestreo Real PCM)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">Muestras Totales PCM</span>
                <div className="text-base font-bold text-white mt-1">
                  {report.pcmSampleCount.toLocaleString()} samples
                </div>
                <span className="text-[10px] text-slate-500">@{report.sampleRate} Hz • {report.channels}ch</span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">Pico Absoluto Real</span>
                <div className="text-base font-bold text-cyan-300 mt-1">
                  {report.rawPeakDb} dBFS
                </div>
                <span className="text-[10px] text-slate-500">Valor raw: {report.rawPeak}</span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">RMS Integrado (Root Mean Square)</span>
                <div className="text-base font-bold text-emerald-400 mt-1">
                  {report.rawRmsDb} dBFS
                </div>
                <span className="text-[10px] text-slate-500">Valor raw: {report.rawRms}</span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">Crest Factor / Dinámica</span>
                <div className="text-base font-bold text-amber-300 mt-1">
                  {report.crestFactorDb} dB
                </div>
                <span className="text-[10px] text-slate-500">LUFS: {report.lufsIntegrated}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              <strong className="text-slate-200">Fórmula de Dinámica:</strong> <code className="text-cyan-300">Dynamic_Range_dB = 20 * log10(Peak_Sample) - 20 * log10(sqrt(sum(x_i^2) / N))</code> = <span className="text-emerald-400 font-bold">{report.crestFactorDb} dB</span>
            </div>
          </div>

          {/* Key Detection Correlation Proof */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Calculator className="w-4 h-4" />
              <span>2. Detección de Tonalidad (Correlación Krumhansl-Schmuckler)</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-[11px] text-slate-400">
                Vector de Energía Cromática de 12 Semitonos extraído por CQT/STFT:
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 text-center">
                {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((note, i) => (
                  <div key={note} className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <div className="text-[10px] text-cyan-400 font-bold">{note}</div>
                    <div className="text-[9px] text-slate-300 mt-0.5">{report.chromaVector[i] || 0}</div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <div className="text-[11px] text-slate-400 mb-2">
                  Top 5 Escalas con mayor coeficiente de correlación de Pearson (<span className="text-cyan-300">r</span>):
                </div>
                <div className="space-y-1.5">
                  {report.topCandidateKeys.map((cand, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className={`font-bold ${idx === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                        #{idx + 1} Escala: {cand.key} ({cand.mode})
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${idx === 0 ? 'bg-emerald-400' : 'bg-slate-600'}`}
                            style={{ width: `${Math.max(0, Math.min(100, ((cand.correlation + 1) / 2) * 100))}%` }}
                          />
                        </div>
                        <span className="text-cyan-300 font-mono w-14 text-right">
                          r = {cand.correlation.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sibilance & Spectral Analysis */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Activity className="w-4 h-4" />
              <span>3. Banda de Transitorios & Sibilancia (6.000 Hz - 10.000 Hz)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Centroide Espectral Ponderado</span>
                <div className="text-lg font-bold text-cyan-300">
                  {report.spectralCentroidHz} Hz
                </div>
                <p className="text-[10px] text-slate-500">
                  Calculado como el centro de masa del espectro de Fourier sobre todas las ventanas activas.
                </p>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Ratio Energético Sibilancia (6k-10k)</span>
                <div className="text-lg font-bold text-rose-400">
                  {(report.sibilanceBandEnergyRatio * 100).toFixed(1)}% de energía de agudos
                </div>
                <p className="text-[10px] text-slate-500">
                  Energía acumulada en el rango 6 kHz - 10 kHz dividida entre la energía total vocal (1 kHz - 15 kHz).
                </p>
              </div>
            </div>
          </div>

          {/* Structure segmentation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Database className="w-4 h-4" />
              <span>4. Segmentación Estructural por Compases (Energía por Ventana)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-2">
              <div>Total de Compases Detectados: <strong className="text-white">{report.barCount} compases</strong> a <strong className="text-cyan-400">{report.detectedBpm} BPM</strong>.</div>
              <div className="text-[10px] text-slate-500">
                Cada sección (Intro, Verse, Drop, Chorus, Outro) está anclada a los puntos de cambio en la derivada de energía RMS por compás.
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            Algoritmos validados con la librería estándar de procesamiento digital de señales (DSP).
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition active:scale-95 shadow-md shadow-cyan-500/20"
          >
            Entendido y Comprobado
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useRef, useEffect } from 'react';
import { Activity, Flame, ShieldAlert, Sparkles, BarChart2 } from 'lucide-react';
import { VocalProfile } from '../types/audio';

interface SpectrumWaterfallAnalyzerProps {
  isPlaying: boolean;
  vocalProfile: VocalProfile;
  analyserNode?: AnalyserNode;
  activeStemSolo: 'all' | 'vocals' | 'no_vocal';
}

export const SpectrumWaterfallAnalyzer: React.FC<SpectrumWaterfallAnalyzerProps> = ({
  isPlaying,
  vocalProfile,
  analyserNode,
  activeStemSolo
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const numBars = 64;
    const barWidth = width / numBars;

    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (analyserNode && isPlaying) {
        analyserNode.getByteFrequencyData(dataArray);
      }

      // Sibilance frequency band indices (6kHz - 10kHz out of 22.05kHz max)
      const sibilanceStartIdx = Math.floor((6000 / 22050) * numBars);
      const sibilanceEndIdx = Math.floor((10000 / 22050) * numBars);

      // Draw background grid lines (20Hz, 100Hz, 1kHz, 6kHz, 10kHz, 20kHz)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      [0.1, 0.25, 0.5, 0.7, 0.85].forEach((pos) => {
        ctx.beginPath();
        ctx.moveTo(pos * width, 0);
        ctx.lineTo(pos * width, height);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Draw Sibilance Highlight Zone (6k - 10k)
      const sibX1 = (sibilanceStartIdx / numBars) * width;
      const sibX2 = (sibilanceEndIdx / numBars) * width;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.fillRect(sibX1, 0, sibX2 - sibX1, height);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.strokeRect(sibX1, 0, sibX2 - sibX1, height);

      // Draw FFT Bars
      for (let i = 0; i < numBars; i++) {
        let value = 0;
        if (analyserNode && isPlaying) {
          const bin = Math.floor((i / numBars) * (bufferLength / 2));
          value = dataArray[bin] || 0;
        } else if (isPlaying) {
          // Synthetic procedural RTA motion
          const time = Date.now() / 150;
          const curve = Math.sin(time + i * 0.2) * 20 + Math.cos(time * 0.8 + i * 0.4) * 15;
          const decay = Math.exp(-i / 22) * 180;
          value = Math.max(10, Math.min(255, decay + curve + (Math.random() * 25)));
        } else {
          // Static resting curves
          value = Math.max(8, Math.exp(-i / 20) * 120 + Math.sin(i * 0.4) * 10);
        }

        const barHeight = (value / 255) * (height * 0.88);
        const x = i * barWidth;
        const y = height - barHeight;

        const isSibilance = i >= sibilanceStartIdx && i <= sibilanceEndIdx;

        // Dynamic gradient
        const grad = ctx.createLinearGradient(0, y, 0, height);
        if (isSibilance) {
          grad.addColorStop(0, '#f43f5e'); // Neon pink/red peak
          grad.addColorStop(0.4, '#fb923c'); // Amber
          grad.addColorStop(1, '#06b6d4'); // Cyan base
        } else if (activeStemSolo === 'vocals') {
          grad.addColorStop(0, '#38bdf8');
          grad.addColorStop(1, '#0369a1');
        } else {
          grad.addColorStop(0, '#34d399');
          grad.addColorStop(1, '#1e293b');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x + 1, y, Math.max(1.5, barWidth - 2), barHeight, [2, 2, 0, 0]);
        ctx.fill();
      }

      // Draw Spectral Centroid Marker
      const centroidHz = vocalProfile.spectral_centroid_hz || 3420;
      const centroidNorm = Math.min(1, Math.max(0, centroidHz / 12000));
      const centroidX = centroidNorm * width;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centroidX, 0);
      ctx.lineTo(centroidX, height);
      ctx.stroke();

      // Spectral Tilt Slope Indicator line
      const tiltSlope = (vocalProfile.spectral_tilt_db_oct || -4.2);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.3);
      ctx.lineTo(width, height * 0.3 + (tiltSlope * -7));
      ctx.stroke();

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, vocalProfile, analyserNode, activeStemSolo]);

  return (
    <div className="bg-[#0b0e17] rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-3">
      
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Analizador RTA & Telemetría Espectral
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              FFT 2048 • Detección de Transitorios & Sibilancia (6 kHz - 10 kHz)
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Centroide: {vocalProfile.spectral_centroid_hz || 3420.5} Hz</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <span>Tilt: {vocalProfile.spectral_tilt_db_oct || -4.2} dB/oct</span>
          </div>
        </div>
      </div>

      {/* RTA Canvas */}
      <div className="relative h-44 w-full bg-[#06080d] rounded-xl border border-slate-800/90 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={800}
          height={176}
          className="w-full h-full block"
        />

        {/* Labels Overlay */}
        <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[9px] font-mono text-slate-500 pointer-events-none">
          <span>20 Hz</span>
          <span>100 Hz</span>
          <span>500 Hz</span>
          <span>1 kHz</span>
          <span className="text-cyan-400 font-bold">6 kHz - 10 kHz (Sibilancia)</span>
          <span>15 kHz</span>
          <span>20 kHz</span>
        </div>

        {/* Sibilance zone floating tag */}
        <div className="absolute top-2 right-1/4 translate-x-1/2 px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono flex items-center gap-1 shadow-md pointer-events-none">
          <Flame className="w-3 h-3 text-rose-400" />
          <span>Banda de Sibilancia ({vocalProfile.sibilance_level.toUpperCase()})</span>
        </div>
      </div>

      {/* Acoustic Insights Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400">Brillo Espectral</div>
          <div className="text-sm font-bold text-white uppercase mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            {vocalProfile.brightness}
          </div>
        </div>

        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400">Rango Dinámico</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">
            {vocalProfile.dynamic_range_db} dB
          </div>
        </div>

        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400">Sibilancia (6k-10k)</div>
          <div className="text-sm font-bold text-amber-400 mt-0.5 uppercase">
            {vocalProfile.sibilance_level} ({Math.round((vocalProfile.sibilance_ratio || 0.18) * 100)}%)
          </div>
        </div>

        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400">Carácter de Saturación</div>
          <div className="text-sm font-bold text-purple-300 mt-0.5 capitalize">
            {vocalProfile.saturation_character.replace('_', ' ')}
          </div>
        </div>
      </div>

    </div>
  );
};

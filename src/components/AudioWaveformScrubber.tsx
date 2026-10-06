import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, Mic, Music, Disc, Repeat, Zap } from 'lucide-react';
import { StructureMarker } from '../types/audio';

interface AudioWaveformScrubberProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onRestart: () => void;
  markers: StructureMarker[];
  activeStemSolo: 'all' | 'vocals' | 'no_vocal';
  setActiveStemSolo: (stem: 'all' | 'vocals' | 'no_vocal') => void;
  audioBuffer?: AudioBuffer;
}

export const AudioWaveformScrubber: React.FC<AudioWaveformScrubberProps> = ({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onRestart,
  markers,
  activeStemSolo,
  setActiveStemSolo,
  audioBuffer
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const numBars = 180;
    const barWidth = width / numBars;
    const progress = duration > 0 ? currentTime / duration : 0;
    const progressX = progress * width;

    // Get real peak data if buffer exists, or synthesize aesthetic waveform
    let peaks: number[] = [];
    if (audioBuffer) {
      const channelData = audioBuffer.getChannelData(0);
      const step = Math.floor(channelData.length / numBars);
      for (let i = 0; i < numBars; i++) {
        let max = 0;
        const start = i * step;
        const end = Math.min(start + step, channelData.length);
        for (let j = start; j < end; j += 8) {
          const val = Math.abs(channelData[j]);
          if (val > max) max = val;
        }
        peaks.push(max);
      }
    } else {
      // Procedural aesthetic envelope matching sections
      for (let i = 0; i < numBars; i++) {
        const norm = i / numBars;
        let amp = 0.35 + Math.sin(norm * 18) * 0.2 + Math.cos(norm * 9) * 0.15;
        if (norm > 0.35 && norm < 0.6) amp *= 1.45; // Drop section
        if (norm > 0.75 && norm < 0.9) amp *= 1.3;  // Chorus section
        if (norm > 0.92) amp *= 0.4;                // Outro
        peaks.push(Math.min(0.95, Math.max(0.12, amp + (Math.random() * 0.1 - 0.05))));
      }
    }

    // Draw background bars
    for (let i = 0; i < numBars; i++) {
      const x = i * barWidth;
      const peak = peaks[i] || 0.3;
      const barH = peak * (height * 0.82);
      const y = (height - barH) / 2;

      const isPlayed = x <= progressX;

      if (isPlayed) {
        // Active played color gradient based on stem solo
        let grad = ctx.createLinearGradient(0, y, 0, y + barH);
        if (activeStemSolo === 'vocals') {
          grad.addColorStop(0, '#38bdf8');
          grad.addColorStop(0.5, '#06b6d4');
          grad.addColorStop(1, '#0284c7');
        } else if (activeStemSolo === 'no_vocal') {
          grad.addColorStop(0, '#c084fc');
          grad.addColorStop(0.5, '#a855f7');
          grad.addColorStop(1, '#7e22ce');
        } else {
          grad.addColorStop(0, '#34d399');
          grad.addColorStop(0.5, '#06b6d4');
          grad.addColorStop(1, '#6366f1');
        }
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = '#1e293b';
      }

      ctx.beginPath();
      ctx.roundRect(x + 1, y, Math.max(1.5, barWidth - 1.5), barH, 2);
      ctx.fill();
    }

    // Draw Section Markers
    markers.forEach((m) => {
      const markerNorm = duration > 0 ? m.time_sec / duration : 0;
      const markerX = markerNorm * width;

      // Marker line
      ctx.strokeStyle = m.label === 'Drop' ? '#f43f5e' : m.label === 'Verse' ? '#38bdf8' : m.label === 'Chorus' ? '#a855f7' : '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(markerX, 0);
      ctx.lineTo(markerX, height);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw Playhead
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(progressX, 0);
    ctx.lineTo(progressX, height);
    ctx.stroke();

    // Playhead glowing handle
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(progressX, height / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [currentTime, duration, markers, activeStemSolo, audioBuffer]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || duration <= 0) return;
    const clickX = e.clientX - rect.left;
    const targetNorm = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(targetNorm * duration);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || duration <= 0) return;
    const clickX = e.clientX - rect.left;
    const targetNorm = Math.max(0, Math.min(1, clickX / rect.width));
    setHoverTime(targetNorm * duration);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
  };

  return (
    <div className="bg-[#0b0e17] rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-4">
      
      {/* Top Header: Controls & Timers */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Playback Transport Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRestart}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 border border-slate-700"
            title="Reiniciar reproducción"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayPause}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 transition active:scale-95 border border-cyan-400/40"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Reproducir</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs">
            <span className="text-cyan-400 font-bold">{formatTime(currentTime)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Quick Stem Solo Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400 px-2 font-mono flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" /> Aislamiento:
          </span>

          <button
            onClick={() => setActiveStemSolo('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              activeStemSolo === 'all'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Full Mix
          </button>

          <button
            onClick={() => setActiveStemSolo('vocals')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              activeStemSolo === 'vocals'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3 h-3" />
            <span>Vocal Solo</span>
          </button>

          <button
            onClick={() => setActiveStemSolo('no_vocal')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              activeStemSolo === 'no_vocal'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-3 h-3" />
            <span>Instrumental</span>
          </button>
        </div>

      </div>

      {/* Main Interactive Waveform Canvas */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="relative h-24 w-full bg-[#07090e] rounded-xl border border-slate-800/80 cursor-pointer overflow-hidden group shadow-inner"
      >
        <canvas
          ref={canvasRef}
          width={1000}
          height={96}
          className="w-full h-full block"
        />

        {/* Hover Time Tooltip */}
        {isHovering && (
          <div
            className="absolute top-1 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900/90 text-cyan-300 border border-cyan-500/40 font-mono text-[10px] pointer-events-none shadow-lg"
            style={{ left: `${duration > 0 ? (hoverTime / duration) * 100 : 0}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      {/* Section Markers Chips Under Waveform */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] text-slate-400 font-mono">Secciones Detectadas:</span>
        {markers.map((m, idx) => {
          const isActive = currentTime >= m.time_sec && (idx === markers.length - 1 || currentTime < markers[idx + 1].time_sec);
          const colorClass = m.label === 'Drop'
            ? 'bg-rose-500/15 text-rose-400 border-rose-500/40'
            : m.label === 'Verse'
            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
            : m.label === 'Chorus'
            ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
            : 'bg-slate-800 text-slate-300 border-slate-700';

          return (
            <button
              key={idx}
              onClick={() => onSeek(m.time_sec)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border flex items-center gap-1.5 active:scale-95 ${colorClass} ${
                isActive ? 'ring-2 ring-cyan-400 shadow-md scale-105' : 'opacity-80 hover:opacity-100'
              }`}
            >
              <span className="font-semibold">{m.label}</span>
              <span className="text-[10px] opacity-70">@{formatTime(m.time_sec)}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};

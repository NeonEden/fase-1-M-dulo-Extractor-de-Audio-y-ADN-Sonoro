import React from 'react';
import { Layers, Plus, Clock, Zap, Music2 } from 'lucide-react';
import { StructureMarker } from '../types/audio';

interface StructureTimelineProps {
  markers: StructureMarker[];
  currentTime: number;
  duration: number;
  bpm: number;
  onSeek: (time: number) => void;
  onAddMarker?: (marker: StructureMarker) => void;
}

export const StructureTimeline: React.FC<StructureTimelineProps> = ({
  markers,
  currentTime,
  duration,
  bpm,
  onSeek
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-[#0b0e17] rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Análisis de la Estructura Musical (no_vocal.wav)
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Detección de cambios de energía por compás • Marcadores de sección
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Tempo: <strong className="text-cyan-400">{bpm} BPM</strong></span>
          <span>•</span>
          <span>Compases: <strong className="text-purple-400">{Math.floor((duration / (60 / bpm * 4)))}</strong></span>
        </div>
      </div>

      {/* Visual Energy Segment Bar */}
      <div className="relative h-12 bg-[#06080d] rounded-xl border border-slate-800/90 overflow-hidden flex shadow-inner">
        {markers.map((m, idx) => {
          const nextTime = idx < markers.length - 1 ? markers[idx + 1].time_sec : duration;
          const sectionDuration = Math.max(1, nextTime - m.time_sec);
          const widthPercent = duration > 0 ? (sectionDuration / duration) * 100 : 25;
          const isActive = currentTime >= m.time_sec && currentTime < nextTime;

          let bgClass = 'bg-slate-800/50 hover:bg-slate-800';
          let borderClass = 'border-slate-700';
          let textClass = 'text-slate-300';

          if (m.label === 'Drop') {
            bgClass = 'bg-gradient-to-r from-rose-950/70 to-rose-900/50 hover:from-rose-900/80 hover:to-rose-850/60';
            borderClass = 'border-rose-500/40';
            textClass = 'text-rose-300';
          } else if (m.label === 'Verse') {
            bgClass = 'bg-gradient-to-r from-cyan-950/60 to-cyan-900/40 hover:from-cyan-900/70';
            borderClass = 'border-cyan-500/40';
            textClass = 'text-cyan-300';
          } else if (m.label === 'Chorus') {
            bgClass = 'bg-gradient-to-r from-purple-950/60 to-purple-900/40 hover:from-purple-900/70';
            borderClass = 'border-purple-500/40';
            textClass = 'text-purple-300';
          } else if (m.label === 'Intro' || m.label === 'Outro') {
            bgClass = 'bg-slate-900/80 hover:bg-slate-850';
            borderClass = 'border-slate-700/60';
            textClass = 'text-slate-400';
          }

          return (
            <div
              key={idx}
              onClick={() => onSeek(m.time_sec)}
              style={{ width: `${widthPercent}%` }}
              className={`h-full border-r relative flex flex-col justify-center px-2 cursor-pointer transition-all duration-150 ${bgClass} ${borderClass} ${
                isActive ? 'ring-2 ring-cyan-400 ring-inset z-10' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold font-mono truncate ${textClass}`}>
                  {m.label}
                </span>
                <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                  {formatTime(m.time_sec)}
                </span>
              </div>

              {/* Energy Mini Meter */}
              <div className="w-full bg-slate-950/80 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-800">
                <div
                  className={`h-full rounded-full ${
                    m.label === 'Drop' ? 'bg-rose-500' : m.label === 'Verse' ? 'bg-cyan-400' : 'bg-purple-400'
                  }`}
                  style={{ width: `${Math.round((m.energy_norm || 0.5) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Cards List of Section Markers matching JSON schema */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
        {markers.map((marker, idx) => {
          const isActive = currentTime >= marker.time_sec && (idx === markers.length - 1 || currentTime < markers[idx + 1].time_sec);

          return (
            <button
              key={idx}
              onClick={() => onSeek(marker.time_sec)}
              className={`p-3 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                isActive
                  ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-white">{marker.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {marker.time_sec.toFixed(1)}s
                </span>
              </div>

              <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Compás {marker.bar || idx * 8 + 1}</span>
                <span className="text-emerald-400 font-semibold">
                  {Math.round((marker.energy_norm || 0.5) * 100)}% RMS
                </span>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};

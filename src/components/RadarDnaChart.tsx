import React from 'react';
import { Sparkles, Shield, Cpu } from 'lucide-react';
import { AudioDNAData } from '../types/audio';

interface RadarDnaChartProps {
  dna: AudioDNAData;
}

export const RadarDnaChart: React.FC<RadarDnaChartProps> = ({ dna }) => {
  const { vocal_profile, track_info } = dna;

  // Calculate radar polygon points (6 dimensions, 0 to 1 scale)
  // 1. Brillo (based on spectral centroid & brightness)
  const brightnessVal = vocal_profile.brightness === 'high' ? 0.9 : vocal_profile.brightness === 'dark' ? 0.3 : 0.65;
  // 2. Dinámica (inverted compression)
  const dynamicsVal = Math.min(1, Math.max(0.2, vocal_profile.dynamic_range_db / 20));
  // 3. Sibilancia (6k-10k ratio)
  const sibilanceVal = vocal_profile.sibilance_level === 'high' ? 0.85 : vocal_profile.sibilance_level === 'low' ? 0.25 : 0.55;
  // 4. Presencia Vocal (vocal presence)
  const vocalPresenceVal = dna.acoustic_fingerprint?.vocal_presence_ratio || 0.72;
  // 5. Armónicos / Saturación
  const harmonicVal = vocal_profile.saturation_character === 'driven' ? 0.95 : vocal_profile.saturation_character === 'warm_tube' ? 0.75 : 0.4;
  // 6. Confianza Tonal
  const tonalVal = track_info.confidence_score || 0.94;

  const traits = [
    { label: 'Brillo Espectral', value: brightnessVal, color: '#38bdf8' },
    { label: 'Rango Dinámico', value: dynamicsVal, color: '#34d399' },
    { label: 'Sibilancia (6-10k)', value: sibilanceVal, color: '#fb7185' },
    { label: 'Presencia Vocal', value: vocalPresenceVal, color: '#c084fc' },
    { label: 'Densidad Armónica', value: harmonicVal, color: '#fbbf24' },
    { label: 'Definición Tonal', value: tonalVal, color: '#22d3ee' },
  ];

  const size = 280;
  const center = size / 2;
  const radius = 95;
  const angleStep = (Math.PI * 2) / traits.length;

  // Generate radar polygon points
  const points = traits.map((t, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = radius * t.value;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-[#0b0e17] rounded-2xl border border-slate-800 p-5 shadow-2xl flex flex-col items-center justify-between">
      
      <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white">Radar ADN Sonoro</span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400">Huella Acústica 360°</span>
      </div>

      {/* Radar SVG */}
      <div className="relative py-2 flex items-center justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Background Concentric Webs */}
          {[0.25, 0.5, 0.75, 1.0].map((level, idx) => {
            const webPoints = traits.map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const r = radius * level;
              const x = center + r * Math.cos(angle);
              const y = center + r * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ');

            return (
              <polygon
                key={idx}
                points={webPoints}
                fill="none"
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray={level === 1 ? 'none' : '3,3'}
              />
            );
          })}

          {/* Spokes from center */}
          {traits.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="#1e293b"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled Radar Area */}
          <polygon
            points={points}
            fill="rgba(6, 182, 212, 0.25)"
            stroke="#06b6d4"
            strokeWidth="2.5"
            className="transition-all duration-300"
          />

          {/* Data Points */}
          {traits.map((t, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = radius * t.value;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);

            // Label position slightly outside
            const labelR = radius + 22;
            const lx = center + labelR * Math.cos(angle);
            const ly = center + labelR * Math.sin(angle);

            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill={t.color} stroke="#0f172a" strokeWidth="1.5" />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-400 text-[9px] font-mono font-semibold"
                >
                  {t.label.split(' ')[0]} ({Math.round(t.value * 100)}%)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="w-full text-center text-[10px] font-mono text-slate-500 pt-1">
        Firma Acústica Normalizada • Extractor DSP
      </div>
    </div>
  );
};

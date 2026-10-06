import React, { useState } from 'react';
import { Sparkles, Activity, Gauge, Flame, Music, Waves, ShieldCheck, Zap, Disc, Info, Check } from 'lucide-react';
import { AudioDNAData, TrackInfo, VocalProfile } from '../types/audio';

interface AcousticTelemetryCardsProps {
  dna: AudioDNAData;
  onUpdateBpm?: (bpm: number) => void;
  onUpdateKey?: (key: string) => void;
}

export const AcousticTelemetryCards: React.FC<AcousticTelemetryCardsProps> = ({
  dna,
  onUpdateBpm,
  onUpdateKey
}) => {
  const { track_info, vocal_profile } = dna;
  const [tapTimes, setTapTimes] = useState<number[]>([]);

  const handleTapTempo = () => {
    const now = Date.now();
    const newTimes = [...tapTimes.slice(-3), now];
    setTapTimes(newTimes);
    if (newTimes.length > 1 && onUpdateBpm) {
      const intervals = [];
      for (let i = 1; i < newTimes.length; i++) {
        intervals.push(newTimes[i] - newTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round((60000 / avgInterval) * 10) / 10;
      if (bpm >= 60 && bpm <= 200) {
        onUpdateBpm(bpm);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. BPM & Tonalidad */}
      <div className="bg-[#0b0e17] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Bpm & Tonalidad</h4>
                <span className="text-[10px] text-slate-500 font-mono">Key & Mode Detection</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {track_info.camelot_key || '4A'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-3">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono">Tempo Global</span>
              <div className="text-2xl font-black font-mono text-cyan-400 tracking-tight mt-0.5">
                {track_info.bpm} <span className="text-xs text-slate-400 font-normal">BPM</span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono">Escala / Key</span>
              <div className="text-2xl font-black font-mono text-white tracking-tight mt-0.5">
                {track_info.key}
              </div>
            </div>
          </div>
        </div>

        {/* Tap Tempo & Confidence */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <button
            onClick={handleTapTempo}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-[11px] border border-slate-700 active:scale-95 transition"
          >
            Tap Tempo
          </button>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Confianza: {Math.round((track_info.confidence_score || 0.94) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* 2. Inclinación Espectral (Spectral Tilt / Centroid) */}
      <div className="bg-[#0b0e17] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Inclinación Espectral</h4>
                <span className="text-[10px] text-slate-500 font-mono">Spectral Tilt & Centroid</span>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                vocal_profile.brightness === 'high'
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  : vocal_profile.brightness === 'dark'
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {vocal_profile.brightness === 'high' ? 'Brillante' : vocal_profile.brightness === 'dark' ? 'Opaca' : 'Neutra'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-3">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono">Centroide (Hz)</span>
              <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
                {vocal_profile.spectral_centroid_hz || 3420.5} <span className="text-xs text-slate-400 font-normal">Hz</span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono">Tilt Espectral</span>
              <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
                {vocal_profile.spectral_tilt_db_oct || -4.2} <span className="text-xs text-slate-400 font-normal">dB/oct</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spectral insight footer */}
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
          <span>Curva de Agudos:</span>
          <span className="text-cyan-300">
            {vocal_profile.brightness === 'high' ? 'Presencia abierta +6kHz' : 'Respuesta equilibrada'}
          </span>
        </div>
      </div>

      {/* 3. Rango Dinámico (RMS / LUFS) */}
      <div className="bg-[#0b0e17] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Rango Dinámico</h4>
                <span className="text-[10px] text-slate-500 font-mono">RMS / LUFS / Compresión</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              {vocal_profile.dynamic_range_db} dB
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-3">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono">RMS Integrado</span>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                {vocal_profile.rms_db || -16.4} <span className="text-xs text-slate-400 font-normal">dB</span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono">LUFS Aprox.</span>
              <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
                {vocal_profile.lufs_integrated || -14.1} <span className="text-xs text-slate-400 font-normal">LUFS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compression inference */}
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
          <span>Compresión:</span>
          <span className="text-emerald-300 font-bold capitalize">
            {vocal_profile.compression_profile?.replace('_', ' ') || 'Moderada'}
          </span>
        </div>
      </div>

      {/* 4. Transitorios & Sibilancia (6k - 10k) */}
      <div className="bg-[#0b0e17] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Sibilancia & Saturación</h4>
                <span className="text-[10px] text-slate-500 font-mono">6 kHz - 10 kHz Energy</span>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                vocal_profile.sibilance_level === 'high'
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  : vocal_profile.sibilance_level === 'medium'
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {vocal_profile.sibilance_level}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-3">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono">Ratio Sibilancia</span>
              <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">
                {Math.round((vocal_profile.sibilance_ratio || 0.18) * 100)}%
              </div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono">Saturación</span>
              <div className="text-sm font-bold font-mono text-purple-300 mt-1 capitalize truncate">
                {vocal_profile.saturation_character.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* De-esser advice */}
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
          <span>De-Esser:</span>
          <span className="text-rose-300">
            {vocal_profile.sibilance_level === 'high' ? 'Reducción -3.5dB a 7.2kHz' : 'Sin atenuación requerida'}
          </span>
        </div>
      </div>

    </div>
  );
};

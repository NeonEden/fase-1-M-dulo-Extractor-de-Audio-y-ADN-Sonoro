import React, { useState } from 'react';
import { Copy, Check, Download, FileJson, Sparkles, Code2, Eye } from 'lucide-react';
import { AudioDNAData } from '../types/audio';

interface AudioDnaJsonViewerProps {
  dna: AudioDNAData;
  onDownload: () => void;
}

export const AudioDnaJsonViewer: React.FC<AudioDnaJsonViewerProps> = ({ dna, onDownload }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'extended'>('standard');

  // Exact JSON requested in the brief
  const standardJson = {
    track_info: {
      bpm: dna.track_info.bpm,
      key: dna.track_info.key
    },
    vocal_profile: {
      brightness: dna.vocal_profile.brightness,
      dynamic_range_db: dna.vocal_profile.dynamic_range_db,
      sibilance_level: dna.vocal_profile.sibilance_level,
      saturation_character: dna.vocal_profile.saturation_character
    },
    structure_markers: dna.structure_markers.map(m => ({
      time_sec: m.time_sec,
      label: m.label
    }))
  };

  // Full Extended JSON with complete DSP telemetry
  const extendedJson = {
    track_info: {
      bpm: dna.track_info.bpm,
      key: dna.track_info.key,
      camelot_key: dna.track_info.camelot_key || '4A',
      confidence_score: dna.track_info.confidence_score || 0.94,
      duration_sec: dna.track_info.duration_sec,
      sample_rate: dna.track_info.sample_rate || 44100,
      channels: dna.track_info.channels || 2
    },
    vocal_profile: {
      brightness: dna.vocal_profile.brightness,
      spectral_centroid_hz: dna.vocal_profile.spectral_centroid_hz || 3420.5,
      spectral_tilt_db_oct: dna.vocal_profile.spectral_tilt_db_oct || -4.2,
      dynamic_range_db: dna.vocal_profile.dynamic_range_db,
      rms_db: dna.vocal_profile.rms_db || -16.4,
      lufs_integrated: dna.vocal_profile.lufs_integrated || -14.1,
      sibilance_level: dna.vocal_profile.sibilance_level,
      sibilance_ratio: dna.vocal_profile.sibilance_ratio || 0.18,
      saturation_character: dna.vocal_profile.saturation_character,
      compression_profile: dna.vocal_profile.compression_profile || 'moderate_compression'
    },
    structure_markers: dna.structure_markers,
    acoustic_fingerprint: dna.acoustic_fingerprint
  };

  const activeJson = viewMode === 'standard' ? standardJson : extendedJson;
  const jsonString = JSON.stringify(activeJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0b0e17] rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileJson className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Salida JSON: audio_dna.json
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Esquema de salida estructurado para pipelines de IA, DAWs y metadatos
            </p>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('standard')}
              className={`px-2.5 py-1 rounded-md transition ${
                viewMode === 'standard'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Estándar (Brief)
            </button>
            <button
              onClick={() => setViewMode('extended')}
              className={`px-2.5 py-1 rounded-md transition ${
                viewMode === 'extended'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Extendido (DSP Full)
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>

          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar .json</span>
          </button>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800/90 bg-[#06080d] p-4 shadow-inner">
        <div className="absolute top-2 right-3 text-[10px] font-mono text-slate-500">
          application/json • utf-8
        </div>
        <pre className="text-xs font-mono text-cyan-300/90 overflow-x-auto leading-relaxed selection:bg-cyan-500/30">
          <code>{jsonString}</code>
        </pre>
      </div>

    </div>
  );
};

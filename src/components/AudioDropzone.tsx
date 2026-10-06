import React, { useRef, useState } from 'react';
import { Upload, FileAudio, Sparkles, CheckCircle2, RefreshCw, Disc3, Layers } from 'lucide-react';
import { DemoPreset } from '../types/audio';
import { DEMO_PRESETS } from '../data/presets';

interface AudioDropzoneProps {
  onFileUpload: (file: File) => void;
  onSelectPreset: (preset: DemoPreset) => void;
  currentPreset: DemoPreset;
  fileName: string;
  isProcessing: boolean;
  isCustomFile: boolean;
}

export const AudioDropzone: React.FC<AudioDropzoneProps> = ({
  onFileUpload,
  onSelectPreset,
  currentPreset,
  fileName,
  isProcessing,
  isCustomFile
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/') || /\.(wav|mp3|flac|ogg|m4a|aac)$/i.test(file.name)) {
        onFileUpload(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-[#0f1420]/80 rounded-2xl border border-slate-800/80 p-5 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Subtle glowing ambient gradient */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 relative z-10">
        
        {/* Dropzone area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
              : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/50 hover:bg-slate-900/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.wav,.mp3,.flac,.ogg,.m4a,.aac"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
            {isProcessing ? (
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            ) : isCustomFile ? (
              <FileAudio className="w-6 h-6 text-cyan-300" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="text-sm font-semibold text-white">
                {isProcessing ? 'Extrayendo stems y ADN sonoro...' : isCustomFile ? fileName : 'Subir pista de referencia'}
              </span>
              {isCustomFile && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Archivo de Usuario
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Arrastra un archivo <span className="text-cyan-300 font-mono">.wav</span>, <span className="text-cyan-300 font-mono">.mp3</span> o <span className="text-cyan-300 font-mono">.flac</span> para aislar la voz y obtener telemetría acústica.
            </p>
          </div>

          <button
            type="button"
            className="px-3.5 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition shrink-0 active:scale-95"
          >
            Examinar
          </button>
        </div>

        {/* Preset Selector Badges */}
        <div className="lg:w-96 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Disc3 className="w-3.5 h-3.5 text-cyan-400" />
              Pistas de Referencia Rápidas:
            </span>
            <span className="text-[10px] font-mono text-slate-500">Demucs Ready</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_PRESETS.map((p) => {
              const isSelected = !isCustomFile && currentPreset.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPreset(p)}
                  className={`px-2.5 py-2 rounded-xl text-left transition-all border text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border-cyan-500/60 text-cyan-200 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="font-semibold truncate text-[11px]">{p.name}</span>
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {p.dna.track_info.key}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                    <span>{p.dna.track_info.bpm} BPM</span>
                    <span className="truncate max-w-[70px] text-slate-500">{p.genre}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

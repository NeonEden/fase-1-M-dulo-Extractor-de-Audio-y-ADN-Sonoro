import React from 'react';
import { Mic, Music, Disc, Volume2, VolumeX, Download, Sparkles, Layers, Sliders } from 'lucide-react';
import { StemChannel } from '../types/audio';

interface StemMixerProps {
  stems: StemChannel[];
  onVolumeChange: (id: string, vol: number) => void;
  onPanChange: (id: string, pan: number) => void;
  onToggleMute: (id: string) => void;
  onToggleSolo: (id: string) => void;
  onDownloadStem: (id: string) => void;
  isPlaying: boolean;
}

export const StemMixer: React.FC<StemMixerProps> = ({
  stems,
  onVolumeChange,
  onPanChange,
  onToggleMute,
  onToggleSolo,
  onDownloadStem,
  isPlaying
}) => {
  return (
    <div className="bg-[#0b0e17] rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-5">
      
      {/* Mixer Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Mezclador Multicanal de Stems (Demucs Engine)
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Aislamiento de voz (/stems/vocals.wav) vs instrumental (/stems/no_vocal.wav)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            32-Bit Float Engine Active
          </span>
        </div>
      </div>

      {/* 3-Channel DAW Fader Strips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stems.map((stem) => {
          const isVocal = stem.id === 'vocals';
          const isInst = stem.id === 'no_vocal';
          const isFull = stem.id === 'full';

          return (
            <div
              key={stem.id}
              className={`rounded-xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                stem.solo
                  ? 'bg-slate-900/90 border-cyan-500/60 shadow-lg ring-1 ring-cyan-500/40'
                  : stem.muted
                  ? 'bg-slate-950/60 border-slate-800 opacity-60'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Channel Strip Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                      isVocal
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : isInst
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isVocal ? <Mic className="w-3.5 h-3.5" /> : isInst ? <Music className="w-3.5 h-3.5" /> : <Disc className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{stem.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{stem.filename}</div>
                  </div>
                </div>

                {/* Solo / Mute Buttons */}
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <button
                    onClick={() => onToggleSolo(stem.id)}
                    className={`w-7 h-7 rounded-lg font-bold text-[11px] transition border ${
                      stem.solo
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                    title="Solo Stem"
                  >
                    S
                  </button>

                  <button
                    onClick={() => onToggleMute(stem.id)}
                    className={`w-7 h-7 rounded-lg font-bold text-[11px] transition border ${
                      stem.muted
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                    title="Mute Stem"
                  >
                    M
                  </button>
                </div>
              </div>

              {/* VU Meter & Fader Section */}
              <div className="flex items-center gap-4 py-3">
                {/* Visual LED VU Meter */}
                <div className="w-4 h-32 bg-slate-950 rounded-md p-0.5 flex flex-col-reverse gap-0.5 border border-slate-800">
                  {Array.from({ length: 16 }).map((_, idx) => {
                    const threshold = idx / 16;
                    const isLit = isPlaying && !stem.muted && (stem.volume * (0.4 + Math.random() * 0.6)) > threshold;
                    let color = 'bg-emerald-500';
                    if (idx > 11) color = 'bg-amber-400';
                    if (idx > 13) color = 'bg-rose-500';

                    return (
                      <div
                        key={idx}
                        className={`w-full h-1.5 rounded-xs transition-colors duration-75 ${
                          isLit ? color : 'bg-slate-800/60'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Vertical Volume Slider & Level Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>Fader</span>
                      <span className="text-cyan-300 font-bold">{Math.round(stem.volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1.2"
                      step="0.01"
                      value={stem.volume}
                      onChange={(e) => onVolumeChange(stem.id, parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Stereo Pan Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>Pan</span>
                      <span className="text-slate-300 font-bold">
                        {stem.pan === 0 ? 'C' : stem.pan < 0 ? `L${Math.abs(Math.round(stem.pan * 100))}` : `R${Math.round(stem.pan * 100)}`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.05"
                      value={stem.pan}
                      onChange={(e) => onPanChange(stem.id, parseFloat(e.target.value))}
                      className="w-full accent-purple-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Download Stem Action Button */}
              <div className="pt-2 border-t border-slate-800/80 mt-2">
                <button
                  onClick={() => onDownloadStem(stem.id)}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium border border-slate-700 hover:border-slate-600 transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Descargar {stem.filename}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

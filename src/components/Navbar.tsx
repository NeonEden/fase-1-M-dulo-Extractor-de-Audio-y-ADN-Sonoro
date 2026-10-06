import React from 'react';
import { Radio, Download, Terminal, Sliders, Cpu, Sparkles, Music2, ShieldCheck } from 'lucide-react';
import { DemoPreset } from '../types/audio';
import { DEMO_PRESETS } from '../data/presets';

interface NavbarProps {
  currentPreset: DemoPreset;
  onSelectPreset: (preset: DemoPreset) => void;
  activeTab: 'telemetry' | 'mixer' | 'json' | 'python';
  setActiveTab: (tab: 'telemetry' | 'mixer' | 'json' | 'python') => void;
  onDownloadDnaJson: () => void;
  onOpenVerification: () => void;
  isProcessing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPreset,
  onSelectPreset,
  activeTab,
  setActiveTab,
  onDownloadDnaJson,
  onOpenVerification,
  isProcessing
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0f17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  AudioDNA
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
                  v2.4 DSP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-mono">
                Demucs Stems • Telemetría Acústica • ADN Sonoro
              </p>
            </div>
          </div>

          {/* Quick Presets for Mobile */}
          <div className="md:hidden">
            <select
              value={currentPreset.id}
              onChange={(e) => {
                const found = DEMO_PRESETS.find(p => p.id === e.target.value);
                if (found) onSelectPreset(found);
              }}
              className="bg-slate-900 text-xs text-slate-300 border border-slate-700 rounded-lg px-2 py-1"
            >
              {DEMO_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.genre})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium w-full md:w-auto justify-center">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'telemetry'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ADN Acústico</span>
          </button>

          <button
            onClick={() => setActiveTab('mixer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'mixer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Stems & Mezclador</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'json'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="font-mono">audio_dna.json</span>
          </button>

          <button
            onClick={() => setActiveTab('python')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'python'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Script Python</span>
          </button>
        </div>

        {/* Preset Selector & Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={onOpenVerification}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono font-medium border border-emerald-500/30 transition shadow-sm active:scale-95"
            title="Verificar informe matemático de datos reales"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Datos Reales</span>
          </button>

          {/* Preset dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <Music2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px]">Pista:</span>
            <select
              value={currentPreset.id}
              onChange={(e) => {
                const found = DEMO_PRESETS.find(p => p.id === e.target.value);
                if (found) onSelectPreset(found);
              }}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-xs"
            >
              {DEMO_PRESETS.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.name} • {p.genre}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onDownloadDnaJson}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium border border-slate-700 transition shadow-sm hover:border-slate-600 active:scale-95 disabled:opacity-50"
            title="Descargar audio_dna.json"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>
    </header>
  );
};


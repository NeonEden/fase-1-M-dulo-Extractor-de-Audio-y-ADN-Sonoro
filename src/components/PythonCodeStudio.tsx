import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, Play, FileCode, Package, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { PYTHON_AUDIO_EXTRACTOR_SCRIPT, PYTHON_REQUIREMENTS_TXT, PYTHON_README_MD } from '../utils/pythonScriptGenerator';

export const PythonCodeStudio: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'script' | 'requirements' | 'readme'>('script');
  const [copied, setCopied] = useState(false);
  const [isRunningSimulation, setIsRunningSimulation] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '$ python audio_extractor.py input_reference.wav --output_dir ./output --model htdemucs',
    '[*] Demucs & Librosa Audio Telemetry Ready.'
  ]);

  const currentContent = 
    activeFile === 'script' ? PYTHON_AUDIO_EXTRACTOR_SCRIPT :
    activeFile === 'requirements' ? PYTHON_REQUIREMENTS_TXT :
    PYTHON_README_MD;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = 
      activeFile === 'script' ? 'audio_extractor.py' :
      activeFile === 'requirements' ? 'requirements.txt' :
      'README.md';
    const mime = activeFile === 'script' ? 'text/x-python' : 'text/plain';
    const blob = new Blob([currentContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runTerminalSimulation = () => {
    setIsRunningSimulation(true);
    setTerminalLogs([
      '$ python audio_extractor.py reference_track.wav --output_dir ./output --model htdemucs',
      '[*] Verificando entorno PyTorch & TorchAudio...',
      '[+] CUDA GPU detected: NVIDIA RTX (Aceleración activa)',
      '[*] Iniciando separación de stems con Demucs (htdemucs)...'
    ]);

    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        '[•] Separando pista: [drums, bass, other, vocals]...',
        '[+] Stems guardados: /output/stems/vocals.wav & /output/stems/no_vocal.wav'
      ]);
    }, 1200);

    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        '[*] Extrayendo telemetría acústica de vocals.wav con Librosa...',
        '[+] BPM estimado: 128.0 BPM (confianza: 94%)',
        '[+] Escala / Tonalidad detectada: Fm (Krumhansl-Schmuckler)',
        '[+] Brillo Espectral: High (Centroide: 3420.5 Hz, Tilt: -4.2 dB/oct)',
        '[+] Rango Dinámico RMS: 14.2 dB (LUFS: -14.1 dB)',
        '[+] Banda Sibilancia 6k-10k: Medium (Ratio: 0.18)'
      ]);
    }, 2400);

    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        '[*] Segmentando estructura por energía en no_vocal.wav...',
        '[+] Marcadores: Intro (0.0s), Verse (15.0s), Drop (45.0s), Outro (110.0s)',
        '[+] Guardando /output/audio_dna.json ...',
        '==================================================',
        '[✓] PROCESAMIENTO COMPLETADO EXITOSAMENTE (100%)',
        '=================================================='
      ]);
      setIsRunningSimulation(false);
    }, 3600);
  };

  return (
    <div className="bg-[#0b0e17] rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-5">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Suite Python de Producción: audio_extractor.py
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Script CLI con Demucs (htdemucs), Librosa, SoundFile, SciPy y PyLoudNorm
            </p>
          </div>
        </div>

        {/* File Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveFile('script')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                activeFile === 'script'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>audio_extractor.py</span>
            </button>

            <button
              onClick={() => setActiveFile('requirements')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                activeFile === 'requirements'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>requirements.txt</span>
            </button>

            <button
              onClick={() => setActiveFile('readme')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                activeFile === 'readme'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>README.md</span>
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
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Archivo</span>
          </button>
        </div>
      </div>

      {/* Code Editor Preview */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800/90 bg-[#06080d] p-4 shadow-inner max-h-[420px] overflow-y-auto">
        <div className="absolute top-2 right-3 text-[10px] font-mono text-slate-500">
          {activeFile === 'script' ? 'python3 • 250 lines' : 'text/plain'}
        </div>
        <pre className="text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed selection:bg-emerald-500/30">
          <code>{currentContent}</code>
        </pre>
      </div>

      {/* Interactive Terminal Simulator */}
      <div className="rounded-xl border border-slate-800 bg-[#04060a] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="ml-2 text-slate-300 font-semibold">Simulador de Terminal CLI</span>
          </div>

          <button
            onClick={runTerminalSimulation}
            disabled={isRunningSimulation}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-medium transition active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningSimulation ? 'animate-spin' : 'fill-emerald-300'}`} />
            <span>{isRunningSimulation ? 'Ejecutando Demucs...' : 'Probar Ejecución CLI'}</span>
          </button>
        </div>

        <div className="font-mono text-[11px] text-slate-300 bg-slate-950/80 p-3 rounded-lg border border-slate-900 space-y-1 max-h-48 overflow-y-auto">
          {terminalLogs.map((log, index) => (
            <div
              key={index}
              className={
                log.startsWith('$') ? 'text-cyan-400 font-bold' :
                log.startsWith('[+]') || log.startsWith('[✓]') ? 'text-emerald-400' :
                log.startsWith('[!]') ? 'text-amber-400' :
                'text-slate-400'
              }
            >
              {log}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

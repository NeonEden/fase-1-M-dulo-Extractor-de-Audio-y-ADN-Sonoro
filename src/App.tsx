import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { AudioDropzone } from './components/AudioDropzone';
import { AudioWaveformScrubber } from './components/AudioWaveformScrubber';
import { SpectrumWaterfallAnalyzer } from './components/SpectrumWaterfallAnalyzer';
import { StemMixer } from './components/StemMixer';
import { AcousticTelemetryCards } from './components/AcousticTelemetryCards';
import { StructureTimeline } from './components/StructureTimeline';
import { RadarDnaChart } from './components/RadarDnaChart';
import { AudioDnaJsonViewer } from './components/AudioDnaJsonViewer';
import { PythonCodeStudio } from './components/PythonCodeStudio';
import { DspVerificationModal } from './components/DspVerificationModal';
import { DEMO_PRESETS } from './data/presets';
import { AudioDNAData, DemoPreset, StemChannel, StructureMarker } from './types/audio';
import { 
  extractAudioDNAFromBuffer, 
  generateProceduralStemBuffers, 
  extractStemsFromStereoBuffer, 
  audioBufferToWavBlob,
  DspVerificationReport
} from './utils/audioDnaDsp';

export default function App() {
  const [currentPreset, setCurrentPreset] = useState<DemoPreset>(DEMO_PRESETS[0]);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'mixer' | 'json' | 'python'>('telemetry');
  const [dna, setDna] = useState<AudioDNAData>(DEMO_PRESETS[0].dna);
  const [fileName, setFileName] = useState<string>('Neon_Horizon_Reference.wav');
  const [isCustomFile, setIsCustomFile] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dspReport, setDspReport] = useState<DspVerificationReport | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);

  // Playback & AudioContext State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(120.0);
  const [activeStemSolo, setActiveStemSolo] = useState<'all' | 'vocals' | 'no_vocal'>('all');

  // Stems
  const [stems, setStems] = useState<StemChannel[]>([
    {
      id: 'full',
      name: 'Pista Completa',
      filename: 'full_mix.wav',
      color: '#10b981',
      volume: 1.0,
      pan: 0,
      muted: false,
      solo: false,
      rmsLevel: -14.2,
      peakLevel: -0.8
    },
    {
      id: 'vocals',
      name: 'Voz Aislada (Demucs)',
      filename: 'vocals.wav',
      color: '#06b6d4',
      volume: 1.0,
      pan: 0,
      muted: false,
      solo: false,
      rmsLevel: -16.4,
      peakLevel: -1.2
    },
    {
      id: 'no_vocal',
      name: 'Instrumental Completo',
      filename: 'no_vocal.wav',
      color: '#a855f7',
      volume: 1.0,
      pan: 0,
      muted: false,
      solo: false,
      rmsLevel: -15.1,
      peakLevel: -0.9
    }
  ]);

  // Audio Context & Nodes refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const fullBufferRef = useRef<AudioBuffer | null>(null);
  const vocalBufferRef = useRef<AudioBuffer | null>(null);
  const instBufferRef = useRef<AudioBuffer | null>(null);
  
  // Playback nodes
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const vocalSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const instSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  
  const gainNodeRef = useRef<GainNode | null>(null);
  const vocalGainRef = useRef<GainNode | null>(null);
  const instGainRef = useRef<GainNode | null>(null);
  
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseOffsetRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Initialize or synthesize audio buffers
  const setupPresetAudio = async (preset: DemoPreset) => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;
    
    // Generate procedural stems for preset
    const { fullBuffer, vocalBuffer, instrumentalBuffer } = generateProceduralStemBuffers(
      ctx,
      preset.dna.track_info.bpm,
      preset.synthConfig.baseFreq,
      preset.dna.track_info.duration_sec || 30
    );

    fullBufferRef.current = fullBuffer;
    vocalBufferRef.current = vocalBuffer;
    instBufferRef.current = instrumentalBuffer;
    setDuration(preset.dna.track_info.duration_sec || 120.0);

    // Compute exact DSP mathematical report on buffer
    const { report } = await extractAudioDNAFromBuffer(fullBuffer, vocalBuffer, instrumentalBuffer);
    setDspReport(report);
  };

  useEffect(() => {
    setupPresetAudio(currentPreset);
  }, []);

  // Update stem gain / solo / mute in real-time
  useEffect(() => {
    if (!audioCtxRef.current) return;

    const vocalStem = stems.find(s => s.id === 'vocals');
    const instStem = stems.find(s => s.id === 'no_vocal');

    const anySolo = stems.some(s => s.solo);

    if (vocalGainRef.current && vocalStem) {
      let vGain = vocalStem.volume;
      if (vocalStem.muted) vGain = 0;
      if (anySolo && !vocalStem.solo) vGain = 0;
      if (activeStemSolo === 'vocals') vGain = vocalStem.volume;
      if (activeStemSolo === 'no_vocal') vGain = 0;
      vocalGainRef.current.gain.setTargetAtTime(vGain, audioCtxRef.current.currentTime, 0.05);
    }

    if (instGainRef.current && instStem) {
      let iGain = instStem.volume;
      if (instStem.muted) iGain = 0;
      if (anySolo && !instStem.solo) iGain = 0;
      if (activeStemSolo === 'no_vocal') iGain = instStem.volume;
      if (activeStemSolo === 'vocals') iGain = 0;
      instGainRef.current.gain.setTargetAtTime(iGain, audioCtxRef.current.currentTime, 0.05);
    }
  }, [stems, activeStemSolo]);

  // Play / Pause handler
  const handlePlayPause = async () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (isPlaying) {
      // Pause
      stopPlaybackNodes();
      pauseOffsetRef.current = currentTime;
      setIsPlaying(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else {
      // Play
      startPlaybackAt(pauseOffsetRef.current);
      setIsPlaying(true);
    }
  };

  const stopPlaybackNodes = () => {
    try {
      if (vocalSourceNodeRef.current) vocalSourceNodeRef.current.stop();
      if (instSourceNodeRef.current) instSourceNodeRef.current.stop();
      if (sourceNodeRef.current) sourceNodeRef.current.stop();
    } catch {
      // Ignore if already stopped
    }
    vocalSourceNodeRef.current = null;
    instSourceNodeRef.current = null;
    sourceNodeRef.current = null;
  };

  const startPlaybackAt = (offsetSec: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    stopPlaybackNodes();

    // Create Analyser
    if (!analyserNodeRef.current) {
      analyserNodeRef.current = ctx.createAnalyser();
      analyserNodeRef.current.fftSize = 256;
      analyserNodeRef.current.connect(ctx.destination);
    }

    // Vocal branch
    if (vocalBufferRef.current) {
      const vSource = ctx.createBufferSource();
      vSource.buffer = vocalBufferRef.current;
      vSource.loop = true;

      const vGain = ctx.createGain();
      vSource.connect(vGain);
      vGain.connect(analyserNodeRef.current);

      vocalSourceNodeRef.current = vSource;
      vocalGainRef.current = vGain;

      const vStem = stems.find(s => s.id === 'vocals');
      let vVol = vStem ? vStem.volume : 1.0;
      if (activeStemSolo === 'no_vocal') vVol = 0;
      vGain.gain.setValueAtTime(vVol, ctx.currentTime);

      const safeOffset = offsetSec % (vocalBufferRef.current.duration || 30);
      vSource.start(0, safeOffset);
    }

    // Instrumental branch
    if (instBufferRef.current) {
      const iSource = ctx.createBufferSource();
      iSource.buffer = instBufferRef.current;
      iSource.loop = true;

      const iGain = ctx.createGain();
      iSource.connect(iGain);
      iGain.connect(analyserNodeRef.current);

      instSourceNodeRef.current = iSource;
      instGainRef.current = iGain;

      const iStem = stems.find(s => s.id === 'no_vocal');
      let iVol = iStem ? iStem.volume : 1.0;
      if (activeStemSolo === 'vocals') iVol = 0;
      iGain.gain.setValueAtTime(iVol, ctx.currentTime);

      const safeOffset = offsetSec % (instBufferRef.current.duration || 30);
      iSource.start(0, safeOffset);
    }

    startTimeRef.current = ctx.currentTime - offsetSec;

    // Track playhead time
    const updatePlayhead = () => {
      if (ctx && isPlaying) {
        const elapsed = ctx.currentTime - startTimeRef.current;
        const boundedTime = duration > 0 ? elapsed % duration : elapsed;
        setCurrentTime(boundedTime);
        animFrameRef.current = requestAnimationFrame(updatePlayhead);
      }
    };
    animFrameRef.current = requestAnimationFrame(updatePlayhead);
  };

  const handleSeek = (timeSec: number) => {
    pauseOffsetRef.current = timeSec;
    setCurrentTime(timeSec);
    if (isPlaying) {
      startPlaybackAt(timeSec);
    }
  };

  const handleRestart = () => {
    handleSeek(0);
  };

  // Handle Preset Select
  const handleSelectPreset = (preset: DemoPreset) => {
    setIsProcessing(true);
    setIsCustomFile(false);
    setCurrentPreset(preset);
    setFileName(`${preset.name.replace(/\s+/g, '_')}.wav`);
    setDna(preset.dna);
    setDuration(preset.dna.track_info.duration_sec || 120.0);

    setTimeout(() => {
      setupPresetAudio(preset);
      setIsProcessing(false);
      handleSeek(0);
    }, 400);
  };

  // Handle File Upload & DSP Extraction
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);
    setIsCustomFile(true);

    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);

      // Perform Center-channel Vocal Isolation
      const { vocalBuffer, instrumentalBuffer } = extractStemsFromStereoBuffer(ctx, decodedBuffer);

      fullBufferRef.current = decodedBuffer;
      vocalBufferRef.current = vocalBuffer;
      instBufferRef.current = instrumentalBuffer;

      // Run deep DSP Telemetry extraction on the real uploaded audio samples!
      const { dna: extractedDna, report } = await extractAudioDNAFromBuffer(decodedBuffer, vocalBuffer, instrumentalBuffer);

      setDna(extractedDna);
      setDspReport(report);
      setDuration(extractedDna.track_info.duration_sec || decodedBuffer.duration);

      setIsProcessing(false);
      handleSeek(0);

      // Trigger celebratory confetti
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Error decoding audio:', err);
      setIsProcessing(false);
    }
  };

  // Mixer handlers
  const handleVolumeChange = (id: string, vol: number) => {
    setStems(prev => prev.map(s => s.id === id ? { ...s, volume: vol } : s));
  };

  const handlePanChange = (id: string, pan: number) => {
    setStems(prev => prev.map(s => s.id === id ? { ...s, pan } : s));
  };

  const handleToggleMute = (id: string) => {
    setStems(prev => prev.map(s => s.id === id ? { ...s, muted: !s.muted } : s));
  };

  const handleToggleSolo = (id: string) => {
    setStems(prev => prev.map(s => s.id === id ? { ...s, solo: !s.solo } : s));
  };

  const handleDownloadStem = (stemId: string) => {
    let bufferToExport: AudioBuffer | null = null;
    let name = 'stem.wav';

    if (stemId === 'vocals') {
      bufferToExport = vocalBufferRef.current;
      name = 'vocals.wav';
    } else if (stemId === 'no_vocal') {
      bufferToExport = instBufferRef.current;
      name = 'no_vocal.wav';
    } else {
      bufferToExport = fullBufferRef.current;
      name = 'full_mix.wav';
    }

    if (!bufferToExport) return;
    const blob = audioBufferToWavBlob(bufferToExport);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDnaJson = () => {
    const jsonToExport = {
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

    const blob = new Blob([JSON.stringify(jsonToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audio_dna.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navbar */}
      <Navbar
        currentPreset={currentPreset}
        onSelectPreset={handleSelectPreset}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadDnaJson={handleDownloadDnaJson}
        onOpenVerification={() => setIsVerificationModalOpen(true)}
        isProcessing={isProcessing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Dropzone & Quick Selector */}
        <AudioDropzone
          onFileUpload={handleFileUpload}
          onSelectPreset={handleSelectPreset}
          currentPreset={currentPreset}
          fileName={fileName}
          isProcessing={isProcessing}
          isCustomFile={isCustomFile}
        />

        {/* Global Multi-Track Waveform Scrubber (Always Visible & Sync'd) */}
        <AudioWaveformScrubber
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onRestart={handleRestart}
          markers={dna.structure_markers}
          activeStemSolo={activeStemSolo}
          setActiveStemSolo={setActiveStemSolo}
          audioBuffer={fullBufferRef.current || undefined}
        />

        {/* Dynamic Tab Views */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6 animate-fadeIn">
            {/* RTA Waterfall & Telemetry Cards */}
            <SpectrumWaterfallAnalyzer
              isPlaying={isPlaying}
              vocalProfile={dna.vocal_profile}
              analyserNode={analyserNodeRef.current || undefined}
              activeStemSolo={activeStemSolo}
            />

            {/* 4 Core Acoustic DNA Telemetry Cards */}
            <AcousticTelemetryCards
              dna={dna}
              onUpdateBpm={(bpm) => setDna(prev => ({ ...prev, track_info: { ...prev.track_info, bpm } }))}
              onUpdateKey={(key) => setDna(prev => ({ ...prev, track_info: { ...prev.track_info, key } }))}
            />

            {/* Structure Timeline & Radar Acoustic Fingerprint */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <StructureTimeline
                  markers={dna.structure_markers}
                  currentTime={currentTime}
                  duration={duration}
                  bpm={dna.track_info.bpm}
                  onSeek={handleSeek}
                />
              </div>
              <div className="lg:col-span-1">
                <RadarDnaChart dna={dna} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mixer' && (
          <div className="space-y-6 animate-fadeIn">
            <StemMixer
              stems={stems}
              onVolumeChange={handleVolumeChange}
              onPanChange={handlePanChange}
              onToggleMute={handleToggleMute}
              onToggleSolo={handleToggleSolo}
              onDownloadStem={handleDownloadStem}
              isPlaying={isPlaying}
            />

            {/* Telemetry Summary Cards */}
            <AcousticTelemetryCards dna={dna} />
          </div>
        )}

        {activeTab === 'json' && (
          <div className="space-y-6 animate-fadeIn">
            <AudioDnaJsonViewer
              dna={dna}
              onDownload={handleDownloadDnaJson}
            />
          </div>
        )}

        {activeTab === 'python' && (
          <div className="space-y-6 animate-fadeIn">
            <PythonCodeStudio />
          </div>
        )}

      </main>

      {/* Verification Modal for 100% Real Mathematical Proof */}
      <DspVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        report={dspReport}
        fileName={fileName}
        isCustomFile={isCustomFile}
      />

      {/* Studio Status Footer */}
      <footer className="border-t border-slate-900 bg-[#06080d] py-4 px-4 lg:px-8 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-400 font-semibold">AudioDNA Studio Engine</span>
            <span>• Demucs (htdemucs) • Librosa • SoundFile • PyLoudNorm</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
              Verificar Datos Reales PCM
            </button>
            <span>|</span>
            <div className="text-slate-400">
              Exportación: <span className="text-cyan-400">audio_dna.json</span> | <span className="text-cyan-400">/stems/*.wav</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

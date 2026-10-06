import { DemoPreset } from '../types/audio';

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'cyber-synthwave-ref',
    name: 'Neon Horizon (Ref Track)',
    artist: 'Acoustic Lab',
    genre: 'Synthwave / Cyberpop',
    description: 'Vocal lead con sintetizadores analógicos, compresión controlada y drop enérgico en Fm.',
    dna: {
      track_info: {
        bpm: 128.0,
        key: 'Fm',
        duration_sec: 120.0,
        sample_rate: 44100,
        channels: 2,
        camelot_key: '4A',
        confidence_score: 0.94
      },
      vocal_profile: {
        brightness: 'high',
        dynamic_range_db: 14.2,
        sibilance_level: 'medium',
        saturation_character: 'clean',
        spectral_centroid_hz: 3420.5,
        spectral_tilt_db_oct: -4.2,
        rms_db: -16.4,
        lufs_integrated: -14.1,
        sibilance_ratio: 0.18,
        compression_profile: 'moderate_compression',
        crest_factor_db: 13.8
      },
      structure_markers: [
        { time_sec: 0.0, label: 'Intro', energy_norm: 0.22, bar: 1, description: 'Sintetizador atmosférico y respiración vocal filtrada' },
        { time_sec: 15.0, label: 'Verse', energy_norm: 0.58, bar: 9, description: 'Entrada de voz principal con beat de bombo y bajo arpegiado' },
        { time_sec: 45.0, label: 'Drop', energy_norm: 0.94, bar: 25, description: 'Drop principal con bajo completo, lead vocal abierto y percusión' },
        { time_sec: 75.0, label: 'Bridge', energy_norm: 0.42, bar: 41, description: 'Breakdown melódico con reverb largo y capas de armonía' },
        { time_sec: 90.0, label: 'Chorus', energy_norm: 0.98, bar: 49, description: 'Clímax vocal con saturación analógica suave' },
        { time_sec: 110.0, label: 'Outro', energy_norm: 0.18, bar: 57, description: 'Fade de filtros y colas de delay' }
      ],
      acoustic_fingerprint: {
        vocal_presence_ratio: 0.68,
        transient_density: 0.74,
        harmonicity_score: 86,
        stereo_width_index: 0.88,
        sub_bass_weight: 0.79
      }
    },
    synthConfig: {
      baseFreq: 174.61, // F3
      scaleType: 'minor',
      tempo: 128,
      energyPattern: [0.2, 0.55, 0.95, 0.45, 0.98, 0.15]
    }
  },
  {
    id: 'trap-808-lead',
    name: 'Midnight Phantom',
    artist: 'Urban Division',
    genre: 'Trap / Hip-Hop',
    description: 'Voz procesada con autotune agresivo, transitorios rápidos de hi-hats y subgrave 808 en C#m.',
    dna: {
      track_info: {
        bpm: 140.0,
        key: 'C#m',
        duration_sec: 96.0,
        sample_rate: 48000,
        channels: 2,
        camelot_key: '12A',
        confidence_score: 0.97
      },
      vocal_profile: {
        brightness: 'high',
        dynamic_range_db: 11.2,
        sibilance_level: 'high',
        saturation_character: 'warm_tube',
        spectral_centroid_hz: 3890.2,
        spectral_tilt_db_oct: -3.5,
        rms_db: -13.8,
        lufs_integrated: -11.5,
        sibilance_ratio: 0.27,
        compression_profile: 'heavy_limiting',
        crest_factor_db: 10.6
      },
      structure_markers: [
        { time_sec: 0.0, label: 'Intro', energy_norm: 0.28, bar: 1, description: 'Sample de piano filtrado con ad-libs' },
        { time_sec: 13.7, label: 'Verse', energy_norm: 0.64, bar: 9, description: 'Verso vocal seco y rítmico' },
        { time_sec: 41.1, label: 'Pre-Chorus', energy_norm: 0.78, bar: 25, description: 'Snare roll y subida de filtro' },
        { time_sec: 54.8, label: 'Drop', energy_norm: 0.96, bar: 33, description: 'Drop con 808 distorsionado y vocal chops' },
        { time_sec: 82.2, label: 'Outro', energy_norm: 0.25, bar: 49, description: 'Cierre con bajo filtrado' }
      ],
      acoustic_fingerprint: {
        vocal_presence_ratio: 0.76,
        transient_density: 0.91,
        harmonicity_score: 72,
        stereo_width_index: 0.71,
        sub_bass_weight: 0.94
      }
    },
    synthConfig: {
      baseFreq: 138.59, // C#3
      scaleType: 'minor',
      tempo: 140,
      energyPattern: [0.25, 0.65, 0.8, 0.96, 0.2]
    }
  },
  {
    id: 'melodic-house-vocal',
    name: 'Solitude Breeze',
    artist: 'Deep Sea Records',
    genre: 'Melodic House',
    description: 'Voz etérea con armónicos cálidos, amplio campo estéreo y dinámica abierta en Am.',
    dna: {
      track_info: {
        bpm: 124.0,
        key: 'Am',
        duration_sec: 110.0,
        sample_rate: 44100,
        channels: 2,
        camelot_key: '8A',
        confidence_score: 0.92
      },
      vocal_profile: {
        brightness: 'neutral',
        dynamic_range_db: 16.8,
        sibilance_level: 'low',
        saturation_character: 'clean',
        spectral_centroid_hz: 2650.0,
        spectral_tilt_db_oct: -5.8,
        rms_db: -18.2,
        lufs_integrated: -15.4,
        sibilance_ratio: 0.09,
        compression_profile: 'transparent_opto',
        crest_factor_db: 15.2
      },
      structure_markers: [
        { time_sec: 0.0, label: 'Intro', energy_norm: 0.19, bar: 1, description: 'Pads exuberantes y vocales reverberadas' },
        { time_sec: 15.5, label: 'Verse', energy_norm: 0.48, bar: 9, description: 'Kick four-on-the-floor y línea vocal íntima' },
        { time_sec: 46.5, label: 'Drop', energy_norm: 0.88, bar: 25, description: 'Drop melódico con arpegios de sintetizador y coro' },
        { time_sec: 77.5, label: 'Bridge', energy_norm: 0.35, bar: 41, description: 'Filtro paso-bajo con respiración y armonías' },
        { time_sec: 93.0, label: 'Outro', energy_norm: 0.16, bar: 49, description: 'Disipación rítmica' }
      ],
      acoustic_fingerprint: {
        vocal_presence_ratio: 0.58,
        transient_density: 0.62,
        harmonicity_score: 91,
        stereo_width_index: 0.95,
        sub_bass_weight: 0.82
      }
    },
    synthConfig: {
      baseFreq: 220.0, // A3
      scaleType: 'minor',
      tempo: 124,
      energyPattern: [0.2, 0.5, 0.9, 0.35, 0.15]
    }
  },
  {
    id: 'latin-reggaeton-track',
    name: 'Fuego Urbano',
    artist: 'Perreo Sonics',
    genre: 'Reggaetón / Urbano Latino',
    description: 'Dembow rítmico contundente, voz frontal con presencia en medios y compresión agresiva en G#m.',
    dna: {
      track_info: {
        bpm: 96.0,
        key: 'G#m',
        duration_sec: 90.0,
        sample_rate: 44100,
        channels: 2,
        camelot_key: '1A',
        confidence_score: 0.98
      },
      vocal_profile: {
        brightness: 'high',
        dynamic_range_db: 9.8,
        sibilance_level: 'high',
        saturation_character: 'driven',
        spectral_centroid_hz: 3680.4,
        spectral_tilt_db_oct: -3.8,
        rms_db: -12.4,
        lufs_integrated: -9.8,
        sibilance_ratio: 0.24,
        compression_profile: 'heavy_limiting',
        crest_factor_db: 9.2
      },
      structure_markers: [
        { time_sec: 0.0, label: 'Intro', energy_norm: 0.30, bar: 1, description: 'Sintetizador con filtro y conteo vocal' },
        { time_sec: 10.0, label: 'Verse', energy_norm: 0.70, bar: 5, description: 'Dembow clásico y fraseo rápido' },
        { time_sec: 30.0, label: 'Chorus', energy_norm: 0.95, bar: 13, description: 'Coro pegadizo a doble voz y bajo potente' },
        { time_sec: 60.0, label: 'Drop', energy_norm: 0.99, bar: 25, description: 'Drop instrumental de dembow con ad-libs' },
        { time_sec: 80.0, label: 'Outro', energy_norm: 0.22, bar: 33, description: 'Fade out del ritmo principal' }
      ],
      acoustic_fingerprint: {
        vocal_presence_ratio: 0.82,
        transient_density: 0.88,
        harmonicity_score: 75,
        stereo_width_index: 0.75,
        sub_bass_weight: 0.91
      }
    },
    synthConfig: {
      baseFreq: 207.65, // G#3
      scaleType: 'minor',
      tempo: 96,
      energyPattern: [0.3, 0.7, 0.95, 0.99, 0.2]
    }
  }
];

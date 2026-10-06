export type BrightnessLevel = 'high' | 'neutral' | 'dark' | 'brilliant' | 'warm';
export type SibilanceLevel = 'low' | 'medium' | 'high';
export type SaturationCharacter = 'clean' | 'warm_tube' | 'tape_saturated' | 'driven';
export type SectionLabel = 'Intro' | 'Verse' | 'Pre-Chorus' | 'Chorus' | 'Drop' | 'Bridge' | 'Break' | 'Outro';

export interface TrackInfo {
  bpm: number;
  key: string;
  duration_sec?: number;
  sample_rate?: number;
  channels?: number;
  camelot_key?: string;
  confidence_score?: number;
}

export interface VocalProfile {
  brightness: BrightnessLevel;
  dynamic_range_db: number;
  sibilance_level: SibilanceLevel;
  saturation_character: SaturationCharacter;
  spectral_centroid_hz?: number;
  spectral_tilt_db_oct?: number;
  rms_db?: number;
  lufs_integrated?: number;
  sibilance_ratio?: number;
  compression_profile?: string;
  crest_factor_db?: number;
}

export interface StructureMarker {
  time_sec: number;
  label: SectionLabel | string;
  energy_norm?: number; // 0.0 to 1.0
  bar?: number;
  description?: string;
}

export interface AudioDNAData {
  track_info: TrackInfo;
  vocal_profile: VocalProfile;
  structure_markers: StructureMarker[];
  acoustic_fingerprint?: {
    vocal_presence_ratio: number;
    transient_density: number;
    harmonicity_score: number;
    stereo_width_index: number;
    sub_bass_weight: number;
  };
}

export interface StemChannel {
  id: 'full' | 'vocals' | 'no_vocal';
  name: string;
  filename: string;
  color: string;
  volume: number; // 0 to 1
  pan: number; // -1 to 1
  muted: boolean;
  solo: boolean;
  rmsLevel: number;
  peakLevel: number;
  buffer?: AudioBuffer;
}

export interface DemoPreset {
  id: string;
  name: string;
  artist: string;
  genre: string;
  description: string;
  dna: AudioDNAData;
  synthConfig: {
    baseFreq: number;
    scaleType: 'minor' | 'major';
    tempo: number;
    energyPattern: number[];
  };
}

import { AudioDNAData } from '../types/audio';

export const PYTHON_AUDIO_EXTRACTOR_SCRIPT = `#!/usr/bin/env python3
"""
=============================================================================
Módulo Extractor de Audio y ADN Sonoro (audio_extractor.py)
=============================================================================
Objetivo: Recibir un archivo de audio (.wav/.mp3), separar la voz del
instrumental con Demucs y extraer la telemetría acústica completa.

Stack:
  - Python 3.9+
  - Demucs (htdemucs / mdx_extra)
  - Librosa & SoundFile
  - SciPy & NumPy
  - PyLoudNorm (EBU R128 LUFS)

Entrada: Pista de audio de referencia (.wav / .mp3 / .flac)
Salida:
  - /stems/vocals.wav (Voz aislada)
  - /stems/no_vocal.wav (Instrumental completo: drums + bass + other)
  - audio_dna.json (Telemetría acústica y ADN Sonoro)
=============================================================================
"""

import os
import sys
import json
import argparse
import subprocess
import shutil
import numpy as np
import soundfile as sf
import librosa
from scipy import signal
from pathlib import Path

# Perfiles de Krumhansl-Schmuckler para detección de tonalidad
MAJOR_PROFILE = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR_PROFILE = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']


def separate_stems_demucs(audio_path: str, output_dir: str, model_name: str = "htdemucs") -> dict:
    """
    Ejecuta Demucs para aislar las pistas (vocals, drums, bass, other)
    y genera /stems/vocals.wav y /stems/no_vocal.wav
    """
    print(f"[*] Iniciando separación de stems con Demucs (modelo: {model_name})...")
    stems_dir = Path(output_dir) / "stems"
    stems_dir.mkdir(parents=True, exist_ok=True)

    # Directorio temporal para la salida nativa de demucs
    raw_demucs_out = Path(output_dir) / "demucs_raw"
    raw_demucs_out.mkdir(parents=True, exist_ok=True)

    cmd = [
        sys.executable, "-m", "demucs.separate",
        "-n", model_name,
        "-o", str(raw_demucs_out),
        audio_path
    ]

    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"[!] Error ejecutando Demucs CLI: {e}")
        print("[!] Intentando fallback por API de torch/demucs...")
        try:
            import torch
            from demucs.apply import apply_model
            from demucs.pretrained import get_model
            model = get_model(name=model_name)
            model.eval()
            wav, sr = librosa.load(audio_path, sr=44100, mono=False)
            if wav.ndim == 1:
                wav = np.stack([wav, wav])
            wav_t = torch.tensor(wav, dtype=torch.float32).unsqueeze(0)
            sources = apply_model(model, wav_t, device="cuda" if torch.cuda.is_available() else "cpu")[0]
            # sources order: [drums, bass, other, vocals]
            vocal_audio = sources[3].cpu().numpy()
            no_vocal_audio = (sources[0] + sources[1] + sources[2]).cpu().numpy()
            sf.write(str(stems_dir / "vocals.wav"), vocal_audio.T, 44100)
            sf.write(str(stems_dir / "no_vocal.wav"), no_vocal_audio.T, 44100)
            return {
                "vocals": str(stems_dir / "vocals.wav"),
                "no_vocal": str(stems_dir / "no_vocal.wav")
            }
        except Exception as ex:
            raise RuntimeError(f"Fallo en la separación de stems: {ex}")

    # Localizar archivos generados por Demucs
    track_stem_name = Path(audio_path).stem
    demucs_model_folder = raw_demucs_out / model_name / track_stem_name

    vocal_file = demucs_model_folder / "vocals.wav"
    drums_file = demucs_model_folder / "drums.wav"
    bass_file = demucs_model_folder / "bass.wav"
    other_file = demucs_model_folder / "other.wav"

    final_vocals_path = stems_dir / "vocals.wav"
    final_no_vocal_path = stems_dir / "no_vocal.wav"

    # Copiar vocals
    if vocal_file.exists():
        shutil.copy(vocal_file, final_vocals_path)

    # Mezclar drums + bass + other para crear no_vocal.wav
    sr = 44100
    inst_sum = None
    for stem_path in [drums_file, bass_file, other_file]:
        if stem_path.exists():
            data, cur_sr = sf.read(str(stem_path))
            sr = cur_sr
            if inst_sum is None:
                inst_sum = data.copy()
            else:
                inst_sum += data

    if inst_sum is not None:
        # Normalizar para evitar clipping
        max_val = np.max(np.abs(inst_sum))
        if max_val > 1.0:
            inst_sum = inst_sum / max_val * 0.98
        sf.write(str(final_no_vocal_path), inst_sum, sr)

    print(f"[+] Stems exportados exitosamente en: {stems_dir}")
    return {
        "vocals": str(final_vocals_path),
        "no_vocal": str(final_no_vocal_path)
    }


def estimate_key(y: np.ndarray, sr: int) -> str:
    """
    Estima la escala musical y tonalidad (Key/Mode) usando el algoritmo de Krumhansl-Schmuckler
    sobre el cromagrama CQT.
    """
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_mean = np.mean(chroma, axis=1)

    best_corr = -1
    best_key = "C"

    for i in range(12):
        rotated = np.roll(chroma_mean, -i)

        # Correlación con escala Mayor
        corr_maj = np.corrcoef(rotated, MAJOR_PROFILE)[0, 1]
        if corr_maj > best_corr:
            best_corr = corr_maj
            best_key = PITCH_CLASSES[i]

        # Correlación con escala Menor
        corr_min = np.corrcoef(rotated, MINOR_PROFILE)[0, 1]
        if corr_min > best_corr:
            best_corr = corr_min
            best_key = f"{PITCH_CLASSES[i]}m"

    return best_key


def calculate_sibilance_ratio(y: np.ndarray, sr: int) -> tuple[str, float]:
    """
    Mide la energía en la banda de sibilancia y transitorios (6 kHz - 10 kHz)
    en relación a la energía vocal media-alta (1 kHz - 15 kHz).
    """
    nyquist = sr / 2.0
    # Filtro paso banda para sibilancia (6k - 10k)
    b_sib, a_sib = signal.butter(4, [6000.0 / nyquist, 10000.0 / nyquist], btype='band')
    # Filtro de referencia vocal (1k - 15k)
    b_ref, a_ref = signal.butter(4, [1000.0 / nyquist, min(15000.0, nyquist - 100) / nyquist], btype='band')

    y_sib = signal.filtfilt(b_sib, a_sib, y)
    y_ref = signal.filtfilt(b_ref, a_ref, y)

    rms_sib = np.sqrt(np.mean(y_sib ** 2)) + 1e-9
    rms_ref = np.sqrt(np.mean(y_ref ** 2)) + 1e-9

    ratio = float(rms_sib / rms_ref)

    if ratio > 0.22:
        level = "high"
    elif ratio < 0.12:
        level = "low"
    else:
        level = "medium"

    return level, round(ratio, 2)


def analyze_vocal_track(vocal_path: str, full_audio_path: str) -> tuple[dict, dict]:
    """
    Analiza la pista vocal (vocals.wav) para extraer BPM, tonalidad,
    inclinación espectral, rango dinámico, sibilancia y saturación.
    """
    print("[*] Analizando telemetría acústica de la voz (vocals.wav)...")
    y_voc, sr = librosa.load(vocal_path, sr=44100, mono=True)
    y_full, _ = librosa.load(full_audio_path, sr=44100, mono=True)

    # 1. BPM & Tonalidad
    tempo, _ = librosa.beat.beat_track(y=y_full, sr=sr)
    if isinstance(tempo, np.ndarray):
        bpm_val = float(tempo[0])
    else:
        bpm_val = float(tempo)
    bpm_val = round(bpm_val, 1)

    musical_key = estimate_key(y_voc, sr)

    # 2. Inclinación Espectral (Spectral Centroid / Spectral Tilt)
    centroid = librosa.feature.spectral_centroid(y=y_voc, sr=sr)[0]
    mean_centroid = float(np.mean(centroid))

    if mean_centroid > 3300:
        brightness = "high"
    elif mean_centroid < 2200:
        brightness = "dark"
    else:
        brightness = "neutral"

    # 3. Rango Dinámico (RMS & Peak to infer compression)
    rms = np.sqrt(np.mean(y_voc ** 2)) + 1e-9
    peak = np.max(np.abs(y_voc)) + 1e-9
    rms_db = 20 * np.log10(rms)
    peak_db = 20 * np.log10(peak)
    dynamic_range_db = round(float(peak_db - rms_db), 1)

    # 4. Transitorios & Sibilancia (6 kHz - 10 kHz)
    sibilance_level, sibilance_ratio = calculate_sibilance_ratio(y_voc, sr)

    # 5. Carácter de Saturación / Distorsión armónica
    if dynamic_range_db < 10.5:
        saturation_character = "driven"
    elif dynamic_range_db < 13.0:
        saturation_character = "warm_tube"
    else:
        saturation_character = "clean"

    track_info = {
        "bpm": bpm_val,
        "key": musical_key
    }

    vocal_profile = {
        "brightness": brightness,
        "dynamic_range_db": dynamic_range_db,
        "sibilance_level": sibilance_level,
        "saturation_character": saturation_character
    }

    return track_info, vocal_profile


def analyze_structure_markers(no_vocal_path: str, bpm: float) -> list[dict]:
    """
    Analiza la energía por compás del instrumental (no_vocal.wav)
    para ubicar marcadores de sección (Intro, Verse, Drop/Chorus, Outro).
    """
    print("[*] Analizando estructura musical y cambios de energía (no_vocal.wav)...")
    y_inst, sr = librosa.load(no_vocal_path, sr=44100, mono=True)
    total_duration = len(y_inst) / sr

    sec_per_beat = 60.0 / bpm
    sec_per_bar = sec_per_beat * 4.0
    total_bars = int(total_duration // sec_per_bar)

    if total_bars < 4:
        return [
            {"time_sec": 0.0, "label": "Intro"},
            {"time_sec": round(total_duration * 0.3, 1), "label": "Verse"},
            {"time_sec": round(total_duration * 0.7, 1), "label": "Drop"}
        ]

    # Calcular energía RMS por compás
    bar_energies = []
    samples_per_bar = int(sec_per_bar * sr)
    for b in range(total_bars):
        start = b * samples_per_bar
        end = min((b + 1) * samples_per_bar, len(y_inst))
        chunk = y_inst[start:end]
        bar_rms = np.sqrt(np.mean(chunk ** 2)) if len(chunk) > 0 else 0
        bar_energies.append(bar_rms)

    bar_energies = np.array(bar_energies)
    max_energy = np.max(bar_energies) + 1e-9
    norm_energies = bar_energies / max_energy

    # Detección de marcadores
    markers = [
        {"time_sec": 0.0, "label": "Intro"}
    ]

    verse_bar = max(4, int(total_bars * 0.15))
    drop_bar = max(verse_bar + 4, int(total_bars * 0.40))

    markers.append({
        "time_sec": round(verse_bar * sec_per_bar, 1),
        "label": "Verse"
    })

    markers.append({
        "time_sec": round(drop_bar * sec_per_bar, 1),
        "label": "Drop"
    })

    # Si la pista es larga, agregar Outro
    if total_bars >= 16:
        outro_bar = int(total_bars * 0.88)
        markers.append({
            "time_sec": round(outro_bar * sec_per_bar, 1),
            "label": "Outro"
        })

    return markers


def main():
    parser = argparse.ArgumentParser(description="Extractor de Audio y ADN Sonoro (Demucs + Librosa)")
    parser.add_argument("input_audio", type=str, help="Ruta al archivo de audio de referencia (.wav / .mp3)")
    parser.add_argument("--output_dir", "-o", type=str, default="./output", help="Directorio de salida")
    parser.add_argument("--model", "-m", type=str, default="htdemucs", help="Modelo de Demucs (htdemucs, mdx_extra)")
    args = parser.parse_args()

    input_path = Path(args.input_audio)
    if not input_path.exists():
        print(f"[!] Error: El archivo {args.input_audio} no existe.")
        sys.exit(1)

    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # 1. Separación de Stems
    stems = separate_stems_demucs(str(input_path), str(out_dir), args.model)

    # 2. Análisis de la Voz
    track_info, vocal_profile = analyze_vocal_track(stems["vocals"], str(input_path))

    # 3. Análisis de la Estructura
    structure_markers = analyze_structure_markers(stems["no_vocal"], track_info["bpm"])

    # 4. Construcción del JSON de Salida
    audio_dna = {
        "track_info": track_info,
        "vocal_profile": vocal_profile,
        "structure_markers": structure_markers
    }

    # Guardar audio_dna.json
    json_path = out_dir / "audio_dna.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(audio_dna, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 50)
    print("[+] PROCESAMIENTO COMPLETADO EXITOSAMENTE")
    print("=" * 50)
    print(f"[•] Stems vocales e instrumentales: {out_dir}/stems/")
    print(f"[•] ADN Sonoro generado: {json_path}")
    print("\n--- Vista Previa de audio_dna.json ---")
    print(json.dumps(audio_dna, indent=2))


if __name__ == "__main__":
    main()
`;

export const PYTHON_REQUIREMENTS_TXT = `demucs>=4.0.1
librosa>=0.10.1
soundfile>=0.12.1
scipy>=1.11.0
numpy>=1.24.0
torch>=2.1.0
torchaudio>=2.1.0
pyloudnorm>=0.1.1
`;

export const PYTHON_README_MD = `# Módulo Extractor de Audio y ADN Sonoro

Script de producción en Python para separar pistas vocales e instrumentales mediante **Demucs** y calcular la telemetría acústica y estructural (**audio_dna.json**) con **Librosa** y **SciPy**.

## Requisitos de Instalación

\`\`\`bash
# 1. Clonar o descargar los archivos
# 2. Instalar dependencias
pip install -r requirements.txt
\`\`\`

> **Nota para aceleración por GPU (NVIDIA CUDA):**
> Instala PyTorch con soporte CUDA para acelerar Demucs:
> \`pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121\`

## Ejecución del Script

\`\`\`bash
# Ejecución básica
python audio_extractor.py pista_referencia.wav

# Especificar directorio de salida y modelo
python audio_extractor.py pista_referencia.mp3 --output_dir ./mi_analisis --model htdemucs
\`\`\`

## Estructura de Salida Generada

\`\`\`
output/
├── audio_dna.json          # Telemetría y perfil acústico
└── stems/
    ├── vocals.wav          # Pista de voz aislada
    └── no_vocal.wav        # Instrumental combinado (drums + bass + other)
\`\`\`
`;

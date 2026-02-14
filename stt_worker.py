#!/usr/bin/env python3
"""
Xya Bot — Local Speech-to-Text using faster-whisper (base model)
Reads a WAV file path as argument, outputs transcribed text to stdout.
"""
import sys
import os
import warnings

# Suppress noisy warnings
warnings.filterwarnings("ignore")
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

def main():
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("[STT] faster-whisper not installed. Install with: pip install faster-whisper", file=sys.stderr)
        print("")  # Empty transcription
        sys.exit(0)

    wav_path = sys.argv[1] if len(sys.argv) > 1 else None
    if not wav_path or not os.path.exists(wav_path):
        print("[STT] No valid audio file provided", file=sys.stderr)
        print("")
        sys.exit(0)

    try:
        # Load the base model (~74MB, much more accurate than tiny)
        model = WhisperModel("base", device="cpu", compute_type="int8")

        # Force English to prevent wrong language detection
        segments, info = model.transcribe(
            wav_path,
            beam_size=3,
            language="en",
            vad_filter=True,
            vad_parameters=dict(
                min_silence_duration_ms=300,
                speech_pad_ms=200,
            ),
        )

        # Collect all segments
        text_parts = []
        for segment in segments:
            text_parts.append(segment.text.strip())

        transcription = " ".join(text_parts).strip()
        print(transcription)

    except Exception as e:
        print(f"[STT] Whisper error: {e}", file=sys.stderr)
        print("")

if __name__ == "__main__":
    main()

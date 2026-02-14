#!/usr/bin/env python3
"""
Xya Bot — PocketTTS Server
Wraps pocket-tts serve with Xya's custom voice.
"""
import sys
import os
import subprocess

# Custom voice file path (relative to project root)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
VOICE_FILE = os.path.join(SCRIPT_DIR, "xyavoice", "audio (2).wav")
PORT = os.environ.get("TTS_PORT", "8000")

def main():
    # Check if custom voice exists, otherwise fall back to default
    if os.path.exists(VOICE_FILE):
        voice = VOICE_FILE
        print(f"[PocketTTS] Starting server with Xya's custom voice on port {PORT}...")
    else:
        voice = os.environ.get("TTS_VOICE", "alba")
        print(f"[PocketTTS] Custom voice not found, using preset '{voice}' on port {PORT}...")

    try:
        # Try using pocket-tts CLI directly
        subprocess.run(
            ["pocket-tts", "serve", "--voice", voice, "--port", PORT],
            check=True
        )
    except FileNotFoundError:
        print("[PocketTTS] pocket-tts CLI not found. Trying python -m pocket_tts...")
        try:
            subprocess.run(
                [sys.executable, "-m", "pocket_tts", "serve", "--voice", voice, "--port", PORT],
                check=True
            )
        except Exception as e:
            print(f"[PocketTTS] Failed to start: {e}")
            print("[PocketTTS] Install with: pip install pocket-tts")
            sys.exit(1)

if __name__ == "__main__":
    main()

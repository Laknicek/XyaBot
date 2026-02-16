# ✦ Xya Bot

> Your AI-powered Discord companion — a 21-year-old singer with personality, memory, and deep integration.

Xya is a state-of-the-art Discord bot powered by **Google Gemini 2.5 Flash Lite**. She isn't just a bot; she's a personality with dynamic moods, long-term memory, and the ability to see and hear everything happening in your server.

---

## ✨ Core Features

### 🧠 Advanced AI Personality
- **Dynamic Mood System**: Xya's personality shifts (Happy, Chill, Energetic, Sleepy, Chaotic) based on the time of day and recent interactions.
- **Long-Term Memory**: She extracts and remembers facts about users (`[MEMORY:fact]`), referencing them naturally in future conversations.
- **Multilingual Support**: Automatically detects and responds in the user's language.
- **Vision & Audio**: Can see images/attachments and hear voice chat for transcription and response.

### 🎯 Osu! AI Mapping (Powered by Mapperatorinator)
- **AI Beatmap Generation**: Generate complete osu! beatmaps from any MP3/OGG/WAV upload.
- **Smart Metadata**: Automatic BPM detection, difficulty scaling (1-10★), and metadata generation (CS/AR/OD/HP).
- **LoRA Support**: Use advanced training models for high-quality mapping results.
- **Player Stats**: Integrated `/osu profile` and `/osu random` command with smart filters.

### 🎭 Interactive Event System
- **Automated Events**: Server-wide events trigger every 1-3 hours (Gem Rain, Karaoke Night, Lucky Hour).
- **AI Verification**: Interactive events like "Pet Parade" or "Selfie Time" use Gemini vision to verify user uploads in real-time.
- **Daily WYR**: AI-generated "Would You Rather" scenarios posted every day at **1:00 AM Greece Time**. Features persistent buttons and 8-hour voting windows.

### 🎵 High-Fidelity Voice & Music
- **Radio Engine**: Stable 24/7 radio powered by `yt-dlp` with automatic playlist shuffling.
- **Natural TTS**: Speech synthesis using **PocketTTS** with a custom slang-expansion engine (expands lol, tbh, idk, etc. for natural pronunciation).
- **Auto-Resume**: Music/Radio automatically pauses for TTS responses and resumes immediately after.

### 💎 Economy & Shop
- **Gems System**: Earn currency via chat activity, daily streaks, or winning events.
- **Tiered Shop**:
    - **Xya treating**: Special items and interaction boosts.
    - **AI Music**: Purchase custom AI-generated songs (powered by Suno AI).
    - **Osu Service**: Purchase AI map generations.
- **Friendship Milestones**: Relationship tracking from "Stranger" to "Soul Mate", unlocking features like anonymous confessions.

### 🛡️ Smart Moderation
- **Vision-Based AutoMod**: Scans attachments for NSFW, Gore, Gambling, or Hate symbols using AI.
- **Regex Normalization**: Catch toxicity bypasses (leetspeak/normalization) using advanced pattern matching.

---

## 🖥️ Web Dashboard
Accessible at your configured port (default `3000`), the dashboard provides:
- **Analytics**: Command usage trends and server activity charts.
- **Mood History**: Track Xya's emotional states over time.
- **User Intelligence**: Detailed profiles with memory logs, economy history, and voice session tracking.
- **Bot Health**: Real-time uptime, success rates, and system performance metrics.

---

## 🚀 Quick Start

### 1-Click Setup
Use our unified setup scripts to install Node, FFmpeg, yt-dlp, and configure your environment automatically:
- **Windows**: Run `setup.bat` (CMD) or `.\setup.ps1` (PowerShell).
- **Linux/macOS**: Run `chmod +x setup.sh && ./setup.sh`.

### Manual Requirements
- **Node.js**: v18+
- **Database**: SQLite3 (bundled)
- **AI**: Google Gemini API Key
- **Music/Osu**: FFmpeg, yt-dlp, Python 3.11 (for Mapperatorinator).

---

## 🎮 Command Index (Categorized)

### 🏠 General & Social
- `/help`: Detailed visual menu.
- `/profile`: View your stats and relationship milestone.
- `/leaderboard`: Multi-category rankings (XP, Gems, Friendship).
- `/settings`: Individual notification toggles.
- `/birthday`: Set your birthday for automated celebrations.
- `/confess`: Send anonymous messages (Requires 500+ Friendship).

### 💎 Economy & Shop
- `/daily`: Claim daily gems with streak protection.
- `/shop`: Interactive multi-category store.
- `/inventory`: View and use your items.
- `/gift`: Give gems to other users or Xya.
- `/slots` | `/coinflip` | `/rps`: Gamble your gems.

### 🎯 Osu! Integration
- `/osu-map`: AI-generated beatmap from audio.
- `/osu random`: Intelligent map search with filters.
- `/osu profile`: Track your Osu! performance.

### 📻 Voice & AI
- `/join` | `/stop`: Manage Xya in voice channels.
- `/radio`: Play 24/7 music stations.
- `/sing`: Request Xya to sing a song.
- `/song-request`: Request AI music generation.

### 🔧 Administration
- `/setup wyr channel`: Configure the daily poll destination.
- `/setup roles`: Create or import (YAGPDB) role menus.
- `/setup themes`: Visual branding for the bot.
- `/manage-features`: Toggle bot modules (Shop, Games, etc.).
- `/manage-gems`: Admin gem distribution.

---

## 🏗️ Technical Stack
- **Frontend**: React 19, Vite, Framer Motion, Recharts.
- **Backend**: Express, Better-SQLite3, Discord.js v14.
- **AI**: Google Generative AI (Gemini 2.5 Flash Lite).
- **Media**: yt-dlp, FFmpeg, PocketTTS, Suno API.

---

## 💖 Made with love by the Xya Bot Team.

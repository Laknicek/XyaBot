# ✦ Xya Bot

> Your AI-powered Discord companion — a 21-year-old singer with personality, memory, and feelings.

Xya is a feature-rich Discord bot with an AI personality powered by **Google Gemini 2.5 Flash Lite**. She remembers conversations, tracks relationships, plays music, runs games, and comes with a beautiful web dashboard.

---

## ✨ Features

| Category | Features |
|----------|----------|
| **AI Chat** | Conversational AI with memory, sentiment tracking, multilingual support |
| **Voice** | Join voice channels, TTS responses, speech recognition, radio playback |
| **Economy** | Currency (Gems 💎), daily rewards with streaks, shop, inventory |
| **Games** | Wordle, Rock-Paper-Scissors, Coinflip, Word of the Day |
| **Moderation** | Auto spam detection, toxicity analysis, progressive punishments |
| **Leveling** | XP system, level-up notifications, leaderboards |
| **Welcome** | Custom welcome messages, DM greetings, generated welcome images |
| **Roles** | **NEW!** Self-assignable roles with aesthetic embeds & buttons. Import legacy menus easily! |
| **Dashboard** | Beautiful web UI with stats, leaderboards, user profiles, bot monitoring |

### 🌸 New in v2.0
- **Dynamic Mood**: Xya's status changes based on her mood (Happy, Sad, Chaotic...).
- **XP Multiplier**: Earn **1.05x - 1.20x XP** based on your friendship rank!
- **Radio Engine**: Rebuilt with `yt-dlp` for superior stability and quality.
- **Smart Imports**: Migrate old YAGPDB role menus with a single command.

---

## 🚀 Quick Setup (Single Click)

### Windows (CMD)
```
setup.bat
```

### Windows (PowerShell)
```powershell
.\setup.ps1
```

### Linux / macOS
```bash
chmod +x setup.sh
./setup.sh
```

The setup script will automatically:
1. ✅ Check & install **Node.js**
2. ✅ Check & install **FFmpeg** (for voice features)
3. ✅ Download **yt-dlp** (for music)
4. ✅ Install all **npm dependencies**
5. ✅ Walk you through **.env configuration**
6. ✅ **Build** the project

---

## 🔧 Manual Setup

If you prefer to set things up manually:

### Prerequisites
- [Node.js](https://nodejs.org) v18+
- [FFmpeg](https://ffmpeg.org) (for voice features)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) (for music)

### Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd xyabot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your tokens:
   ```
   DISCORD_TOKEN=your_discord_bot_token
   GEMINI_API_KEY=your_gemini_api_key
   CLIENT_ID=your_discord_client_id
   PORT=3000
   ```

4. **Build**
   ```bash
   npm run build
   ```

5. **Start**
   ```bash
   npm start
   ```

---

## 📋 Getting Your Tokens

| Token | Where to Get It |
|-------|----------------|
| **Discord Bot Token** | [Discord Developer Portal](https://discord.com/developers/applications) → Bot → Token |
| **Client ID** | [Discord Developer Portal](https://discord.com/developers/applications) → OAuth2 → Client ID |
| **Gemini API Key** | [Google AI Studio](https://aistudio.google.com/apikey) |

### Required Bot Permissions
When inviting your bot, make sure to enable these intents in the Developer Portal:
- ✅ Server Members Intent
- ✅ Message Content Intent

---

## 🖥️ Dashboard

The web dashboard runs at `http://localhost:3000` (or your configured port) and includes:

- **Home** — Server overview, mood indicator, charts, top members
- **Leaderboard** — Rankings by XP, Gems, Friendship, Voice time
- **User Profiles** — Detailed view with economy history, voice sessions, memories
- **Bot Status** — Uptime, command usage, performance metrics

---

## 📁 Project Structure

```
xyabot/
├── src/
│   ├── bot/           # Discord bot logic
│   │   ├── commands/  # Slash commands
│   │   ├── events/    # Event handlers
│   │   ├── utils/     # Utilities (TTS, moderation, image gen)
│   │   ├── ai.ts      # Gemini AI integration
│   │   ├── db.ts      # SQLite database
│   │   └── index.ts   # Entry point
│   ├── dashboard/     # React web dashboard
│   │   ├── components/
│   │   ├── pages/
│   │   └── index.html
│   └── server/        # Express API server
├── setup.sh           # Linux/macOS setup
├── setup.bat          # Windows CMD setup
├── setup.ps1          # Windows PowerShell setup
└── package.json
```

---

## 🎮 Commands

| Command | Description |
|---------|-------------|
| `/help` | Show all available commands |
| `/profile` | View your profile and stats |
| `/daily` | Claim daily Gems reward |
| `/shop` | Browse the item shop |
| `/buy` | Purchase items |
| `/inventory` | View your items |
| `/leaderboard` | See the top users |
| `/coinflip` | Gamble your Gems |
| `/rps` | Play Rock-Paper-Scissors |
| `/wordoftheday` | Start a Wordle game |
| `/radio` | Play radio stations |
| `/join` | Have Xya join your voice channel |
| `/gift` | Gift Gems to another user |
| `/settings` | Configure your notifications |
| `/setup-welcome` | Set up welcome messages |
| `/manage-features` | Toggle bot features |
| `/setup roles` | Create or import role menus (Buttons!) |
| `/setup themes` | Change the bot's visual theme |

---

## 💖 Made with love by the Xya team

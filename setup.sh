#!/usr/bin/env bash
# ─────────────────────────────────────────────────────
# Xya Bot — Single-Click Setup for Linux & macOS
# ─────────────────────────────────────────────────────
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PINK='\033[1;35m'
NC='\033[0m' # No Color

banner() {
    echo ""
    echo -e "${PINK}  ╔═══════════════════════════════════════╗${NC}"
    echo -e "${PINK}  ║          ✦  Xya Bot Setup  ✦          ║${NC}"
    echo -e "${PINK}  ║      Your AI Discord Companion        ║${NC}"
    echo -e "${PINK}  ╚═══════════════════════════════════════╝${NC}"
    echo ""
}

info()    { echo -e "${CYAN}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[  OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail()    { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

banner

# ── Detect OS ──
OS="$(uname -s)"
ARCH="$(uname -m)"
info "Detected OS: $OS ($ARCH)"

# ── 1. Node.js ──
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    success "Node.js found: $NODE_VERSION"
else
    warn "Node.js not found. Installing..."
    if [[ "$OS" == "Darwin" ]]; then
        if command -v brew &> /dev/null; then
            brew install node
        else
            warn "Homebrew not found. Installing Homebrew first..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            brew install node
        fi
    elif [[ "$OS" == "Linux" ]]; then
        if command -v apt-get &> /dev/null; then
            info "Using apt to install Node.js 20.x..."
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command -v dnf &> /dev/null; then
            info "Using dnf to install Node.js..."
            sudo dnf install -y nodejs npm
        elif command -v pacman &> /dev/null; then
            info "Using pacman to install Node.js..."
            sudo pacman -S --noconfirm nodejs npm
        elif command -v apk &> /dev/null; then
            info "Using apk to install Node.js..."
            sudo apk add --no-cache nodejs npm
        else
            fail "Unsupported package manager. Please install Node.js manually: https://nodejs.org"
        fi
    else
        fail "Unsupported OS. Please install Node.js manually: https://nodejs.org"
    fi
    success "Node.js installed: $(node -v)"
fi

# ── 2. Ollama (AI Engine) ──
if command -v ollama &> /dev/null; then
    success "Ollama found: $(ollama -v)"
else
    warn "Ollama not found. Installing..."
    curl -fsSL https://ollama.com/install.sh | sh
    success "Ollama installed"
fi

# Start Ollama service if not running
if ! pgrep -x "ollama" > /dev/null; then
    info "Starting Ollama service..."
    ollama serve &
    OLLAMA_PID=$!
    sleep 5
fi

# Pull Gemma3 4B model
info "Checking/Pulling Gemma3 4B model (this may take a moment)..."
ollama pull gemma3:4b
success "Gemma3 4B ready"


# ── 3. Python & Pip (for TTS/STT) ──
if command -v python3 &> /dev/null; then
    success "Python 3 found: $(python3 --version)"
    info "Installing Python dependencies (pocket-tts, faster-whisper)..."
    pip3 install pocket-tts faster-whisper --break-system-packages 2>/dev/null || pip3 install pocket-tts faster-whisper
    success "Python dependencies installed"
else
    fail "Python 3 is required for TTS/STT but was not found. Please install Python 3.10+"
fi

# ── FIX: ensure `python` command exists (needed by npm/yt-dlp-exec) ──
if ! command -v python &> /dev/null; then
    warn "'python' not found — linking python → python3"
    sudo ln -sf "$(command -v python3)" /usr/bin/python
    success "'python' command created"
else
    success "python found: $(python --version)"
fi



# ── 4. FFmpeg ──
if command -v ffmpeg &> /dev/null; then
    success "ffmpeg found"
else
    warn "ffmpeg not found. Installing..."
    if [[ "$OS" == "Darwin" ]]; then
        brew install ffmpeg
    elif [[ "$OS" == "Linux" ]]; then
        if command -v apt-get &> /dev/null; then
            sudo apt-get install -y ffmpeg
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y ffmpeg
        elif command -v pacman &> /dev/null; then
            sudo pacman -S --noconfirm ffmpeg
        elif command -v apk &> /dev/null; then
            sudo apk add --no-cache ffmpeg
        else
            warn "Could not auto-install ffmpeg. Please install manually."
        fi
    fi
fi

# ── 5. yt-dlp ──
if command -v yt-dlp &> /dev/null; then
    success "yt-dlp found: $(yt-dlp --version)"
elif [ -f "./yt-dlp" ]; then
    success "yt-dlp (local) found"
else
    warn "yt-dlp not found. Downloading..."
    if [[ "$OS" == "Darwin" ]]; then
        curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos -o yt-dlp
    else
        curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp
    fi
    chmod +x yt-dlp
    success "yt-dlp downloaded"
fi

# ── 6. npm install ──
info "Installing Node.js dependencies..."
npm install
success "Dependencies installed"

# ── 7. .env Setup ──
if [ ! -f ".env" ]; then
    info "Setting up your .env configuration..."
    echo ""
    echo -e "${PINK}  Let's configure your bot!${NC}"
    echo -e "${CYAN}  1. Discord Bot Token${NC}"
    echo -e "${CYAN}  2. Discord Client ID${NC}"
    echo ""

    read -p "$(echo -e ${YELLOW}Enter your Discord Bot Token: ${NC})" DISCORD_TOKEN
    read -p "$(echo -e ${YELLOW}Enter your Discord Client ID: ${NC})" CLIENT_ID
    read -p "$(echo -e ${YELLOW}Enter dashboard port [3000]: ${NC})" PORT
    PORT=${PORT:-3000}

    cat > .env << EOF
DISCORD_TOKEN=$DISCORD_TOKEN
CLIENT_ID=$CLIENT_ID
PORT=$PORT
OLLAMA_URL=http://localhost:11434
TTS_VOICE=alba
TTS_PORT=8000
EOF
    success ".env file created"
else
    success ".env file already exists"
fi

# ── 8. Build ──
info "Building the project..."
npm run build
success "Build complete"

# ── Done! ──
echo ""
echo -e "${PINK}  ╔═══════════════════════════════════════╗${NC}"
echo -e "${PINK}  ║        ✨ Setup Complete! ✨           ║${NC}"
echo -e "${PINK}  ╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}  To start the bot:${NC}"
echo -e "    ${CYAN}npm start${NC}"
echo ""
if [ -n "$OLLAMA_PID" ]; then
    echo -e "${YELLOW}  Note: Ollama running in background (PID $OLLAMA_PID)${NC}"
fi

# ─────────────────────────────────────────────────────
# Xya Bot — PowerShell Setup Script (Windows)
# ─────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

function Write-Banner {
    Write-Host ""
    Write-Host "  ╔═══════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "  ║          ✦  Xya Bot Setup  ✦          ║" -ForegroundColor Magenta
    Write-Host "  ║      Your AI Discord Companion        ║" -ForegroundColor Magenta
    Write-Host "  ╚═══════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
}

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-OK($msg) { Write-Host "[  OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "[FAIL] $msg" -ForegroundColor Red; exit 1 }

Write-Banner

# ── 1. Node.js ──
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-OK "Node.js found: $(node -v)"
}
else {
    Write-Warn "Node.js not found. Installing via winget..."
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    Write-Info "Please restart script after install."
    exit
}

# ── 2. Python & Pip ──
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-OK "Python found: $(python --version)"
    Write-Info "Installing PocketTTS & faster-whisper..."
    pip install pocket-tts faster-whisper
    Write-OK "Python deps installed"
}
else {
    Write-Warn "Python not found. Installing via winget..."
    winget install Python.Python.3.11 --accept-package-agreements --accept-source-agreements
    Write-Info "Please restart script after install."
    exit
}

# ── 3. Ollama ──
if (Get-Command ollama -ErrorAction SilentlyContinue) {
    Write-OK "Ollama found"
}
else {
    Write-Warn "Ollama not found. Installing via winget..."
    winget install Ollama.Ollama --accept-package-agreements --accept-source-agreements
}

# Start Ollama
if (-not (Get-Process ollama -ErrorAction SilentlyContinue)) {
    Write-Info "Starting Ollama..."
    Start-Process ollama "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 5
}

# Pull Model
Write-Info "Pulling Gemma3 4B model..."
ollama pull gemma3:4b
Write-OK "Gemma3 4B Ready"

# ── 4. FFmpeg & yt-dlp ──
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    winget install Gyan.FFmpeg --accept-package-agreements --accept-source-agreements
}
if (-not (Test-Path "yt-dlp.exe")) {
    Write-Warn "Downloading yt-dlp..."
    Invoke-WebRequest -Uri "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe" -OutFile "yt-dlp.exe"
    if (Test-Path "yt-dlp.exe") {
        Write-OK "yt-dlp downloaded"
    }
    else {
        Write-Fail "Could not download yt-dlp.exe"
    }
}
else {
    Write-OK "yt-dlp found"
}

# ── 5. npm install ──
Write-Info "Installing dependencies..."
npm install
Write-OK "Dependencies installed"

# ── 6. .env Setup ──
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "  Let's configure your bot!" -ForegroundColor Magenta
    
    $discordToken = Read-Host "Enter your Discord Bot Token"
    $clientId = Read-Host "Enter your Discord Client ID"
    $port = Read-Host "Enter dashboard port (default: 3000)"
    if ([string]::IsNullOrWhiteSpace($port)) { $port = "3000" }

    @"
DISCORD_TOKEN=$discordToken
CLIENT_ID=$clientId
PORT=$port
OLLAMA_URL=http://localhost:11434
TTS_VOICE=alba
TTS_PORT=8000
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-OK ".env file created"
}

# ── 7. Build ──
Write-Info "Building..."
npm run build
Write-OK "Build complete"

Write-Host ""
Write-Host "  To start the bot:" -ForegroundColor Green
Write-Host "    npm start" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"

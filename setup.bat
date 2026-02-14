@echo off
chcp 65001 >nul 2>&1
title Xya Bot Setup
color 0D

echo.
echo  ╔═══════════════════════════════════════╗
echo  ║          ✦  Xya Bot Setup  ✦          ║
echo  ║      Your AI Discord Companion        ║
echo  ╚═══════════════════════════════════════╝
echo.

:: ── 1. Check Node.js ──
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [  OK] Node.js found
) else (
    echo [WARN] Node.js not found. Installing via winget...
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    echo [INFO] Please restart this script after installation.
    pause
    exit /b
)

:: ── 2. Check Python ──
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [  OK] Python found
) else (
    echo [WARN] Python not found. Installing via winget...
    winget install Python.Python.3.11 --accept-package-agreements --accept-source-agreements
    echo [INFO] Please restart this script after installation.
    pause
    exit /b
)

:: ── 3. Install Python Deps (PocketTTS, faster-whisper) ──
echo [INFO] Installing PocketTTS & faster-whisper...
pip install pocket-tts faster-whisper
if %ERRORLEVEL% EQU 0 (
    echo [  OK] Python dependencies installed
) else (
    echo [WARN] Failed to install Python dependencies. TTS/STT might accept.
)

:: ── 4. Check Ollama ──
where ollama >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [  OK] Ollama found
) else (
    echo [WARN] Ollama not found. Installing via winget...
    winget install Ollama.Ollama --accept-package-agreements --accept-source-agreements
    echo [INFO] Installing Ollama... please wait.
)

:: Start Ollama if not running
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo [INFO] Starting Ollama...
    start /min ollama serve
    timeout /t 5 >nul
)

:: Pull Gemma3 4B
echo [INFO] Checking/Pulling Gemma3 4B model...
ollama pull gemma3:4b
echo [  OK] Gemma3 4B Ready

:: ── 5. Check ffmpeg ──
where ffmpeg >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] ffmpeg not found. Installing via winget...
    winget install Gyan.FFmpeg --accept-package-agreements --accept-source-agreements
)

:: ── 6. Check yt-dlp ──
if not exist "yt-dlp.exe" (
    echo [WARN] Downloading yt-dlp...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe' -OutFile 'yt-dlp.exe'"
    if exist "yt-dlp.exe" (
        echo [  OK] yt-dlp downloaded
    ) else (
        echo [FAIL] Could not download yt-dlp.exe. Please download manually from https://github.com/yt-dlp/yt-dlp
    )
) else (
    echo [  OK] yt-dlp found
)

:: ── 7. npm install ──
echo.
echo [INFO] Installing dependencies...
call npm install

:: ── 8. .env Setup ──
if not exist ".env" (
    echo.
    echo  Let's configure your bot!
    set /p DISCORD_TOKEN="Enter your Discord Bot Token: "
    set /p CLIENT_ID="Enter your Discord Client ID: "
    set /p PORT="Enter dashboard port [3000]: "
    if "%PORT%"=="" set PORT=3000

    (
        echo DISCORD_TOKEN=%DISCORD_TOKEN%
        echo CLIENT_ID=%CLIENT_ID%
        echo PORT=%PORT%
        echo OLLAMA_URL=http://localhost:11434
        echo TTS_VOICE=alba
        echo TTS_PORT=8000
    ) > .env
    echo [  OK] .env file created
)

:: ── 9. Build ──
echo.
echo [INFO] Building...
call npm run build
echo [  OK] Build complete

echo.
echo  To start the bot: npm start
echo.
pause

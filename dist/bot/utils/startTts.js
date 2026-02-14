"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTTSServer = startTTSServer;
exports.checkTTSHealth = checkTTSHealth;
exports.stopTTSServer = stopTTSServer;
exports.getTTSUrl = getTTSUrl;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let ttsProcess = null;
const TTS_PORT = process.env.TTS_PORT || '8000';
const TTS_URL = `http://localhost:${TTS_PORT}`;
/**
 * Start the PocketTTS server as a background process.
 * Waits up to 30 seconds for it to become available.
 */
async function startTTSServer() {
    // Check if already running
    if (await checkTTSHealth()) {
        console.log('[PocketTTS] Server already running');
        return true;
    }
    const scriptPath = path_1.default.join(__dirname, '../../../tts_server.py');
    if (!fs_1.default.existsSync(scriptPath)) {
        console.warn('[PocketTTS] tts_server.py not found. TTS will be disabled.');
        return false;
    }
    console.log('[PocketTTS] Starting server...');
    // Try python3 first, then python
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    ttsProcess = (0, child_process_1.spawn)(pythonCmd, [scriptPath], {
        env: { ...process.env, TTS_PORT, TTS_VOICE: process.env.TTS_VOICE || 'alba' },
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
    });
    ttsProcess.stdout?.on('data', (data) => {
        console.log(`[PocketTTS] ${data.toString().trim()}`);
    });
    ttsProcess.stderr?.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg && !msg.includes('WARNING')) {
            console.error(`[PocketTTS] ${msg}`);
        }
    });
    ttsProcess.on('exit', (code) => {
        console.warn(`[PocketTTS] Server exited with code ${code}`);
        ttsProcess = null;
    });
    // Wait for server to be ready (up to 120 seconds for slow downloads)
    for (let i = 0; i < 240; i++) {
        await new Promise(r => setTimeout(r, 500));
        if (await checkTTSHealth()) {
            console.log('[PocketTTS] ✅ Server is ready');
            return true;
        }
        if (i > 0 && i % 20 === 0) {
            console.log(`[PocketTTS] Still starting... (${i / 2}s)`);
        }
    }
    console.warn('[PocketTTS] Server failed to start in 120s. TTS disabled.');
    return false;
}
/**
 * Check if PocketTTS server is healthy
 */
async function checkTTSHealth() {
    try {
        const response = await fetch(`${TTS_URL}/health`, { signal: AbortSignal.timeout(2000) });
        return response.ok || response.status === 200;
    }
    catch {
        return false;
    }
}
/**
 * Stop the PocketTTS server
 */
function stopTTSServer() {
    if (ttsProcess) {
        ttsProcess.kill();
        ttsProcess = null;
        console.log('[PocketTTS] Server stopped');
    }
}
/**
 * Get TTS URL for external use
 */
function getTTSUrl() {
    return TTS_URL;
}

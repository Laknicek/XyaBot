import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';

let ttsProcess: ChildProcess | null = null;
const TTS_PORT = process.env.TTS_PORT || '8000';
const TTS_URL = `http://localhost:${TTS_PORT}`;

/**
 * Start the PocketTTS server as a background process.
 * Waits up to 30 seconds for it to become available.
 */
export async function startTTSServer(): Promise<boolean> {
    // Check if already running
    if (await checkTTSHealth()) {
        console.log('[PocketTTS] Server already running');
        return true;
    }

    const scriptPath = path.join(__dirname, '../../../tts_server.py');

    if (!fs.existsSync(scriptPath)) {
        console.warn('[PocketTTS] tts_server.py not found. TTS will be disabled.');
        return false;
    }

    console.log('[PocketTTS] Starting server...');

    // Try python3 first, then python
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

    ttsProcess = spawn(pythonCmd, [scriptPath], {
        env: { ...process.env, TTS_PORT, TTS_VOICE: process.env.TTS_VOICE || 'alba' },
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
    });

    ttsProcess.stdout?.on('data', (data: Buffer) => {
        console.log(`[PocketTTS] ${data.toString().trim()}`);
    });

    ttsProcess.stderr?.on('data', (data: Buffer) => {
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
export async function checkTTSHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${TTS_URL}/health`, { signal: AbortSignal.timeout(2000) });
        return response.ok || response.status === 200;
    } catch {
        return false;
    }
}

/**
 * Stop the PocketTTS server
 */
export function stopTTSServer() {
    if (ttsProcess) {
        ttsProcess.kill();
        ttsProcess = null;
        console.log('[PocketTTS] Server stopped');
    }
}

/**
 * Get TTS URL for external use
 */
export function getTTSUrl(): string {
    return TTS_URL;
}

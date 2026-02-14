"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playRadio = playRadio;
exports.playTTS = playTTS;
exports.stopAudio = stopAudio;
exports.getGuildPlayer = getGuildPlayer;
exports.cleanupAudioFolder = cleanupAudioFolder;
const voice_1 = require("@discordjs/voice");
const play_dl_1 = __importDefault(require("play-dl"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const child_process_1 = require("child_process");
const TTS_PORT = process.env.TTS_PORT || '8000';
const TTS_URL = `http://localhost:${TTS_PORT}`;
const TTS_VOICE = process.env.TTS_VOICE || 'alba';
const guildStates = new Map();
const ttsCacheDir = path_1.default.join(__dirname, '../../../temp_audio');
if (!fs_1.default.existsSync(ttsCacheDir))
    fs_1.default.mkdirSync(ttsCacheDir, { recursive: true });
function getOrCreateGuildState(guildId) {
    let state = guildStates.get(guildId);
    if (!state) {
        const player = (0, voice_1.createAudioPlayer)();
        state = {
            player,
            isRadioPlaying: false,
            isTTSPlaying: false
        };
        guildStates.set(guildId, state);
        player.on(voice_1.AudioPlayerStatus.Idle, async () => {
            if (state.isTTSPlaying) {
                state.isTTSPlaying = false;
                if (state.isRadioPlaying && state.radioUrl) {
                    console.log(`[Voice:${guildId}] Restarting radio after TTS...`);
                    // Resume radio
                    await playTrack(guildId, state.radioUrl, (0, voice_1.getVoiceConnection)(guildId));
                }
            }
        });
        player.on('error', error => {
            console.error(`[Voice:${guildId}] Player Error:`, error.message);
        });
    }
    return state;
}
const guildQueues = new Map();
async function playRadio(guildId, url, connection, isPlaylistMode = false) {
    const state = getOrCreateGuildState(guildId);
    state.radioUrl = url;
    state.isRadioPlaying = true;
    // Reset queue if new play command (unless we implement full queue later, for now simple override)
    guildQueues.set(guildId, []);
    if (isPlaylistMode) {
        try {
            // If it's the radio playlist, fetch videos
            if (url.includes('list=')) {
                const playlistInfo = await play_dl_1.default.playlist_info(url, { incomplete: true });
                const videos = await playlistInfo.all_videos();
                const items = videos.map(v => ({ url: v.url, title: v.title }));
                // Shuffle for radio vibe
                for (let i = items.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [items[i], items[j]] = [items[j], items[i]];
                }
                guildQueues.set(guildId, items);
                // Play first
                if (items.length > 0)
                    playTrack(guildId, items[0].url, connection);
            }
            else {
                playTrack(guildId, url, connection);
            }
        }
        catch (e) {
            console.error("[Voice] Playlist error:", e);
        }
    }
    else {
        // Single track
        playTrack(guildId, url, connection);
    }
}
async function playTrack(guildId, url, connection) {
    if (!connection)
        return;
    const state = getOrCreateGuildState(guildId);
    state.radioUrl = url; // Store current
    if (!state.isTTSPlaying) {
        try {
            console.log(`[Voice] Starting playback for: ${url}`);
            const ytDlpPath = path_1.default.resolve(__dirname, '../../../yt-dlp.exe');
            // Create a child process for yt-dlp to stream raw audio
            const ytDlpProcess = (0, child_process_1.spawn)(ytDlpPath, [
                url,
                '-o', '-',
                '-q',
                '-f', 'bestaudio',
                '--no-playlist',
                '--force-ipv4', // Reliability fix
                '--geo-bypass',
                '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                '--socket-timeout', '30',
                '--retries', '10'
            ]);
            const resource = (0, voice_1.createAudioResource)(ytDlpProcess.stdout, {
                inlineVolume: true
            });
            if (resource.volume)
                resource.volume.setVolume(0.35);
            state.player.play(resource);
            connection.subscribe(state.player);
            ytDlpProcess.stderr.on('data', (data) => {
                console.error(`[yt-dlp Error] ${data}`);
            });
            // Set up idle handler to play next in queue
            state.player.removeAllListeners(voice_1.AudioPlayerStatus.Idle);
            state.player.on(voice_1.AudioPlayerStatus.Idle, () => {
                if (state.isTTSPlaying) {
                    state.isTTSPlaying = false;
                    // Handled by the global idle listener in getOrCreateGuildState
                    return;
                }
                const queue = guildQueues.get(guildId) || [];
                if (queue.length > 0) {
                    // Loop handling
                    const current = queue.shift();
                    if (current) {
                        queue.push(current);
                        playTrack(guildId, queue[0].url, connection);
                    }
                }
            });
        }
        catch (e) {
            console.error("[Voice] Failed to play track via yt-dlp:", e);
            const queue = guildQueues.get(guildId) || [];
            if (queue.length > 0) {
                queue.shift();
                if (queue.length > 0)
                    playTrack(guildId, queue[0].url, connection);
            }
        }
    }
}
/**
 * Expand slang/abbreviations to full words for natural TTS pronunciation
 */
const SLANG_MAP = {
    'idk': "I don't know",
    'idc': "I don't care",
    'ngl': 'not gonna lie',
    'tbh': 'to be honest',
    'imo': 'in my opinion',
    'brb': 'be right back',
    'lol': 'haha',
    'lmao': 'hahaha',
    'lmfao': 'hahahaha',
    'omg': 'oh my god',
    'nvm': 'never mind',
    'ily': 'I love you',
    'ilysm': 'I love you so much',
    'irl': 'in real life',
    'smh': 'shaking my head',
    'wbu': 'what about you',
    'hbu': 'how about you',
    'gtg': 'got to go',
    'ttyl': 'talk to you later',
    'rn': 'right now',
    'fr': 'for real',
    'istg': 'I swear to god',
    'ikr': 'I know right',
    'ofc': 'of course',
    'btw': 'by the way',
    'pls': 'please',
    'thx': 'thanks',
    'ty': 'thank you',
    'yw': "you're welcome",
    'np': 'no problem',
    'ur': 'your',
    'u': 'you',
    'r': 'are',
    'w': 'with',
    'bc': 'because',
    'cuz': 'because',
    'tho': 'though',
    'gonna': 'going to',
    'wanna': 'want to',
    'gotta': 'got to',
    'kinda': 'kind of',
    'lowkey': 'low key',
    'highkey': 'high key',
    'bestie': 'bestie',
    'yall': 'you all',
    'imma': "I'm going to",
    'dm': 'direct message',
    'afk': 'away from keyboard',
    'gg': 'good game',
    'ez': 'easy',
    'sus': 'suspicious',
    'goat': 'greatest of all time',
    'fyi': 'for your information',
    'asap': 'as soon as possible',
    'tbf': 'to be fair',
    'fomo': 'fear of missing out',
    'yolo': 'you only live once',
    'srsly': 'seriously',
    'bb': 'baby',
    'bff': 'best friend forever',
};
function expandSlang(text) {
    // Replace whole-word matches only (case-insensitive)
    return text.replace(/\b\w+\b/g, (word) => {
        const lower = word.toLowerCase();
        return SLANG_MAP[lower] || word;
    });
}
/**
 * Generate TTS audio using PocketTTS local server.
 * Falls back gracefully if server is unavailable.
 */
async function generatePocketTTS(text, outputPath) {
    try {
        // Expand slang for natural speech
        const spokenText = expandSlang(text);
        console.log(`[TTS] Expanded: "${text}" → "${spokenText}"`);
        // PocketTTS uses form data, not JSON
        const formData = new URLSearchParams();
        formData.append('text', spokenText);
        const response = await fetch(`${TTS_URL}/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
            signal: AbortSignal.timeout(30000),
        });
        if (!response.ok) {
            console.error(`[TTS] PocketTTS error: ${response.status}`);
            return false;
        }
        // PocketTTS streams WAV audio back
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        if (audioBuffer.length < 100) {
            console.warn('[TTS] PocketTTS returned empty/tiny audio');
            return false;
        }
        fs_1.default.writeFileSync(outputPath, audioBuffer);
        console.log(`[TTS] Generated ${audioBuffer.length} bytes of audio`);
        return true;
    }
    catch (error) {
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
            console.warn('[TTS] PocketTTS timed out (30s)');
        }
        else {
            console.warn(`[TTS] PocketTTS unavailable: ${error.message}`);
        }
        return false;
    }
}
async function playTTS(text, connection, lang = 'en') {
    const guildId = connection.joinConfig.guildId;
    const state = getOrCreateGuildState(guildId);
    const cleanText = text
        .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
        .replace(/Xya/gi, 'Zayah')
        .trim();
    if (!cleanText)
        return;
    const hash = crypto_1.default.createHash('md5').update(`${cleanText}_${lang}_pkt`).digest('hex');
    const filePath = path_1.default.join(ttsCacheDir, `tts_${hash}.wav`);
    const startTTS = (file) => {
        const resource = (0, voice_1.createAudioResource)(file, { inlineVolume: true });
        if (resource.volume)
            resource.volume.setVolume(1.0);
        state.isTTSPlaying = true;
        state.player.play(resource);
        connection.subscribe(state.player);
    };
    // Check cache first
    if (fs_1.default.existsSync(filePath)) {
        startTTS(filePath);
        return;
    }
    // Generate with PocketTTS
    const success = await generatePocketTTS(cleanText, filePath);
    if (success && fs_1.default.existsSync(filePath)) {
        // Enforce single file limit: delete all OTHER wav files in temp folder
        try {
            const files = fs_1.default.readdirSync(ttsCacheDir);
            for (const file of files) {
                if (file.endsWith('.wav') && path_1.default.join(ttsCacheDir, file) !== filePath) {
                    try {
                        fs_1.default.unlinkSync(path_1.default.join(ttsCacheDir, file));
                    }
                    catch { }
                }
            }
        }
        catch (e) {
            console.error("[TTS] Cleanup error:", e);
        }
        startTTS(filePath);
        // Cache cleanup after 10 minutes
        setTimeout(() => { if (fs_1.default.existsSync(filePath))
            fs_1.default.unlinkSync(filePath); }, 600000);
    }
    else {
        console.warn(`[TTS] Failed to generate speech for: "${cleanText.substring(0, 50)}..."`);
    }
}
function stopAudio(guildId) {
    const state = guildStates.get(guildId);
    if (state) {
        state.player.stop();
        state.isRadioPlaying = false;
        state.isTTSPlaying = false;
        state.radioUrl = undefined;
    }
}
function getGuildPlayer(guildId) {
    return getOrCreateGuildState(guildId).player;
}
function cleanupAudioFolder() {
    if (!fs_1.default.existsSync(ttsCacheDir))
        return;
    try {
        const files = fs_1.default.readdirSync(ttsCacheDir);
        let deleted = 0;
        for (const file of files) {
            if (file.endsWith('.wav')) {
                fs_1.default.unlinkSync(path_1.default.join(ttsCacheDir, file));
                deleted++;
            }
        }
        if (deleted > 0)
            console.log(`[Audio] Cleaned up ${deleted} temporary audio files.`);
    }
    catch (e) {
        console.error("[Audio] Failed to cleanup temp folder:", e);
    }
}

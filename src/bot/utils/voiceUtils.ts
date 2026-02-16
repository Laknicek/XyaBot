import {
    createAudioPlayer,
    createAudioResource,
    VoiceConnection,
    AudioPlayerStatus,
    AudioPlayer,
    StreamType,
    getVoiceConnection,
} from '@discordjs/voice';
import play from 'play-dl';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { spawn } from 'child_process';

const TTS_PORT = process.env.TTS_PORT || '8000';
const TTS_URL = `http://localhost:${TTS_PORT}`;
const TTS_VOICE = process.env.TTS_VOICE || 'alba';

interface GuildAudioState {
    player: AudioPlayer;
    radioUrl?: string;
    isRadioPlaying: boolean;
    isTTSPlaying: boolean;
}

const guildStates = new Map<string, GuildAudioState>();
const ttsCacheDir = path.join(__dirname, '../../../temp_audio');
if (!fs.existsSync(ttsCacheDir)) fs.mkdirSync(ttsCacheDir, { recursive: true });

function getOrCreateGuildState(guildId: string): GuildAudioState {
    let state = guildStates.get(guildId);
    if (!state) {
        const player = createAudioPlayer();
        state = {
            player,
            isRadioPlaying: false,
            isTTSPlaying: false
        };
        guildStates.set(guildId, state);

        player.on(AudioPlayerStatus.Idle, async () => {
            if (state!.isTTSPlaying) {
                state!.isTTSPlaying = false;

                if (state!.isRadioPlaying && state!.radioUrl) {
                    console.log(`[Voice:${guildId}] Restarting radio after TTS...`);
                    // Resume radio
                    await playTrack(guildId, state!.radioUrl, getVoiceConnection(guildId)!);
                }
            }
        });

        player.on('error', error => {
            console.error(`[Voice:${guildId}] Player Error:`, error.message);
        });
    }
    return state;
}

// Basic queue system for radio/playlists
interface QueueItem {
    url: string;
    title?: string;
}
const guildQueues = new Map<string, QueueItem[]>();

export async function playRadio(guildId: string, url: string, connection: VoiceConnection, isPlaylistMode: boolean = false) {
    const state = getOrCreateGuildState(guildId);
    state.radioUrl = url;
    state.isRadioPlaying = true;

    // Reset queue if new play command (unless we implement full queue later, for now simple override)
    guildQueues.set(guildId, []);

    if (isPlaylistMode) {
        try {
            // If it's the radio playlist, fetch videos
            if (url.includes('list=')) {
                const playlistInfo = await play.playlist_info(url, { incomplete: true });
                const videos = await playlistInfo.all_videos();
                const items = videos.map(v => ({ url: v.url, title: v.title }));
                // Shuffle for radio vibe
                for (let i = items.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [items[i], items[j]] = [items[j], items[i]];
                }
                guildQueues.set(guildId, items);
                // Play first
                if (items.length > 0) playTrack(guildId, items[0].url, connection);
            } else {
                playTrack(guildId, url, connection);
            }
        } catch (e) {
            console.error("[Voice] Playlist error:", e);
        }
    } else {
        // Single track
        playTrack(guildId, url, connection);
    }
}

async function playTrack(guildId: string, url: string, connection: VoiceConnection) {
    if (!connection) return;
    const state = getOrCreateGuildState(guildId);
    state.radioUrl = url; // Store current

    if (!state.isTTSPlaying) {
        try {
            console.log(`[Voice] Starting playback for: ${url}`);

            // Determine yt-dlp path based on OS
            const isWindows = process.platform === 'win32';
            const binName = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
            const localPath = path.resolve(__dirname, `../../../${binName}`);

            let ytDlpPath = localPath;
            if (!fs.existsSync(localPath) && !isWindows) {
                // on Linux/Mac, if local binary missing, try global command
                ytDlpPath = 'yt-dlp';
            }

            // Prepare arguments
            const args = [
                url,
                '-o', '-',
                '-q',
                '-f', 'bestaudio',
                '--no-playlist',
                '--force-ipv4', // Reliability fix
                '--geo-bypass',
                '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                '--retries', '10',
                // Fixes for server environments
                '--js-runtimes', 'node'
            ];

            // Check for cookies.txt in multiple locations
            const cookiesPaths = [
                path.resolve(process.cwd(), 'cookies.txt'), // Root (most likely)
                path.resolve(__dirname, '../../../cookies.txt'), // Relative from file
            ];

            let cookiesFound = false;
            for (const p of cookiesPaths) {
                if (fs.existsSync(p)) {
                    args.push('--cookies', p);
                    console.log(`[Voice] Using cookies from: ${p}`);
                    cookiesFound = true;
                    break;
                }
            }

            if (!cookiesFound) {
                console.warn(`[Voice] WARNING: cookies.txt not found! YouTube playback may fail.`);
                console.log(`[Voice] Searched in: ${cookiesPaths.join(', ')}`);
            }

            // Create a child process for yt-dlp to stream raw audio
            const ytDlpProcess = spawn(ytDlpPath, args);

            const resource = createAudioResource(ytDlpProcess.stdout, {
                inlineVolume: true
            });

            if (resource.volume) resource.volume.setVolume(0.35);
            state.player.play(resource);
            connection.subscribe(state.player);

            ytDlpProcess.stderr.on('data', (data) => {
                console.error(`[yt-dlp Error] ${data}`);
            });

            // Set up idle handler to play next in queue
            state.player.removeAllListeners(AudioPlayerStatus.Idle);
            state.player.on(AudioPlayerStatus.Idle, () => {
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

        } catch (e) {
            console.error("[Voice] Failed to play track via yt-dlp:", e);
            const queue = guildQueues.get(guildId) || [];
            if (queue.length > 0) {
                queue.shift();
                if (queue.length > 0) playTrack(guildId, queue[0].url, connection);
            }
        }
    }
}

/**
 * Expand slang/abbreviations to full words for natural TTS pronunciation
 */
const SLANG_MAP: Record<string, string> = {
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
    'wdym': 'what do you mean',
    'idts': 'I don\'t think so',
    'faq': 'frequently asked questions',
    'ftw': 'for the win',
    'hmu': 'hit me up',
    'icymi': 'in case you missed it',
    'jk': 'just kidding',
    'n/a': 'not applicable',
    'omw': 'on my way',
    'pov': 'point of view',
    'ppl': 'people',
    'rip': 'rest in peace',
    'tba': 'to be announced',
    'tbc': 'to be continued',
    'tbd': 'to be determined',
    'tmi': 'too much information',
    'wth': 'what the hell',
    'wtf': 'what the fuck',
    'ygti': 'you get the idea',
    'yta': 'you the asshole',
    'nta': 'not the asshole',
    'ama': 'ask me anything',
    'eli5': 'explain like I\'m five',
    'tl;dr': 'too long; didn\'t read',
    'mf': 'motherfucker',
    'mfw': 'my face when',
    'tfw': 'that feeling when',
    'mrw': 'my reaction when',
    'oc': 'original content',
    'op': 'original poster',
    'os': 'operating system',
    'pm': 'private message',
    'rt': 'retweet',
    'so': 'significant other',
    'til': 'today I learned',
    'wb': 'welcome back',
    'wys': 'what you saying',
    'wyd': 'what you doing',
    'wyg': 'what you got',
    'dw': 'don\'t worry',
    'mb': 'my bad',
    'g2g': 'got to go',
    'gn': 'good night',
    'gm': 'good morning',
};

function expandSlang(text: string): string {
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
async function generatePocketTTS(text: string, outputPath: string): Promise<boolean> {
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
        fs.writeFileSync(outputPath, audioBuffer);
        console.log(`[TTS] Generated ${audioBuffer.length} bytes of audio`);
        return true;
    } catch (error: any) {
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
            console.warn('[TTS] PocketTTS timed out (30s)');
        } else {
            console.warn(`[TTS] PocketTTS unavailable: ${error.message}`);
        }
        return false;
    }
}

export async function playTTS(text: string, connection: VoiceConnection, lang: string = 'en') {
    const guildId = connection.joinConfig.guildId!;
    const state = getOrCreateGuildState(guildId);

    const cleanText = text
        .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
        .replace(/Xya/gi, 'Zayah')
        .trim();

    if (!cleanText) return;

    const hash = crypto.createHash('md5').update(`${cleanText}_${lang}_pkt`).digest('hex');
    const filePath = path.join(ttsCacheDir, `tts_${hash}.wav`);

    const startTTS = (file: string) => {
        const resource = createAudioResource(file, { inlineVolume: true });
        if (resource.volume) resource.volume.setVolume(1.0);

        state.isTTSPlaying = true;
        state.player.play(resource);
        connection.subscribe(state.player);
    };

    // Check cache first
    if (fs.existsSync(filePath)) {
        startTTS(filePath);
        return;
    }

    // Generate with PocketTTS
    const success = await generatePocketTTS(cleanText, filePath);
    if (success && fs.existsSync(filePath)) {
        // Enforce single file limit: delete all OTHER wav files in temp folder
        try {
            const files = fs.readdirSync(ttsCacheDir);
            for (const file of files) {
                if (file.endsWith('.wav') && path.join(ttsCacheDir, file) !== filePath) {
                    try { fs.unlinkSync(path.join(ttsCacheDir, file)); } catch { }
                }
            }
        } catch (e) { console.error("[TTS] Cleanup error:", e); }

        startTTS(filePath);
        // Cache cleanup after 10 minutes
        setTimeout(() => { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); }, 600000);
    } else {
        console.warn(`[TTS] Failed to generate speech for: "${cleanText.substring(0, 50)}..."`);
    }
}

export function stopAudio(guildId: string) {
    const state = guildStates.get(guildId);
    if (state) {
        state.player.stop();
        state.isRadioPlaying = false;
        state.isTTSPlaying = false;
        state.radioUrl = undefined;
    }
}

export function getGuildPlayer(guildId: string): AudioPlayer {
    return getOrCreateGuildState(guildId).player;
}

export function cleanupAudioFolder() {
    if (!fs.existsSync(ttsCacheDir)) return;
    try {
        const files = fs.readdirSync(ttsCacheDir);
        let deleted = 0;
        for (const file of files) {
            if (file.endsWith('.wav')) {
                fs.unlinkSync(path.join(ttsCacheDir, file));
                deleted++;
            }
        }
        if (deleted > 0) console.log(`[Audio] Cleaned up ${deleted} temporary audio files.`);
    } catch (e) {
        console.error("[Audio] Failed to cleanup temp folder:", e);
    }
}

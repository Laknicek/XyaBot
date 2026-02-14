import { EndBehaviorType, VoiceReceiver, VoiceConnection } from '@discordjs/voice';
import { ExtendedClient } from '../types';
import { playTTS } from './voiceUtils';
import { generateVoiceResponse, transcribeAudio } from '../ai';
import { getUser, updateUser, logInteraction, getUserRelationship, getInteractions, getGuildSetting, saveMemory } from '../db';
import { opus } from 'prism-media';
import { pipeline, Writable } from 'stream';
import { checkToxicity } from './moderation';
import { commands } from '../commands';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Track active connections to prevent duplicate listeners
const listeningConnections = new Set<string>();

// Track guild locks to prevent overlapping processing
const guildLocks = new Set<string>();

// Track speakers to avoid processing multiple people at once if needed
const activeSpeakers = new Set<string>();

// Debounce users to prevent spam processing
const userDebounce = new Set<string>();

const tempDir = path.join(__dirname, '../../../temp_audio');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

export async function setupVoiceListening(connection: VoiceConnection, client: ExtendedClient) {
    const guildId = connection.joinConfig.guildId!;
    if (listeningConnections.has(guildId)) {
        console.log(`[Voice:${guildId}] 🎙️ Already listening, skipping setup.`);
        return;
    }

    listeningConnections.add(guildId);
    const receiver = connection.receiver;

    console.log(`[Voice:${guildId}] 🎙️ Xya is now listening...`);

    // Remove listener on disconnect to allow re-setup
    connection.on('stateChange', (oldState, newState) => {
        if (newState.status === 'destroyed' || newState.status === 'disconnected') {
            listeningConnections.delete(guildId);
        }
    });

    receiver.speaking.on('start', (userId) => {
        activeSpeakers.add(userId);

        if (guildLocks.has(guildId) || userDebounce.has(userId)) return;
        handleSpeechBurst(receiver, connection, userId, client);
    });

    receiver.speaking.on('end', (userId) => {
        activeSpeakers.delete(userId);
    });
}

// Local transcribeAudio function removed in favor of AI-based transcription imported from ../ai

async function handleSpeechBurst(receiver: VoiceReceiver, connection: VoiceConnection, userId: string, client: ExtendedClient) {
    userDebounce.add(userId);

    setTimeout(() => userDebounce.delete(userId), 3000);

    const audioStream = receiver.subscribe(userId, {
        end: {
            behavior: EndBehaviorType.AfterSilence,
            duration: 1000,
        },
    });
    audioStream.setMaxListeners(20); // Prevent warning if rapid subscriptions occur

    const opusDecoder = new opus.Decoder({ frameSize: 960, channels: 2, rate: 48000 });

    opusDecoder.on('error', (err: any) => {
        if (err.message?.includes('Invalid packet') || err.message?.includes('Decode error')) {
            return;
        }
        console.error(`[Voice:Decoder] Error for ${userId}:`, err.message);
    });

    const chunks: Buffer[] = [];

    const streamCollector = new Writable({
        write(chunk, encoding, callback) {
            chunks.push(chunk);
            callback();
        }
    });

    console.log(`[Voice] 📥 Subscribed to ${userId}, collecting audio...`);

    const currentClient = client;

    pipeline(audioStream, opusDecoder, streamCollector, async (err: any) => {
        audioStream.destroy();
        opusDecoder.destroy();

        console.log(`[Voice] 🔄 Pipeline completed for ${userId}. Chunks: ${chunks.length}, Error: ${err ? err.message : 'none'}`);

        if (err) {
            const msg = err.message || '';
            if (!msg.includes('DecryptionFailed') && !msg.includes('Decode error') && !msg.includes('Invalid packet')) {
                console.error(`[Voice] ❌ Pipeline error for ${userId}:`, err);
            }
            return;
        }

        const guildId = connection.joinConfig.guildId!;
        const settings = getGuildSetting(guildId);
        if (settings) {
            console.log(`[Voice] ⚙️ Guild settings: maintenance=${settings.maintenance_mode}, disable_voice=${settings.disable_voice}, disable_chat=${settings.disable_chat}`);
        }
        if (settings?.maintenance_mode === 1 || settings?.disable_voice === 1) {
            console.log(`[Voice] ⏸️ Voice explicitly disabled for guild ${guildId}`);
            return;
        }

        if (chunks.length < 10) {
            console.log(`[Voice] 🔇 Too few chunks (${chunks.length} < 10), ignoring short burst`);
            return;
        }
        if (guildLocks.has(guildId)) {
            console.log(`[Voice] 🔒 Guild ${guildId} is locked, skipping`);
            return;
        }

        guildLocks.add(guildId);

        try {
            const userData = getUser(userId, "Voice User");

            const pcmBuffer = Buffer.concat(chunks);
            const wavBuffer = pcmToWav(pcmBuffer, 48000, 2);

            console.log(`[Voice] 🧠 Captured ${wavBuffer.length} bytes from ${userId}. Transcribing...`);

            // Step 1: Local speech-to-text with Vosk
            const sttStart = Date.now();
            const transcribedText = await transcribeAudio(wavBuffer);
            console.log(`[Voice] ⏱️ STT took ${Date.now() - sttStart}ms`);

            if (!transcribedText || transcribedText.length < 2) {
                console.log(`[Voice] 🍃 Transcription empty or too short, skipping.`);
                guildLocks.delete(guildId);
                return;
            }

            console.log(`[Voice] 📝 Transcribed: "${transcribedText}"`);

            // Step 2: Send transcribed text to Gemma3 via Ollama
            console.log(`[Voice] 🤖 Sending '${transcribedText}' to AI...`);
            const relationship = getUserRelationship(userId);
            const friendshipPts = userData.friendship_points || 0;
            const rawHistory = getInteractions(userId, 3) as any[];
            const history = rawHistory.reverse().flatMap(h => [
                { role: "user", parts: h.content },
                { role: "model", parts: h.response }
            ]);

            let { text, lang, sentiment, memories } = await generateVoiceResponse(transcribedText, relationship, history as any, userId, friendshipPts);
            if (!text) throw new Error("AI returned empty text");

            // Clean any stray tags from AI response
            if (text.includes('[IGNORE]')) {
                console.log(`[Voice] 🤫 AI chose to ignore.`);
                guildLocks.delete(guildId);
                return;
            }

            // Clean any stray tags from AI response
            text = text.replace(/\[CMD:.*?\]/g, '').trim();
            if (!text) {
                console.log(`[Voice] 🍃 Empty response after cleanup, skipping.`);
                guildLocks.delete(guildId);
                return;
            }
            console.log(`[Voice] 💬 AI response: "${text}"`);

            // --- Selective Multi-Speaker Logic ---
            if (activeSpeakers.size > 1) {
                await playTTS(`Please guys, one by one! I'm trying to listen to ${userData.username}...`, connection, lang);
                await new Promise(r => setTimeout(r, 2500));
            }

            // --- Command Execution Logic ---
            const cmdMatch = text.match(/\[CMD:(.*?)\]/);
            if (cmdMatch) {
                const cmdName = cmdMatch[1].toLowerCase();
                text = text.replace(/\[CMD:.*?\]/, '').trim();

                const cmd = commands.get(cmdName);
                if (cmd) {
                    try {
                        const guild = currentClient.guilds.cache.get(guildId);
                        const targetChannel = guild?.channels.cache.find((c: any) => c.isTextBased()) as any;

                        if (targetChannel) {
                            const user = await currentClient.users.fetch(userId);
                            const member = guild?.members.cache.get(userId);

                            const mockInteraction = {
                                user, member, guild, guildId,
                                channel: targetChannel,
                                deferReply: async () => { },
                                editReply: async (payload: any) => {
                                    if (typeof payload === 'string') return targetChannel.send(`<@${userId}>, ${payload}`);
                                    return targetChannel.send({ ...payload, content: payload.content ? `<@${userId}>, ${payload.content}` : `<@${userId}>` });
                                },
                                reply: async (payload: any) => {
                                    if (typeof payload === 'string') return targetChannel.send(`<@${userId}>, ${payload}`);
                                    return targetChannel.send({ ...payload, content: payload.content ? `<@${userId}>, ${payload.content}` : `<@${userId}>` });
                                },
                                options: { getUser: () => null, getString: () => null, getInteger: () => null }
                            } as any;

                            await cmd.execute(mockInteraction);
                        }
                    } catch (cmdErr) {
                        console.error(`[Voice] Failed to execute command ${cmdName}:`, cmdErr);
                    }
                }
            }

            console.log(`[Voice] ✨ Xya responding to ${userId}: "${text}"`);

            // --- Voice Moderation ---
            const toxicSentiment = checkToxicity(text);
            if (toxicSentiment !== "Neutral") {
                let warnKey: "warnings_rude" | "warnings_hateful" | "warnings_racist" = "warnings_rude";
                let disgustBase = 30; let friendshipLoss = 20;

                if (toxicSentiment === "Rude") { warnKey = "warnings_rude"; disgustBase = 30; friendshipLoss = 20; }
                if (toxicSentiment === "Hateful") { warnKey = "warnings_hateful"; disgustBase = 60; friendshipLoss = 40; }
                if (toxicSentiment === "Racist") { warnKey = "warnings_racist"; disgustBase = 180; friendshipLoss = 120; }

                const updateData: any = {
                    [warnKey]: (userData[warnKey] || 0) + 1,
                    disgust_points: Math.min(1000, (userData.disgust_points || 0) + disgustBase),
                    friendship_points: Math.max(0, (userData.friendship_points || 0) - friendshipLoss),
                    last_offense_time: Date.now()
                };

                await playTTS(`Please don't be ${toxicSentiment.toLowerCase()}, ${userData.username}... it makes Xya's heart hurt.`, connection);
                updateUser(userId, updateData);
                return;
            }

            await playTTS(text, connection, lang);

            // --- Voice Activity Rewards ---
            const voiceXP = 5;
            const voiceCoins = 3;
            updateUser(userId, {
                xp: (userData.xp || 0) + voiceXP,
                currency: (userData.currency || 0) + voiceCoins,
            });
            console.log(`[Voice] 💰 Rewarded ${userData.username}: +${voiceXP}XP, +${voiceCoins} coins`);

            // --- Memory Extraction ---
            if (memories && memories.length > 0) {
                for (const fact of memories) {
                    saveMemory(userId, fact);
                    console.log(`[Memory] 🧠 Saved from voice: "${fact}" for ${userData.username}`);
                }
            }

            // --- Relationship Update (Inverse: friendship ↑ = disgust ↓) ---
            let fDelta = 0; let dDelta = 0;
            if (sentiment === "Kind") { fDelta = 15; dDelta = -10; }
            else if (sentiment === "Rude") { fDelta = -20; dDelta = 25; }
            else if (sentiment === "Hateful" || sentiment === "Racist") { fDelta = -100; dDelta = 100; }
            else { fDelta = 3; dDelta = -2; } // Neutral: slow friendship build + disgust decay

            updateUser(userId, {
                friendship_points: Math.max(0, Math.min(1000, (userData.friendship_points || 0) + fDelta)),
                disgust_points: Math.max(0, Math.min(1000, (userData.disgust_points || 0) + dDelta))
            });

            logInteraction(userId, userData.username, `[Voice] ${transcribedText}`, text, sentiment);
        } catch (e) {
            console.error(`[Voice] ❌ Error processing speech for ${userId}:`, e);
        } finally {
            setTimeout(() => {
                guildLocks.delete(guildId);
                console.log(`[Voice:${guildId}] 👂 Xya is ready for more conversation!`);
            }, 1500);
        }
    });
}

function pcmToWav(pcmBuffer: Buffer, sampleRate: number, numChannels: number): Buffer {
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + pcmBuffer.length, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20); // PCM
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * numChannels * 2, 28);
    header.writeUInt16LE(numChannels * 2, 32);
    header.writeUInt16LE(16, 34); // Bits per sample
    header.write('data', 36);
    header.writeUInt32LE(pcmBuffer.length, 40);

    return Buffer.concat([header, pcmBuffer]);
}
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const server_1 = require("../server");
const deploy_commands_1 = require("./deploy-commands");
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const startTts_1 = require("./utils/startTts");
const voiceUtils_1 = require("./utils/voiceUtils");
const ai_1 = require("./ai");
const EventSystem_1 = require("./events/EventSystem");
dotenv_1.default.config();
const main = async () => {
    // 0. Clean up temp audio files
    (0, voiceUtils_1.cleanupAudioFolder)();
    // 1. Start Dashboard Server
    (0, server_1.startServer)();
    // 2. Start Local TTS Server (PocketTTS)
    await (0, startTts_1.startTTSServer)();
    // 3. Check Local AI (Ollama)
    const aiHealthy = await (0, ai_1.checkOllamaHealth)();
    if (!aiHealthy) {
        console.warn("⚠️  AI WARNING: Ollama is not running or Gemma3 is missing. Chat will not work.");
    }
    // 4. Start Discord Bot
    const client = (0, client_1.setupClient)();
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
        console.error("❌ Fatal: DISCORD_TOKEN is missing in .env");
        return;
    }
    try {
        await client.login(token);
        // Commands are auto-refreshed (PUT) which cleans up stale commands
        await (0, deploy_commands_1.deployCommands)();
        // Record bot start time for uptime tracking
        (0, db_1.updateBotStartTime)();
        // === TIMER SYSTEMS ===
        // --- Reminder Checker (every 30s) ---
        setInterval(async () => {
            try {
                const dueReminders = (0, db_1.getDueReminders)();
                for (const reminder of dueReminders) {
                    try {
                        const channel = await client.channels.fetch(reminder.channel_id);
                        if (channel?.isSendable()) {
                            await channel.send(`⏰ hey <@${reminder.user_id}>! you asked me to remind you: **${reminder.message}** 💕`);
                        }
                    }
                    catch (e) {
                        console.error(`[Reminder] Failed to deliver reminder ${reminder.id}:`, e);
                    }
                    (0, db_1.deleteReminder)(reminder.id);
                }
            }
            catch (e) {
                console.error("[Reminder] Error checking reminders:", e);
            }
        }, 30 * 1000);
        // --- Birthday Checker (every hour) ---
        let lastBirthdayCheck = '';
        setInterval(async () => {
            const now = new Date();
            const dateKey = `${now.getMonth() + 1}-${now.getDate()}`;
            if (dateKey === lastBirthdayCheck)
                return;
            lastBirthdayCheck = dateKey;
            try {
                const birthdays = (0, db_1.getTodayBirthdays)(now.getMonth() + 1, now.getDate());
                for (const bday of birthdays) {
                    try {
                        const guild = client.guilds.cache.get(bday.guild_id);
                        if (!guild)
                            continue;
                        const channel = guild.channels.cache.find((c) => c.isTextBased() && c.permissionsFor?.(guild.members.me)?.has('SendMessages'));
                        if (channel?.isSendable()) {
                            await channel.send(`🎂🎉 **HAPPY BIRTHDAY** <@${bday.user_id}>!! 🥳🎶\nXya is singing just for you today!! You're amazing and I hope your day is as wonderful as you are 💕✨🎵`);
                        }
                    }
                    catch (e) {
                        console.error(`[Birthday] Error announcing for ${bday.user_id}:`, e);
                    }
                }
            }
            catch (e) {
                console.error("[Birthday] Error checking birthdays:", e);
            }
        }, 60 * 60 * 1000);
        // --- Server Events (Managed by EventSystem) ---
        EventSystem_1.eventSystem.init(client);
        // --- Scheduler (Daily WYR, etc) ---
        const { initScheduler } = await Promise.resolve().then(() => __importStar(require('./utils/scheduler')));
        initScheduler(client);
        // --- Weekly Highlights (every Sunday at noon) ---
        setInterval(async () => {
            const now = new Date();
            if (now.getDay() !== 0 || now.getHours() !== 12)
                return;
            try {
                for (const guild of client.guilds.cache.values()) {
                    const highlights = (0, db_1.getWeeklyHighlights)(guild.id);
                    if (highlights.totalMessages === 0)
                        continue;
                    let highlightText = `📊 **Weekly Highlights!** 🎉\n\n`;
                    highlightText += `Total messages this week: **${highlights.totalMessages}**\n\n`;
                    if (highlights.topChatters.length > 0) {
                        highlightText += `💬 **Top Chatters:**\n`;
                        for (let i = 0; i < highlights.topChatters.length; i++) {
                            const c = highlights.topChatters[i];
                            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                            highlightText += `${medals[i]} <@${c.user_id}> — ${c.msg_count} messages\n`;
                        }
                    }
                    if (highlights.topVoice.length > 0) {
                        highlightText += `\n🎤 **Top Voice Users:**\n`;
                        for (let i = 0; i < highlights.topVoice.length; i++) {
                            const v = highlights.topVoice[i];
                            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                            highlightText += `${medals[i]} <@${v.user_id}> — ${v.total_mins} minutes\n`;
                        }
                    }
                    highlightText += `\nyou guys are amazing, keep it up!! 💕✨ — Xya`;
                    highlightText += `\nyou guys are amazing, keep it up!! 💕✨ — Xya`;
                    const settings = (0, db_1.getGuildSetting)(guild.id);
                    let channel;
                    if (settings?.events_channel_id) {
                        channel = guild.channels.cache.get(settings.events_channel_id);
                    }
                    if (!channel) {
                        channel = guild.channels.cache.find((c) => c.isTextBased() && c.permissionsFor?.(guild.members.me)?.has('SendMessages'));
                    }
                    if (channel?.isSendable()) {
                        await channel.send(highlightText);
                    }
                }
            }
            catch (e) {
                console.error("[Highlights] Error:", e);
            }
        }, 60 * 60 * 1000); // Check every hour
        // --- Weekly Kindest User Award ---
        setInterval(async () => {
            const now = Date.now();
            console.log("Checking for weekly kindest user...");
            try {
                const kindest = db_1.db.prepare(`
                    SELECT user_id, username, COUNT(*) as count 
                    FROM interactions 
                    WHERE sentiment = 'Kind' AND timestamp > ? 
                    GROUP BY user_id 
                    ORDER BY count DESC 
                    LIMIT 1
                `).get(now - (7 * 24 * 60 * 60 * 1000));
                if (kindest) {
                    console.log(`Rewarding ${kindest.username} with 500 Gems!`);
                    const user = (0, db_1.getUser)(kindest.user_id, kindest.username);
                    (0, db_1.updateUser)(kindest.user_id, { currency: (user.currency || 0) + 500 });
                }
            }
            catch (e) {
                console.error("Error in weekly reward:", e);
            }
        }, 24 * 60 * 60 * 1000);
        // --- Mood Log (every 30 min) ---
        setInterval(() => {
            const mood = (0, ai_1.getCurrentMood)();
            console.log(`[Mood] ${mood.emoji} Xya's current mood: ${mood.mood} — ${mood.effect}`);
        }, 30 * 60 * 1000);
        const mood = (0, ai_1.getCurrentMood)();
        console.log(`[Mood] ${mood.emoji} Xya started with mood: ${mood.mood}`);
    }
    catch (error) {
        console.error("Failed to start bot:", error);
    }
};
main();

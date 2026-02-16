import { Message, Events, ChannelType, EmbedBuilder, AttachmentBuilder, TextChannel } from 'discord.js';
import { getUser, updateUser, logInteraction, getInteractions, getWordleGame, saveWordleGame, deleteWordleGame, getMood, updateMood, getUserRelationship, getGuildSetting, logMessage, updateUserActivityByHour, updateUserActivityByDay, updateMessagesPerChannel, logEconomyTransaction, saveMemory, getMilestoneTitle, getMilestoneThresholds, getMilestoneMultiplier } from '../db';
import { generateResponse, scanAttachment } from '../ai';
import { generateWordleBoard } from '../utils/wordleGen';
import { checkToxicity, ToxicityCategory } from '../utils/moderation';
import { commands } from '../commands';
import * as profileCommand from '../commands/profile';
import * as dailyCommand from '../commands/daily';
import * as rpsCommand from '../commands/rps';
import * as coinflipCommand from '../commands/coinflip';
import * as joinCommand from '../commands/join';
import { eventSystem } from './EventSystem';

const SPAM_THRESHOLD = 5;
const SPAM_WINDOW = 5000;
const PUNISH_RESET_TIME = 12 * 60 * 60 * 1000;
const CONVERSATION_TIMEOUT = 45 * 1000; // Reduced to 45s

// In-memory spam cache
const spamCache = new Map<string, { count: number, lastTime: number }>();

// In-memory conversation tracking: channelId -> { userId, timestamp }
const recentConversations = new Map<string, { userId: string, timestamp: number }>();
// Supported image MIME types for vision
const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

// Fetch an image from URL and return base64
const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer).toString('base64');
    } catch (e) {
        console.error('[Vision] Failed to fetch image:', e);
        return null;
    }
};

const isContentValidForXp = (content: string) => {
    if (content.includes('http')) return false;
    if (content.includes('gif')) return false;
    return !/^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])+$/.test(content);
};

const getLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100));

export const name = Events.MessageCreate;
export const execute = async (message: Message) => {
    if (message.author.bot) return;

    // --- EVENT SYSTEM ---
    eventSystem.handleMessage(message);

    // --- ATTACHMENT MODERATION ---
    if (message.attachments.size > 0 && message.guild) {
        const checkable = message.attachments.filter(a =>
            a.contentType?.startsWith('image/') || a.contentType?.startsWith('video/')
        );

        if (checkable.size > 0) {
            for (const attachment of checkable.values()) {
                const scan = await scanAttachment(attachment.url, attachment.contentType!);
                if (!scan.safe) {
                    try {
                        if (message.deletable) await message.delete();
                        const warningMsg = await (message.channel as TextChannel).send(`⚠️ <@${message.author.id}>, your attachment was removed for **${scan.reason || 'Safety Violation'}**. Please be careful! ♪`);

                        // Delete warning after 10s
                        setTimeout(() => warningMsg.delete().catch(() => { }), 10000);

                        // Log violation
                        logInteraction(message.author.id, message.author.username, `[Deleted Attachment: ${scan.reason}]`, "Violation", "Hateful");
                    } catch (e) {
                        console.error("[AutoMod] Failed to action attachment:", e);
                    }
                    return; // STOP PROCESSING
                }
            }
        }
    }

    // Zero-Latency Debug Console
    console.log(`[Message] ${message.author.username}: ${message.content}`);

    const user = getUser(message.author.id, message.author.username);
    const now = Date.now();
    const date = new Date();
    const hour = date.getHours();
    const day = date.getDay();

    // Track message statistics
    if (message.guild) {
        logMessage(message.author.id, message.guild.id, message.channel.id);
        updateUserActivityByHour(message.author.id, hour);
        updateUserActivityByDay(message.author.id, day);
        updateMessagesPerChannel(message.author.id, message.channel.id);
        updateUser(message.author.id, { last_active_time: now });
    }

    // --- High-Speed Spam Detection ---
    if (message.guild) {
        let spamData = spamCache.get(message.author.id) || { count: 0, lastTime: 0 };
        const timeDiff = now - spamData.lastTime;
        spamData.count = (timeDiff < SPAM_WINDOW) ? spamData.count + 1 : 1;
        spamData.lastTime = now;
        spamCache.set(message.author.id, spamData);

        if (spamData.count > SPAM_THRESHOLD) {
            console.warn(`[SPAM DETECTED] ${message.author.username} - Count: ${spamData.count}`);
            const newWarnings = (user.warnings || 0) + 1;
            if (newWarnings === 1) {
                await message.reply("Please do not spam, sweetie! 🥺");
                updateUser(message.author.id, { warnings: newWarnings });
            } else {
                const timeoutMinutes = Math.pow(2, user.timeout_level || 0);
                try {
                    if (message.member?.moderatable) {
                        await message.member.timeout(timeoutMinutes * 60 * 1000, "Spamming");
                        if (message.channel.isSendable()) {
                            await message.channel.send(`Oh my... ${message.author} has been timed out for ${timeoutMinutes}m for spamming. Please be nice! ♪`);
                        }
                    } else {
                        if (message.channel.isSendable()) await message.channel.send(`Xya wants to timeout ${message.author}, but they are too powerful! 🥺`);
                    }
                    updateUser(message.author.id, {
                        timeout_level: (user.timeout_level || 0) + 1,
                        last_punished: now,
                        disgust_points: Math.min(1000, (user.disgust_points || 0) + 20),
                        friendship_points: Math.max(0, (user.friendship_points || 0) - 10)
                    });
                    spamCache.delete(message.author.id);
                } catch (e) { }
            }
            return;
        }
    }

    // --- High-Speed Toxicity Analysis (Script-based) ---
    const toxicSentiment = checkToxicity(message.content);

    if (toxicSentiment !== "Neutral") {
        console.warn(`[TOXICITY DETECTED] ${message.author.username} - Sentiment: ${toxicSentiment}`);

        let warnKey: "warnings_rude" | "warnings_hateful" | "warnings_racist" = "warnings_rude";
        let limit = 5; let disgustBase = 20; let friendshipLoss = 10;

        if (toxicSentiment === "Rude") { warnKey = "warnings_rude"; limit = 5; disgustBase = 20; friendshipLoss = 10; }
        if (toxicSentiment === "Hateful") { warnKey = "warnings_hateful"; limit = 4; disgustBase = 50; friendshipLoss = 30; }
        if (toxicSentiment === "Racist") { warnKey = "warnings_racist"; limit = 2; disgustBase = 150; friendshipLoss = 100; }

        const newWarnings = (user[warnKey] || 0) + 1;
        const updateData: any = {
            [warnKey]: newWarnings,
            disgust_points: Math.min(1000, (user.disgust_points || 0) + disgustBase),
            friendship_points: Math.max(0, (user.friendship_points || 0) - friendshipLoss),
            last_offense_time: Date.now()
        };

        if (newWarnings >= limit) {
            let currentLevel = user.timeout_level || 0;
            if (Date.now() - (user.last_offense_time || 0) > PUNISH_RESET_TIME) currentLevel = 0;
            const timeoutMinutes = Math.pow(2, currentLevel);
            updateData.timeout_level = currentLevel + 1;
            updateData[warnKey] = 0;

            try {
                if (message.member?.moderatable) {
                    await message.member.timeout(timeoutMinutes * 60 * 1000, `Toxicity: ${toxicSentiment}`);
                    await message.reply(`Xya is very sad... You reached the warning limit for being ${toxicSentiment.toLowerCase()}.
You've been timed out for **${timeoutMinutes}m**. Please be kinder! 🥺`);
                } else {
                    await message.reply(`Xya is sad... You are being ${toxicSentiment.toLowerCase()}, but I cannot moderate you. Please stop! ♪`);
                }
            } catch (e) { }
        } else {
            await message.reply(`Please don't be ${toxicSentiment.toLowerCase()}! This is warning **${newWarnings}/${limit}**. Xya wants everyone to be friends! ♪`);
        }
        updateUser(message.author.id, updateData);
        return; // STOP: No XP for toxic messages
    }

    // --- Wordle Game Logic ---
    const activeWordle = getWordleGame(message.author.id);
    if (activeWordle && /^[a-zA-Z]+$/.test(message.content) && !message.content.includes(' ')) {
        const guess = message.content.toUpperCase();
        const targetLength = activeWordle.word.length;

        if (guess.length !== targetLength) {
            // Only respond if it's a single word that looks like a guess but wrong length
            if (guess.length >= 4 && guess.length <= 7) {
                await message.reply(`The word I'm thinking of has **${targetLength}** letters, sweetie! ♪`);
                return;
            }
        } else {
            const guesses = JSON.parse(activeWordle.guesses) as string[];

            if (guesses.includes(guess)) {
                await message.reply("You already guessed that word, sweetie! ♪");
                return;
            } else {
                guesses.push(guess);
                const tries = activeWordle.tries + 1;

                if (guess === activeWordle.word) {
                    const buffer = generateWordleBoard(activeWordle.word, guesses);
                    const attachment = new AttachmentBuilder(buffer, { name: 'wordle_win.png' });

                    const embed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle('✨ YAY! You got it!')
                        .setDescription(`The word was **${activeWordle.word}**! You're so smart! 🍭\n\nYou earned **50** 💎 and **100** ✨!`)
                        .setImage('attachment://wordle_win.png');

                    await message.reply({
                        embeds: [embed],
                        files: [attachment]
                    });
                    deleteWordleGame(message.author.id);
                    const newXp = user.xp + 100;
                    const newCurrency = user.currency + 50;
                    updateUser(message.author.id, { currency: newCurrency, xp: newXp });
                    logEconomyTransaction(message.author.id, 'wordle_win', 50, 'wordle_game', newCurrency);
                } else if (tries >= 6) {
                    const buffer = generateWordleBoard(activeWordle.word, guesses);
                    const attachment = new AttachmentBuilder(buffer, { name: 'wordle_loss.png' });

                    const embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('Oh no...')
                        .setDescription(`You\'re out of tries! The word was **${activeWordle.word}**. Better luck next time, okay? ♪`)
                        .setImage('attachment://wordle_loss.png');

                    await message.reply({
                        embeds: [embed],
                        files: [attachment]
                    });
                    deleteWordleGame(message.author.id);
                } else {
                    saveWordleGame(message.author.id, activeWordle.word, guesses, tries);
                    const buffer = generateWordleBoard(activeWordle.word, guesses);
                    const attachment = new AttachmentBuilder(buffer, { name: 'wordle.png' });

                    const embed = new EmbedBuilder()
                        .setColor(0x00FFFF)
                        .setTitle('Keep going!')
                        .setDescription(`Not quite! I believe in you! (Guess **${tries}/6**) ♪`)
                        .setImage('attachment://wordle.png');

                    await message.reply({
                        embeds: [embed],
                        files: [attachment]
                    });
                }
                return;
            }
        }
    }

    // --- XP ---
    if (isContentValidForXp(message.content)) {
        const oldLevel = getLevel(user.xp);

        // Multiplier based on Friendship Rank
        const multiplier = getMilestoneMultiplier(user.friendship_points || 0);
        const baseXp = 15;
        const newXp = Math.floor(user.xp + (baseXp * multiplier));

        updateUser(message.author.id, { xp: newXp });
        if (getLevel(newXp) > oldLevel && message.channel.isSendable()) {
            await message.channel.send(`✨ **Level Up!** ${message.author} is now **Level ${oldLevel + 1}**!`);
        }
    }

    // --- Random Reactions (makes Xya feel present even when not addressed) ---
    if (message.guild && Math.random() < 0.04 && message.content.length > 10) {
        const reactionEmojis = ['👀', '❤️', '😂', '🎵', '✨', '💀', '😭', '👏', '🔥', '💕'];
        const emoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        try { await message.react(emoji); } catch { }
    }

    // --- Active AI Interaction ---
    const isMentioned = message.mentions.has(message.client.user!.id);
    const isXya = message.content.toLowerCase().includes("xya");
    const isHello = message.content.toLowerCase().includes("hello");

    // Smart Reply Detection: check if user was recently talking to Xya in this channel
    const channelId = message.channel.id;
    const recentConvo = recentConversations.get(channelId);

    // IGNORE replies to bot embeds/interactions (games, shop, etc) unless explicitly mentioned
    let isGameInput = false;
    if (message.reference) {
        try {
            const ref = await message.fetchReference();
            // If replying to the bot AND the bot sent an Embed (games usually use embeds), ignore it
            if (ref.author.id === message.client.user?.id && ref.embeds.length > 0) {
                isGameInput = true;
            }
        } catch { }
    }

    // Explicit mentions bypass this check
    if (isMentioned || isHello || isXya) isGameInput = false;

    const isConversationContinuation = !isGameInput
        && recentConvo
        && recentConvo.userId === message.author.id
        && (now - recentConvo.timestamp) < CONVERSATION_TIMEOUT
        && Math.random() < 0.8; // 80% chance to reply to follow-ups to reduce spamminess


    // Check for image attachments
    const imageAttachments = message.attachments.filter(att =>
        att.contentType && IMAGE_MIME_TYPES.includes(att.contentType.toLowerCase())
    );
    const hasImages = imageAttachments.size > 0;

    // Trigger AI if: mentioned, DM, says "xya"/"hello", continuing a conversation, or sending images to Xya
    const shouldRespond = isMentioned
        || message.channel.type === ChannelType.DM
        || isXya
        || isHello
        || isConversationContinuation;

    if (shouldRespond) {
        // Feature Toggles
        const guildId = message.guild?.id;
        if (guildId) {
            const settings = getGuildSetting(guildId);
            if (settings?.maintenance_mode || settings?.disable_chat) return;
        }

        // --- TYPING INDICATOR LOOP ---
        // Keeps the "Xya is typing..." status active during long generations
        let typingInterval: NodeJS.Timeout | null = null;
        let safetyTimeout: NodeJS.Timeout | null = null;

        if (message.channel.isSendable()) {
            await message.channel.sendTyping().catch(() => { });
            typingInterval = setInterval(async () => {
                try {
                    if (message.channel.isSendable()) await message.channel.sendTyping();
                } catch { }
            }, 8000); // Re-trigger every 8s (Discord typing lasts ~10s)

            // Safety timeout: stop typing after 60s max to prevent infinite typing
            safetyTimeout = setTimeout(() => {
                if (typingInterval) clearInterval(typingInterval);
                typingInterval = null;
            }, 60000);
        }

        try {
            const rawHistory = getInteractions(message.author.id, 6) as any[];
            const history = rawHistory.reverse().flatMap(h => [
                { role: "user", parts: h.content },
                { role: "model", parts: h.response }
            ]);

            const relationship = getUserRelationship(message.author.id);
            const friendshipPts = user.friendship_points || 0;

            // Build prompt — include image context if present
            let imageBase64List: string[] = [];
            let imageContext = '';

            // 1. Process standard attachments
            if (hasImages) {
                console.log(`[Vision] 🖼️ Processing ${imageAttachments.size} image(s) from ${message.author.username}`);
                const fetchPromises = imageAttachments.map(att => fetchImageAsBase64(att.url));
                const results = await Promise.all(fetchPromises);
                const validImages = results.filter((b): b is string => b !== null);
                imageBase64List.push(...validImages);
            }

            // 2. Process Tenor GIF links
            const tenorMatch = message.content.match(/https?:\/\/tenor\.com\/view\/[\w-]+-\d+/i);
            if (tenorMatch) {
                try {
                    console.log(`[Vision] 🖼️ Found Tenor link: ${tenorMatch[0]}`);
                    const html = await (await fetch(tenorMatch[0])).text();
                    // Extract the raw media URL from OpenGraph tags
                    const mediaMatch = html.match(/<meta\s+property="og:image"\s+content="(https:\/\/media\.tenor\.com\/.*?\.(gif|png|jpg))"/i);

                    if (mediaMatch && mediaMatch[1]) {
                        const mediaUrl = mediaMatch[1];
                        console.log(`[Vision] 🖼️ Extracted Media URL: ${mediaUrl}`);
                        const base64 = await fetchImageAsBase64(mediaUrl);
                        if (base64) {
                            imageBase64List.push(base64);
                            imageContext += `\n[User sent a Tenor GIF. Check it for content.]`;
                        }
                    }
                } catch (e: any) {
                    console.error("[Vision] Failed to process Tenor link:", e.message);
                }
            }

            if (imageBase64List.length > 0) {
                imageContext += `\n[The user sent ${imageBase64List.length} image(s)/gifs. Describe what you see and react naturally as Xya would. If it's racist or hateful, say so!]`;
            }

            const msgContent = message.content || (imageBase64List.length > 0 ? '(shared content)' : '');
            const prompt = `User: ${message.author.username}\nRel: ${relationship}\nMsg: ${msgContent}${imageContext}\n\n[Rule: Use [CMD:name] tag if needed]`;

            let { text, sentiment, lang, memories } = await generateResponse(prompt, history as any, message.author.id, friendshipPts, imageBase64List.length > 0 ? imageBase64List : undefined);

            // --- Auto-Delete Hateful Content ---
            if (sentiment === 'Hateful' || sentiment === 'Racist') {
                if (message.deletable) {
                    await message.delete().catch(() => { });
                    console.log(`[AutoMod] 🗑️ Deleted hateful message from ${message.author.username}`);
                }
            }

            // --- Command Execution Logic ---
            const cmdMatch = text.match(/\[CMD:(.*?)\]/i);
            if (cmdMatch) {
                const cmdName = cmdMatch[1].toLowerCase();

                console.log(`[Chat] 🚀 AI requested command: ${cmdName} for user ${message.author.username}`);

                const cmd = commands.get(cmdName);
                if (cmd) {
                    try {
                        // Create a mock interaction
                        const mockInteraction = {
                            user: message.author,
                            member: message.member,
                            guild: message.guild,
                            guildId: message.guild?.id,
                            channel: message.channel,
                            deferReply: async () => { },
                            editReply: async (payload: any) => {
                                if (!message.channel.isSendable()) return null;
                                if (typeof payload === 'string') {
                                    return message.channel.send(`<@${message.author.id}>, ${payload}`);
                                } else {
                                    return message.channel.send({ ...payload, content: payload.content ? `<@${message.author.id}>, ${payload.content}` : `<@${message.author.id}>` });
                                }
                            },
                            reply: async (payload: any) => {
                                if (!message.channel.isSendable()) return null;
                                if (typeof payload === 'string') {
                                    return message.channel.send(`<@${message.author.id}>, ${payload}`);
                                } else {
                                    return message.channel.send({ ...payload, content: payload.content ? `<@${message.author.id}>, ${payload.content}` : `<@${message.author.id}>` });
                                }
                            },
                            options: {
                                getUser: () => null,
                                getString: () => null,
                                getInteger: () => null,
                            }
                        } as any;

                        await cmd.execute(mockInteraction);
                    } catch (cmdErr) {
                        console.error(`[Chat] Failed to execute command ${cmdName}:`, cmdErr);
                    }
                }
            }

            // --- Memory Extraction ---
            if (memories && memories.length > 0) {
                for (const fact of memories) {
                    saveMemory(message.author.id, fact);
                    console.log(`[Memory] 🧠 Saved: "${fact}" for ${message.author.username}`);
                }
            }

            // --- Final Cleanup of ANY tag left in the string ---
            const finalCleanText = text
                .replace(/\|?SENTIMENT:?\s*\w+\|?/gi, '')
                .replace(/\|?LANG:?\s*[\w-]+\|?/gi, '')
                .replace(/\[CMD:.*?\]/gi, '')
                .replace(/\[MEMORY:.*?\]/gi, '')
                .replace(/\[\s*\]/g, '') // Remove empty brackets
                .replace(/\s+(Kind|Neutral|Rude|Hateful|Racist)(en|fr|vi|ja|zh|es)$|$/i, '')
                .trim();

            if (finalCleanText) {
                await message.reply(finalCleanText);
            }

            // --- Relationship Update ---
            const userStats = getUser(message.author.id, message.author.username);
            const oldFriendship = userStats.friendship_points || 0;
            let fDelta = 0; let dDelta = 0;

            // Updated Values: Harder Progression
            if (sentiment === "Kind") { fDelta = 4; dDelta = -5; }          // Was +15, -20
            else if (sentiment === "Rude") { fDelta = -10; dDelta = 10; }   // Was -20, +25
            else if (sentiment === "Hateful" || sentiment === "Racist") { fDelta = -50; dDelta = 50; } // Was -100, +100
            else { fDelta = 1; dDelta = -1; }                               // Neutral: Was +5, -5

            const newFriendship = Math.max(0, Math.min(2000, oldFriendship + fDelta)); // Max raised to 2000 for Obsessed
            updateUser(message.author.id, {
                friendship_points: newFriendship,
                disgust_points: Math.max(0, Math.min(1000, (userStats.disgust_points || 0) + dDelta))
            });

            // --- Milestone Announcement ---
            const thresholds = getMilestoneThresholds();
            for (const threshold of thresholds) {
                if (oldFriendship < threshold && newFriendship >= threshold) {
                    const title = getMilestoneTitle(newFriendship);
                    const milestoneMsg = `✨ **Milestone Reached!** ${message.author} is now ${title} with Xya! 💕`;
                    if (message.channel.isSendable()) {
                        await new Promise(r => setTimeout(r, 1000));
                        await message.channel.send(milestoneMsg);
                    }
                    break;
                }
            }

            logInteraction(message.author.id, message.author.username, message.content || '(image)', text, sentiment);

            // Track this conversation for smart reply detection
            recentConversations.set(channelId, { userId: message.author.id, timestamp: Date.now() });

        } catch (error: any) {
            console.error("[MessageCreate] Critical Error:", error);
            // Optional: send a message if it wasn't a silent failure
            // try { await message.reply("oops... my brain short-circuited 😵💫 check logs pls!"); } catch {}
        } finally {
            // STOP TYPING immediately when done (or if error occurred)
            if (typingInterval) clearInterval(typingInterval);
            if (safetyTimeout) clearTimeout(safetyTimeout);
        }
    }

    // Clean up stale conversation entries periodically (every 100 messages)
    if (Math.random() < 0.01) {
        const cutoff = Date.now() - CONVERSATION_TIMEOUT * 2;
        for (const [key, val] of recentConversations) {
            if (val.timestamp < cutoff) recentConversations.delete(key);
        }
    }
};
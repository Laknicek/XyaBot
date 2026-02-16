import { Client, TextChannel, EmbedBuilder, Message, MessageFlags, Collection } from 'discord.js';
import { getGuildSetting, getUser, updateUser } from '../db';
import { verifyImageContent } from '../ai';

// --- CONFIGURATION ---
const MIN_EVENT_INTERVAL = 1 * 60 * 60 * 1000; // 1 Hour
const MAX_EVENT_INTERVAL = 3 * 60 * 60 * 1000; // 3 Hours

interface ServerEvent {
    id: string;
    name: string;
    description: string;
    type: 'passive' | 'interactive';
    duration: number; // ms
    color: number;
    emoji: string;
    // Interactive specific
    requirement?: string; // e.g. "a cat" for AI verification
    rewardCoins?: number;
    rewardXpMultiplier?: number;
    // Logic
    onStart?: (channel: TextChannel) => Promise<void>;
    onMessage?: (message: Message) => Promise<void>;
    onEnd?: (channel: TextChannel) => Promise<void>;
}

class EventSystem {
    private client: Client | null = null;
    private activeEvents: Map<string, ServerEvent> = new Map(); // guildId -> currentEvent
    private eventTimeout: NodeJS.Timeout | null = null;
    private winners: Map<string, Set<string>> = new Map(); // eventId -> Set<userId> (for preventing double rewards)

    // --- DEFINED EVENTS ---
    private events: ServerEvent[] = [
        // PASSIVE EVENTS
        {
            id: 'gem_rain',
            name: 'Gem Rain',
            description: 'It\'s raining gems! 💎\nEveryone who chats gets **+50 Gems** per message!',
            type: 'passive',
            duration: 10 * 60 * 1000, // 10 mins
            color: 0x00FFFF,
            emoji: '💎',
            rewardCoins: 50
        },
        {
            id: 'karaoke',
            name: 'Karaoke Night',
            description: 'Xya is feeling musical! 🎤\nChat activity grants **2x XP**!',
            type: 'passive',
            duration: 15 * 60 * 1000,
            color: 0xFF69B4,
            emoji: '🎤',
            rewardXpMultiplier: 2
        },
        {
            id: 'lucky_hour',
            name: 'Lucky Hour',
            description: 'Feeling lucky? 🍀\nFirst 5 people to say "I feel lucky" get **100 Gems**!',
            type: 'interactive',
            duration: 5 * 60 * 1000,
            color: 0x00FF00,
            emoji: '🍀',
            onMessage: async (msg) => {
                if (msg.content.toLowerCase().includes('i feel lucky')) {
                    this.awardPrize(msg, 100, 'Lucky Hour Winner');
                }
            }
        },
        // AI INTERACTIVE EVENTS
        {
            id: 'show_pet',
            name: 'Pet Parade',
            description: 'Show me your pets! 🐾\nPost a picture of your **cat, dog, or any pet** to win **300 Gems**!',
            type: 'interactive',
            duration: 10 * 60 * 1000,
            color: 0xFFA500,
            emoji: '🐾',
            requirement: 'a pet animal like a dog, cat, bird, hamster, etc',
            rewardCoins: 300
        },
        {
            id: 'show_wallpaper',
            name: 'Desktop Check',
            description: 'Show me your wallpaper! 🖥️\nPost a screenshot of your **phone or desktop wallpaper** to win **250 Gems**!',
            type: 'interactive',
            duration: 10 * 60 * 1000,
            color: 0x9932CC,
            emoji: '🖥️',
            requirement: 'a computer desktop wallpaper or phone home screen',
            rewardCoins: 250
        },
        {
            id: 'selfie_time',
            name: 'Selfie Time',
            description: 'Xya wants to see you! 📸\nPost a **selfie** (IRL) to win **500 Gems**!',
            type: 'interactive',
            duration: 15 * 60 * 1000,
            color: 0xFF1493,
            emoji: '📸',
            requirement: 'a selfie of a person',
            rewardCoins: 500
        }
    ];

    public init(client: Client) {
        this.client = client;
        this.scheduleNextEvent();
        console.log('[Events] System Initialized.');
    }

    private scheduleNextEvent() {
        if (this.eventTimeout) clearTimeout(this.eventTimeout);

        const delay = MIN_EVENT_INTERVAL + Math.random() * (MAX_EVENT_INTERVAL - MIN_EVENT_INTERVAL);
        console.log(`[Events] Next event in ${(delay / 60000).toFixed(1)} minutes.`);

        this.eventTimeout = setTimeout(() => this.triggerRandomEvent(), delay);
    }

    private async triggerRandomEvent() {
        if (!this.client) return;

        const eventTemplate = this.events[Math.floor(Math.random() * this.events.length)];
        console.log(`[Events] Triggering: ${eventTemplate.name}`);

        for (const guild of this.client.guilds.cache.values()) {
            const settings = getGuildSetting(guild.id);
            if (!settings?.events_channel_id) continue; // STRICT: Only spawn in configured channel

            const channel = guild.channels.cache.get(settings.events_channel_id) as TextChannel;
            if (!channel || !channel.isSendable()) continue;

            // Start Event
            const eventInstance = { ...eventTemplate }; // Clone
            this.activeEvents.set(guild.id, eventInstance);
            this.winners.set(guild.id + eventInstance.id, new Set()); // Reset winners

            // Announcement Embed
            const endTime = Math.floor((Date.now() + eventInstance.duration) / 1000);
            const embed = new EmbedBuilder()
                .setTitle(`${eventInstance.emoji} EVENT: ${eventInstance.name}`)
                .setDescription(`${eventInstance.description}\n\n⏳ **Ends:** <t:${endTime}:R>`)
                .setColor(eventInstance.color)
                .setThumbnail('https://media1.tenor.com/m/m4SC_3x2C-oAAAAC/excited-anime.gif'); // Generic hype gif or Xya

            await channel.send({ embeds: [embed] });

            if (eventInstance.onStart) await eventInstance.onStart(channel);

            // Schedule End
            setTimeout(() => this.endEvent(guild.id, channel), eventInstance.duration);
        }

        this.scheduleNextEvent();
    }

    private async endEvent(guildId: string, channel: TextChannel) {
        const event = this.activeEvents.get(guildId);
        if (!event) return;

        this.activeEvents.delete(guildId);

        // Results Embed
        const winners = this.winners.get(guildId + event.id);
        const winnerCount = winners ? winners.size : 0;

        const embed = new EmbedBuilder()
            .setTitle(`${event.emoji} Event Ended: ${event.name}`)
            .setDescription(`The event is over! Thanks for playing! 💕`)
            .addFields({ name: 'Participants / Winners', value: `${winnerCount} users`, inline: true })
            .setColor(0x333333)
            .setTimestamp();

        // Specific wrap-up logic if needed
        if (event.onEnd) await event.onEnd(channel);

        await channel.send({ embeds: [embed] });
    }

    // --- PUBLIC HANDLERS ---

    public async handleMessage(message: Message) {
        if (!message.guild || message.author.bot) return;

        const event = this.activeEvents.get(message.guild.id);
        if (!event) return;

        const settings = getGuildSetting(message.guild.id);
        if (message.channelId !== settings?.events_channel_id) return; // Only process in event channel

        // PASSIVE REWARDS (Gem Rain / XP)
        if (event.type === 'passive') {
            if (event.rewardCoins) {
                // Rate limit slightly? Nah, users love spamming gem rain.
                // Maybe check valid message? 
                if (message.content.length > 2) {
                    const user = getUser(message.author.id, message.author.username);
                    updateUser(message.author.id, { currency: user.currency + event.rewardCoins });
                }
            }
            // XP multiplier logic handled in XP system (needs to check activeEvents)
        }

        // INTERACTIVE LOGIC
        if (event.type === 'interactive') {
            // Check if user already won
            const winnersKey = message.guild.id + event.id;
            const winners = this.winners.get(winnersKey) || new Set();
            if (winners.has(message.author.id)) return;

            // Image Verification
            if (event.requirement && message.attachments.size > 0) {
                const attachment = message.attachments.first()!;
                const isImage = attachment.contentType?.startsWith('image/');

                if (isImage) {
                    await message.react('👀'); // Acknowledge
                    const isValid = await verifyImageContent(attachment.url, event.requirement);

                    if (isValid) {
                        this.awardPrize(message, event.rewardCoins || 0, event.name);
                    } else {
                        const reply = await message.reply({
                            content: `hmmm... that doesn't look like **${event.requirement}** to me! try again? 🧐`
                        });
                        setTimeout(() => reply.delete().catch(() => { }), 5000);
                    }
                }
            }

            // Custom Logic
            if (event.onMessage) await event.onMessage(message);
        }
    }

    private async awardPrize(message: Message, amount: number, eventName: string) {
        const guildId = message.guild!.id;
        const currentEvent = this.activeEvents.get(guildId);
        if (!currentEvent) return;

        const winnersKey = guildId + currentEvent.id;
        const winners = this.winners.get(winnersKey) || new Set();

        if (winners.has(message.author.id)) return;

        winners.add(message.author.id);
        this.winners.set(winnersKey, winners);

        const user = getUser(message.author.id, message.author.username);
        updateUser(message.author.id, { currency: user.currency + amount });

        await message.reply(`🎉 **Correct!** You won **${amount} Gems**! (${eventName})`);
    }

    public getActiveEvent(guildId: string) {
        return this.activeEvents.get(guildId);
    }
}

export const eventSystem = new EventSystem();

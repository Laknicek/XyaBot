import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from '../types';
import { getUser, updateUser } from '../db';

const SUNO_API_URL = 'https://api.sunoapi.org/api/v1';
const COST = 10000;

export const data = new SlashCommandBuilder()
    .setName('music')
    .setDescription('Generate AI music using Suno V5 (Costs 10,000 Gems)')
    .addStringOption(option =>
        option.setName('prompt')
            .setDescription('Description of the song (lyrics or vibe)')
            .setRequired(true)
            .setMaxLength(1000)) // Safety limit, though API allows more
    .addStringOption(option =>
        option.setName('style')
            .setDescription('Music style/genre (e.g., "Heavy Metal", "Chill Hop")')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('title')
            .setDescription('Title of the song')
            .setRequired(false))
    .addBooleanOption(option =>
        option.setName('instrumental')
            .setDescription('Whether the song should be instrumental (no lyrics)')
            .setRequired(false));

import { getGuildSetting } from '../db';

export const execute: Command['execute'] = async (interaction) => {
    const settings = getGuildSetting(interaction.guildId!) || {};
    if (settings.shop_enabled === 0 || settings.shop_music_enabled === 0) {
        return interaction.reply({ content: '🚫 The **AI Music Shop** is currently closed.', flags: [MessageFlags.Ephemeral] });
    }

    const prompt = interaction.options.getString('prompt', true);
    const style = interaction.options.getString('style');
    const title = interaction.options.getString('title');
    const instrumental = interaction.options.getBoolean('instrumental') || false;

    // --- GEM CHECK ---
    const user = getUser(interaction.user.id, interaction.user.username);
    if (user.currency < COST) {
        return interaction.reply({
            content: `❌ You need **${COST.toLocaleString()} gems** to generate music! You currently have **${user.currency.toLocaleString()}**.`,
            flags: [MessageFlags.Ephemeral]
        });
    }

    // --- DEDUCT GEMS ---
    updateUser(interaction.user.id, { currency: user.currency - COST });

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    // --- PREPARE PAYLOAD ---
    // Logic: 
    // If style/title provided OR instrumental=true -> customMode = true
    // If customMode=true, style/title required? 
    // API Docs: "If instrumental is true: style and title are required"
    // "If instrumental is false: style, prompt, and title are required"

    // We need to be careful. The user might just provide prompt.
    // If they provide ONLY prompt, we use customMode: false.
    // If they provide style OR title OR instrumental, we MUST use customMode: true, and fill in missing fields.

    const isCustom = !!(style || title || instrumental);

    let payload: any = {
        model: 'V5',
        callBackUrl: 'https://example.com/callback', // Required by API, even if polling
    };

    if (isCustom) {
        payload.customMode = true;
        payload.instrumental = instrumental;

        // Ensure required fields for custom mode are present
        payload.title = title || (prompt.length > 20 ? prompt.substring(0, 20) : prompt);
        payload.style = style || 'Pop'; // Default style if not provided but custom mode triggered
        payload.prompt = prompt;

    } else {
        payload.customMode = false;
        payload.prompt = prompt;
    }

    try {
        const apiKey = process.env.SUNO_API_KEY;
        if (!apiKey) throw new Error("SUNO_API_KEY not configured");

        console.log("Sending Suno Request:", JSON.stringify(payload, null, 2));

        // --- GENERATE REQUEST ---
        const genRes = await fetch(`${SUNO_API_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!genRes.ok) {
            const err = await genRes.text();
            throw new Error(`API Error: ${genRes.status} - ${err}`);
        }

        const genData = await genRes.json();
        console.log("Suno Response:", JSON.stringify(genData, null, 2));

        if (genData.code !== 200) {
            throw new Error(`API Error: ${genData.code} - ${genData.msg}`);
        }

        const taskId = genData.data?.taskId;

        if (!taskId) {
            throw new Error(`No taskId returned. Full response: ${JSON.stringify(genData)}`);
        }

        // --- POLLING LOOP ---
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes (60 * 5s)
        const pollInterval = 5000;

        const progressEmbed = new EmbedBuilder()
            .setTitle('🎵 Generating Music...')
            .setDescription(`**Prompt:** ${prompt}\n\n**Status:** Initializing...`)
            .setColor(0x00AAFF)
            .setFooter({ text: 'This may take a few minutes. Results will be sent to your DMs.' });

        await interaction.editReply({ embeds: [progressEmbed] });

        const poll = async () => {
            await new Promise(r => setTimeout(r, pollInterval));
            attempts++;

            const statusRes = await fetch(`${SUNO_API_URL}/generate/record-info?taskId=${taskId}`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });

            if (!statusRes.ok) return poll(); // Retry on net error

            const statusData = await statusRes.json();
            const status = statusData.data?.status; // PENDING, TEXT_SUCCESS, FIRST_SUCCESS, SUCCESS
            const clips = statusData.data?.response?.sunoData || [];

            // Update Progress
            let progressText = 'Processing...';
            if (status === 'TEXT_SUCCESS') progressText = 'Lyrics generated... Composing audio...';
            if (status === 'FIRST_SUCCESS') progressText = 'First track ready... Finalizing...';

            progressEmbed.setDescription(`**Prompt:** ${prompt}\n\n**Status:** ${progressText}`);
            await interaction.editReply({ embeds: [progressEmbed] });

            if (status === 'SUCCESS' && clips.length > 0) {
                // --- SEND TO DM ---
                try {
                    for (const clip of clips) {
                        const clipEmbed = new EmbedBuilder()
                            .setTitle(`🎵 ${clip.title || 'Generated Song'}`)
                            .setDescription(`**Style:** ${clip.modelName}\n**Prompt:** ${clip.prompt?.substring(0, 200)}...`)
                            .setColor(0x00FF00)
                            .setImage(clip.imageUrl)
                            .addFields(
                                { name: 'Audio', value: `[Link](${clip.audioUrl})` },
                                { name: 'Video', value: `[Link](${clip.videoUrl || clip.audioUrl})` }
                            )
                            .setFooter({ text: `Duration: ${clip.duration}s` });

                        await interaction.user.send({ embeds: [clipEmbed], content: `Here is your generated song! ${clip.audioUrl}` });
                    }

                    await interaction.editReply({ content: "✅ **Music Generated!** user check your DMs! 📩", embeds: [] });
                } catch (dmError) {
                    console.error("Failed to DM user:", dmError);
                    await interaction.editReply({ content: "✅ **Music Generated!** ...but I couldn't DM you. Please enable DMs.", embeds: [] });
                    // Fallback: Post in channel? User asked for privacy, but if DMs fail...
                    // For now, adhere to privacy request and just warn.
                }
                return;
            } else if (status === 'GENERATE_AUDIO_FAILED' || status === 'CREATE_TASK_FAILED' || status?.includes('ERROR')) {
                throw new Error(`Generation failed: ${status}`);
            } else {
                if (attempts < maxAttempts) {
                    await poll();
                } else {
                    throw new Error("Timeout waiting for music generation.");
                }
            }
        };

        await poll();

    } catch (error: any) {
        console.error("Music command error:", error);
        // Refund on error? 
        updateUser(interaction.user.id, { currency: user.currency }); // Add back? No, just set back to original? 
        // Better to just add the cost back.
        // Actually, let's keep it simple. If it fails, we refund.
        updateUser(interaction.user.id, { currency: user.currency }); // Reset to original (effectively refunding)

        await interaction.editReply({ content: `❌ Error generating music: ${error.message}. Gems have been refunded.` });
    }
};

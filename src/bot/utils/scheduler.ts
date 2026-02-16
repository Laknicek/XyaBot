import { Client, TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { getGuildSetting, getActiveWyr, createWyr, updateWyrMessageId, getPendingExpiredWyrs, endWyr, db } from '../db';
import { generateWyrScenario } from '../ai';

const GREECE_OFFSET = 3 * 60 * 60 * 1000; // UTC+3 (approx for simplicity, or use localized checks) -> Actually better to use Date string check

export const initScheduler = (client: Client) => {
    console.log('[Scheduler] Initialized.');

    setInterval(() => {
        checkDailyWyr(client);
        checkExpiredWyrs(client);
    }, 60 * 1000); // Check every minute
};

const checkDailyWyr = async (client: Client) => {
    // Check if it's 1 AM in Greece
    const now = new Date();

    // Convert to Greece time string to check hour
    const greeceTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Athens" }));
    const hour = greeceTime.getHours();
    const minute = greeceTime.getMinutes();

    // Target: 01:00 AM
    if (hour !== 1) return;

    // Check if valid minute window (00-05) to avoid double firing if restarts happen or lag
    if (minute > 5) return;

    // Check if we already ran today
    const dateKey = `${now.getMonth() + 1}-${now.getDate()}`;
    const lastRunDate = (db.prepare('SELECT value FROM global_stats WHERE key = ?').get('active_wyr_date') as any)?.value;

    if (lastRunDate === dateKey) return; // Already ran today

    console.log(`[Scheduler] 🕐 It is 1 AM in Greece! Starting Daily WYR...`);

    // --- START WYR FOR ALL GUILDS ---
    // Actually, for now, let's just do it for guilds that have a configured events channel?
    // Or do we want one global question? The user asked for "the /wyr command... to be setup for automatic".
    // Usually implies per-server if it's a bot command, but automated could be global content distributed.
    // Let's generate ONE question and post it to ALL guilds with an events channel.

    const scenario = await generateWyrScenario();

    for (const guild of client.guilds.cache.values()) {
        const settings = getGuildSetting(guild.id);
        // User requested specific setup for WYR, so we look for that.
        // Fallback to events_channel_id? No, "we need to set it up on one channel and then it starts" implies explicit opts-in.
        if (!settings?.wyr_channel_id) continue;

        const channel = guild.channels.cache.get(settings.wyr_channel_id) as TextChannel;
        if (!channel || !channel.isSendable()) continue;

        // 8 Hours Duration
        const duration = 8 * 60 * 60 * 1000;

        // Create DB Entry
        const wyrId = createWyr(guild.id, channel.id, scenario.question, scenario.optionA, scenario.optionB, duration);

        // Build Message
        const embed = new EmbedBuilder()
            .setColor(0xFF69B4)
            .setTitle('🤔 Daily Would You Rather!')
            .setDescription(`**${scenario.question}**`)
            .addFields(
                { name: '🅰️ Option A', value: scenario.optionA, inline: true },
                { name: '🅱️ Option B', value: scenario.optionB, inline: true }
            )
            .setFooter({ text: `Daily Question • Ends in 8 hours` });

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`wyr_a_${wyrId}`).setLabel(scenario.optionA.substring(0, 80)).setStyle(ButtonStyle.Primary).setEmoji('🅰️'),
            new ButtonBuilder().setCustomId(`wyr_b_${wyrId}`).setLabel(scenario.optionB.substring(0, 80)).setStyle(ButtonStyle.Danger).setEmoji('🅱️')
        );

        try {
            const message = await channel.send({
                content: `<@&1473070225443393617> 🧠 **Daily Question!**`,
                embeds: [embed],
                components: [row]
            });
            if (message) {
                // Determine if ID is bigint (better-sqlite3 returns bigint for lastInsertRowid)
                updateWyrMessageId(wyrId, message.id);
            }
        } catch (e) {
            console.error(`[Scheduler] Failed to post WYR in guild ${guild.id}:`, e);
        }
    }
};

const checkExpiredWyrs = async (client: Client) => {
    const expired = getPendingExpiredWyrs();
    for (const wyr of expired) {
        if (!wyr.message_id) {
            endWyr(wyr.id); // Just mark ended if no message
            continue;
        }

        try {
            const channel = await client.channels.fetch(wyr.channel_id) as TextChannel;
            if (channel) {
                const message = await channel.messages.fetch(wyr.message_id);
                if (message) {
                    const votesA = JSON.parse(wyr.votes_a || '[]');
                    const votesB = JSON.parse(wyr.votes_b || '[]');
                    const totalVotes = votesA.length + votesB.length;
                    const pctA = totalVotes > 0 ? Math.round((votesA.length / totalVotes) * 100) : 0;
                    const pctB = totalVotes > 0 ? Math.round((votesB.length / totalVotes) * 100) : 0;

                    const embed = new EmbedBuilder()
                        .setColor(0x808080)
                        .setTitle('🤔 Daily Would You Rather! (Ended)')
                        .setDescription(`**${wyr.question}**\n\nFinal Results:`)
                        .addFields(
                            { name: `🅰️ ${wyr.option_a}`, value: `${'▓'.repeat(Math.floor(pctA / 10))}${'░'.repeat(10 - Math.floor(pctA / 10))} ${pctA}% (${votesA.length})`, inline: false },
                            { name: `🅱️ ${wyr.option_b}`, value: `${'▓'.repeat(Math.floor(pctB / 10))}${'░'.repeat(10 - Math.floor(pctB / 10))} ${pctB}% (${votesB.length})`, inline: false }
                        )
                        .setFooter({ text: `Voting Closed • Total Votes: ${totalVotes}` });

                    const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder().setCustomId('disabled_a').setLabel(wyr.option_a.substring(0, 80)).setStyle(ButtonStyle.Primary).setDisabled(true).setEmoji('🅰️'),
                        new ButtonBuilder().setCustomId('disabled_b').setLabel(wyr.option_b.substring(0, 80)).setStyle(ButtonStyle.Danger).setDisabled(true).setEmoji('🅱️')
                    );

                    await message.edit({ embeds: [embed], components: [disabledRow] });
                }
            }
        } catch (e) {
            console.error(`[Scheduler] Failed to close WYR ${wyr.id}:`, e);
        }

        endWyr(wyr.id);
        console.log(`[Scheduler] Closed WYR ${wyr.id}`);
    }
};

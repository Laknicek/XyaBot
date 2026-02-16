import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types';

const SCENARIOS = [
    { a: 'Be able to fly', b: 'Be able to read minds' },
    { a: 'Live in a world with no music', b: 'Live in a world with no color' },
    { a: 'Always be 10 minutes late', b: 'Always be 20 minutes early' },
    { a: 'Have unlimited money', b: 'Have unlimited knowledge' },
    { a: 'Never use social media again', b: 'Never watch movies again' },
    { a: 'Live in space', b: 'Live underwater' },
    { a: 'Be famous but hated', b: 'Be unknown but loved' },
    { a: 'Only eat pizza forever', b: 'Only eat ramen forever' },
    { a: 'Have a rewind button for life', b: 'Have a pause button for life' },
    { a: 'Be the funniest person alive', b: 'Be the smartest person alive' },
    { a: 'Fight 100 duck-sized horses', b: 'Fight 1 horse-sized duck' },
    { a: 'Never sleep', b: 'Never eat' },
    { a: 'Know how you die', b: 'Know when you die' },
    { a: 'Have free Wi-Fi everywhere', b: 'Have free coffee everywhere' },
    { a: 'Be a famous singer', b: 'Be a famous gamer' },
    { a: 'Live in the past', b: 'Live in the future' },
    { a: 'Have no phone', b: 'Have no friends irl' },
    { a: 'Speak every language', b: 'Play every instrument' },
    { a: 'Be a vampire', b: 'Be a werewolf' },
    { a: 'Have a dragon', b: 'Be a dragon' },
];

export const data = new SlashCommandBuilder()
    .setName('wyr')
    .setDescription('Would You Rather? Let Xya challenge you! 🤔 (Admin Only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const execute: Command['execute'] = async (interaction) => {
    // 0. Manual Trigger (Admin Only)
    // 1. Generate Scenario (or pick random from local if API fails)
    // 2. Post Persistent Message

    // For manual command, we can just pick a random local one to be fast, OR assume admin wants to force a daily one.
    // Let's use local for manual speed but persistent DB.

    const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    const duration = 24 * 60 * 60 * 1000; // Manual ones last 24h? Or 8h? Let's say 8h.

    // Lazy import
    const { createWyr, updateWyrMessageId } = await import('../db');

    // Create DB Entry
    const wyrId = createWyr(interaction.guildId!, interaction.channelId, `Would rather ${scenario.a} OR ${scenario.b}?`, scenario.a, scenario.b, duration);

    const embed = new EmbedBuilder()
        .setColor(0xFF69B4)
        .setTitle('🤔 Would You Rather...')
        .setDescription(`**Would you rather ${scenario.a} OR ${scenario.b}?**`)
        .addFields(
            { name: '🅰️ Option A', value: scenario.a, inline: true },
            { name: '🅱️ Option B', value: scenario.b, inline: true }
        )
        .setFooter({ text: `ENDS IN 8 HOURS • Vote to see results!` });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(`wyr_a_${wyrId}`).setLabel(scenario.a.substring(0, 80)).setStyle(ButtonStyle.Primary).setEmoji('🅰️'),
        new ButtonBuilder().setCustomId(`wyr_b_${wyrId}`).setLabel(scenario.b.substring(0, 80)).setStyle(ButtonStyle.Danger).setEmoji('🅱️'),
    );

    const reply = await interaction.reply({
        content: `<@&1473070225443393617> 🧠 **Would You Rather...**`,
        embeds: [embed],
        components: [row],
        fetchReply: true
    });

    if (reply) {
        updateWyrMessageId(wyrId, reply.id);
    }
};

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
    const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    const votes = { a: new Set<string>(), b: new Set<string>() };
    const DURATION = 8 * 60 * 60 * 1000; // 8 hours
    const endTime = Date.now() + DURATION;

    const buildEmbed = () => {
        const totalVotes = votes.a.size + votes.b.size;
        const pctA = totalVotes > 0 ? Math.round((votes.a.size / totalVotes) * 100) : 0;
        const pctB = totalVotes > 0 ? Math.round((votes.b.size / totalVotes) * 100) : 0;

        const remaining = Math.max(0, endTime - Date.now());
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

        return new EmbedBuilder()
            .setColor(0xFF69B4)
            .setTitle('🤔 Would You Rather...')
            .addFields(
                { name: `🅰️ ${scenario.a}`, value: totalVotes > 0 ? `${'▓'.repeat(Math.floor(pctA / 5))}${'░'.repeat(20 - Math.floor(pctA / 5))} ${pctA}% (${votes.a.size})` : '`vote to see results!`', inline: false },
                { name: `🅱️ ${scenario.b}`, value: totalVotes > 0 ? `${'▓'.repeat(Math.floor(pctB / 5))}${'░'.repeat(20 - Math.floor(pctB / 5))} ${pctB}% (${votes.b.size})` : '`vote to see results!`', inline: false }
            )
            .setFooter({ text: `${totalVotes} vote${totalVotes !== 1 ? 's' : ''} • ends in ${hours}h ${mins}m` });
    };

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('wyr_a').setLabel(`🅰️ ${scenario.a}`).setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('wyr_b').setLabel(`🅱️ ${scenario.b}`).setStyle(ButtonStyle.Danger),
    );

    const reply = await interaction.reply({ embeds: [buildEmbed()], components: [row] });

    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: DURATION,
    });

    collector.on('collect', async (btn) => {
        // Remove from opposite vote if they change their mind
        if (btn.customId === 'wyr_a') {
            votes.b.delete(btn.user.id);
            votes.a.add(btn.user.id);
        } else {
            votes.a.delete(btn.user.id);
            votes.b.add(btn.user.id);
        }

        await btn.update({ embeds: [buildEmbed()], components: [row] });
    });

    collector.on('end', async () => {
        const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('wyr_a').setLabel(`🅰️ ${scenario.a}`).setStyle(ButtonStyle.Primary).setDisabled(true),
            new ButtonBuilder().setCustomId('wyr_b').setLabel(`🅱️ ${scenario.b}`).setStyle(ButtonStyle.Danger).setDisabled(true),
        );

        const totalVotes = votes.a.size + votes.b.size;
        const winner = votes.a.size > votes.b.size ? scenario.a : votes.b.size > votes.a.size ? scenario.b : 'tie lol';
        const xya_comment = totalVotes === 0
            ? 'nobody voted... ok then 💀'
            : winner === 'tie lol'
                ? 'its a tie omg yall are split 😭'
                : `"${winner}" won and honestly... valid 💅`;

        const finalEmbed = buildEmbed().setFooter({ text: `voting ended • ${xya_comment}` });
        try {
            await reply.edit({ embeds: [finalEmbed], components: [disabledRow] });
        } catch { }
    });
};

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../types';
import { getUser, updateUser } from '../db';

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '🌟', '💰'];
const COST = 10;

// Payout table
function calculatePayout(s1: string, s2: string, s3: string): { multiplier: number, name: string } {
    if (s1 === '💎' && s2 === '💎' && s3 === '💎') return { multiplier: 50, name: 'DIAMOND JACKPOT 💎💎💎' };
    if (s1 === '7️⃣' && s2 === '7️⃣' && s3 === '7️⃣') return { multiplier: 25, name: 'TRIPLE SEVENS 7️⃣7️⃣7️⃣' };
    if (s1 === '🌟' && s2 === '🌟' && s3 === '🌟') return { multiplier: 15, name: 'STAR COMBO ⭐' };
    if (s1 === '💰' && s2 === '💰' && s3 === '💰') return { multiplier: 10, name: 'MONEY BAGS 💰' };
    if (s1 === s2 && s2 === s3) return { multiplier: 5, name: 'TRIPLE MATCH!' };
    if (s1 === s2 || s2 === s3 || s1 === s3) return { multiplier: 2, name: 'Double Match' };
    return { multiplier: 0, name: '' };
}

const WIN_COMMENTS = [
    'omgg ur so lucky 🍀',
    'LETSGOOO 🎉',
    'wait how r u this lucky',
    'rigged smh... jk congrats 😂',
    'big winnnn 💰',
];

const LOSE_COMMENTS = [
    'rip ur gems 💀',
    'better luck next time bestie 😭',
    'the slots were not kind today...',
    'ouch 😬',
    'gone... reduced to atoms 🫠',
];

const JACKPOT_COMMENTS = [
    'WHATTTTT NO WAY 🤯🤯🤯',
    'IM SCREAMING UR SO LUCKY',
    'THIS IS INSANE OMGGG',
];

export const data = new SlashCommandBuilder()
    .setName('slots')
    .setDescription(`Spin Xya's slot machine! Costs ${COST} gems 💎`);

export const execute: Command['execute'] = async (interaction) => {
    const user = getUser(interaction.user.id, interaction.user.username);
    const balance = user.currency || 0;

    if (balance < COST) {
        const embed = new EmbedBuilder()
            .setColor(0xFF4444)
            .setTitle('💎 Not Enough Gems')
            .setDescription(`you need ${COST} gems to spin! you only have ${balance} 😭\nearn more with /daily or by chatting!`);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    // Deduct cost
    updateUser(interaction.user.id, { currency: balance - COST });

    // Spin!
    const s1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const s2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const s3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

    const result = calculatePayout(s1, s2, s3);
    const winnings = result.multiplier * COST;
    const netGain = winnings - COST;

    if (winnings > 0) {
        updateUser(interaction.user.id, { currency: balance - COST + winnings });
    }

    const isJackpot = result.multiplier >= 25;
    const isWin = result.multiplier > 0;

    const comment = isJackpot
        ? JACKPOT_COMMENTS[Math.floor(Math.random() * JACKPOT_COMMENTS.length)]
        : isWin
            ? WIN_COMMENTS[Math.floor(Math.random() * WIN_COMMENTS.length)]
            : LOSE_COMMENTS[Math.floor(Math.random() * LOSE_COMMENTS.length)];

    const embed = new EmbedBuilder()
        .setTitle('🎰 Xya\'s Slots')
        .setDescription(
            `┌──────────────┐\n` +
            `│  ${s1}  │  ${s2}  │  ${s3}  │\n` +
            `└──────────────┘`
        )
        .setColor(isJackpot ? 0xFFD700 : isWin ? 0x00FF7F : 0xFF4444);

    if (isWin) {
        embed.addFields(
            { name: `🎉 ${result.name}`, value: `**+${winnings} gems** (${result.multiplier}x)`, inline: true },
            { name: '💰 Balance', value: `${balance - COST + winnings} gems`, inline: true }
        );
    } else {
        embed.addFields(
            { name: '💨 No Match', value: `**-${COST} gems**`, inline: true },
            { name: '💰 Balance', value: `${balance - COST} gems`, inline: true }
        );
    }

    embed.setFooter({ text: comment });

    await interaction.reply({ embeds: [embed] });
};

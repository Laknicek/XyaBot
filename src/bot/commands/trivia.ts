import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { Command } from '../types';
import { updateUser, getUser } from '../db';
import gameManager from '../utils/gameUtils';

interface TriviaQ {
    question: string;
    options: string[];
    answer: number; // 0-indexed
    category: string;
}

const TRIVIA: TriviaQ[] = [
    // Anime
    { category: '🎌 Anime', question: 'What anime features a notebook that can kill people?', options: ['Death Note', 'Soul Eater', 'Black Butler', 'Psycho-Pass'], answer: 0 },
    { category: '🎌 Anime', question: 'What is Goku\'s Saiyan name?', options: ['Vegeta', 'Kakarot', 'Broly', 'Raditz'], answer: 1 },
    { category: '🎌 Anime', question: 'Which anime is set in the world of Titans?', options: ['Fullmetal Alchemist', 'Attack on Titan', 'Bleach', 'Naruto'], answer: 1 },
    { category: '🎌 Anime', question: 'Who is the main character of Demon Slayer?', options: ['Zenitsu', 'Inosuke', 'Tanjiro', 'Rengoku'], answer: 2 },
    // Music
    { category: '🎵 Music', question: 'Which artist released "Blinding Lights"?', options: ['Drake', 'The Weeknd', 'Post Malone', 'Travis Scott'], answer: 1 },
    { category: '🎵 Music', question: 'How many members are in BTS?', options: ['5', '6', '7', '8'], answer: 2 },
    { category: '🎵 Music', question: 'Which instrument has 88 keys?', options: ['Guitar', 'Violin', 'Piano', 'Drums'], answer: 2 },
    { category: '🎵 Music', question: 'Who sang "Bohemian Rhapsody"?', options: ['The Beatles', 'Led Zeppelin', 'Queen', 'Pink Floyd'], answer: 2 },
    // Gaming
    { category: '🎮 Gaming', question: 'What game features a character named Master Chief?', options: ['Gears of War', 'Halo', 'Destiny', 'Call of Duty'], answer: 1 },
    { category: '🎮 Gaming', question: 'How many Chaos Emeralds are there in Sonic?', options: ['5', '6', '7', '8'], answer: 2 },
    { category: '🎮 Gaming', question: 'What game is Creepers from?', options: ['Terraria', 'Roblox', 'Minecraft', 'Fortnite'], answer: 2 },
    { category: '🎮 Gaming', question: 'Which game has a Battle Royale mode on an island?', options: ['Fortnite', 'Overwatch', 'Valorant', 'CS2'], answer: 0 },
    // General
    { category: '🧠 General', question: 'What planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], answer: 2 },
    { category: '🧠 General', question: 'How many continents are there?', options: ['5', '6', '7', '8'], answer: 2 },
    { category: '🧠 General', question: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], answer: 3 },
    { category: '🧠 General', question: 'What gas do plants absorb?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], answer: 2 },
];

const OPTION_LABELS = ['🅰️', '🅱️', '🅲', '🅳'];
const XP_REWARD = 25;
const CURRENCY_REWARD = 15;

export const data = new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Test your knowledge with Xya\'s trivia! 🧠');

export const execute: Command['execute'] = async (interaction) => {
    const q = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
    let answered = new Set<string>();

    const buildEmbed = (state: 'active' | 'correct' | 'wrong' | 'timeout', userId?: string) => {
        const embed = new EmbedBuilder()
            .setTitle(`${q.category} Trivia`)
            .setDescription(`**${q.question}**`)
            .setFooter({ text: state === 'active' ? '15 seconds to answer! ⏰' : 'trivia ended' });

        if (state === 'active') {
            embed.setColor(0x8A2BE2);
            q.options.forEach((opt, i) => {
                embed.addFields({ name: `${OPTION_LABELS[i]}`, value: opt, inline: true });
            });
        } else if (state === 'correct') {
            embed.setColor(0x00FF7F);
            embed.addFields({ name: '✅ Correct!', value: `The answer is **${q.options[q.answer]}**!\n+${XP_REWARD} XP, +${CURRENCY_REWARD} gems 💎` });
            embed.setFooter({ text: 'big brain moment 🧠✨' });
        } else if (state === 'wrong') {
            embed.setColor(0xFF4444);
            embed.addFields({ name: '❌ Wrong!', value: `The correct answer was **${q.options[q.answer]}**\nbetter luck next time 💀` });
        } else {
            embed.setColor(0x888888);
            embed.addFields({ name: '⏰ Time\'s up!', value: `The answer was **${q.options[q.answer]}**\ntoo slow bestie 😭` });
        }

        return embed;
    };

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...q.options.map((opt, i) =>
            new ButtonBuilder()
                .setCustomId(`trivia_${i}`)
                .setLabel(`${OPTION_LABELS[i]} ${opt}`)
                .setStyle(i === 0 ? ButtonStyle.Primary : i === 1 ? ButtonStyle.Danger : i === 2 ? ButtonStyle.Success : ButtonStyle.Secondary)
        ),
        new ButtonBuilder()
            .setCustomId('trivia_stop')
            .setLabel('Stop Game')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🛑')
    );

    const reply = await interaction.reply({ embeds: [buildEmbed('active')], components: [row] });

    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 15_000,
    });

    // Register game
    gameManager.register(interaction.user.id, 'trivia', interaction.channelId, () => {
        collector.stop('manual_stop');
    });

    let wasAnswered = false;

    collector.on('collect', async (btn) => {
        if (btn.user.id !== interaction.user.id) { // Strict on who can answer/stop own game
            await btn.reply({ content: 'this isnt ur game bestie', ephemeral: true });
            return;
        }

        if (btn.customId === 'trivia_stop') {
            await btn.update({ content: '🛑 Game stopped!', embeds: [], components: [] });
            collector.stop('manual_stop');
            return;
        }

        if (answered.has(btn.user.id)) {
            await btn.reply({ content: 'u already answered lol', ephemeral: true });
            return;
        }

        answered.add(btn.user.id);
        wasAnswered = true;
        const chosen = parseInt(btn.customId.split('_')[1]);

        if (chosen === q.answer) {
            // Reward correct answer
            const user = getUser(btn.user.id, btn.user.username);
            updateUser(btn.user.id, {
                xp: (user.xp || 0) + XP_REWARD,
                currency: (user.currency || 0) + CURRENCY_REWARD,
            });
            await btn.update({ embeds: [buildEmbed('correct', btn.user.id)], components: [] });
        } else {
            await btn.update({ embeds: [buildEmbed('wrong', btn.user.id)], components: [] });
        }

        collector.stop();
    });

    collector.on('end', async (_, reason) => {
        // Remove from manager
        gameManager.stopGame(interaction.user.id); // Cleanup map, but don't call stop() again

        if (reason === 'manual_stop') return; // Handled above

        if (!wasAnswered) {
            try {
                await reply.edit({ embeds: [buildEmbed('timeout')], components: [] });
            } catch { }
        }
    });
};

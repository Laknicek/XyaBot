import { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../types';
import { generateResponse } from '../ai';
import { saveWordleGame } from '../db';
import { generateWordleBoard } from '../utils/wordleGen';

export const data = new SlashCommandBuilder()
    .setName('wordoftheday')
    .setDescription('Start a game of Wordle with Xya!');

export const execute: Command['execute'] = async (interaction) => {
    await interaction.deferReply();
    
    const prompt = `Give me one lovely 5 or 6 letter English word. Reply ONLY with the word. No punctuation.`;
    const aiResponse = await generateResponse(prompt, []);
    const word = aiResponse.text.trim().toUpperCase().replace(/[^A-Z]/g, '');

    if (word.length < 4 || word.length > 7) {
        await interaction.editReply("Xya couldn't think of a good word... could we try again? *blushes*");
        return;
    }

    saveWordleGame(interaction.user.id, word, [], 0);

    const buffer = generateWordleBoard(word, []);
    const attachment = new AttachmentBuilder(buffer, { name: 'wordle.png' });

    const embed = new EmbedBuilder()
        .setColor(0xFF69B4)
        .setTitle('🌸 Xya\'s Wordle Challenge!')
        .setDescription(`I\'ve thought of a lovely **${word.length}-letter** word!\nYou have **6 tries** to guess it. Just type your guess in the chat! ♪`)
        .setImage('attachment://wordle.png')
        .setFooter({ text: 'Good luck, sweetie! I believe in you!' });

    await interaction.editReply({
        embeds: [embed],
        files: [attachment]
    });
};

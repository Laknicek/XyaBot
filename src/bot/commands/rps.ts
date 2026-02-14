import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../types';

export const data = new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play Rock Paper Scissors with Xya!')
    .addStringOption(option =>
        option.setName('choice')
            .setDescription('Your move')
            .setRequired(true)
            .addChoices(
                { name: 'Rock', value: 'rock' },
                { name: 'Paper', value: 'paper' },
                { name: 'Scissors', value: 'scissors' }
            ));

export const execute: Command['execute'] = async (interaction) => {
    const userChoice = interaction.options.getString('choice')!;
    const choices = ['rock', 'paper', 'scissors'];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let result = '';
    
    if (userChoice === botChoice) {
        result = "It's a tie! *giggles* We think alike!";
    } else if (
        (userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'paper' && botChoice === 'rock') ||
        (userChoice === 'scissors' && botChoice === 'paper')
    ) {
        result = "You won! Wow, you're so good at this! 🎉";
    } else {
        result = "I won! Yay! ♪ But you did great!";
    }

    const icons: { [key: string]: string } = { rock: '🪨', paper: '📄', scissors: '✂️' };

    const embed = new EmbedBuilder()
        .setColor(0xFF69B4)
        .setTitle('🎮 Rock, Paper, Scissors!')
        .addFields(
            { name: 'You', value: `${icons[userChoice]} ${userChoice.toUpperCase()}`, inline: true },
            { name: 'Xya', value: `${icons[botChoice]} ${botChoice.toUpperCase()}`, inline: true },
            { name: 'Result', value: result, inline: false }
        )
        .setThumbnail(interaction.user.displayAvatarURL());

    await interaction.reply({ embeds: [embed] });
};

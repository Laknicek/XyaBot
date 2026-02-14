"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play Rock Paper Scissors with Xya!')
    .addStringOption(option => option.setName('choice')
    .setDescription('Your move')
    .setRequired(true)
    .addChoices({ name: 'Rock', value: 'rock' }, { name: 'Paper', value: 'paper' }, { name: 'Scissors', value: 'scissors' }));
const execute = async (interaction) => {
    const userChoice = interaction.options.getString('choice');
    const choices = ['rock', 'paper', 'scissors'];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    let result = '';
    if (userChoice === botChoice) {
        result = "It's a tie! *giggles* We think alike!";
    }
    else if ((userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'paper' && botChoice === 'rock') ||
        (userChoice === 'scissors' && botChoice === 'paper')) {
        result = "You won! Wow, you're so good at this! 🎉";
    }
    else {
        result = "I won! Yay! ♪ But you did great!";
    }
    const icons = { rock: '🪨', paper: '📄', scissors: '✂️' };
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0xFF69B4)
        .setTitle('🎮 Rock, Paper, Scissors!')
        .addFields({ name: 'You', value: `${icons[userChoice]} ${userChoice.toUpperCase()}`, inline: true }, { name: 'Xya', value: `${icons[botChoice]} ${botChoice.toUpperCase()}`, inline: true }, { name: 'Result', value: result, inline: false })
        .setThumbnail(interaction.user.displayAvatarURL());
    await interaction.reply({ embeds: [embed] });
};
exports.execute = execute;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin!');
const execute = async (interaction) => {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const icon = result === 'Heads' ? '🪙' : '🪙'; // Could use different icons if available
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('✨ Coin Flip!')
        .setDescription(`The coin spins in the air... and lands on...`)
        .addFields({ name: 'Result', value: `**${icon} ${result.toUpperCase()}**` })
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: 'Xya loves a good toss! ♪' });
    await interaction.reply({ embeds: [embed] });
};
exports.execute = execute;

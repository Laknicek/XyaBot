import Discord from 'discord.js';
import { getUser, addConfession } from '../db';
import { Command } from '../types';

export const data = new Discord.SlashCommandBuilder()
    .setName('confess')
    .setDescription('Send an anonymous confession through Xya (Best Friend required: 500+ friendship)')
    .addStringOption(opt =>
        opt.setName('message')
            .setDescription('Your anonymous confession')
            .setRequired(true)
    );

export const execute: Command['execute'] = async (interaction) => {
    const user = getUser(interaction.user.id, interaction.user.username);

    // Friendship gate: require 500+ points (Best Friend)
    if ((user.friendship_points || 0) < 500) {
        const points = user.friendship_points || 0;
        return interaction.reply({
            content: `sorry bestie, confessions are only for my best friends 💛\nyou need **500 friendship points** to use this (you have **${points}**)\nkeep chatting with me and we'll get there!! 🥰`,
            flags: Discord.MessageFlags.Ephemeral
        });
    }

    const confession = interaction.options.getString('message', true);

    if (confession.length > 1000) {
        return interaction.reply({ content: "thats a bit too long! keep it under 1000 characters 😅", flags: Discord.MessageFlags.Ephemeral });
    }

    // Save confession
    addConfession(interaction.guildId!, confession);

    // Send anonymous confession to the channel
    const embed = new Discord.EmbedBuilder()
        .setTitle('🤫 Anonymous Confession')
        .setDescription(confession)
        .setColor(0x9B59B6)
        .setFooter({ text: 'Sent through Xya • Identity protected 💜' })
        .setTimestamp();

    if (interaction.channel?.isSendable()) {
        await interaction.channel.send({ embeds: [embed] });
    }

    // Ephemeral confirmation to the user
    await interaction.reply({ content: "✅ your confession has been sent anonymously! your secret is safe with me 🤫💜", flags: Discord.MessageFlags.Ephemeral });
};

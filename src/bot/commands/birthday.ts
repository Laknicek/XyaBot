import Discord from 'discord.js';
import { setBirthday, getBirthday } from '../db';
import { Command } from '../types';

export const data = new Discord.SlashCommandBuilder()
    .setName('birthday')
    .setDescription('Set or check your birthday!')
    .addSubcommand(sub =>
        sub.setName('set')
            .setDescription('Set your birthday')
            .addIntegerOption(opt => opt.setName('month').setDescription('Month (1-12)').setRequired(true).setMinValue(1).setMaxValue(12))
            .addIntegerOption(opt => opt.setName('day').setDescription('Day (1-31)').setRequired(true).setMinValue(1).setMaxValue(31))
    )
    .addSubcommand(sub =>
        sub.setName('check')
            .setDescription('Check your registered birthday')
    );

export const execute: Command['execute'] = async (interaction) => {
    const sub = interaction.options.getSubcommand();

    if (sub === 'set') {
        const month = interaction.options.getInteger('month', true);
        const day = interaction.options.getInteger('day', true);

        // Basic validation
        const daysInMonth = new Date(2024, month, 0).getDate();
        if (day > daysInMonth) {
            return interaction.reply({ content: `ummm ${month}/${day} doesnt exist bestie 😅`, flags: Discord.MessageFlags.Ephemeral });
        }

        setBirthday(interaction.user.id, interaction.guildId!, month, day);

        const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        await interaction.reply(`🎂 i saved your birthday as **${monthNames[month]} ${day}**!! ill make sure to celebrate with you 💕`);
    } else if (sub === 'check') {
        const bday = getBirthday(interaction.user.id);
        if (!bday) {
            return interaction.reply({ content: "you haven't set your birthday yet! use `/birthday set` 🎂", flags: Discord.MessageFlags.Ephemeral });
        }
        const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        await interaction.reply(`🎂 your birthday is **${monthNames[bday.month]} ${bday.day}**! dont worry, i wont forget 💕`);
    }
};

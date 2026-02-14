"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = __importDefault(require("discord.js"));
const db_1 = require("../db");
exports.data = new discord_js_1.default.SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder — Xya will ping you when the time comes!')
    .addSubcommand(sub => sub.setName('set')
    .setDescription('Set a new reminder')
    .addStringOption(opt => opt.setName('time').setDescription('When? e.g. 30m, 2h, 1d').setRequired(true))
    .addStringOption(opt => opt.setName('message').setDescription('What should I remind you about?').setRequired(true)))
    .addSubcommand(sub => sub.setName('list')
    .setDescription('See your upcoming reminders'));
function parseTime(timeStr) {
    const match = timeStr.match(/^(\d+)\s*(m|min|mins|minutes?|h|hr|hrs|hours?|d|days?)$/i);
    if (!match)
        return null;
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.startsWith('m'))
        return value * 60 * 1000;
    if (unit.startsWith('h'))
        return value * 60 * 60 * 1000;
    if (unit.startsWith('d'))
        return value * 24 * 60 * 60 * 1000;
    return null;
}
const execute = async (interaction) => {
    const sub = interaction.options.getSubcommand();
    if (sub === 'set') {
        const timeStr = interaction.options.getString('time', true);
        const message = interaction.options.getString('message', true);
        const duration = parseTime(timeStr);
        if (!duration) {
            return interaction.reply({ content: "hmm i dont understand that time format! try something like `30m`, `2h`, or `1d` ⏰", flags: discord_js_1.default.MessageFlags.Ephemeral });
        }
        if (duration > 7 * 24 * 60 * 60 * 1000) {
            return interaction.reply({ content: "thats too far in the future! max is 7 days 📅", flags: discord_js_1.default.MessageFlags.Ephemeral });
        }
        const remindAt = Date.now() + duration;
        (0, db_1.addReminder)(interaction.user.id, interaction.guildId, interaction.channelId, message, remindAt);
        const readableTime = new Date(remindAt).toLocaleString();
        await interaction.reply(`⏰ gotchu! ill remind you about "${message}" at ~${readableTime} 💕`);
    }
    else if (sub === 'list') {
        const reminders = (0, db_1.getUserReminders)(interaction.user.id);
        if (reminders.length === 0) {
            return interaction.reply({ content: "you have no upcoming reminders! use `/remind set` to create one ⏰", flags: discord_js_1.default.MessageFlags.Ephemeral });
        }
        const list = reminders.map((r, i) => {
            const time = new Date(r.remind_at).toLocaleString();
            return `**${i + 1}.** ${r.message} — *${time}*`;
        }).join('\n');
        const embed = new discord_js_1.default.EmbedBuilder()
            .setTitle('⏰ Your Reminders')
            .setDescription(list)
            .setColor(0x3498DB);
        await interaction.reply({ embeds: [embed] });
    }
};
exports.execute = execute;

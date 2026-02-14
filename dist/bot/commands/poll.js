"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = __importDefault(require("discord.js"));
const db_1 = require("../db");
const EMOJI_NUMBERS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];
exports.data = new discord_js_1.default.SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll! Xya will handle the voting 📊 (Admin Only)')
    .setDefaultMemberPermissions(discord_js_1.default.PermissionFlagsBits.Administrator)
    .addStringOption(opt => opt.setName('question').setDescription('What are we voting on?').setRequired(true))
    .addStringOption(opt => opt.setName('option1').setDescription('First option').setRequired(true))
    .addStringOption(opt => opt.setName('option2').setDescription('Second option').setRequired(true))
    .addStringOption(opt => opt.setName('option3').setDescription('Third option (optional)').setRequired(false))
    .addStringOption(opt => opt.setName('option4').setDescription('Fourth option (optional)').setRequired(false))
    .addStringOption(opt => opt.setName('option5').setDescription('Fifth option (optional)').setRequired(false));
const execute = async (interaction) => {
    const question = interaction.options.getString('question', true);
    const options = [];
    for (let i = 1; i <= 5; i++) {
        const opt = interaction.options.getString(`option${i}`);
        if (opt)
            options.push(opt);
    }
    if (options.length < 2) {
        return interaction.reply({ content: "you need at least 2 options for a poll! 📊", flags: discord_js_1.default.MessageFlags.Ephemeral });
    }
    // Create poll in DB
    const pollId = (0, db_1.createPoll)(interaction.guildId, interaction.channelId, question, options, interaction.user.id);
    // Build embed
    const description = options.map((opt, i) => `${EMOJI_NUMBERS[i]} ${opt}`).join('\n\n');
    const embed = new discord_js_1.default.EmbedBuilder()
        .setTitle(`📊 ${question}`)
        .setDescription(description)
        .setColor(0xE67E22)
        .setFooter({ text: `Poll by ${interaction.user.displayName} • React to vote!` })
        .setTimestamp();
    await interaction.reply({ content: "✨ poll created!", embeds: [embed] });
    // Add reactions
    const reply = await interaction.fetchReply();
    (0, db_1.updatePollMessageId)(pollId, reply.id);
    for (let i = 0; i < options.length; i++) {
        try {
            await reply.react(EMOJI_NUMBERS[i]);
        }
        catch { }
    }
};
exports.execute = execute;

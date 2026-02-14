"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const ai_1 = require("../ai");
const db_1 = require("../db");
const wordleGen_1 = require("../utils/wordleGen");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('wordoftheday')
    .setDescription('Start a game of Wordle with Xya!');
const execute = async (interaction) => {
    await interaction.deferReply();
    const prompt = `Give me one lovely 5 or 6 letter English word. Reply ONLY with the word. No punctuation.`;
    const aiResponse = await (0, ai_1.generateResponse)(prompt, []);
    const word = aiResponse.text.trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (word.length < 4 || word.length > 7) {
        await interaction.editReply("Xya couldn't think of a good word... could we try again? *blushes*");
        return;
    }
    (0, db_1.saveWordleGame)(interaction.user.id, word, [], 0);
    const buffer = (0, wordleGen_1.generateWordleBoard)(word, []);
    const attachment = new discord_js_1.AttachmentBuilder(buffer, { name: 'wordle.png' });
    const embed = new discord_js_1.EmbedBuilder()
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
exports.execute = execute;

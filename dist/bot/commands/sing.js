"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = __importDefault(require("discord.js"));
const voice_1 = require("@discordjs/voice");
const voiceUtils_1 = require("../utils/voiceUtils");
const SONG_SNIPPETS = [
    "La la la, singing just for you, my favorite person in the world",
    "Twinkle twinkle little star, you're amazing just the way you are",
    "Do re mi fa sol la ti, music is my destiny",
    "Every day I wake up and I smile, cuz you make everything worthwhile",
    "Dancing in the moonlight, everything feels so right tonight",
];
exports.data = new discord_js_1.default.SlashCommandBuilder()
    .setName('sing')
    .setDescription('Ask Xya to sing for you in voice chat!')
    .addStringOption(opt => opt.setName('lyrics')
    .setDescription('What lyrics should Xya sing? (optional)')
    .setRequired(false));
const execute = async (interaction) => {
    const connection = (0, voice_1.getVoiceConnection)(interaction.guildId);
    if (!connection) {
        return interaction.reply({ content: "im not in vc rn! use /join first 🎤", flags: discord_js_1.default.MessageFlags.Ephemeral });
    }
    const customLyrics = interaction.options.getString('lyrics');
    const lyrics = customLyrics || SONG_SNIPPETS[Math.floor(Math.random() * SONG_SNIPPETS.length)];
    await interaction.reply(`🎵 *clears throat* okay here goes... 🎤`);
    try {
        await (0, voiceUtils_1.playTTS)(`♪ ${lyrics} ♪`, connection, 'en');
    }
    catch (error) {
        console.error('[Sing] TTS error:', error);
    }
};
exports.execute = execute;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const gameUtils_1 = __importDefault(require("../utils/gameUtils"));
const voiceUtils_1 = require("../utils/voiceUtils");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the current game, interaction, or music! 🛑');
const execute = async (interaction) => {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    let stoppedSomething = false;
    let message = "";
    // 1. Stop Active Game
    if (gameUtils_1.default.hasGame(userId)) {
        gameUtils_1.default.stopGame(userId);
        stoppedSomething = true;
        message += "🛑 Game stopped! ";
    }
    // 2. Stop Music/Radio
    if (guildId) {
        // We can't easily check if *this specific user* started the music, 
        // but often users want to stop music if they are in the VC.
        const member = interaction.guild?.members.cache.get(userId);
        if (member?.voice.channelId) {
            // Check if bot is in the same channel
            const botMember = interaction.guild?.members.me;
            if (botMember?.voice.channelId === member.voice.channelId) {
                (0, voiceUtils_1.stopAudio)(guildId);
                stoppedSomething = true;
                message += "🛑 Music stopped! ";
            }
        }
    }
    // 3. Fallback / AI interruption (simulated by just replying)
    if (!stoppedSomething) {
        message = "I didn't find any active games or music to stop for you! >_<";
    }
    await interaction.reply({ content: message, ephemeral: !stoppedSomething });
};
exports.execute = execute;

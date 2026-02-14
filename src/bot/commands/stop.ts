import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../types';
import gameManager from '../utils/gameUtils';
import { stopAudio } from '../utils/voiceUtils';

export const data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the current game, interaction, or music! 🛑');

export const execute: Command['execute'] = async (interaction) => {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    let stoppedSomething = false;
    let message = "";

    // 1. Stop Active Game
    if (gameManager.hasGame(userId)) {
        gameManager.stopGame(userId);
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
                stopAudio(guildId);
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const TRUTHS = [
    "what's the most embarrassing thing you've done online?",
    "what's your most played song rn?",
    "who was your first crush?",
    "what's the weirdest thing you've googled?",
    "what's a secret talent you have?",
    "have you ever pretended to be offline to avoid someone?",
    "what's the longest you've stayed up and why?",
    "what's a lie you've told that you got away with?",
    "what's your biggest insecurity?",
    "who in this server would you want to be stuck on an island with?",
    "what's the last thing you cried about?",
    "have you ever stalked someone's profile?",
    "what's a show you secretly love but won't admit?",
    "what's the most money you've spent on something you regret?",
    "have you ever had a dream about someone in this server?",
];
const DARES = [
    "change your profile picture to something embarrassing for 1 hour",
    "send a random compliment to the last person who messaged in this server",
    "type your next 3 messages with your eyes closed",
    "send a voice message of you singing the first song that comes to mind",
    "set your status to 'i love xya' for 30 minutes",
    "send a message in all caps for the next 5 minutes",
    "compliment everyone who reacts to this message",
    "share your screen time screenshot",
    "send your most recent photo from your gallery (if appropriate)",
    "speak in third person for the next 10 minutes",
    "use only emojis to communicate for 5 minutes",
    "send a message to the person above you saying something nice",
    "record yourself doing your best impression of a character",
    "change your nickname to whatever the next person says for 1 hour",
    "post your most listened to artist on Spotify",
];
const XYA_COMMENTS_TRUTH = [
    "ooh this ones juicy 👀",
    "no lying allowed!! 🫵",
    "spill the tea bestie ☕",
    "i need to know this too ngl",
    "this is gonna be good 💀",
];
const XYA_COMMENTS_DARE = [
    "do it no backing out 😈",
    "if u chicken out ur lame ngl",
    "omg this is gonna be funny 💀",
    "LMAOOO good luck with this one",
    "bet u wont do it 👀",
];
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('tod')
    .setDescription('Truth or Dare with Xya! 🎭');
const execute = async (interaction) => {
    const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('tod_truth').setLabel('🤔 Truth').setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder().setCustomId('tod_dare').setLabel('😈 Dare').setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder().setCustomId('tod_random').setLabel('🎲 Random').setStyle(discord_js_1.ButtonStyle.Secondary));
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0xFF69B4)
        .setTitle('🎭 Truth or Dare?')
        .setDescription('pick one... if u dare 😏')
        .setFooter({ text: `${interaction.user.username} is playing` });
    const reply = await interaction.reply({ embeds: [embed], components: [row] });
    const collector = reply.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        time: 30000,
        filter: (btn) => btn.user.id === interaction.user.id,
    });
    collector.on('collect', async (btn) => {
        let isTruth;
        if (btn.customId === 'tod_truth')
            isTruth = true;
        else if (btn.customId === 'tod_dare')
            isTruth = false;
        else
            isTruth = Math.random() > 0.5;
        const pool = isTruth ? TRUTHS : DARES;
        const comments = isTruth ? XYA_COMMENTS_TRUTH : XYA_COMMENTS_DARE;
        const prompt = pool[Math.floor(Math.random() * pool.length)];
        const comment = comments[Math.floor(Math.random() * comments.length)];
        const resultEmbed = new discord_js_1.EmbedBuilder()
            .setColor(isTruth ? 0x4169E1 : 0xFF4444)
            .setTitle(isTruth ? '🤔 Truth' : '😈 Dare')
            .setDescription(`**${prompt}**`)
            .setFooter({ text: `xya says: ${comment}` });
        await btn.update({ embeds: [resultEmbed], components: [] });
        collector.stop();
    });
    collector.on('end', async (_, reason) => {
        if (reason === 'time') {
            const timeoutEmbed = new discord_js_1.EmbedBuilder()
                .setColor(0x888888)
                .setTitle('🎭 Truth or Dare')
                .setDescription('u took too long... scared? 💀')
                .setFooter({ text: 'try again with /tod' });
            try {
                await reply.edit({ embeds: [timeoutEmbed], components: [] });
            }
            catch { }
        }
    });
};
exports.execute = execute;

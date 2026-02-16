"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = exports.SHOP_ITEMS = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
exports.SHOP_ITEMS = [
    { id: 'lollipop', name: '🍭 Sweet Lollipop', price: 50, description: 'A small treat for Xya — she loves sweets!' },
    { id: 'cupcake', name: '🧁 Strawberry Cupcake', price: 200, description: 'A lovely cupcake she absolutely adores!' },
    { id: 'ribbon', name: '🎀 Pink Ribbon', price: 500, description: 'A beautiful ribbon for her hair.' },
    { id: 'plushie', name: '🧸 Bear Plushie', price: 1000, description: 'A soft friend to keep her company.' },
    { id: 'xp_boost', name: '⚡ XP Boost (2x)', price: 750, description: '2x XP for 1 hour — level up faster!' },
    { id: 'lucky_charm', name: '🍀 Lucky Charm', price: 500, description: 'Better odds on /slots for 1 hour!' },
    { id: 'microphone', name: '🎤 Golden Mic', price: 2500, description: 'For the singer in your life — Xya will love this!' },
    { id: 'crown', name: '👑 Crystal Crown', price: 5000, description: 'The ultimate gift — makes Xya feel like royalty!' },
    { id: 'vip_title', name: '✨ VIP Title', price: 3000, description: 'Get a shiny VIP badge on your profile!' },
];
// Build embed for each category
function buildXyaShopEmbed() {
    return new discord_js_1.EmbedBuilder()
        .setColor(0xFF69B4)
        .setTitle('🍭 Xya\'s Gift Shop')
        .setDescription('Buy lovely gifts for Xya with your 💎 Gems!\nUse `/buy [item]` to purchase~')
        .addFields(exports.SHOP_ITEMS.map(item => ({
        name: `${item.name} — 💎 ${item.price}`,
        value: item.description,
        inline: true
    })))
        .setFooter({ text: '♪ Xya appreciates every gift!' });
}
function buildMusicShopEmbed() {
    return new discord_js_1.EmbedBuilder()
        .setColor(0x8A2BE2)
        .setTitle('🎵 AI Music Studio')
        .setDescription('✨ **Now Available!** ✨\n\nGenerate custom AI music, lyrics, and beats right from Discord using **Suno AI V5**!')
        .addFields({ name: '💰 Price', value: '💎 10,000 Gems per request', inline: true }, { name: '📦 Includes', value: '2 Full Songs + Covers', inline: true }, { name: '🚀 How to Use', value: 'Use the `/music` command to start generating!', inline: false })
        .setFooter({ text: 'Powered by Suno AI V5 • High Quality Audio' });
}
function buildOsuShopEmbed() {
    return new discord_js_1.EmbedBuilder()
        .setColor(0xFF4500)
        .setTitle('🎯 Osu Mapping AI')
        .setDescription('✨ **Now Available!** ✨\n\nAI-powered osu! beatmap generation!\n\n🗺️ **Auto-Map**: Generate a full beatmap from any audio file.\n⭐ **Custom Difficulty**: Choose your star rating.\n🤖 **AI Models**: Includes standard and LoRA fine-tuned models.')
        .addFields({ name: '💰 Price', value: '💎 1,000 Gems per map', inline: true }, { name: '📦 Includes', value: '.osz file via DM', inline: true }, { name: '🚀 How to Use', value: 'Use `/osu-map` and upload your song!', inline: false })
        .setFooter({ text: 'Powered by Mapperatorinator v30' });
}
// Build category buttons
function buildCategoryButtons(activeCategory) {
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('shop_xya')
        .setLabel('🍭 Xya Shop')
        .setStyle(activeCategory === 'xya' ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
        .setCustomId('shop_music')
        .setLabel('🎵 AI Music')
        .setStyle(activeCategory === 'music' ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
        .setCustomId('shop_osu')
        .setLabel('🎯 Osu Mapping')
        .setStyle(activeCategory === 'osu' ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary));
}
function getEmbedForCategory(category) {
    switch (category) {
        case 'music': return buildMusicShopEmbed();
        case 'osu': return buildOsuShopEmbed();
        default: return buildXyaShopEmbed();
    }
}
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('shop')
    .setDescription('Visit Xya\'s Shop! 💎 Browse categories and find awesome stuff!');
const execute = async (interaction) => {
    const settings = (0, db_1.getGuildSetting)(interaction.guildId) || {};
    // Global Shop Check
    if (settings.shop_enabled === 0) {
        return interaction.reply({ content: '🚫 The **Shop** is currently closed by the admins.', flags: [discord_js_1.MessageFlags.Ephemeral] });
    }
    // Determine initial category
    let activeCategory = '';
    if (settings.shop_xya_enabled !== 0)
        activeCategory = 'xya';
    else if (settings.shop_music_enabled !== 0)
        activeCategory = 'music';
    else if (settings.shop_osu_enabled !== 0)
        activeCategory = 'osu';
    if (!activeCategory) {
        return interaction.reply({ content: '🚫 All specific shops are currently closed.', flags: [discord_js_1.MessageFlags.Ephemeral] });
    }
    const getButtons = (activeCallback) => {
        const row = new discord_js_1.ActionRowBuilder();
        row.addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('shop_xya')
            .setLabel('🍭 Xya Shop')
            .setStyle(activeCallback === 'xya' ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary)
            .setDisabled(settings.shop_xya_enabled === 0), new discord_js_1.ButtonBuilder()
            .setCustomId('shop_music')
            .setLabel('🎵 AI Music')
            .setStyle(activeCallback === 'music' ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary)
            .setDisabled(settings.shop_music_enabled === 0), new discord_js_1.ButtonBuilder()
            .setCustomId('shop_osu')
            .setLabel('🎯 Osu Mapping')
            .setStyle(activeCallback === 'osu' ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary)
            .setDisabled(settings.shop_osu_enabled === 0));
        return row;
    };
    const reply = await interaction.reply({
        embeds: [getEmbedForCategory(activeCategory)],
        components: [getButtons(activeCategory)],
    });
    // Collect button interactions for 2 minutes
    const collector = reply.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        time: 120000,
    });
    collector.on('collect', async (btnInteraction) => {
        // Only the command user can use the buttons
        if (btnInteraction.user.id !== interaction.user.id) {
            await btnInteraction.reply({ content: 'This shop menu isn\'t yours, sweetie! Use `/shop` to open your own~ 🍭', ephemeral: true });
            return;
        }
        // Determine category from button ID
        const category = btnInteraction.customId.replace('shop_', '');
        activeCategory = category;
        // Double check enabled (in case changed mid-session, optional but good)
        // If disabled, don't allow switch? 
        // Logic: if button was disabled, they couldn't click. 
        // But if they clicked, we assume it's valid.
        await btnInteraction.update({
            embeds: [getEmbedForCategory(category)],
            components: [getButtons(category)],
        });
    });
    collector.on('end', async () => {
        // Disable buttons after timeout
        try {
            const disabledRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('shop_xya').setLabel('🍭 Xya Shop').setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(true), new discord_js_1.ButtonBuilder().setCustomId('shop_music').setLabel('🎵 AI Music').setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(true), new discord_js_1.ButtonBuilder().setCustomId('shop_osu').setLabel('🎯 Osu Mapping').setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(true));
            await reply.edit({ components: [disabledRow] });
        }
        catch { }
    });
};
exports.execute = execute;

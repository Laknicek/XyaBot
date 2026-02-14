import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { Command } from '../types';

export const SHOP_ITEMS = [
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
function buildXyaShopEmbed(): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(0xFF69B4)
        .setTitle('🍭 Xya\'s Gift Shop')
        .setDescription('Buy lovely gifts for Xya with your 💎 Gems!\nUse `/buy [item]` to purchase~')
        .addFields(SHOP_ITEMS.map(item => ({
            name: `${item.name} — 💎 ${item.price}`,
            value: item.description,
            inline: true
        })))
        .setFooter({ text: '♪ Xya appreciates every gift!' });
}

function buildMusicShopEmbed(): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(0x8A2BE2)
        .setTitle('🎵 AI Music Shop')
        .setDescription('✨ **Coming Soon!** ✨\n\nGenerate custom AI music, remixes, and beats right from Discord!\n\n🎧 AI-powered song generation\n🎹 Custom beats & instrumentals\n🎤 Voice synthesis tracks\n🔥 Community remix battles')
        .setFooter({ text: '🚧 Under development — stay tuned!' });
}

function buildOsuShopEmbed(): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(0xFF4500)
        .setTitle('🎯 Osu Mapping AI')
        .setDescription('✨ **Coming Soon!** ✨\n\nAI-powered osu! beatmap generation and mapping tools!\n\n🗺️ Auto-generate beatmaps from any song\n⭐ Difficulty scaling (Easy → Expert+)\n🎨 Hitsound suggestions\n📊 Map analysis & improvement tips')
        .setFooter({ text: '🚧 Under development — stay tuned!' });
}

// Build category buttons
function buildCategoryButtons(activeCategory: string): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('shop_xya')
            .setLabel('🍭 Xya Shop')
            .setStyle(activeCategory === 'xya' ? ButtonStyle.Primary : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('shop_music')
            .setLabel('🎵 AI Music')
            .setStyle(activeCategory === 'music' ? ButtonStyle.Primary : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('shop_osu')
            .setLabel('🎯 Osu Mapping')
            .setStyle(activeCategory === 'osu' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    );
}

function getEmbedForCategory(category: string): EmbedBuilder {
    switch (category) {
        case 'music': return buildMusicShopEmbed();
        case 'osu': return buildOsuShopEmbed();
        default: return buildXyaShopEmbed();
    }
}

export const data = new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Visit Xya\'s Shop! 💎 Browse categories and find awesome stuff!');

export const execute: Command['execute'] = async (interaction) => {
    let activeCategory = 'xya';

    const reply = await interaction.reply({
        embeds: [buildXyaShopEmbed()],
        components: [buildCategoryButtons(activeCategory)],
    });

    // Collect button interactions for 2 minutes
    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 120_000,
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

        await btnInteraction.update({
            embeds: [getEmbedForCategory(category)],
            components: [buildCategoryButtons(category)],
        });
    });

    collector.on('end', async () => {
        // Disable buttons after timeout
        try {
            const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId('shop_xya').setLabel('🍭 Xya Shop').setStyle(ButtonStyle.Secondary).setDisabled(true),
                new ButtonBuilder().setCustomId('shop_music').setLabel('🎵 AI Music').setStyle(ButtonStyle.Secondary).setDisabled(true),
                new ButtonBuilder().setCustomId('shop_osu').setLabel('🎯 Osu Mapping').setStyle(ButtonStyle.Secondary).setDisabled(true),
            );
            await reply.edit({ components: [disabledRow] });
        } catch { }
    });
};

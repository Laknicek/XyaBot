"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
const shop_1 = require("./shop");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy an item from the shop')
    .addStringOption(option => option.setName('item')
    .setDescription('The item to buy')
    .setRequired(true)
    .addChoices(...shop_1.SHOP_ITEMS.map(i => ({ name: i.name, value: i.id }))));
const db_2 = require("../db");
const execute = async (interaction) => {
    const settings = (0, db_2.getGuildSetting)(interaction.guildId) || {};
    if (settings.shop_enabled === 0 || settings.shop_xya_enabled === 0) {
        return interaction.reply({ content: '🚫 The **Xya Shop** is currently closed.', flags: [discord_js_1.MessageFlags.Ephemeral] });
    }
    const itemId = interaction.options.getString('item');
    const item = shop_1.SHOP_ITEMS.find(i => i.id === itemId);
    const user = (0, db_1.getUser)(interaction.user.id, interaction.user.username);
    if (user.currency < item.price) {
        await interaction.reply({ content: `Oh my, you don't have enough Gems! You need **💎 ${item.price}**. >_<`, flags: [discord_js_1.MessageFlags.Ephemeral] });
        return;
    }
    (0, db_1.updateUser)(interaction.user.id, { currency: user.currency - item.price });
    (0, db_1.addItem)(interaction.user.id, itemId, 1);
    await interaction.reply(`Yay! You bought a **${item.name}**! Xya is so happy for you! 🍭`);
};
exports.execute = execute;

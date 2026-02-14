"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
const shop_1 = require("./shop");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('inventory')
    .setDescription('See all the gifts you have collected! 🎀');
const execute = async (interaction) => {
    const inv = (0, db_1.getInventory)(interaction.user.id);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0xFF69B4)
        .setTitle('🎒 Your Inventory')
        .setDescription('Here are the items you have bought or earned! ♪');
    if (inv.length === 0 || inv.every(i => i.quantity <= 0)) {
        embed.addFields({ name: 'Empty!', value: 'You don\'t have any items yet. Visit the /shop! 💎' });
    }
    else {
        inv.forEach(userItem => {
            if (userItem.quantity > 0) {
                const item = shop_1.SHOP_ITEMS.find(i => i.id === userItem.item_id);
                embed.addFields({
                    name: item ? item.name : userItem.item_id,
                    value: `Quantity: **${userItem.quantity}**`,
                    inline: true
                });
            }
        });
    }
    await interaction.reply({ embeds: [embed] });
};
exports.execute = execute;

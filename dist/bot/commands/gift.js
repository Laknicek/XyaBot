"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
const shop_1 = require("./shop");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('gift')
    .setDescription('Give a gift to Xya! 💖')
    .addStringOption(option => option.setName('item')
    .setDescription('The item to gift')
    .setRequired(true)
    .addChoices(...shop_1.SHOP_ITEMS.map(i => ({ name: i.name, value: i.id }))));
const execute = async (interaction) => {
    const itemId = interaction.options.getString('item');
    const item = shop_1.SHOP_ITEMS.find(i => i.id === itemId);
    const inv = (0, db_1.getInventory)(interaction.user.id);
    const userItem = inv.find((i) => i.item_id === itemId);
    if (!userItem || userItem.quantity <= 0) {
        await interaction.reply({ content: `You don't have any **${item.name}** to gift! Buy one in the /shop first! ♪`, flags: [discord_js_1.MessageFlags.Ephemeral] });
        return;
    }
    const user = (0, db_1.getUser)(interaction.user.id, interaction.user.username);
    const pointsGained = item.price / 10;
    const newPoints = (user.friendship_points || 0) + pointsGained;
    (0, db_1.removeItem)(interaction.user.id, itemId, 1);
    (0, db_1.updateUser)(interaction.user.id, { friendship_points: newPoints });
    let response = `*Xya blushes and takes the ${item.name}* 
"Thank you so much! Xya will cherish this forever! 💖"`;
    if (newPoints >= 100) {
        (0, db_1.addBadge)(interaction.user.id, 'best_friend');
        response += `

✨ **New Badge Unlocked:** Xya's Best Friend!`;
    }
    await interaction.reply(response);
};
exports.execute = execute;

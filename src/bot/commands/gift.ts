import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { Command } from '../types';
import { getUser, updateUser, getInventory, removeItem, addBadge } from '../db';
import { SHOP_ITEMS } from './shop';

export const data = new SlashCommandBuilder()
    .setName('gift')
    .setDescription('Give a gift to Xya! 💖')
    .addStringOption(option =>
        option.setName('item')
            .setDescription('The item to gift')
            .setRequired(true)
            .addChoices(...SHOP_ITEMS.map(i => ({ name: i.name, value: i.id }))));

export const execute: Command['execute'] = async (interaction) => {
    const itemId = interaction.options.getString('item')!;
    const item = SHOP_ITEMS.find(i => i.id === itemId)!;
    const inv = getInventory(interaction.user.id) as any[];
    const userItem = inv.find((i: any) => i.item_id === itemId);

    if (!userItem || userItem.quantity <= 0) {
        await interaction.reply({ content: `You don't have any **${item.name}** to gift! Buy one in the /shop first! ♪`, flags: [MessageFlags.Ephemeral] });
        return;
    }

    const user = getUser(interaction.user.id, interaction.user.username);
    const pointsGained = item.price / 10;
    const newPoints = (user.friendship_points || 0) + pointsGained;

    removeItem(interaction.user.id, itemId, 1);
    updateUser(interaction.user.id, { friendship_points: newPoints });

    let response = `*Xya blushes and takes the ${item.name}* 
"Thank you so much! Xya will cherish this forever! 💖"`;
    
    if (newPoints >= 100) {
        addBadge(interaction.user.id, 'best_friend');
        response += `

✨ **New Badge Unlocked:** Xya's Best Friend!`;
    }

    await interaction.reply(response);
};
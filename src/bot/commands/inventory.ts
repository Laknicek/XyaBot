import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../types';
import { getInventory } from '../db';
import { SHOP_ITEMS } from './shop';

export const data = new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('See all the gifts you have collected! 🎀');

export const execute: Command['execute'] = async (interaction) => {
    const inv = getInventory(interaction.user.id) as any[];
    
    const embed = new EmbedBuilder()
        .setColor(0xFF69B4)
        .setTitle('🎒 Your Inventory')
        .setDescription('Here are the items you have bought or earned! ♪');

    if (inv.length === 0 || inv.every(i => i.quantity <= 0)) {
        embed.addFields({ name: 'Empty!', value: 'You don\'t have any items yet. Visit the /shop! 💎' });
    } else {
        inv.forEach(userItem => {
            if (userItem.quantity > 0) {
                const item = SHOP_ITEMS.find(i => i.id === userItem.item_id);
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
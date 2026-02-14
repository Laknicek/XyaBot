import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { Command } from '../types';
import { getUser, updateUser, addItem } from '../db';
import { SHOP_ITEMS } from './shop';

export const data = new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy an item from the shop')
    .addStringOption(option =>
        option.setName('item')
            .setDescription('The item to buy')
            .setRequired(true)
            .addChoices(...SHOP_ITEMS.map(i => ({ name: i.name, value: i.id }))));

export const execute: Command['execute'] = async (interaction) => {
    const itemId = interaction.options.getString('item')!;
    const item = SHOP_ITEMS.find(i => i.id === itemId)!;
    const user = getUser(interaction.user.id, interaction.user.username);

    if (user.currency < item.price) {
        await interaction.reply({ content: `Oh my, you don't have enough Gems! You need **💎 ${item.price}**. >_<`, flags: [MessageFlags.Ephemeral] });
        return;
    }

    updateUser(interaction.user.id, { currency: user.currency - item.price });
    addItem(interaction.user.id, itemId, 1);

    await interaction.reply(`Yay! You bought a **${item.name}**! Xya is so happy for you! 🍭`);
};

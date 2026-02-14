import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { Command } from '../types';

const CATEGORIES = {
    fun: {
        label: '🎉 Fun & Games',
        description: 'Interactive games and fun commands!',
        commands: [
            '`/8ball` - Ask the magic 8-ball a question',
            '`/wyr` - Would You Rather scenarios',
            '`/rps` - Rock Paper Scissors',
            '`/coinflip` - Flip a coin',
            '`/trivia` - Test your knowledge',
            '`/tod` - Truth or Dare',
            '`/slots` - Spin the slots to win gems',
            '`/sing` - Ask Xya to sing a song',
            '`/confess` - Send an anonymous confession',
            '`/poll` - Create a simple poll'
        ]
    },
    economy: {
        label: '💰 Economy',
        description: 'Manage your gems and items!',
        commands: [
            '`/daily` - Claim your daily reward',
            '`/shop` - Browse the shop for items',
            '`/buy` - Purchase items from the shop',
            '`/inventory` - View your items',
            '`/gift` - Gift gems or items to others'
        ]
    },
    social: {
        label: '💖 Social',
        description: 'Connect with other users!',
        commands: [
            '`/profile` - View your profile card',
            '`/leaderboard` - See top users',
            '`/birthday` - Set or view birthdays',
            '`/remind` - Set a reminder'
        ]
    },
    utility: {
        label: '🛠️ Utility',
        description: 'Useful tools and helpers.',
        commands: [
            '`/help` - Show this menu',
            '`/wordoftheday` - Get a random word definition',
            '`/join` - Join voice channel',
            '`/radio` - Play Xya\'s radio'
        ]
    },
    settings: {
        label: '⚙️ Settings',
        description: 'Configure bot settings.',
        commands: [
            '`/settings` - Toggle bot features',
            '`/manage-features` - Enable/disable specific commands',
            '`/setup-welcome` - Configure welcome channel',
            '`/test-welcome` - Test welcome message'
        ]
    }
};

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Explore all of Xya\'s commands! ✨');

export const execute: Command['execute'] = async (interaction) => {
    // Helper to build embed based on category
    const getEmbed = (categoryKey?: string) => {
        const embed = new EmbedBuilder()
            .setColor(0xFF69B4)
            .setThumbnail(interaction.client.user?.displayAvatarURL() || null)
            .setFooter({ text: 'Xya loves helping! 💕' });

        if (!categoryKey || categoryKey === 'home') {
            embed.setTitle('✨ Xya Help Menu')
                .setDescription(
                    `Hi there, **${interaction.user.username}**! I'm Xya, your AI companion! 💖\n\n` +
                    `Use the buttons below to explore my commands.\nI can play games, chat, remember things, and more!\n\n` +
                    `**Tip:** You can chat with me normally too! Just say "Hi Xya"!`
                )
                .addFields(
                    { name: '🎉 Fun', value: 'Games, trivia, and 8-ball', inline: true },
                    { name: '💰 Economy', value: 'Gems, shop, and items', inline: true },
                    { name: '💖 Social', value: 'Profiles and birthdays', inline: true },
                    { name: '🛠️ Utility', value: 'Tools and helpers', inline: true },
                    { name: '⚙️ Settings', value: 'Configure the bot', inline: true }
                );
        } else {
            const cat = CATEGORIES[categoryKey as keyof typeof CATEGORIES];
            embed.setTitle(cat.label)
                .setDescription(cat.description)
                .addFields({ name: 'Commands', value: cat.commands.join('\n') });
        }

        return embed;
    };

    // Helper to build buttons
    const getButtons = (activeCategory: string = 'home') => {
        const row1 = new ActionRowBuilder<ButtonBuilder>();
        const row2 = new ActionRowBuilder<ButtonBuilder>();

        // Home Button
        row1.addComponents(
            new ButtonBuilder()
                .setCustomId('help_home')
                .setLabel('🏠 Home')
                .setStyle(activeCategory === 'home' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(activeCategory === 'home')
        );

        // Category Buttons
        Object.entries(CATEGORIES).forEach(([key, cat], index) => {
            const btn = new ButtonBuilder()
                .setCustomId(`help_${key}`)
                .setLabel(cat.label)
                .setStyle(activeCategory === key ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(activeCategory === key);

            if (index < 2) row1.addComponents(btn);
            else row2.addComponents(btn);
        });

        return [row1, row2];
    };

    const reply = await interaction.reply({
        embeds: [getEmbed('home')],
        components: getButtons('home'),
        fetchReply: true
    });

    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60_000,
        filter: (i) => i.user.id === interaction.user.id
    });

    collector.on('collect', async (i) => {
        const categoryKey = i.customId.replace('help_', '');
        await i.update({
            embeds: [getEmbed(categoryKey)],
            components: getButtons(categoryKey)
        });
    });

    collector.on('end', async () => {
        // Disable buttons on timeout
        const disabledRows = getButtons().map(row => {
            row.components.forEach(btn => btn.setDisabled(true));
            return row;
        });

        try {
            await interaction.editReply({ components: disabledRows });
        } catch { }
    });
};

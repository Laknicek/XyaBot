"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.name = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
exports.name = discord_js_1.Events.InteractionCreate;
const execute = async (interaction) => {
    const guildId = interaction.guildId;
    const settings = guildId ? (0, db_1.getGuildSetting)(guildId) : null;
    const isAdmin = interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.Administrator);
    // 0. Maintenance Check
    if (settings?.maintenance_mode && !isAdmin) {
        if (interaction.isRepliable()) {
            const maintEmbed = new discord_js_1.EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('🛠️ Maintenance Mode')
                .setDescription('Xya is currently taking a little nap while my heart gets some repairs! Please try again later. ♪');
            return interaction.reply({ embeds: [maintEmbed], flags: [discord_js_1.MessageFlags.Ephemeral] });
        }
        return;
    }
    // 0.5 DM Command Check (Friendship Requirement)
    if (!interaction.guildId && interaction.isChatInputCommand()) {
        const user = (0, db_1.getUser)(interaction.user.id, interaction.user.username);
        // Requirement: 500 Friendship (Best Friends)
        if (user.friendship_points < 500) {
            return interaction.reply({
                content: `🚫 **Access Denied!**\nI only talk in DMs with my besties! 💕\n(You need **500+ Friendship** to use commands here — chat with me in a server first!)`,
                flags: [discord_js_1.MessageFlags.Ephemeral]
            });
        }
    }
    // 1. Slash Commands
    if (interaction.isChatInputCommand()) {
        // Management commands are always allowed for admins
        const isManagementCmd = ['manage-features', 'setup-welcome', 'test-welcome'].includes(interaction.commandName);
        // Restriction Check
        if (settings?.disable_commands && !isManagementCmd && !isAdmin) {
            return interaction.reply({
                content: "Slash commands are currently disabled in this server! Please contact an admin if you think this is a mistake. >_<",
                flags: [discord_js_1.MessageFlags.Ephemeral]
            });
        }
        const client = interaction.client;
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        // Log command usage
        (0, db_1.logCommandUsage)(interaction.commandName, interaction.user.id, guildId, true);
        try {
            await command.execute(interaction);
        }
        catch (error) {
            console.error(error);
            // Log failed command
            (0, db_1.logCommandUsage)(interaction.commandName, interaction.user.id, guildId, false);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            else {
                await interaction.reply({ content: 'There was an error while executing this command!', flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
        }
        return;
    }
    // 2. Buttons
    if (interaction.isButton()) {
        // --- Role Assignment ---
        if (interaction.customId.startsWith('role_assign:')) {
            const roleId = interaction.customId.split(':')[1];
            const member = interaction.member;
            if (!member || !roleId)
                return;
            // Resolve role
            const role = interaction.guild?.roles.cache.get(roleId);
            if (!role) {
                return interaction.reply({ content: "❌ This role no longer exists!", flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            try {
                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId);
                    return interaction.reply({
                        content: `➖ Removed **${role.name}** role.`,
                        flags: [discord_js_1.MessageFlags.Ephemeral]
                    });
                }
                else {
                    await member.roles.add(roleId);
                    return interaction.reply({
                        content: `➕ Added **${role.name}** role!`,
                        flags: [discord_js_1.MessageFlags.Ephemeral]
                    });
                }
            }
            catch (error) {
                console.error(`[RoleAssign] Failed to toggle role ${roleId} for ${member.user.tag}:`, error);
                if (!interaction.replied && !interaction.deferred) {
                    return interaction.reply({
                        content: "❌ I couldn't update your role! Please make sure my role is **above** the role you are trying to get, and that I have `Manage Roles` permission.",
                        flags: [discord_js_1.MessageFlags.Ephemeral]
                    }).catch(() => null);
                }
                else {
                    return interaction.followUp({
                        content: "❌ I couldn't update your role! Please make sure my role is **above** the role you are trying to get, and that I have `Manage Roles` permission.",
                        flags: [discord_js_1.MessageFlags.Ephemeral]
                    }).catch(() => null);
                }
            }
        }
        if (interaction.customId.startsWith('guess_word_')) {
            const correctWord = interaction.customId.replace('guess_word_', '');
            const modal = new discord_js_1.ModalBuilder()
                .setCustomId(`submit_guess_${correctWord}`)
                .setTitle('Guess the Word');
            const guessInput = new discord_js_1.TextInputBuilder()
                .setCustomId('guessInput')
                .setLabel("What is your guess?")
                .setStyle(discord_js_1.TextInputStyle.Short)
                .setPlaceholder("Type the word here...")
                .setRequired(true);
            const firstActionRow = new discord_js_1.ActionRowBuilder().addComponents(guessInput);
            modal.addComponents(firstActionRow);
            await interaction.showModal(modal);
        }
        // --- WYR BUTTONS ---
        if (interaction.customId.startsWith('wyr_')) {
            const parts = interaction.customId.split('_');
            const choice = parts[1]; // a or b
            const id = parseInt(parts[2]);
            try {
                const { voteWyr, getWyr } = await Promise.resolve().then(() => __importStar(require('../db'))); // Lazy import
                const success = voteWyr(id, interaction.user.id, choice);
                if (!success) {
                    return interaction.reply({ content: '❌ This poll has ended!', flags: [discord_js_1.MessageFlags.Ephemeral] });
                }
                // Refresh Embed
                const wyr = getWyr(id);
                if (wyr) {
                    const votesA = wyr.votes_a;
                    const votesB = wyr.votes_b;
                    const totalVotes = votesA.length + votesB.length;
                    const pctA = totalVotes > 0 ? Math.round((votesA.length / totalVotes) * 100) : 0;
                    const pctB = totalVotes > 0 ? Math.round((votesB.length / totalVotes) * 100) : 0;
                    const embed = discord_js_1.EmbedBuilder.from(interaction.message.embeds[0]);
                    // Update Fields
                    embed.setFields({ name: `🅰️ Option A`, value: `${wyr.option_a}\n${'▓'.repeat(Math.floor(pctA / 10))}${'░'.repeat(10 - Math.floor(pctA / 10))} ${pctA}% (${votesA.length})`, inline: false }, { name: `🅱️ Option B`, value: `${wyr.option_b}\n${'▓'.repeat(Math.floor(pctB / 10))}${'░'.repeat(10 - Math.floor(pctB / 10))} ${pctB}% (${votesB.length})`, inline: false });
                    embed.setFooter({ text: `Daily Question • Total Votes: ${totalVotes}` });
                    await interaction.update({ embeds: [embed] });
                }
            }
            catch (error) {
                console.error("WYR Error:", error);
                await interaction.reply({ content: '❌ Error processing vote.', flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            return;
        }
        if (interaction.customId === 'create_ticket') {
            if (!settings?.ticket_category_id) {
                return interaction.reply({ content: "❌ Tickets are not configured yet! Ask an admin to run `/setup tickets config`.", flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            const existingChannel = interaction.guild?.channels.cache.find(c => c.name === `ticket-${interaction.user.username.toLowerCase()}`);
            if (existingChannel) {
                return interaction.reply({ content: `❌ You already have a ticket open: <#${existingChannel.id}>`, flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            // Create Channel
            const channel = await interaction.guild?.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: 0, // GuildText
                parent: settings.ticket_category_id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [discord_js_1.PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [discord_js_1.PermissionFlagsBits.ViewChannel, discord_js_1.PermissionFlagsBits.SendMessages, discord_js_1.PermissionFlagsBits.ReadMessageHistory],
                    },
                    {
                        id: interaction.client.user.id,
                        allow: [discord_js_1.PermissionFlagsBits.ViewChannel, discord_js_1.PermissionFlagsBits.SendMessages],
                    }
                ],
            });
            if (!channel)
                return interaction.reply({ content: "❌ Failed to create ticket channel.", flags: [discord_js_1.MessageFlags.Ephemeral] });
            // Log DB
            const { createTicket } = await Promise.resolve().then(() => __importStar(require('../db'))); // Lazy import to avoid circular dep issues if any
            createTicket(interaction.guildId, channel.id, interaction.user.id);
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`🎫 Ticket: ${interaction.user.username}`)
                .setDescription("Support will be with you shortly. Please describe your issue!")
                .setColor(0x00FF00)
                .setTimestamp();
            const row = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Close Ticket')
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setEmoji('🔒'));
            await channel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });
            return interaction.reply({ content: `✅ Ticket created: <#${channel.id}>`, flags: [discord_js_1.MessageFlags.Ephemeral] });
        }
        if (interaction.customId === 'close_ticket') {
            const channel = interaction.channel;
            if (!channel || channel.type !== 0)
                return; // Ensure text channel
            await interaction.reply({ content: "🔒 Closing ticket in 5 seconds..." });
            // Prepare Transcript (Basic text file)
            // In a real app, you'd fetch messages. For now, we'll just log it.
            if (settings?.ticket_transcript_channel_id) {
                const transcriptChannel = interaction.guild?.channels.cache.get(settings.ticket_transcript_channel_id);
                if (transcriptChannel?.isSendable()) {
                    const embed = new discord_js_1.EmbedBuilder()
                        .setTitle('📄 Ticket Transcript')
                        .setDescription(`Ticket ${channel.name} was closed by ${interaction.user.tag}`)
                        .setColor(0x95A5A6)
                        .setTimestamp();
                    await transcriptChannel.send({ embeds: [embed] });
                }
            }
            const { closeTicket } = await Promise.resolve().then(() => __importStar(require('../db')));
            closeTicket(channel.id);
            setTimeout(() => {
                channel.delete().catch(() => { });
            }, 5000);
        }
        // --- SONG REQUEST BUTTONS ---
        if (interaction.customId === 'approve_song' || interaction.customId === 'decline_song') {
            // Check permissions (e.g. Manage Messages or Mute Members)
            if (!interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({ content: "❌ You don't have permission to manage requests!", flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            const isApprove = interaction.customId === 'approve_song';
            const embed = discord_js_1.EmbedBuilder.from(interaction.message.embeds[0]);
            // Update Status
            if (isApprove) {
                embed.setColor(0x00FF00); // Green
                embed.setFooter({ text: `Status: Approved by ${interaction.user.tag}` });
            }
            else {
                embed.setColor(0xFF0000); // Red
                embed.setFooter({ text: `Status: Declined by ${interaction.user.tag}` });
            }
            // Update Buttons (Keep both enabled so they can switch decision)
            const row = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId('approve_song')
                .setLabel('Approve')
                .setStyle(discord_js_1.ButtonStyle.Success)
                .setEmoji('✅')
                .setDisabled(isApprove), // Disable the one just clicked? Or keep enabled to re-trigger? 
            // User requirement: "make it if wrong decicion made we can cahnge from aprove to decline and decline to aprove any time we want!"
            // So we should probably keep them enabled, OR toggle the disabled state.
            // Let's just keep them ENABLED but maybe visually indicate the current state?
            // Discord buttons don't have a "selected" state other than disabled/style.
            // Let's disable the CURRENTLY selected one to show it's active state.
            new discord_js_1.ButtonBuilder()
                .setCustomId('decline_song')
                .setLabel('Decline')
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setEmoji('✖️')
                .setDisabled(!isApprove));
            await interaction.update({ embeds: [embed], components: [row] });
            // --- NOTIFY USER ---
            const description = embed.data.description || '';
            const match = description.match(/<@(\d+)>/);
            if (match) {
                const requesterId = match[1];
                try {
                    const requester = await interaction.client.users.fetch(requesterId);
                    const action = isApprove ? 'Approved' : 'Declined';
                    const color = isApprove ? 0x00FF00 : 0xFF0000;
                    const dmEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle(`🎵 Song Request ${action}!`)
                        .setDescription(`Your song request has been **${action}** by **${interaction.user.tag}**!`)
                        .addFields({ name: 'Request Info', value: description.split('\n').slice(1).join('\n') || 'Content unavailable' }) // Try to show original content
                        .setColor(color)
                        .setTimestamp();
                    await requester.send({ embeds: [dmEmbed] });
                }
                catch (e) {
                    // Start a background logic or just log
                    console.error(`[SongRequest] Failed to DM user ${requesterId}:`, e);
                }
            }
            return;
        }
        // 6. Theme System Buttons
        if (interaction.customId.startsWith('theme_')) {
            // isAdmin check again for safety
            if (!interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ You need Administrator permissions to change themes!", flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            const parts = interaction.customId.split('_');
            const action = parts[1]; // apply, regen, cancel
            const themeId = parts.slice(2).join('_'); // Rejoin the rest for IDs with underscores (lunar_new_year)
            if (action === 'cancel') {
                return interaction.update({ content: "❌ Theme Selection Cancelled.", embeds: [], components: [] });
            }
            // Immediately acknowledge to prevent timeout
            if (action === 'regen') {
                // For regen, we update the message immediately with new content, so no defer needed IF we are fast.
                // But better safe than sorry:
                // await interaction.deferUpdate(); // Actually, if we defer, we must editReply. 
            }
            else if (action === 'apply') {
                // Apply takes time, so we update the message to "Processing..."
                await interaction.update({ content: "⏳ **Applying Theme...** This may take a while to avoid rate limits...", embeds: [], components: [] });
            }
            try {
                const { THEMES, getPreview } = await Promise.resolve().then(() => __importStar(require('../utils/themes')));
                const theme = THEMES[themeId];
                if (!theme) {
                    return;
                }
                // --- BANNER PRE-CHECK ---
                // We need to identify the banner category BEFORE we do anything else, 
                // so we can exclude it from the general renaming loop.
                let bannerId = settings?.theme_banner_id;
                // If we don't have an ID, try to find it by name from ALL themes
                if (!bannerId) {
                    const allBanners = Object.values(THEMES).map(t => t.banner).filter(b => b);
                    const found = interaction.guild?.channels.cache.find(c => c.type === 4 && allBanners.some(b => c.name.includes(b)));
                    if (found) {
                        bannerId = found.id;
                        // Save it immediately so next time we know
                        const { setGuildSetting } = await Promise.resolve().then(() => __importStar(require('../db')));
                        setGuildSetting(interaction.guildId, { theme_banner_id: bannerId });
                    }
                }
                // --- IGNORE LIST ---
                let ignoredCats = [];
                try {
                    ignoredCats = settings?.theme_ignored_categories ? JSON.parse(settings.theme_ignored_categories) : [];
                }
                catch { }
                // Filter: Text (0), Voice (2), Category (4)
                const channels = interaction.guild?.channels.cache
                    .filter(c => c.type === 0 || c.type === 2 || c.type === 4)
                    .filter(c => !c.name.includes('staff') && !c.name.includes('log') && !c.name.includes('admin'))
                    .filter(c => c.id !== bannerId) // Exclude banner
                    // IGNORE LOGIC
                    .filter(c => {
                    // If it IS one of the ignored categories
                    if (ignoredCats.includes(c.id))
                        return false;
                    // If it is a CHILD of an ignored category
                    if (c.parentId && ignoredCats.includes(c.parentId))
                        return false;
                    return true;
                });
                if (!channels || channels.size === 0) {
                    if (action === 'apply') {
                        await interaction.followUp({ content: "❌ No suitable channels found to apply theme to.", flags: [discord_js_1.MessageFlags.Ephemeral] });
                    }
                    return;
                }
                // Create channel data for getPreview
                const channelData = channels.map(c => ({
                    name: c.name,
                    id: c.id,
                    type: c.type,
                    rawPosition: c.rawPosition,
                    parentId: c.parentId
                }));
                const renamedChannels = getPreview(channelData, themeId);
                if (action === 'regen') {
                    // Limit preview to top 15 from the result
                    const previewText = renamedChannels.slice(0, 15).map(p => `\`${p.oldName}\` ➡️ \`${p.newName}\``).join('\n');
                    const embed = new discord_js_1.EmbedBuilder()
                        .setTitle(`🎨 Theme Preview: ${theme.name} (Regenerated)`)
                        .setDescription(`**Description:** ${theme.description}\n\n**Preview Changes:**\n${previewText}\n\n⚠️ **Warning:** Clicking Apply will rename these channels.`)
                        .setColor(0xFF69B4);
                    return interaction.update({ embeds: [embed] });
                }
                if (action === 'apply') {
                    const { setGuildSetting } = await Promise.resolve().then(() => __importStar(require('../db')));
                    setGuildSetting(interaction.guildId, { theme_id: themeId });
                    let count = 0;
                    const errors = [];
                    console.log("[Theme] Starting apply loop...");
                    for (const plan of renamedChannels) {
                        try {
                            const channel = interaction.guild?.channels.cache.get(plan.id);
                            if (channel) {
                                // Skip if name is already correct to save rate limits
                                if (channel.name === plan.newName) {
                                    console.log(`[Theme] Skipping ${plan.oldName} (already correct)`);
                                    continue;
                                }
                                console.log(`[Theme] Renaming ${plan.oldName} -> ${plan.newName}`);
                                await channel.setName(plan.newName);
                                count++;
                                // Wait 1.5s to be safe with rate limits
                                await new Promise(r => setTimeout(r, 1500));
                            }
                        }
                        catch (e) {
                            console.error(`[Theme] Failed to rename ${plan.oldName}:`, e);
                            errors.push(plan.oldName);
                        }
                    }
                    // --- BANNER LOGIC ---
                    if (theme.banner) {
                        try {
                            let bannerChannel;
                            // 1. Try to find by ID (using the one we resolved earlier or from settings)
                            if (bannerId) {
                                bannerChannel = interaction.guild?.channels.cache.get(bannerId);
                            }
                            // 2. If STILL not found (e.g. deleted mid-run), try Name again
                            if (!bannerChannel) {
                                const allBanners = Object.values(THEMES).map(t => t.banner).filter(b => b);
                                const found = interaction.guild?.channels.cache.find(c => c.type === 4 && allBanners.some(b => c.name.includes(b)));
                                if (found)
                                    bannerChannel = found;
                            }
                            if (bannerChannel) {
                                // Update Name if needed
                                if (bannerChannel.name !== theme.banner) {
                                    await bannerChannel.setName(theme.banner);
                                }
                                // Force to Top
                                await bannerChannel.setPosition(0);
                                // Persist ID if it wasn't set (or changed)
                                if (settings?.theme_banner_id !== bannerChannel.id) {
                                    const { setGuildSetting } = await Promise.resolve().then(() => __importStar(require('../db')));
                                    setGuildSetting(interaction.guildId, { theme_banner_id: bannerChannel.id });
                                }
                                count++;
                            }
                            else {
                                // Create new one at top
                                const newChannel = await interaction.guild?.channels.create({
                                    name: theme.banner,
                                    type: 4, // GuildCategory
                                    position: 0
                                });
                                if (newChannel) {
                                    const { setGuildSetting } = await Promise.resolve().then(() => __importStar(require('../db')));
                                    setGuildSetting(interaction.guildId, { theme_banner_id: newChannel.id });
                                    count++;
                                }
                            }
                        }
                        catch (e) {
                            console.error("Banner Error:", e);
                            errors.push("Theme Banner");
                        }
                    }
                    // --- AUTO-UPDATE ROLE MENUS ---
                    if (settings?.role_menus) {
                        try {
                            const menus = JSON.parse(settings.role_menus);
                            const roleConfig = settings.self_roles ? JSON.parse(settings.self_roles) : [];
                            const validMenus = [];
                            let updatedMenusCount = 0;
                            for (const menu of menus) {
                                try {
                                    const channel = interaction.guild?.channels.cache.get(menu.channelId);
                                    if (!channel || !channel.isSendable())
                                        continue;
                                    const message = await channel.messages.fetch(menu.messageId).catch(() => null);
                                    if (!message)
                                        continue; // Message deleted
                                    // Rebuild for this category
                                    const cat = menu.category;
                                    const roles = roleConfig.filter((r) => (r.category || 'General') === cat);
                                    if (roles.length === 0)
                                        continue; // No roles left for this category?
                                    // Stylize Title
                                    const catTitle = `${theme.emoji} ${theme.categoryFormat?.open[0] || ''} ${cat} ${theme.categoryFormat?.close[0] || ''}`;
                                    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
                                        .setCustomId(`self_role_select_${cat.toLowerCase().replace(/\s+/g, '_')}`)
                                        .setPlaceholder(`Select ${cat} roles...`)
                                        .setMinValues(0)
                                        .setMaxValues(Math.min(roles.length, 25));
                                    roles.forEach((r) => {
                                        selectMenu.addOptions(new discord_js_1.StringSelectMenuOptionBuilder()
                                            .setLabel(r.label)
                                            .setValue(r.roleId)
                                            .setEmoji(r.emoji || theme.defaultEmojis[0])
                                            .setDescription(r.description || 'Click to toggle this role'));
                                    });
                                    const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
                                    const embed = new discord_js_1.EmbedBuilder()
                                        .setTitle(catTitle)
                                        .setDescription(`${theme.format.open[0]} Select the roles you want from the menus below! ${theme.format.close[0]}`) // Generic desc or stored?
                                        .setColor(theme.color)
                                        .setImage(theme.image || null)
                                        .setFooter({ text: `Server Theme: ${theme.name}` });
                                    await message.edit({ embeds: [embed], components: [row] });
                                    updatedMenusCount++;
                                    validMenus.push(menu);
                                }
                                catch (e) {
                                    console.error(`Failed to update menu ${menu.messageId}:`, e);
                                }
                            }
                            // Update DB with only valid menus (cleanup)
                            if (validMenus.length !== menus.length) {
                                const { setGuildSetting } = await Promise.resolve().then(() => __importStar(require('../db')));
                                setGuildSetting(interaction.guildId, { role_menus: JSON.stringify(validMenus) });
                            }
                            console.log(`[Theme] Updated ${updatedMenusCount} role menus.`);
                        }
                        catch (e) {
                            console.error("Role Menu Update Error:", e);
                        }
                    }
                    console.log(`[Theme] Finished. Updated: ${count}, Errors: ${errors.length}`);
                    await interaction.followUp({
                        content: `✅ **Theme Applied!**\nUpdated ${count} channels.\n${errors.length > 0 ? `Failed to update: ${errors.join(', ')}` : ''}`,
                        flags: [discord_js_1.MessageFlags.Ephemeral]
                    });
                }
            }
            catch (error) {
                console.error("Theme Logic Error:", error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: "❌ An error occurred while processing the theme.", flags: [discord_js_1.MessageFlags.Ephemeral] });
                }
                else {
                    await interaction.reply({ content: "❌ An error occurred.", flags: [discord_js_1.MessageFlags.Ephemeral] });
                }
            }
        }
    }
    // 3. Modals
    if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('submit_guess_')) {
            const correctWord = interaction.customId.replace('submit_guess_', '');
            const userGuess = interaction.fields.getTextInputValue('guessInput').trim().toUpperCase();
            if (userGuess === correctWord) {
                // Award Logic
                const user = (0, db_1.getUser)(interaction.user.id, interaction.user.username);
                const newXp = user.xp + 20;
                const newCurrency = user.currency + 50;
                (0, db_1.updateUser)(interaction.user.id, {
                    currency: newCurrency,
                    xp: newXp
                });
                (0, db_1.logCommandUsage)('wordle_guess', interaction.user.id, guildId, true);
                (0, db_1.logCommandUsage)('wordle_correct', interaction.user.id, guildId, true);
                await interaction.reply({
                    content: `🎉 **Correct!** The word was **${correctWord}**! You earned **50 💎** and **20 XP**!`,
                    flags: [discord_js_1.MessageFlags.Ephemeral]
                });
            }
            else {
                (0, db_1.logCommandUsage)('wordle_guess', interaction.user.id, guildId, false);
                await interaction.reply({
                    content: `❌ Aww, that's not quite right. The word was **${correctWord}**. Better luck next time!`,
                    flags: [discord_js_1.MessageFlags.Ephemeral]
                });
            }
        }
    }
    // 4. String Select Menus (Self Roles)
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('self_role_select')) {
        const member = interaction.member;
        if (!member || !('roles' in member)) { // Check if 'roles' exists (Member type)
            return interaction.reply({ content: 'Error: Could not access your roles.', flags: [discord_js_1.MessageFlags.Ephemeral] });
        }
        // This cast is safe because we checked 'roles' in member, implying GuildMember
        const guildMember = member;
        const selectedRoleIds = interaction.values;
        if (!settings?.self_roles)
            return;
        const allConfigRoles = JSON.parse(settings.self_roles);
        // Determine Category from CustomID
        // Format: self_role_select  OR  self_role_select_<category_slug>
        const parts = interaction.customId.replace('self_role_select', '').split('_').filter(p => p);
        const categorySlug = parts.length > 0 ? parts.join('_') : null;
        // Filter roles to ONLY those in this category (or all if no category)
        // If legacy menu (no category), it operates on ALL roles (or maybe just those without category?)
        // Better: If legacy menu, operate on ALL. If category menu, operate on matching category.
        let targetRoles = allConfigRoles;
        if (categorySlug) {
            targetRoles = allConfigRoles.filter(r => {
                const catSlug = (r.category || 'General').toLowerCase().replace(/\s+/g, '_');
                return catSlug === categorySlug;
            });
        }
        else {
            // Legacy/Fallback: If usage was generic, maybe we should only touch 'General' or undefined categories?
            // But realistically, old menus might just be invalid now.
            // Let's assume if no slug, it tries to handle everything (risky if split across menus).
            // Actually, if we just implemented categories, we should probably default to handling everything 
            // if it's the old 'self_role_select' ID, to keep old messages working?
            // Yes, let's keep targetRoles as allConfigRoles for backward compatibility.
        }
        const configRoleIds = targetRoles.map(r => r.roleId);
        const rolesToAdd = selectedRoleIds;
        const rolesToRemove = configRoleIds.filter(id => !selectedRoleIds.includes(id));
        try {
            await guildMember.roles.add(rolesToAdd);
            await guildMember.roles.remove(rolesToRemove);
            await interaction.reply({
                content: `✨ **Roles Updated!**\nAdded: ${rolesToAdd.length}\nRemoved: ${rolesToRemove.length}`,
                flags: [discord_js_1.MessageFlags.Ephemeral]
            });
        }
        catch (error) {
            console.error("Failed to update roles:", error);
            await interaction.reply({ content: "❌ I couldn't update your roles! I might be missing permissions or the role is above mine.", flags: [discord_js_1.MessageFlags.Ephemeral] });
        }
    }
};
exports.execute = execute;

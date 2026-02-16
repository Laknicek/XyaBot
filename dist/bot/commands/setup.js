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
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure advanced bot features (Admins Only)')
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    // --- SELF ROLES ---
    .addSubcommandGroup(group => group.setName('roles')
    .setDescription('Manage self-assignable roles')
    .addSubcommand(sub => sub.setName('add')
    .setDescription('Add a role to the selection menu')
    .addRoleOption(opt => opt.setName('role').setDescription('The role users can clip').setRequired(true))
    .addStringOption(opt => opt.setName('label').setDescription('Display name (e.g. "Gamer")').setRequired(true))
    .addStringOption(opt => opt.setName('category').setDescription('Category group (e.g. "Age", "Games")').setRequired(false))
    .addStringOption(opt => opt.setName('emoji').setDescription('Emoji for the menu (e.g. 🎮)').setRequired(false))
    .addStringOption(opt => opt.setName('description').setDescription('Short description for the menu').setRequired(false)))
    .addSubcommand(sub => sub.setName('remove')
    .setDescription('Remove a role from the configuration')
    .addRoleOption(opt => opt.setName('role').setDescription('The role to remove').setRequired(true)))
    .addSubcommand(sub => sub.setName('list')
    .setDescription('View currently configured self roles'))
    .addSubcommand(sub => sub.setName('post')
    .setDescription('Post the Self Roles menu in this channel')
    .addStringOption(opt => opt.setName('title').setDescription('Embed title').setRequired(false))
    .addStringOption(opt => opt.setName('description').setDescription('Embed description').setRequired(false)))
    .addSubcommand(sub => sub.setName('import')
    .setDescription('Convert legacy role menus (YAGPDB) to buttons')
    .addStringOption(opt => opt.setName('type').setDescription('Source Type').setRequired(true).addChoices({ name: 'YAGPDB / Standard', value: 'legacy' }))))
    // --- TICKETS ---
    .addSubcommandGroup(group => group.setName('tickets')
    .setDescription('Manage the ticket system')
    .addSubcommand(sub => sub.setName('config')
    .setDescription('Configure ticket settings')
    .addChannelOption(opt => opt.setName('category').setDescription('Category for new tickets').addChannelTypes(discord_js_1.ChannelType.GuildCategory).setRequired(true))
    .addChannelOption(opt => opt.setName('transcript_channel').setDescription('Channel to send closed ticket transcripts').addChannelTypes(discord_js_1.ChannelType.GuildText).setRequired(false)))
    .addSubcommand(sub => sub.setName('panel')
    .setDescription('Post the "Create Ticket" panel in this channel')
    .addStringOption(opt => opt.setName('title').setDescription('Panel Title').setRequired(false))
    .addStringOption(opt => opt.setName('description').setDescription('Panel Description').setRequired(false))))
    // --- THEMES ---
    .addSubcommandGroup(group => group.setName('theme')
    .setDescription('Manage server channel aesthetics')
    .addSubcommand(sub => sub.setName('preview')
    .setDescription('Preview a theme before applying it')
    .addStringOption(opt => opt.setName('preset')
    .setDescription('The aesthetic theme to preview')
    .setRequired(true)
    .addChoices({ name: '💖 Valentines', value: 'valentines' }, { name: '🧧 Lunar New Year', value: 'lunar_new_year' }, { name: '🐰 Easter', value: 'easter' }, { name: '🎄 Christmas', value: 'christmas' }, { name: '🎃 Halloween', value: 'halloween' }, { name: '☀️ Summer', value: 'summer' }, { name: '🌸 Spring', value: 'spring' }, { name: '🍂 Autumn', value: 'autumn' }, { name: '🥮 Mid-Autumn Festival', value: 'mid_autumn' }, { name: '✨ Default/Clean', value: 'default' })))
    .addSubcommand(sub => sub.setName('ignore')
    .setDescription('Manage ignored categories')
    .addStringOption(opt => opt.setName('action')
    .setDescription('What to do')
    .setRequired(true)
    .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }, { name: 'List', value: 'list' }))
    .addChannelOption(opt => opt.setName('category')
    .setDescription('The category (required for add/remove)')
    .addChannelTypes(discord_js_1.ChannelType.GuildCategory)
    .setRequired(false))))
    // --- EVENTS ---
    .addSubcommandGroup(group => group.setName('events')
    .setDescription('Manage automated events and highlights')
    .addSubcommand(sub => sub.setName('channel')
    .setDescription('Set the channel for events and weekly highlights')
    .addChannelOption(opt => opt.setName('channel')
    .setDescription('The channel to send events/highlights to')
    .addChannelTypes(discord_js_1.ChannelType.GuildText)
    .setRequired(true))))
    // --- REQUESTS ---
    .addSubcommandGroup(group => group.setName('requests')
    .setDescription('Manage song request settings')
    .addSubcommand(sub => sub.setName('channel')
    .setDescription('Set the channel for song requests')
    .addChannelOption(opt => opt.setName('channel')
    .setDescription('The channel to receive requests')
    .addChannelTypes(discord_js_1.ChannelType.GuildText)
    .setRequired(true))))
    // --- SHOP ---
    .addSubcommandGroup(group => group.setName('shop')
    .setDescription('Manage shop modules')
    .addSubcommand(sub => sub.setName('toggle')
    .setDescription('Enable/Disable shop modules')
    .addStringOption(opt => opt.setName('module')
    .setDescription('The shop module to toggle')
    .setRequired(true)
    .addChoices({ name: '🛍️ All Shops', value: 'all' }, { name: '🍭 Xya Shop', value: 'xya' }, { name: '🎵 AI Music', value: 'music' }, { name: '🎯 Osu Mapping', value: 'osu' }))
    .addBooleanOption(opt => opt.setName('enabled')
    .setDescription('Enable or Disable?')
    .setRequired(true))))
    // --- WYR ---
    .addSubcommandGroup(group => group.setName('wyr')
    .setDescription('Manage Would You Rather settings')
    .addSubcommand(sub => sub.setName('channel')
    .setDescription('Set the channel for Daily WYR')
    .addChannelOption(opt => opt.setName('channel')
    .setDescription('The channel to send daily questions to')
    .addChannelTypes(discord_js_1.ChannelType.GuildText)
    .setRequired(true))));
const execute = async (interaction) => {
    const group = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;
    // --- SELF ROLES LOGIC ---
    if (group === 'roles') {
        const settings = (0, db_1.getGuildSetting)(guildId) || {};
        let selfRoles = [];
        try {
            selfRoles = settings.self_roles ? JSON.parse(settings.self_roles) : [];
        }
        catch {
            selfRoles = [];
        }
        if (subcommand === 'add') {
            const role = interaction.options.getRole('role');
            const label = interaction.options.getString('label');
            const category = interaction.options.getString('category') || 'General';
            const emoji = interaction.options.getString('emoji') || undefined;
            const description = interaction.options.getString('description') || undefined;
            // Check duplicate
            if (selfRoles.some((r) => r.roleId === role.id)) {
                return interaction.reply({ content: `❌ **${role.name}** is already in the list!`, flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            selfRoles.push({ roleId: role.id, label, category, emoji, description });
            (0, db_1.setGuildSetting)(guildId, { self_roles: JSON.stringify(selfRoles) });
            return interaction.reply({ content: `✅ Added **${label}** (${role.name}) to **${category}** roles!`, flags: [discord_js_1.MessageFlags.Ephemeral] });
        }
        if (subcommand === 'remove') {
            const role = interaction.options.getRole('role');
            const initialLength = selfRoles.length;
            selfRoles = selfRoles.filter((r) => r.roleId !== role.id);
            if (selfRoles.length === initialLength) {
                return interaction.reply({ content: `❌ **${role.name}** was not in the config.`, flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            (0, db_1.setGuildSetting)(guildId, { self_roles: JSON.stringify(selfRoles) });
            return interaction.reply({ content: `🗑️ Removed **${role.name}** from self roles.`, flags: [discord_js_1.MessageFlags.Ephemeral] });
        }
        if (subcommand === 'list') {
            if (selfRoles.length === 0) {
                return interaction.reply({ content: "No self roles configured yet.", flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            const description = selfRoles.map((r) => `• ${r.emoji || ''} **${r.label}** (<@&${r.roleId}>)`).join('\n');
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle('🎭 Configured Self Roles')
                .setColor(0x00FF00)
                .setDescription(description);
            return interaction.reply({ embeds: [embed], flags: [discord_js_1.MessageFlags.Ephemeral] });
        }
        if (subcommand === 'post') {
            // Fetch Theme
            const themeId = settings.theme_id || 'default';
            const { THEMES } = await Promise.resolve().then(() => __importStar(require('../utils/themes')));
            const theme = THEMES[themeId] || THEMES['default'];
            const title = interaction.options.getString('title') || 'Choose Your Roles';
            const description = interaction.options.getString('description') || 'Select the roles you want from the menus below!';
            // Stylize Title
            const styledTitle = `${theme.emoji} ${theme.categoryFormat?.open[0] || ''}${title}${theme.categoryFormat?.close[0] || ''}`;
            // Group roles by category
            const categories = {};
            selfRoles.forEach((r) => {
                const cat = r.category || 'General';
                if (!categories[cat])
                    categories[cat] = [];
                categories[cat].push(r);
            });
            // specific sort order? alphabetical for now, or 'General' first?
            const sortedCats = Object.keys(categories).sort();
            if (sortedCats.length === 0) {
                return interaction.reply({ content: "❌ No roles configured!", flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            if (!interaction.channel?.isSendable()) {
                return interaction.reply({ content: "❌ I cannot send messages in this channel.", flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            // Acknowledge first (Defer because this might take time)
            await interaction.deferReply({ flags: [discord_js_1.MessageFlags.Ephemeral] });
            await interaction.editReply({ content: "⏳ Posting categorized role menus..." });
            const createdMenus = [];
            for (const cat of sortedCats) {
                const roles = categories[cat];
                const menuId = `self_role_select_${cat.toLowerCase().replace(/\s+/g, '_')}`;
                // Stylize Title for this specific Category
                // Use the user-provided title as a prefix or just use Category? 
                // Using Category as the main title is cleaner for "Embed per Category".
                // If user provided a title, maybe use it as the main header and Category as sub? 
                // Let's stick to Theme + Category as the main visual.
                const catTitle = `${theme.emoji} ${theme.categoryFormat?.open[0] || ''} ${cat} ${theme.categoryFormat?.close[0] || ''}`;
                const selectMenu = new discord_js_1.StringSelectMenuBuilder()
                    .setCustomId(menuId)
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
                    .setDescription(`${theme.format.open[0]} ${description} ${theme.format.close[0]}`)
                    .setColor(theme.color)
                    .setImage(theme.image || null)
                    .setFooter({ text: `Server Theme: ${theme.name}` });
                const msg = await interaction.channel.send({ embeds: [embed], components: [row] });
                // Track this menu for auto-updates
                const currentMenus = settings.role_menus ? JSON.parse(settings.role_menus) : [];
                currentMenus.push({
                    channelId: msg.channelId,
                    messageId: msg.id,
                    category: cat
                });
                // Update settings immediately (or accumulate and update at end)
                // Accumulating is better for DB perms but this loop is slow anyway due to rate limits
                // Let's just update at the end to be safe.
                // Wait, if we update at end we need to read 'currentMenus' from accumulating variable?
                // Actually, let's just accumulate in a local variable and save ONCE at the end.
                // But we need to handle existing menus? Maybe we should append to existing?
                // Yes, append.
                // Small delay to ensure order?
                await new Promise(r => setTimeout(r, 500));
                // (We will save after the loop)
                createdMenus.push({
                    channelId: msg.channelId,
                    messageId: msg.id,
                    category: cat
                });
            }
            // Save all new menus to DB
            const existingMenus = settings.role_menus ? JSON.parse(settings.role_menus) : [];
            const updatedMenus = [...existingMenus, ...createdMenus];
            (0, db_1.setGuildSetting)(guildId, { role_menus: JSON.stringify(updatedMenus) });
            await interaction.editReply({ content: "✅ **All menus posted!** (Auto-update enabled)" });
        }
        if (subcommand === 'import') {
            const channel = interaction.channel;
            if (!channel || !(channel instanceof discord_js_1.TextChannel)) {
                return interaction.reply({ content: "Please run this in a text channel where the role menus are!", flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            await interaction.deferReply({ flags: [discord_js_1.MessageFlags.Ephemeral] });
            await interaction.editReply({ content: "🔍 **Scanning channel for legacy role menus...**\nI'm looking for YAGPDB-style messages..." });
            try {
                // Fetch last 50 messages
                const messages = await channel.messages.fetch({ limit: 50 });
                const roleMenus = [];
                // Regex patterns
                const titleRegex = /Role Menu:\s*(.+)/i;
                const roleLineRegex = /((?:<:.+?:\d+>)|(?:[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]))\s*:\s*(?:`([^`]+)`|<@&(\d+)>|(.+))/g;
                for (const msg of messages.values()) {
                    if (msg.author.bot && msg.content.includes("Role Menu:")) {
                        const titleMatch = msg.content.match(titleRegex);
                        if (titleMatch) {
                            const category = titleMatch[1].trim();
                            const roles = [];
                            let match;
                            roleLineRegex.lastIndex = 0;
                            while ((match = roleLineRegex.exec(msg.content)) !== null) {
                                const emoji = match[1];
                                let roleName = match[2] || match[4]; // Code block or plain text
                                const roleIdRaw = match[3];
                                if (roleIdRaw) {
                                    const role = interaction.guild?.roles.cache.get(roleIdRaw);
                                    if (role)
                                        roleName = role.name;
                                }
                                if (roleName) {
                                    roles.push({ label: roleName.trim(), emoji, roleName: roleName.trim() });
                                }
                            }
                            if (roles.length > 0) {
                                roleMenus.push({ category, roles, message: msg });
                            }
                        }
                    }
                }
                if (roleMenus.length === 0) {
                    await interaction.editReply("❌ **No legacy role menus found!**\nMake sure they start with `Role Menu:` and follow the standard format.");
                    return;
                }
                await interaction.followUp({ content: `✅ Found **${roleMenus.length}** menus! Processing...`, flags: [discord_js_1.MessageFlags.Ephemeral] });
                for (const menu of roleMenus.reverse()) {
                    const validRoles = [];
                    for (const r of menu.roles) {
                        const role = interaction.guild?.roles.cache.find(gRole => gRole.name.toLowerCase() === r.roleName.toLowerCase());
                        if (role) {
                            validRoles.push({ label: r.label, emoji: r.emoji, id: role.id });
                        }
                        else {
                            console.warn(`[SetupRoles] Could not find role: ${r.roleName}`);
                        }
                    }
                    if (validRoles.length === 0)
                        continue;
                    const embed = new discord_js_1.EmbedBuilder()
                        .setTitle(`${menu.category}`)
                        .setDescription("Click the buttons below to toggle your roles!")
                        .setColor(0x2B2D31)
                        .setFooter({ text: "Self Roles" });
                    const chunks = [];
                    for (let i = 0; i < validRoles.length; i += 5) {
                        chunks.push(validRoles.slice(i, i + 5));
                    }
                    const rows = [];
                    for (const chunk of chunks) {
                        const row = new discord_js_1.ActionRowBuilder();
                        for (const r of chunk) {
                            let emoji = r.emoji;
                            const customEmojiMatch = emoji.match(/<:(.*?):(\d+)>/);
                            if (customEmojiMatch) {
                                const [_, emojiName, emojiId] = customEmojiMatch;
                                const clientEmoji = interaction.client.emojis.cache.get(emojiId);
                                if (clientEmoji) {
                                    // We have access to the exact emoji
                                    emoji = emojiId;
                                }
                                else {
                                    // Try to find a similar emoji by name in current guild or cache
                                    const similar = interaction.guild?.emojis.cache.find(e => e.name?.toLowerCase() === emojiName.toLowerCase())
                                        || interaction.client.emojis.cache.find(e => e.name?.toLowerCase() === emojiName.toLowerCase());
                                    if (similar) {
                                        emoji = similar.id;
                                    }
                                    else {
                                        // Fallback to a generic emoji if not found
                                        emoji = '✨';
                                    }
                                }
                            }
                            row.addComponents(new discord_js_1.ButtonBuilder()
                                .setCustomId(`role_assign:${r.id}`)
                                .setLabel(r.label)
                                .setEmoji(emoji)
                                .setStyle(discord_js_1.ButtonStyle.Secondary));
                        }
                        rows.push(row);
                    }
                    try {
                        await menu.message.delete();
                    }
                    catch (e) {
                        console.warn("Could not delete old message");
                    }
                    await channel.send({ embeds: [embed], components: rows });
                    await new Promise(r => setTimeout(r, 1000));
                }
                await interaction.editReply("✨ **Migration Complete!** Check out the new aesthetic buttons!");
            }
            catch (e) {
                console.error(e);
                await interaction.editReply(`❌ Error during setup: ${e.message}`);
            }
        }
    }
    // --- TICKETS LOGIC ---
    if (group === 'tickets') {
        if (subcommand === 'config') {
            const category = interaction.options.getChannel('category');
            const transcriptChannel = interaction.options.getChannel('transcript_channel');
            (0, db_1.setGuildSetting)(guildId, {
                ticket_category_id: category.id,
                ticket_transcript_channel_id: transcriptChannel ? transcriptChannel.id : null
            });
            return interaction.reply({
                content: `✅ **Ticket System Configured!**\n📂 Category: ${category.name}\n📜 Transcripts: ${transcriptChannel ? transcriptChannel.name : 'None'}`,
                flags: [discord_js_1.MessageFlags.Ephemeral]
            });
        }
        if (subcommand === 'panel') {
            const title = interaction.options.getString('title') || '📩 Support Tickets';
            const desc = interaction.options.getString('description') || 'Need help? Click the button below to open a private ticket with staff!';
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(title)
                .setDescription(desc)
                .setColor(0xE91E63)
                .setFooter({ text: 'Please do not open tickets for fun! >_<' });
            const button = new discord_js_1.ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('Open Ticket')
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setEmoji('📩');
            const row = new discord_js_1.ActionRowBuilder().addComponents(button);
            if (interaction.channel?.isSendable()) {
                await interaction.channel.send({ embeds: [embed], components: [row] });
                return interaction.reply({ content: "✅ Ticket panel posted!", flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            return interaction.reply({ content: "❌ I cannot send messages in this channel.", flags: [discord_js_1.MessageFlags.Ephemeral] });
        }
    }
    // --- THEME SYSTEM ---
    if (group === 'theme') {
        const settings = (0, db_1.getGuildSetting)(guildId) || {};
        // --- IGNORE SUBCOMMANDS ---
        if (subcommand === 'ignore') {
            const action = interaction.options.getString('action');
            let ignoredCats = [];
            try {
                ignoredCats = settings.theme_ignored_categories ? JSON.parse(settings.theme_ignored_categories) : [];
            }
            catch {
                ignoredCats = [];
            }
            if (action === 'list') {
                if (ignoredCats.length === 0) {
                    return interaction.reply({ content: "No categories are currently ignored.", flags: [discord_js_1.MessageFlags.Ephemeral] });
                }
                const names = ignoredCats.map(id => {
                    const c = interaction.guild?.channels.cache.get(id);
                    return c ? `• ${c.name}` : `• Used to be: ${id} (Deleted)`;
                }).join('\n');
                return interaction.reply({
                    embeds: [new discord_js_1.EmbedBuilder().setTitle('🚫 Ignored Categories').setDescription(names).setColor(0xFF0000)],
                    flags: [discord_js_1.MessageFlags.Ephemeral]
                });
            }
            const category = interaction.options.getChannel('category');
            if (!category) {
                return interaction.reply({ content: "❌ You must specify a category for add/remove!", flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            if (action === 'add') {
                if (ignoredCats.includes(category.id)) {
                    return interaction.reply({ content: `❌ **${category.name}** is already ignored!`, flags: [discord_js_1.MessageFlags.Ephemeral] });
                }
                ignoredCats.push(category.id);
                (0, db_1.setGuildSetting)(guildId, { theme_ignored_categories: JSON.stringify(ignoredCats) });
                return interaction.reply({ content: `✅ **${category.name}** and its channels will now be ignored by themes!`, flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            if (action === 'remove') {
                if (!ignoredCats.includes(category.id)) {
                    return interaction.reply({ content: `❌ **${category.name}** was not in the ignore list.`, flags: [discord_js_1.MessageFlags.Ephemeral] });
                }
                ignoredCats = ignoredCats.filter(id => id !== category.id);
                (0, db_1.setGuildSetting)(guildId, { theme_ignored_categories: JSON.stringify(ignoredCats) });
                return interaction.reply({ content: `✅ **${category.name}** is no longer ignored.`, flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            return;
        }
        if (subcommand === 'preview') {
            const themeId = interaction.options.getString('preset');
            const { THEMES, getPreview } = await Promise.resolve().then(() => __importStar(require('../utils/themes')));
            // Verify Theme exists
            if (!THEMES[themeId]) {
                return interaction.reply({ content: `❌ Unknown theme: ${themeId}`, flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            const theme = THEMES[themeId];
            await interaction.deferReply({ flags: [discord_js_1.MessageFlags.Ephemeral] });
            // Get Channels (Text, Voice, Category)
            // FILTER IGNORED CATEGORIES
            let ignoredCats = [];
            try {
                ignoredCats = settings.theme_ignored_categories ? JSON.parse(settings.theme_ignored_categories) : [];
            }
            catch { }
            const channels = interaction.guild?.channels.cache
                .filter(c => c.type === discord_js_1.ChannelType.GuildText || c.type === discord_js_1.ChannelType.GuildVoice || c.type === discord_js_1.ChannelType.GuildCategory)
                .filter(c => !c.name.includes('staff') && !c.name.includes('log') && !c.name.includes('admin')) // Basic safety
                // IGNORE LOGIC
                .filter(c => {
                // If it IS one of the ignored categories
                if (ignoredCats.includes(c.id))
                    return false;
                // If it is a CHILD of an ignored category
                if (c.parentId && ignoredCats.includes(c.parentId))
                    return false;
                return true;
            })
                .first(15); // Limit to 15 for preview to avoid hitting limits or huge embeds
            if (!channels || channels.length === 0) {
                return interaction.followUp({ content: "❌ No suitable channels found to preview." });
            }
            const previewData = getPreview(channels.map(c => ({
                name: c.name,
                id: c.id,
                type: c.type,
                rawPosition: c.rawPosition,
                parentId: c.parentId
            })), themeId);
            const previewText = previewData.map(p => `\`${p.oldName}\` ➡️ \`${p.newName}\``).join('\n');
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`🎨 Theme Preview: ${theme.name}`)
                .setDescription(`**Description:** ${theme.description}\n\n**Preview Changes:**\n${previewText}\n\n⚠️ **Warning:** Clicking Apply will rename these channels. This interacts with Discord's rate limits and may take a moment.`)
                .setColor(0xFF69B4);
            const row = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.ButtonBuilder().setCustomId(`theme_apply_${themeId}`).setLabel('Apply Theme').setStyle(discord_js_1.ButtonStyle.Success).setEmoji('✅'), new discord_js_1.ButtonBuilder().setCustomId(`theme_regen_${themeId}`).setLabel('Regenerate (Randomize)').setStyle(discord_js_1.ButtonStyle.Secondary).setEmoji('🎲'), new discord_js_1.ButtonBuilder().setCustomId('theme_cancel').setLabel('Cancel').setStyle(discord_js_1.ButtonStyle.Danger).setEmoji('✖️'));
            await interaction.followUp({ embeds: [embed], components: [row] });
        }
    }
    // --- EVENTS LOGIC ---
    if (group === 'events') {
        if (subcommand === 'channel') {
            const channel = interaction.options.getChannel('channel');
            // Check permissions in that channel
            if (!channel.permissionsFor(interaction.guild?.members.me).has(discord_js_1.PermissionFlagsBits.SendMessages)) {
                return interaction.reply({ content: `❌ I don't have permission to send messages in ${channel}! Please give me permission first.`, flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            (0, db_1.setGuildSetting)(guildId, { events_channel_id: channel.id });
            return interaction.reply({
                content: `✅ **Events Channel Configured!**\nAll automated events (Karaoke, Gem Rain, Highlights) will now be sent to ${channel}.`,
                flags: [discord_js_1.MessageFlags.Ephemeral]
            });
        }
    }
    // --- REQUESTS LOGIC ---
    if (group === 'requests') {
        if (subcommand === 'channel') {
            const channel = interaction.options.getChannel('channel');
            (0, db_1.setGuildSetting)(guildId, { requests_channel_id: channel.id });
            return interaction.reply({
                content: `✅ **Request Channel Configured!**\nAll song requests will be sent to ${channel} for approval.`,
                flags: [discord_js_1.MessageFlags.Ephemeral]
            });
        }
    }
    // --- SHOP LOGIC ---
    if (group === 'shop') {
        if (subcommand === 'toggle') {
            const module = interaction.options.getString('module');
            const enabled = interaction.options.getBoolean('enabled');
            // Convert boolean to 1/0 for DB
            const dbVal = enabled ? 1 : 0;
            const settingsUpdate = {};
            let moduleName = '';
            if (module === 'all') {
                settingsUpdate.shop_enabled = dbVal;
                moduleName = 'All Shops';
            }
            else if (module === 'xya') {
                settingsUpdate.shop_xya_enabled = dbVal;
                moduleName = 'Xya Shop';
            }
            else if (module === 'music') {
                settingsUpdate.shop_music_enabled = dbVal;
                moduleName = 'AI Music Shop';
            }
            else if (module === 'osu') {
                settingsUpdate.shop_osu_enabled = dbVal;
                moduleName = 'Osu Shop';
            }
            (0, db_1.setGuildSetting)(guildId, settingsUpdate);
            return interaction.reply({
                content: `✅ **${moduleName}** is now **${enabled ? 'OPEN 🟢' : 'CLOSED 🔴'}**!`,
                flags: [discord_js_1.MessageFlags.Ephemeral]
            });
        }
    }
    // --- WYR LOGIC ---
    if (group === 'wyr') {
        if (subcommand === 'channel') {
            const channel = interaction.options.getChannel('channel');
            // Check permissions
            if (!channel.permissionsFor(interaction.guild?.members.me).has(discord_js_1.PermissionFlagsBits.SendMessages)) {
                return interaction.reply({ content: `❌ I don't have permission to send messages in ${channel}!`, flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            (0, db_1.setGuildSetting)(guildId, { wyr_channel_id: channel.id });
            return interaction.reply({
                content: `✅ **WYR Channel Configured!**\nDaily "Would You Rather" questions will be sent to ${channel} at 1 AM.`,
                flags: [discord_js_1.MessageFlags.Ephemeral]
            });
        }
    }
};
exports.execute = execute;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily gems and grow your streak! ✨');
const execute = async (interaction) => {
    const user = interaction.user;
    const userData = (0, db_1.getUser)(user.id, user.username);
    const now = new Date();
    // Calculate the start of the current day (12 AM)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    // Calculate the start of the last claim day
    const lastClaimDate = new Date(userData.last_daily || 0);
    const lastClaimStart = new Date(lastClaimDate.getFullYear(), lastClaimDate.getMonth(), lastClaimDate.getDate()).getTime();
    // If last claim was today (same 12 AM start), they must wait
    if (userData.last_daily && lastClaimStart === todayStart) {
        // Calculate time until next midnight
        const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;
        const remaining = tomorrowStart - now.getTime();
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const waitEmbed = new discord_js_1.EmbedBuilder()
            .setColor(0xFF69B4)
            .setTitle('⏳ Not quite yet...')
            .setDescription(`Xya is still preparing your gems! Please come back in **${hours}h ${minutes}m** (at midnight). ♪`)
            .setThumbnail(user.displayAvatarURL());
        await interaction.reply({ embeds: [waitEmbed], flags: [discord_js_1.MessageFlags.Ephemeral] });
        return;
    }
    let streak = userData.daily_streak || 0;
    let shields = userData.vacation_shields ?? 3;
    let shieldUsed = false;
    // Check how many days have passed since the last claim start
    const oneDayMs = 24 * 60 * 60 * 1000;
    const daysSinceLast = Math.floor((todayStart - lastClaimStart) / oneDayMs);
    if (userData.last_daily === 0) {
        // First time ever
        streak = 1;
    }
    else if (daysSinceLast === 1) {
        // Claiming on the very next calendar day
        streak += 1;
    }
    else {
        // Missed one or more calendar days!
        const missedDays = daysSinceLast - 1;
        if (missedDays <= shields) {
            // Shield protects the streak!
            shields -= missedDays;
            streak += 1;
            shieldUsed = true;
        }
        else {
            // Shield depleted or gone too long
            streak = 1;
            shields = 3; // Reset shields for the new streak
        }
    }
    // Shield recovery: If streak is maintained normally, recover 1 shield up to 3
    if (!shieldUsed && shields < 3) {
        shields = Math.min(3, shields + 1);
    }
    // Reward calculation: Base 100 + (streak * 10)
    const baseReward = 100;
    const streakBonus = (streak - 1) * 10;
    const totalReward = baseReward + streakBonus;
    (0, db_1.updateUser)(user.id, {
        currency: Number(userData.currency) + totalReward,
        last_daily: now.getTime(),
        daily_streak: Number(streak),
        vacation_shields: Number(shields)
    });
    // --- "Animation" Effect ---
    const rollEmbed = new discord_js_1.EmbedBuilder()
        .setColor(0x00FFFF)
        .setTitle('🎲 Rolling for Gems...')
        .setDescription('Xya is counting your allowance... hang on! ♪');
    await interaction.reply({ embeds: [rollEmbed] });
    // Simulate counting
    await new Promise(resolve => setTimeout(resolve, 1500));
    const finalEmbed = new discord_js_1.EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('✨ Daily Gems Claimed!')
        .setDescription(`You received **${totalReward}** 💎!`)
        .addFields({ name: '🔥 Streak', value: `**${streak}** days`, inline: true }, { name: '🛡️ Vacation Shields', value: `${'⭐'.repeat(shields)}${'⚫'.repeat(3 - shields)}`, inline: true })
        .setThumbnail(user.displayAvatarURL())
        .setFooter({ text: shieldUsed ? 'Your streak was protected by a vacation shield! 🛡️' : 'Keep it up to recover shields and grow your bonus! ♪' });
    if (streak % 7 === 0) {
        finalEmbed.addFields({ name: '🎊 Weekly Bonus!', value: 'You got an extra **50** Gems for reaching a full week!' });
        (0, db_1.updateUser)(user.id, { currency: Number(userData.currency) + totalReward + 50 });
    }
    await interaction.editReply({ embeds: [finalEmbed] });
};
exports.execute = execute;

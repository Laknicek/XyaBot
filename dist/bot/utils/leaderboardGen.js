"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLeaderboardImage = generateLeaderboardImage;
const canvas_1 = require("canvas");
const candyUtils_1 = require("./candyUtils");
async function generateLeaderboardImage(topUsers) {
    const width = 900;
    const height = 1100;
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const ctx = canvas.getContext('2d');
    // --- Background ---
    (0, candyUtils_1.drawCandyBackground)(ctx, width, height);
    (0, candyUtils_1.drawSprinkles)(ctx, width, height, 120);
    // Decorations
    (0, candyUtils_1.drawLollipop)(ctx, 80, 80, 50);
    (0, candyUtils_1.drawWrappedCandy)(ctx, 820, 80, 70, '#FF1493');
    (0, candyUtils_1.drawWrappedCandy)(ctx, 80, 1020, 60, '#00FFFF');
    (0, candyUtils_1.drawLollipop)(ctx, 820, 1000, 50);
    // Title
    ctx.save();
    ctx.shadowColor = 'rgba(255, 20, 147, 0.4)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FF1493';
    ctx.font = 'bold 85px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Xya\'s Leaderboard', width / 2, 100);
    ctx.restore();
    // Main Glass Panel
    const listX = 50;
    const listY = 140;
    const listW = 800;
    const listH = 900;
    (0, candyUtils_1.drawCandyGlassCard)(ctx, listX, listY, listW, listH, 40);
    const rowH = 80;
    const rowGap = 15;
    topUsers.forEach((user, i) => {
        const y = listY + 30 + i * (rowH + rowGap);
        // Glassy Row
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.roundRect(listX + 20, y, listW - 40, rowH, 20);
        ctx.fill();
        ctx.restore();
        // Rank Circle
        const rankColor = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#FF69B4';
        ctx.save();
        ctx.shadowColor = rankColor;
        ctx.shadowBlur = 10;
        ctx.fillStyle = rankColor;
        ctx.beginPath();
        ctx.arc(listX + 70, y + rowH / 2, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${i + 1}`, listX + 70, y + rowH / 2 + 10);
        // Name & Level
        const level = Math.floor(Math.sqrt(user.xp / 100));
        ctx.textAlign = 'left';
        ctx.fillStyle = '#444';
        ctx.font = 'bold 32px sans-serif';
        const displayName = user.username.length > 15 ? user.username.slice(0, 15) + '...' : user.username;
        ctx.fillText(displayName, listX + 120, y + rowH / 2 + 10);
        // Level Badge
        ctx.fillStyle = '#8A2BE2';
        ctx.beginPath();
        ctx.roundRect(listX + 430, y + rowH / 2 - 15, 90, 30, 10);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(`Lv. ${level}`, listX + 445, y + rowH / 2 + 6);
        // Stats
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FF1493';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`${user.xp} ✨`, listX + listW - 180, y + rowH / 2 + 10);
        ctx.fillStyle = '#FF8C00';
        ctx.fillText(`${user.currency} 💎`, listX + listW - 50, y + rowH / 2 + 10);
        // Top 3 Sparkles
        if (i < 3) {
            (0, candyUtils_1.drawSparkle)(ctx, listX + listW - 30, y + 10, 12);
        }
    });
    return canvas.toBuffer();
}

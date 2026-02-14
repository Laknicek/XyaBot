"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWelcomeImage = generateWelcomeImage;
const canvas_1 = require("canvas");
async function generateWelcomeImage(username, avatarUrl) {
    const width = 1000;
    const height = 450;
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const ctx = canvas.getContext('2d');
    // --- Soft Aesthetic Background ---
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#E0F2F1'); // Very light teal
    grad.addColorStop(0.5, '#FCE4EC'); // Very light pink
    grad.addColorStop(1, '#E1F5FE'); // Very light blue
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    // --- Decorative "Clouds" or soft circles ---
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = 100 + Math.random() * 150;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    // --- Glassy Card ---
    const cardX = 40;
    const cardY = 40;
    const cardW = 920;
    const cardH = 370;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 30);
    ctx.fill();
    // Border for card
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    // --- Sen Nightcore Branding ---
    ctx.save();
    ctx.fillStyle = '#607D8B'; // Slate Grey/Blue
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Sen Nightcore', width - 70, 80);
    ctx.font = '18px sans-serif';
    ctx.globalAlpha = 0.7;
    ctx.fillText('hirehirehire', width - 70, 105);
    ctx.restore();
    // --- Avatar Section ---
    const avatarSize = 180;
    const avatarX = 100;
    const avatarY = (height - avatarSize) / 2;
    // Avatar Circle Clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();
    try {
        const avatar = await (0, canvas_1.loadImage)(avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png');
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    }
    catch (e) {
        ctx.fillStyle = '#B0BEC5';
        ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
    }
    ctx.restore();
    // Avatar Border (Soft Glow)
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
    // --- Large Stylized Text ---
    const textX = 350;
    // "WELCOME" in bubble/stylized letters
    ctx.save();
    ctx.fillStyle = '#B2EBF2'; // Soft cyan
    ctx.font = 'bold 120px sans-serif';
    ctx.globalAlpha = 0.6;
    ctx.fillText('W E L C O M E', textX, 230);
    // Overlay text (darker)
    ctx.fillStyle = '#455A64';
    ctx.font = 'bold 80px sans-serif';
    ctx.globalAlpha = 1.0;
    ctx.fillText('WELCOME', textX + 10, 220);
    // Username
    ctx.font = 'italic 40px sans-serif';
    ctx.fillStyle = '#CFD8DC';
    const cleanName = username.length > 15 ? username.slice(0, 15) : username;
    ctx.fillText(`${cleanName}?!`, textX + 15, 280);
    ctx.restore();
    // --- Decorations ---
    // Floating Sakura/Flowers (simple shapes)
    function drawFlower(fx, fy, size, color) {
        ctx.save();
        ctx.translate(fx, fy);
        ctx.fillStyle = color;
        for (let i = 0; i < 5; i++) {
            ctx.rotate((Math.PI * 2) / 5);
            ctx.beginPath();
            ctx.ellipse(size, 0, size, size / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
    drawFlower(width - 150, 200, 15, '#F8BBD0'); // Light pink flower
    drawFlower(width - 100, 230, 12, '#F8BBD0');
    drawFlower(width - 180, 250, 10, '#F8BBD0');
    return canvas.toBuffer();
}

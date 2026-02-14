import { createCanvas, loadImage } from 'canvas';
import { getBadges } from '../db';
import { drawCandyBackground, drawSprinkles, drawCandyGlassCard, drawLollipop, drawWrappedCandy, drawSparkle } from './candyUtils';

export async function generateProfileImage(user: any, avatarUrl: string | null) {
    const width = 900;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // --- Background ---
    drawCandyBackground(ctx, width, height);
    drawSprinkles(ctx, width, height, 80);

    // Floating Decorations
    drawWrappedCandy(ctx, 60, 60, 60, '#FF69B4');
    drawLollipop(ctx, 840, 60, 45);
    drawWrappedCandy(ctx, 840, 540, 60, '#00CED1');
    drawLollipop(ctx, 60, 540, 40);
    drawSparkle(ctx, 450, 40, 20);

    // Main Card
    const cardX = 40; const cardY = 50; const cardW = 820; const cardH = 500;
    drawCandyGlassCard(ctx, cardX, cardY, cardW, cardH, 40);

    // --- Avatar Section ---
    const avatarSize = 180; 
    const avatarX = 90; 
    const avatarY = 110;
    
    // Avatar Glow
    ctx.save();
    ctx.shadowColor = '#FF69B4';
    ctx.shadowBlur = 30;
    
    ctx.beginPath(); 
    ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2); 
    ctx.clip();
    
    try {
        const avatar = await loadImage(avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png');
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    } catch (e) { 
        ctx.fillStyle = '#FFC0CB'; 
        ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize); 
    }
    ctx.restore();
    
    // Avatar Glossy Border
    const bGrad = ctx.createLinearGradient(avatarX, avatarY, avatarX + avatarSize, avatarY + avatarSize);
    bGrad.addColorStop(0, '#FF69B4');
    bGrad.addColorStop(0.5, '#FFF');
    bGrad.addColorStop(1, '#00FFFF');
    
    ctx.lineWidth = 8; 
    ctx.strokeStyle = bGrad; 
    ctx.beginPath(); 
    ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 4, 0, Math.PI * 2); 
    ctx.stroke();

    // --- User Info ---
    const textX = 320;
    
    // Username with Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(255, 20, 147, 0.4)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FF1493'; 
    ctx.font = 'bold 55px sans-serif'; 
    ctx.fillText(user.username, textX, 140);
    ctx.restore();

    const level = Math.floor(Math.sqrt(user.xp / 100));
    
    // Level Badge
    ctx.save();
    ctx.fillStyle = '#8A2BE2'; 
    ctx.beginPath();
    ctx.roundRect(textX, 160, 160, 40, 20);
    ctx.fill();
    
    // Badge Shine
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.roundRect(textX + 5, 165, 150, 15, 10);
    ctx.fill();
    
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#fff'; 
    ctx.font = 'bold 24px sans-serif'; 
    ctx.textAlign = 'center'; 
    ctx.fillText(`Level ${level}`, textX + 80, 188); 
    ctx.restore();

    // --- Bars Section ---
    function drawStatBar(lx: number, ly: number, label: string, val: number, max: number, color: string, icon: string) {
        // Label
        ctx.fillStyle = '#555'; 
        ctx.font = 'bold 22px sans-serif'; 
        ctx.textAlign = 'left';
        ctx.fillText(`${icon} ${label}`, lx, ly);
        
        const barW = 460;
        const progress = Math.min(Math.max(val / max, 0), 1);
        
        // Bar Background
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; 
        ctx.beginPath(); 
        ctx.roundRect(lx, ly + 10, barW, 20, 10); 
        ctx.fill();
        
        // Bar Fill (Gradient)
        const fGrad = ctx.createLinearGradient(lx, 0, lx + barW, 0);
        fGrad.addColorStop(0, color);
        fGrad.addColorStop(1, '#FFC0CB'); // Light pinkish end
        
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = fGrad; 
        
        ctx.beginPath(); 
        ctx.roundRect(lx, ly + 10, Math.max(20, barW * progress), 20, 10); 
        ctx.fill();
        ctx.restore();
        
        // Bar Shine
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); 
        ctx.roundRect(lx + 5, ly + 12, Math.max(0, barW * progress - 10), 8, 4); 
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    drawStatBar(textX, 250, 'Friendship', user.friendship_points || 0, 1000, '#FF69B4', '💖');
    drawStatBar(textX, 320, 'Disgust', user.disgust_points || 0, 1000, '#9370DB', '🤢');

    // XP Bar (Bottom)
    const xpNext = Math.pow(level + 1, 2) * 100;
    drawStatBar(90, 480, 'Experience to Next Level', user.xp, xpNext, '#00CED1', '✨');
    
    ctx.fillStyle = '#666'; 
    ctx.font = 'bold 18px sans-serif'; 
    ctx.textAlign = 'right';
    ctx.fillText(`${user.xp} / ${xpNext}`, 90 + 460, 480); 
    ctx.textAlign = 'left';

    // --- Stats Grid ---
    const stats = [
        { label: 'Gems', value: user.currency, icon: '💎', color: '#FFD700' },
        { label: 'Warns', value: user.warnings, icon: '⚠️', color: '#FF4500' }
    ];

    stats.forEach((s, i) => {
        const sx = textX + i * 240;
        const sy = 370;
        
        // Glass Bubble
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowColor = 'rgba(0,0,0,0.05)';
        ctx.shadowBlur = 10;
        ctx.beginPath(); 
        ctx.roundRect(sx, sy, 220, 70, 25); 
        ctx.fill();
        ctx.restore();
        
        ctx.textAlign = 'left';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillStyle = s.color; 
        ctx.fillText(s.icon, sx + 20, sy + 48);
        
        ctx.fillStyle = '#444'; 
        ctx.fillText(s.value.toString(), sx + 75, sy + 48);
        
        ctx.fillStyle = '#888';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(s.label, sx + 20, sy + 65);
    });

    // --- Badges ---
    const badges = getBadges(user.id);
    let bx = 90;
    badges.slice(0, 4).forEach(b => {
        ctx.save();
        ctx.fillStyle = '#FFD700'; 
        ctx.shadowColor = '#DAA520';
        ctx.shadowBlur = 10;
        ctx.beginPath(); 
        ctx.roundRect(bx, 420, 130, 30, 15); 
        ctx.fill();
        
        ctx.fillStyle = '#fff'; 
        ctx.font = 'bold 14px sans-serif'; 
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.fillText(b.replace('_', ' ').toUpperCase(), bx + 65, 440);
        ctx.restore();
        bx += 145;
    });

    return canvas.toBuffer();
}
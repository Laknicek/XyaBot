import { createCanvas } from 'canvas';
import { drawCandyBackground, drawSprinkles, drawCandyGlassCard, drawLollipop, drawWrappedCandy, drawSparkle } from './candyUtils';

export async function generateHelpImage() {
    const width = 1000;
    const height = 1600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // --- Background ---
    drawCandyBackground(ctx, width, height);
    drawSprinkles(ctx, width, height, 180);

    // Decorative Candies
    drawLollipop(ctx, 80, 100, 50);
    drawLollipop(ctx, 920, 1500, 60);
    drawWrappedCandy(ctx, 120, 1450, 70, '#FF8C00');
    drawWrappedCandy(ctx, 880, 120, 70, '#00CED1');
    drawSparkle(ctx, 500, 80, 20);

    // --- Header ---
    ctx.save();
    ctx.shadowColor = 'rgba(255, 20, 147, 0.5)';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#FF1493';
    ctx.font = 'bold 90px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Xya\'s Menu', width / 2, 120);
    ctx.restore();

    // --- Categories ---
    const categories = [
        {
            title: '🏠 General',
            color: '#8A2BE2',
            commands: [
                ['/help', 'Shows this sweet menu'],
                ['/profile', 'Check your stats card'],
                ['/leaderboard', 'See top sweet friends'],
                ['/settings', 'Your notification settings']
            ]
        },
        {
            title: '💎 Gems & Economy',
            color: '#FF1493',
            commands: [
                ['/daily', 'Claim your daily gems'],
                ['/shop', 'Visit the store'],
                ['/buy', 'Purchase treats'],
                ['/gift', 'Give a gift to Xya'],
                ['/inventory', 'See your collected items']
            ]
        },
        {
            title: '🎮 Games',
            color: '#FF8C00',
            commands: [
                ['/wordoftheday', 'Xya\'s Wordle challenge'],
                ['/rps', 'Play Rock Paper Scissors'],
                ['/coinflip', 'Flip a shiny coin']
            ]
        },
        {
            title: '📻 Radio',
            color: '#00CED1',
            commands: [
                ['/join', 'Invite Xya to your channel'],
                ['/radio', 'Play Nightcore 24/7']
            ]
        }
    ];

    let currentY = 180;
    const boxX = 60;
    const boxW = 880;

    categories.forEach((cat, index) => {
        const cmdCount = cat.commands.length;
        const boxH = 80 + (cmdCount * 55);
        
        // Slightly different tilt for visual interest
        // const rotate = index % 2 === 0 ? 0.01 : -0.01;
        
        drawCandyGlassCard(ctx, boxX, currentY, boxW, boxH, 45);

        // Header Strip
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(boxX + 20, currentY + 20, boxW - 40, 50, 20);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fill();
        ctx.restore();

        // Title with Gloss
        ctx.fillStyle = cat.color;
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(cat.title, boxX + 40, currentY + 58);

        // Sparkle near title
        drawSparkle(ctx, boxX + boxW - 60, currentY + 45, 12);

        // Commands
        cat.commands.forEach((cmd, i) => {
            const cmdY = currentY + 120 + (i * 55);
            
            // Bullet Point (Candy)
            ctx.save();
            ctx.fillStyle = cat.color;
            ctx.beginPath();
            ctx.arc(boxX + 60, cmdY - 10, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Gloss on bullet
            ctx.fillStyle = '#FFF';
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(boxX + 58, cmdY - 12, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.fillStyle = '#C71585';
            ctx.font = 'bold 28px sans-serif';
            ctx.fillText(cmd[0], boxX + 90, cmdY);
            
            ctx.fillStyle = '#555';
            ctx.font = '24px sans-serif';
            ctx.fillText(`— ${cmd[1]}`, boxX + 350, cmdY);
        });

        currentY += boxH + 40;
    });

    // Footer
    ctx.fillStyle = '#FF1493';
    ctx.font = 'italic 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText('Xya loves talking to you! Just mention her name. ♪', width / 2, height - 60);

    return canvas.toBuffer();
}
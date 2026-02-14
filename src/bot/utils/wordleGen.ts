import { createCanvas } from 'canvas';
import { drawCandyBackground, drawSprinkles, drawCandyGlassCard, drawLollipop, drawWrappedCandy, drawSparkle } from './candyUtils';

export function generateWordleBoard(word: string, guesses: string[]) {
    const width = 700;
    const height = 900;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // --- Background ---
    drawCandyBackground(ctx, width, height);
    drawSprinkles(ctx, width, height, 100);

    // Decorations
    drawLollipop(ctx, 60, 60, 45);
    drawWrappedCandy(ctx, 640, 60, 60, '#FF1493');
    drawWrappedCandy(ctx, 60, 840, 60, '#00CED1');
    drawLollipop(ctx, 640, 840, 45);

    // Title
    ctx.save();
    ctx.shadowColor = 'rgba(255, 20, 147, 0.5)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FF1493';
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Xya\'s Wordle', width / 2, 80);
    ctx.restore();

    const boxSize = 90;
    const gap = 15;
    const totalW = word.length * boxSize + (word.length - 1) * gap;
    const totalH = 6 * boxSize + (6 - 1) * gap;
    const startX = (width - totalW) / 2;
    const startY = 140;

    // Board Glass Card
    drawCandyGlassCard(ctx, startX - 40, startY - 40, totalW + 80, totalH + 80, 50);

    for (let row = 0; row < 6; row++) {
        const guess = guesses[row] || "";
        for (let col = 0; col < word.length; col++) {
            const char = guess[col] || "";
            const x = startX + col * (boxSize + gap);
            const y = startY + row * (boxSize + gap);

            // Determine color (Candy themed)
            let color = 'rgba(255, 255, 255, 0.4)'; // Empty
            let textColor = '#555';
            let strokeColor = 'rgba(255, 255, 255, 0.8)';
            
            // "Juicy" Colors
            if (char) {
                if (char === word[col]) {
                    color = '#77DD77'; // Pastel Green
                    textColor = '#fff';
                    strokeColor = '#4CAF50';
                } else if (word.includes(char)) {
                    color = '#FFD700'; // Gold/Yellow
                    textColor = '#fff';
                    strokeColor = '#DAA520';
                } else {
                    color = '#A9A9A9'; // Gray
                    textColor = '#fff';
                    strokeColor = '#808080';
                }
            }

            // Draw Glossy Box (Bubble-like)
            ctx.save();
            ctx.fillStyle = color;
            
            // Shadow for filled boxes
            if (char) {
                ctx.shadowColor = strokeColor;
                ctx.shadowBlur = 15;
            }

            ctx.beginPath();
            ctx.roundRect(x, y, boxSize, boxSize, 25);
            ctx.fill();
            
            // Inner Border
            ctx.lineWidth = 4;
            ctx.strokeStyle = strokeColor;
            ctx.stroke();

            // Box Gloss
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.ellipse(x + boxSize/2, y + 20, boxSize/3, 10, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.restore();

            // Draw Text
            if (char) {
                ctx.fillStyle = textColor;
                ctx.font = 'bold 50px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Text Shadow
                ctx.shadowColor = 'rgba(0,0,0,0.3)';
                ctx.shadowBlur = 4;
                
                ctx.fillText(char.toUpperCase(), x + boxSize / 2, y + boxSize / 2 + 4);
                ctx.shadowBlur = 0;
            }
        }
    }

    // Sparkles on board
    drawSparkle(ctx, startX - 20, startY - 20, 15);
    drawSparkle(ctx, startX + totalW + 20, startY + totalH + 20, 15);

    return canvas.toBuffer();
}
import { CanvasGradient, CanvasRenderingContext2D } from 'canvas';

export function drawCandyBackground(ctx: any, width: number, height: number) {
    // Richer gradient background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#FFDEE9'); // Pastel Pink
    grad.addColorStop(0.5, '#B5FFFC'); // Pastel Blue
    grad.addColorStop(1, '#E0C3FC'); // Pastel Purple
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Floating Orbs / Bokeh
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = 50 + Math.random() * 150;
        
        const orbGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        orbGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        orbGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
}

export function drawSprinkles(ctx: any, width: number, height: number, count: number = 100) {
    const colors = ['#FF69B4', '#00FFFF', '#FFD700', '#FF4500', '#7FFF00', '#FF00FF', '#FFFFFF'];
    
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 2;

    for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const w = 6 + Math.random() * 10;
        const h = 4 + Math.random() * 6;
        const angle = Math.random() * Math.PI * 2;
        const type = Math.random();

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        
        ctx.beginPath();
        if (type > 0.7) {
            // Circle sprinkle
            ctx.arc(0, 0, w/2, 0, Math.PI*2);
        } else {
            // Pill sprinkle
            ctx.roundRect(-w/2, -h/2, w, h, 3);
        }
        ctx.fill();
        ctx.restore();
    }
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
}

export function drawLollipop(ctx: any, x: number, y: number, size: number) {
    ctx.save();
    
    // Stick
    ctx.fillStyle = '#F5F5F5';
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 5;
    ctx.fillRect(x - size / 8, y, size / 4, size * 2);
    ctx.shadowColor = 'transparent';

    // Swirl
    const radius = size;
    const cx = x;
    const cy = y;

    ctx.save();
    ctx.translate(cx, cy);
    
    // Base
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    grad.addColorStop(0, '#FF69B4');
    grad.addColorStop(1, '#C71585');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI*2);
    ctx.fill();

    // Spiral
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = size / 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < 3 * Math.PI; i += 0.1) {
        const r = (i / (3 * Math.PI)) * (radius - 5);
        ctx.lineTo(r * Math.cos(i), r * Math.sin(i));
    }
    ctx.stroke();
    
    // Gloss
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(-radius/3, -radius/3, radius/3, radius/5, Math.PI/4, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
}

export function drawWrappedCandy(ctx: any, x: number, y: number, width: number, color: string) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * 0.5 - 0.25);

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;

    ctx.fillStyle = color;

    // Wrappers
    ctx.beginPath();
    ctx.moveTo(-width * 0.8, -width * 0.4);
    ctx.lineTo(-width * 0.3, 0);
    ctx.lineTo(-width * 0.8, width * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(width * 0.8, -width * 0.4);
    ctx.lineTo(width * 0.3, 0);
    ctx.lineTo(width * 0.8, width * 0.4);
    ctx.closePath();
    ctx.fill();

    // Body
    const bodyGrad = ctx.createRadialGradient(0, -5, 0, 0, 0, width/2);
    bodyGrad.addColorStop(0, '#FFF');
    bodyGrad.addColorStop(0.3, color);
    bodyGrad.addColorStop(1, color); // solid color edge
    ctx.fillStyle = bodyGrad;
    
    ctx.beginPath();
    ctx.ellipse(0, 0, width / 2.2, width / 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Stripes
    ctx.globalCompositeOperation = 'source-atop';
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, -20); ctx.lineTo(-10, 20);
    ctx.moveTo(10, -20); ctx.lineTo(10, 20);
    ctx.stroke();

    ctx.restore();
}

export function drawSparkle(ctx: any, x: number, y: number, size: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#FFF';
    ctx.shadowColor = '#FFF';
    ctx.shadowBlur = 10;
    
    for (let r = 0; r < 2; r++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size / 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.rotate(Math.PI / 2);
    }
    
    ctx.restore();
}

export function drawCandyGlassCard(ctx: any, x: number, y: number, w: number, h: number, radius: number) {
    ctx.save();
    
    // Glass Body
    // Gradient from top-left white to transparent
    const bodyGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    bodyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    bodyGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    bodyGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    
    ctx.fillStyle = bodyGrad;
    
    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 15;
    
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
    
    // Reset shadow for border
    ctx.shadowColor = 'transparent';

    // Border (Rim Light)
    const borderGrad = ctx.createLinearGradient(x, y, x, y + h);
    borderGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    borderGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = borderGrad;
    ctx.stroke();
    
    // Inner Glow (simulated)
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.ellipse(x + w/2, y - 50, w, 200, 0, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
}

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';

interface MoodData {
    mood: string;
    emoji: string;
    effect: string;
    value: number;
}

export const XyaMoodWidget: React.FC<{ moodData: MoodData | null }> = ({ moodData }) => {
    if (!moodData) return null;

    return (
        <GlassCard className="bento-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
            {/* Background Gradient */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at top right, rgba(255, 42, 109, 0.15), transparent 70%)',
                zIndex: 0
            }} />

            <div style={{ padding: '30px', position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                        filter: ['drop-shadow(0 0 20px rgba(255,42,109,0.4))', 'drop-shadow(0 0 40px rgba(255,42,109,0.8))', 'drop-shadow(0 0 20px rgba(255,42,109,0.4))']
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        fontSize: '6rem',
                        cursor: 'grab'
                    }}
                    whileHover={{ scale: 1.2, rotate: 180 }}
                >
                    {moodData.emoji}
                </motion.div>

                <div style={{ marginLeft: '30px' }}>
                    <div style={{
                        fontSize: '0.9rem', color: 'var(--neon-pink)', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase'
                    }}>
                        CURRENT STATE
                    </div>
                    <h3 style={{ margin: '5px 0', fontSize: '2.5rem', color: '#fff', lineHeight: 1 }}>
                        {moodData.mood}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '200px' }}>
                        "{moodData.effect}"
                    </p>
                </div>
            </div>

            {/* AI Status Footer */}
            <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '15px 25px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--glass-border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', background: 'var(--neon-blue)', borderRadius: '50%', boxShadow: '0 0 10px var(--neon-blue)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>GEMINI 2.5 FLASH LITE</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ width: '4px', height: '16px', background: 'var(--neon-purple)', opacity: 0.5 + (i * 0.2) }} />
                    ))}
                </div>
            </div>
        </GlassCard>
    );
};

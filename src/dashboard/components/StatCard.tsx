import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
    icon: string;
    label: string;
    value: string | number;
    color: string;
    delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ scale: 1.05 }}
        className="bento-card"
        style={{
            border: `1px solid ${color}44`,
            padding: '20px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
        }}
    >
        <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '100%', height: '100%',
            background: `radial-gradient(circle at top right, ${color}22, transparent 60%)`,
        }} />
        <div style={{ fontSize: '2.5rem', marginBottom: '8px', filter: `drop-shadow(0 0 10px ${color})` }}>{icon}</div>
        <div style={{
            fontSize: '2.2rem',
            fontWeight: 900,
            color: color,
            textShadow: `0 0 20px ${color}66`,
            fontFamily: "var(--font-display)",
            lineHeight: 1
        }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            marginTop: '8px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
        }}>
            {label}
        </div>
    </motion.div>
);

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
    children: React.ReactNode;
    onClick?: () => void;
    style?: React.CSSProperties;
    whileHover?: any;
    className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, onClick, style, whileHover, className }) => (
    <motion.div
        onClick={onClick}
        whileHover={whileHover}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`bento-card ${className || ''}`}
        style={{
            cursor: onClick ? 'pointer' : 'default',
            position: 'relative',
            overflow: 'hidden',
            ...style
        }}
    >
        {children}
    </motion.div>
);

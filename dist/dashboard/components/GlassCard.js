"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlassCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const framer_motion_1 = require("framer-motion");
const GlassCard = ({ children, onClick, style, whileHover, className }) => ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { onClick: onClick, whileHover: whileHover, initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.4 }, className: `bento-card ${className || ''}`, style: {
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...style
    }, children: children }));
exports.GlassCard = GlassCard;

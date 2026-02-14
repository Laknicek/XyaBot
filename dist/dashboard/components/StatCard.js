"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const framer_motion_1 = require("framer-motion");
const StatCard = ({ icon, label, value, color, delay = 0 }) => ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5, delay }, whileHover: { scale: 1.05 }, className: "bento-card", style: {
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
    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                position: 'absolute', top: 0, right: 0,
                width: '100%', height: '100%',
                background: `radial-gradient(circle at top right, ${color}22, transparent 60%)`,
            } }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '2.5rem', marginBottom: '8px', filter: `drop-shadow(0 0 10px ${color})` }, children: icon }), (0, jsx_runtime_1.jsx)("div", { style: {
                fontSize: '2.2rem',
                fontWeight: 900,
                color: color,
                textShadow: `0 0 20px ${color}66`,
                fontFamily: "var(--font-display)",
                lineHeight: 1
            }, children: typeof value === 'number' ? value.toLocaleString() : value }), (0, jsx_runtime_1.jsx)("div", { style: {
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginTop: '8px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
            }, children: label })] }));
exports.StatCard = StatCard;

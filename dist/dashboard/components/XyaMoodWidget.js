"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XyaMoodWidget = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const framer_motion_1 = require("framer-motion");
const GlassCard_1 = require("./GlassCard");
const XyaMoodWidget = ({ moodData }) => {
    if (!moodData)
        return null;
    return ((0, jsx_runtime_1.jsxs)(GlassCard_1.GlassCard, { className: "bento-card", style: { padding: '0', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at top right, rgba(255, 42, 109, 0.15), transparent 70%)',
                    zIndex: 0
                } }), (0, jsx_runtime_1.jsxs)("div", { style: { padding: '30px', position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { animate: {
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                            filter: ['drop-shadow(0 0 20px rgba(255,42,109,0.4))', 'drop-shadow(0 0 40px rgba(255,42,109,0.8))', 'drop-shadow(0 0 20px rgba(255,42,109,0.4))']
                        }, transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }, style: {
                            fontSize: '6rem',
                            cursor: 'grab'
                        }, whileHover: { scale: 1.2, rotate: 180 }, children: moodData.emoji }), (0, jsx_runtime_1.jsxs)("div", { style: { marginLeft: '30px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    fontSize: '0.9rem', color: 'var(--neon-pink)', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase'
                                }, children: "CURRENT STATE" }), (0, jsx_runtime_1.jsx)("h3", { style: { margin: '5px 0', fontSize: '2.5rem', color: '#fff', lineHeight: 1 }, children: moodData.mood }), (0, jsx_runtime_1.jsxs)("p", { style: { margin: 0, color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '200px' }, children: ["\"", moodData.effect, "\""] })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    background: 'rgba(0,0,0,0.3)',
                    padding: '15px 25px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--glass-border)'
                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: '8px', height: '8px', background: 'var(--neon-blue)', borderRadius: '50%', boxShadow: '0 0 10px var(--neon-blue)' } }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: '0.8rem', fontWeight: 700, color: '#fff' }, children: "GEMINI 2.5 FLASH LITE" })] }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', gap: '4px' }, children: [1, 2, 3].map(i => ((0, jsx_runtime_1.jsx)("div", { style: { width: '4px', height: '16px', background: 'var(--neon-purple)', opacity: 0.5 + (i * 0.2) } }, i))) })] })] }));
};
exports.XyaMoodWidget = XyaMoodWidget;

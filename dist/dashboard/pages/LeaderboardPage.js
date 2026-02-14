"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardPage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const framer_motion_1 = require("framer-motion");
const tabs = [
    { key: 'xp', label: 'XP', icon: '✨', color: '#00FFFF' },
    { key: 'currency', label: 'Gems', icon: '💎', color: '#FFD700' },
    { key: 'friendship', label: 'Friendship', icon: '💖', color: '#FF69B4' },
    { key: 'voice', label: 'Voice', icon: '🎤', color: '#8A2BE2' },
];
const getLevel = (xp) => Math.floor(Math.sqrt(xp / 100));
const getRankBadge = (rank) => {
    if (rank === 0)
        return { emoji: '🥇', bg: 'linear-gradient(135deg, #FFD700, #FFA500)', shadow: 'rgba(255,215,0,0.3)' };
    if (rank === 1)
        return { emoji: '🥈', bg: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)', shadow: 'rgba(192,192,192,0.3)' };
    if (rank === 2)
        return { emoji: '🥉', bg: 'linear-gradient(135deg, #CD7F32, #B8860B)', shadow: 'rgba(205,127,50,0.3)' };
    return { emoji: `#${rank + 1}`, bg: 'rgba(255,255,255,0.05)', shadow: 'transparent' };
};
const LeaderboardPage = () => {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [users, setUsers] = (0, react_1.useState)([]);
    const [activeTab, setActiveTab] = (0, react_1.useState)('xp');
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        fetch(`/api/leaderboard?sort=${activeTab}`)
            .then(r => r.json())
            .then(data => { setUsers(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [activeTab]);
    const getDisplayValue = (user) => {
        switch (activeTab) {
            case 'currency': return `💎 ${(user.currency || 0).toLocaleString()}`;
            case 'friendship': return `💖 ${user.friendship_points || 0}`;
            case 'voice': return `🎤 ${user.total_voice_minutes || 0}m`;
            case 'xp':
            default: return `✨ ${(user.xp || 0).toLocaleString()} XP`;
        }
    };
    const activeColor = tabs.find(t => t.key === activeTab)?.color || '#FF69B4';
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { y: -30, opacity: 0 }, animate: { y: 0, opacity: 1 }, style: { marginBottom: '30px' }, children: [(0, jsx_runtime_1.jsx)("h1", { style: {
                            fontSize: '2.5rem', fontWeight: 900, fontFamily: "'Fredoka', sans-serif",
                            background: `linear-gradient(135deg, ${activeColor}, #fff)`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0,
                        }, children: "\uD83C\uDFC6 Leaderboard" }), (0, jsx_runtime_1.jsx)("p", { style: { color: 'rgba(255,255,255,0.4)', margin: '8px 0 0' }, children: "Who shines the brightest in Xya's world?" })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                    display: 'flex', gap: '8px', marginBottom: '30px', flexWrap: 'wrap',
                }, children: tabs.map((tab) => ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.button, { onClick: () => { setLoading(true); setActiveTab(tab.key); }, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, style: {
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 20px', borderRadius: '14px',
                        border: activeTab === tab.key ? `1px solid ${tab.color}44` : '1px solid rgba(255,255,255,0.1)',
                        background: activeTab === tab.key ? `${tab.color}15` : 'rgba(30, 15, 40, 0.4)',
                        color: activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                        fontFamily: "'Nunito', sans-serif",
                        boxShadow: activeTab === tab.key ? `0 0 20px ${tab.color}15` : 'none',
                    }, children: [(0, jsx_runtime_1.jsx)("span", { children: tab.icon }), (0, jsx_runtime_1.jsx)("span", { children: tab.label })] }, tab.key))) }), loading ? ((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }, children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity, ease: 'linear' }, style: { fontSize: '2rem', display: 'inline-block' }, children: "\uD83C\uDF6D" }) })) : ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' }, children: [(0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { mode: "popLayout", children: users.map((user, i) => {
                            const rank = getRankBadge(i);
                            return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { layout: true, initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 30 }, transition: { duration: 0.3, delay: i * 0.04 }, onClick: () => navigate(`/user/${user.id}`), whileHover: { x: 8, backgroundColor: 'var(--candy-glass-highlight)' }, className: "glass-card", style: {
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    padding: '16px 20px', borderRadius: '24px', cursor: 'pointer',
                                    background: i < 3 ? 'rgba(30, 15, 40, 0.5)' : 'rgba(30, 15, 40, 0.2)',
                                    border: i < 3 ? `1px solid ${rank.shadow}` : '1px solid var(--candy-glass-border)',
                                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                            width: '44px', height: '44px', borderRadius: '14px',
                                            background: rank.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: i < 3 ? '1.4rem' : '0.9rem', fontWeight: 900,
                                            color: i < 3 ? '#fff' : 'rgba(255,255,255,0.4)',
                                            boxShadow: `0 4px 12px ${rank.shadow}`,
                                        }, children: rank.emoji }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { color: '#fff', fontWeight: 700, fontSize: '1.05rem' }, children: user.username }), (0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }, children: ["Level ", getLevel(user.xp), " \u2022 ", user.milestone || 'Stranger'] })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            color: activeColor, fontWeight: 800, fontSize: '1.1rem',
                                            textShadow: `0 0 15px ${activeColor}33`,
                                        }, children: getDisplayValue(user) })] }, user.id));
                        }) }), users.length === 0 && ((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }, children: "No users yet \u2014 invite some friends! \uD83C\uDF89" }))] }))] }));
};
exports.LeaderboardPage = LeaderboardPage;

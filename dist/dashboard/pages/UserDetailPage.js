"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDetailPage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const framer_motion_1 = require("framer-motion");
const GlassCard_1 = require("../components/GlassCard");
const StatCard_1 = require("../components/StatCard");
const getLevel = (xp) => Math.floor(Math.sqrt(xp / 100));
const xpForLevel = (level) => level * level * 100;
const formatTime = (ts) => {
    if (!ts)
        return 'N/A';
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
const ProgressBar = ({ value, max, color, label, icon }) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    return ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '14px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }, children: [(0, jsx_runtime_1.jsxs)("span", { children: [icon, " ", label] }), (0, jsx_runtime_1.jsxs)("span", { children: [value.toLocaleString(), " / ", max.toLocaleString()] })] }), (0, jsx_runtime_1.jsx)("div", { style: { height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }, children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { width: 0 }, animate: { width: `${pct}%` }, transition: { duration: 1, ease: 'easeOut' }, style: { height: '100%', background: color, borderRadius: '4px' } }) })] }));
};
const MilestoneProgress = ({ friendshipPoints, milestone }) => {
    const milestones = [
        { threshold: 0, title: '❓ Stranger', color: '#777' },
        { threshold: 50, title: '👋 Acquaintance', color: '#00FFFF' },
        { threshold: 150, title: '😊 Friend', color: '#4CAF50' },
        { threshold: 300, title: '💛 Close Friend', color: '#FFD700' },
        { threshold: 500, title: '💗 Best Friend', color: '#FF69B4' },
        { threshold: 750, title: '💜 Soul Mate', color: '#8A2BE2' },
        { threshold: 1000, title: '🌟 Legendary', color: '#FF4500' },
    ];
    const currentIdx = milestones.findIndex(m => m.title === milestone) || 0;
    const nextMilestone = milestones[Math.min(currentIdx + 1, milestones.length - 1)];
    const prevThreshold = milestones[currentIdx]?.threshold || 0;
    const nextThreshold = nextMilestone?.threshold || 1000;
    const progress = nextThreshold > prevThreshold ? ((friendshipPoints - prevThreshold) / (nextThreshold - prevThreshold)) * 100 : 100;
    return ((0, jsx_runtime_1.jsxs)(GlassCard_1.GlassCard, { style: { marginBottom: '24px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: '0 0 16px', color: '#fff', fontFamily: "'Fredoka', sans-serif" }, children: "\uD83D\uDC95 Relationship Milestones" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: milestones[currentIdx]?.color || '#fff', fontWeight: 800, fontSize: '1.2rem' }, children: milestone || '❓ Stranger' }), currentIdx < milestones.length - 1 && ((0, jsx_runtime_1.jsxs)("span", { style: { color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }, children: ["\u2192 ", nextMilestone.title] }))] }), (0, jsx_runtime_1.jsx)("div", { style: { height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }, children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { width: 0 }, animate: { width: `${Math.min(100, progress)}%` }, transition: { duration: 1.5, ease: 'easeOut' }, style: {
                        height: '100%',
                        background: `linear-gradient(90deg, ${milestones[currentIdx]?.color || '#FF69B4'}, ${nextMilestone?.color || '#8A2BE2'})`,
                        borderRadius: '5px'
                    } }) }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', justifyContent: 'space-between', marginTop: '16px', flexWrap: 'wrap', gap: '4px' }, children: milestones.map((m, i) => ((0, jsx_runtime_1.jsx)("div", { title: `${m.title} (${m.threshold} pts)`, style: {
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: friendshipPoints >= m.threshold ? m.color : 'rgba(255,255,255,0.1)',
                        border: `2px solid ${friendshipPoints >= m.threshold ? m.color : 'rgba(255,255,255,0.15)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', cursor: 'default',
                        boxShadow: friendshipPoints >= m.threshold ? `0 0 10px ${m.color}44` : 'none',
                    }, children: i + 1 }, i))) })] }));
};
const UserDetailPage = () => {
    const { id } = (0, react_router_dom_1.useParams)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [user, setUser] = (0, react_1.useState)(null);
    const [interactions, setInteractions] = (0, react_1.useState)([]);
    const [memories, setMemories] = (0, react_1.useState)([]);
    const [economy, setEconomy] = (0, react_1.useState)([]);
    const [voiceSessions, setVoiceSessions] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        if (!id)
            return;
        Promise.all([
            fetch(`/api/user/${id}`).then(r => r.json()),
            fetch(`/api/interactions/${id}`).then(r => r.json()),
            fetch(`/api/memories/${id}`).then(r => r.json()),
            fetch(`/api/economy/${id}`).then(r => r.json()),
            fetch(`/api/voice/${id}`).then(r => r.json()),
        ]).then(([userData, interactionsData, memoriesData, economyData, voiceData]) => {
            setUser(userData);
            setInteractions(interactionsData || []);
            setMemories(memoriesData || []);
            setEconomy(economyData || []);
            setVoiceSessions(voiceData || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [id]);
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }, children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity, ease: 'linear' }, style: { fontSize: '3rem' }, children: "\uD83C\uDF6D" }) }));
    }
    if (!user) {
        return ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.4)' }, children: [(0, jsx_runtime_1.jsx)("p", { style: { fontSize: '2rem' }, children: "\uD83D\uDE14" }), (0, jsx_runtime_1.jsx)("p", { children: "User not found" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => navigate('/'), style: {
                        marginTop: '20px', padding: '10px 24px', borderRadius: '12px', border: '1px solid rgba(255,105,180,0.3)',
                        background: 'rgba(255,105,180,0.1)', color: '#FF69B4', cursor: 'pointer', fontWeight: 700,
                    }, children: "Go Home" })] }));
    }
    const level = getLevel(user.xp || 0);
    const currentLevelXp = xpForLevel(level);
    const nextLevelXp = xpForLevel(level + 1);
    const xpProgress = user.xp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.button, { onClick: () => navigate(-1), whileHover: { x: -4 }, style: {
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, marginBottom: '20px',
                    fontFamily: "'Nunito', sans-serif",
                }, children: "\u2190 Back" }), (0, jsx_runtime_1.jsxs)(GlassCard_1.GlassCard, { style: { marginBottom: '24px', padding: '32px', position: 'relative', overflow: 'hidden' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            position: 'absolute', top: '-40px', right: '-40px',
                            width: '200px', height: '200px',
                            background: 'radial-gradient(circle, rgba(255,105,180,0.1), transparent)',
                            borderRadius: '50%',
                        } }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    width: '80px', height: '80px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #FF69B4, #8A2BE2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2.5rem', boxShadow: '0 0 30px rgba(255,105,180,0.3)',
                                }, children: user.username?.charAt(0)?.toUpperCase() || '?' }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("h1", { style: {
                                            margin: 0, color: '#fff', fontSize: '2.2rem', fontWeight: 900,
                                            fontFamily: "'Fredoka', sans-serif",
                                        }, children: user.username }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsxs)("span", { style: {
                                                    background: 'rgba(255,105,180,0.15)', padding: '4px 14px', borderRadius: '10px',
                                                    color: '#FF69B4', fontWeight: 700, fontSize: '0.85rem',
                                                }, children: ["Level ", level] }), (0, jsx_runtime_1.jsx)("span", { style: {
                                                    background: 'rgba(138,43,226,0.15)', padding: '4px 14px', borderRadius: '10px',
                                                    color: '#8A2BE2', fontWeight: 700, fontSize: '0.85rem',
                                                }, children: user.milestone || '❓ Stranger' })] })] })] }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: '24px' }, children: (0, jsx_runtime_1.jsx)(ProgressBar, { value: xpProgress, max: xpNeeded || 1, color: "linear-gradient(90deg, #00FFFF, #8A2BE2)", label: `XP to Level ${level + 1}`, icon: "\u2728" }) })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }, children: [(0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\uD83D\uDC8E", label: "Gems", value: user.currency || 0, color: "#FFD700", delay: 0 }), (0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\u2728", label: "Total XP", value: user.xp || 0, color: "#00FFFF", delay: 0.05 }), (0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\uD83D\uDC96", label: "Friendship", value: user.friendship_points || 0, color: "#FF69B4", delay: 0.1 }), (0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\uD83D\uDE24", label: "Disgust", value: user.disgust_points || 0, color: "#8A2BE2", delay: 0.15 }), (0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\u26A0\uFE0F", label: "Warnings", value: user.warnings || 0, color: "#FF4500", delay: 0.2 }), (0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\uD83C\uDFA4", label: "Voice Min", value: user.total_voice_minutes || 0, color: "#9370DB", delay: 0.25 })] }), (0, jsx_runtime_1.jsx)(MilestoneProgress, { friendshipPoints: user.friendship_points || 0, milestone: user.milestone }), (0, jsx_runtime_1.jsxs)(GlassCard_1.GlassCard, { style: { marginBottom: '24px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: '0 0 16px', color: '#fff', fontFamily: "'Fredoka', sans-serif" }, children: "Relationship with Xya" }), (0, jsx_runtime_1.jsx)(ProgressBar, { value: user.friendship_points || 0, max: 1000, color: "linear-gradient(90deg, #FF9A9E, #FF69B4)", label: "Friendship", icon: "\uD83D\uDC96" }), (0, jsx_runtime_1.jsx)(ProgressBar, { value: user.disgust_points || 0, max: 1000, color: "linear-gradient(90deg, #a18cd1, #8A2BE2)", label: "Disgust", icon: "\uD83E\uDD22" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '12px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', textAlign: 'center' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { color: '#FFA500', fontWeight: 800 }, children: user.warnings_rude || 0 }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }, children: "Rude" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', textAlign: 'center' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { color: '#FF4500', fontWeight: 800 }, children: user.warnings_hateful || 0 }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }, children: "Hateful" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', textAlign: 'center' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { color: '#8B0000', fontWeight: 800 }, children: user.warnings_racist || 0 }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }, children: "Racist" })] })] })] }), (0, jsx_runtime_1.jsxs)(GlassCard_1.GlassCard, { style: { marginBottom: '24px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: '0 0 16px', color: '#fff', fontFamily: "'Fredoka', sans-serif" }, children: "\uD83E\uDDE0 What Xya Remembers" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '10px' }, children: memories.length > 0 ? memories.map((m, i) => ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { delay: i * 0.05 }, style: {
                                background: 'rgba(255,105,180,0.1)',
                                border: '1px solid rgba(255,105,180,0.2)',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                color: '#FF69B4',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                            }, children: m.fact }, m.id || i))) : ((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)', width: '100%' }, children: "No memories yet \u2014 tell Xya about yourself!" })) })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }, children: [(0, jsx_runtime_1.jsxs)(GlassCard_1.GlassCard, { children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: '0 0 16px', color: '#fff', fontFamily: "'Fredoka', sans-serif" }, children: "\uD83D\uDCB0 Economy History" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }, children: economy.length > 0 ? economy.slice(0, 15).map((tx, i) => ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.03 }, style: {
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '10px 14px', borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                    }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { color: '#fff', fontWeight: 600, fontSize: '0.9rem' }, children: tx.source || tx.type }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }, children: formatTime(tx.timestamp) })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                                color: tx.amount > 0 ? '#4CAF50' : '#FF4500',
                                                fontWeight: 800, fontSize: '0.95rem',
                                            }, children: [tx.amount > 0 ? '+' : '', tx.amount, " \uD83D\uDC8E"] })] }, tx.id || i))) : ((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)' }, children: "No transactions yet" })) })] }), (0, jsx_runtime_1.jsxs)(GlassCard_1.GlassCard, { children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: '0 0 16px', color: '#fff', fontFamily: "'Fredoka', sans-serif" }, children: "\uD83C\uDFA4 Voice Sessions" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }, children: voiceSessions.length > 0 ? voiceSessions.slice(0, 15).map((vs, i) => ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.03 }, style: {
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '10px 14px', borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                    }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { color: '#fff', fontWeight: 600, fontSize: '0.9rem' }, children: vs.duration_minutes ? `${vs.duration_minutes}m session` : 'Active' }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }, children: formatTime(vs.join_time) })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '12px' }, children: [vs.xp_gained > 0 && (0, jsx_runtime_1.jsxs)("span", { style: { color: '#00FFFF', fontWeight: 700, fontSize: '0.85rem' }, children: ["+", vs.xp_gained, "XP"] }), vs.currency_gained > 0 && (0, jsx_runtime_1.jsxs)("span", { style: { color: '#FFD700', fontWeight: 700, fontSize: '0.85rem' }, children: ["+", vs.currency_gained, "\uD83D\uDC8E"] })] })] }, vs.id || i))) : ((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)' }, children: "No voice sessions yet" })) })] })] }), (0, jsx_runtime_1.jsxs)(GlassCard_1.GlassCard, { style: { marginBottom: '24px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: '0 0 16px', color: '#fff', fontFamily: "'Fredoka', sans-serif" }, children: "\uD83D\uDCAC Recent Conversations" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }, children: interactions.length > 0 ? interactions.map((m) => ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, style: {
                                background: 'rgba(255,255,255,0.03)',
                                padding: '16px',
                                borderRadius: '14px',
                                borderLeft: `4px solid ${m.sentiment === 'Kind' ? '#4CAF50' : m.sentiment === 'Rude' ? '#FFA500' : m.sentiment === 'Hateful' ? '#FF4500' : m.sentiment === 'Racist' ? '#8B0000' : '#555'}`,
                            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }, children: formatTime(m.timestamp) }), (0, jsx_runtime_1.jsx)("span", { style: {
                                                fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: '8px',
                                                background: m.sentiment === 'Kind' ? 'rgba(76,175,80,0.15)' : m.sentiment === 'Rude' ? 'rgba(255,165,0,0.15)' : 'rgba(128,128,128,0.15)',
                                                color: m.sentiment === 'Kind' ? '#4CAF50' : m.sentiment === 'Rude' ? '#FFA500' : 'rgba(255,255,255,0.4)',
                                            }, children: m.sentiment })] }), (0, jsx_runtime_1.jsxs)("p", { style: { margin: '0 0 8px', color: '#fff', fontWeight: 600 }, children: ["\"", m.content, "\""] }), (0, jsx_runtime_1.jsx)("p", { style: {
                                        margin: 0, padding: '10px 14px', borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', fontSize: '0.9rem',
                                    }, children: m.response })] }, m.id))) : ((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }, children: "No conversations recorded yet \u2014 talk to Xya!" })) })] }), user.peakHours && Object.keys(user.peakHours).length > 0 && ((0, jsx_runtime_1.jsxs)(GlassCard_1.GlassCard, { children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: '0 0 16px', color: '#fff', fontFamily: "'Fredoka', sans-serif" }, children: "\uD83D\uDCCA Activity by Hour" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4px' }, children: Array.from({ length: 24 }, (_, h) => {
                            const count = user.peakHours[h] || 0;
                            const max = Math.max(1, ...Object.values(user.peakHours));
                            const intensity = count / max;
                            return ((0, jsx_runtime_1.jsx)("div", { title: `${h}:00 — ${count} messages`, style: {
                                    height: '32px', borderRadius: '6px',
                                    background: count > 0
                                        ? `rgba(255, 105, 180, ${0.15 + intensity * 0.6})`
                                        : 'rgba(255,255,255,0.03)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)',
                                }, children: h }, h));
                        }) })] }))] }));
};
exports.UserDetailPage = UserDetailPage;

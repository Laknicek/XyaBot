"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotStatusPage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const framer_motion_1 = require("framer-motion");
const recharts_1 = require("recharts");
const GlassCard_1 = require("../components/GlassCard");
const StatCard_1 = require("../components/StatCard");
const XyaMoodWidget_1 = require("../components/XyaMoodWidget");
const FeatureStatsRow_1 = require("../components/FeatureStatsRow");
const formatDuration = (ms) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0)
        return `${d}d ${h % 24}h ${m % 60}m`;
    if (h > 0)
        return `${h}h ${m % 60}m`;
    if (m > 0)
        return `${m}m ${s % 60}s`;
    return `${s}s`;
};
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                background: 'rgba(20, 10, 30, 0.95)',
                border: '1px solid rgba(255,105,180,0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }, children: [(0, jsx_runtime_1.jsxs)("p", { style: { margin: 0, color: '#FF69B4', fontWeight: 700, fontSize: '0.85rem' }, children: ["/", label] }), (0, jsx_runtime_1.jsxs)("p", { style: { margin: '4px 0 0', color: '#fff', fontWeight: 600 }, children: [payload[0].value, " uses"] })] }));
    }
    return null;
};
const chartColors = ['#FF69B4', '#00FFFF', '#FFD700', '#8A2BE2', '#FF4500', '#4CAF50', '#9370DB', '#FF6347', '#00CED1', '#FF1493'];
const BotStatusPage = () => {
    const [data, setData] = (0, react_1.useState)(null);
    const [commands, setCommands] = (0, react_1.useState)([]);
    const [moodData, setMoodData] = (0, react_1.useState)(null);
    const [featureStats, setFeatureStats] = (0, react_1.useState)({});
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [liveUptime, setLiveUptime] = (0, react_1.useState)(0);
    const startTimeRef = (0, react_1.useRef)(0);
    const fetchData = () => {
        Promise.all([
            fetch('/api/uptime').then(r => r.json()),
            fetch('/api/commands').then(r => r.json()),
            fetch('/api/status').then(r => r.json()),
            fetch('/api/stats').then(r => r.json()),
        ]).then(([uptimeData, commandsData, statusData, statsData]) => {
            setData(uptimeData);
            setCommands(commandsData || []);
            setMoodData(statusData.currentMood);
            setFeatureStats(statsData);
            startTimeRef.current = uptimeData?.startTime || 0;
            setLiveUptime(uptimeData?.uptime || 0);
            setLoading(false);
        }).catch(() => setLoading(false));
    };
    (0, react_1.useEffect)(() => {
        fetchData();
        // Auto-refresh every 30 seconds
        const refreshInterval = setInterval(fetchData, 30000);
        // Live uptime ticker every second
        const uptimeInterval = setInterval(() => {
            if (startTimeRef.current > 0) {
                setLiveUptime(Date.now() - startTimeRef.current);
            }
        }, 1000);
        return () => {
            clearInterval(refreshInterval);
            clearInterval(uptimeInterval);
        };
    }, []);
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }, children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity, ease: 'linear' }, style: { fontSize: '3rem' }, children: "\uD83C\uDF6D" }) }));
    }
    const errorCount = data?.commandErrors || 0;
    const avgResponseTime = data?.averageResponseTime || 0;
    const totalCommands = commands.reduce((s, c) => s + (c.count || 0), 0);
    const successRate = totalCommands > 0 ? ((totalCommands - errorCount) / totalCommands * 100).toFixed(1) : '100.0';
    const features = [
        { name: 'Gemma3 Brain', desc: 'AI Conversations', icon: '🧠', color: '#FF69B4' },
        { name: 'Voice Synthesis', desc: 'Active', icon: '🗣️', color: '#00FFFF' },
        { name: 'Memory System', desc: 'Long-term Recall', icon: '💾', color: '#FFD700' },
        { name: 'Mood Engine', desc: 'Dynamic Emotions', icon: '🎭', color: '#8A2BE2' },
        { name: 'Economy', desc: 'Gems & Shop', icon: '💎', color: '#FF4500' },
        { name: 'Leveling', desc: 'XP & Roles', icon: '✨', color: '#4CAF50' },
        { name: 'Music', desc: 'High Quality', icon: '🎵', color: '#9370DB' },
        { name: 'Moderation', desc: 'Auto-Mod', icon: '🛡️', color: '#FF6347' },
        { name: 'Polls', desc: 'Interactive', icon: '📊', color: '#00CED1' },
        { name: 'Reminders', desc: 'Smart Alerts', icon: '⏰', color: '#FF1493' },
        { name: 'Birthdays', desc: 'Celebrations', icon: '🎂', color: '#FFA500' },
        { name: 'Confessions', desc: 'Anonymous', icon: '🤫', color: '#7B68EE' },
        { name: 'Starboard', desc: 'Highlights', icon: '⭐', color: '#FFFF00' },
        { name: 'Reaction Roles', desc: 'Self-assign', icon: '🎭', color: '#00FA9A' },
        { name: 'Welcome', desc: 'Greetings', icon: '👋', color: '#1E90FF' },
    ];
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { y: -30, opacity: 0 }, animate: { y: 0, opacity: 1 }, style: { marginBottom: '30px' }, children: [(0, jsx_runtime_1.jsx)("h1", { style: {
                            fontSize: '2.5rem', fontWeight: 900, fontFamily: "'Fredoka', sans-serif",
                            background: 'linear-gradient(135deg, #00FFFF, #8A2BE2)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0,
                        }, children: "\u26A1 Bot Status" }), (0, jsx_runtime_1.jsx)("p", { style: { color: 'rgba(255,255,255,0.4)', margin: '8px 0 0' }, children: "System Health & Feature Status \u2022 Auto-refreshes every 30s" })] }), (0, jsx_runtime_1.jsxs)(GlassCard_1.GlassCard, { style: {
                    marginBottom: '24px',
                    padding: '24px',
                    background: 'linear-gradient(90deg, rgba(138,43,226,0.1), rgba(0,255,255,0.05))',
                    border: '1px solid rgba(138,43,226,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px'
                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: '20px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    width: '60px', height: '60px', borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #8A2BE2, #00FFFF)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2rem', boxShadow: '0 0 20px rgba(138,43,226,0.4)'
                                }, children: "\uD83E\uDDE0" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { color: '#fff', fontWeight: 800, fontSize: '1.4rem', fontFamily: "'Fredoka', sans-serif" }, children: "Powered by Gemma3 4B" }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }, children: "Running locally via Ollama \u2022 Multimodal (Vision) \u2022 Context: 128k tokens" })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            padding: '8px 16px', borderRadius: '10px',
                            background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)',
                            color: '#4CAF50', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px'
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: '8px', height: '8px', borderRadius: '50%', background: '#4CAF50', boxShadow: '0 0 10px #4CAF50' } }), "Systems Operational"] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }, children: [(0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\u23F1\uFE0F", label: "Uptime", value: formatDuration(liveUptime), color: "#4CAF50", delay: 0 }), (0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\uD83D\uDD27", label: "Commands Run", value: totalCommands, color: "#00FFFF", delay: 0.1 }), (0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\u2705", label: "Success Rate", value: `${successRate}%`, color: "#FFD700", delay: 0.2 }), (0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\u26A1", label: "Avg Response", value: avgResponseTime > 0 ? `${avgResponseTime.toFixed(0)}ms` : 'N/A', color: "#8A2BE2", delay: 0.3 })] }), (0, jsx_runtime_1.jsx)(FeatureStatsRow_1.FeatureStatsRow, { stats: featureStats }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }, children: [(0, jsx_runtime_1.jsx)(XyaMoodWidget_1.XyaMoodWidget, { moodData: moodData }), (0, jsx_runtime_1.jsxs)(GlassCard_1.GlassCard, { children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: '0 0 20px', color: '#fff', fontFamily: "'Fredoka', sans-serif", fontSize: '1.2rem' }, children: "\uD83D\uDCCA Command Usage" }), commands.length > 0 ? ((0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 260, children: (0, jsx_runtime_1.jsxs)(recharts_1.BarChart, { data: commands.slice(0, 10), margin: { top: 5, right: 20, left: 0, bottom: 5 }, children: [(0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "command", stroke: "rgba(255,255,255,0.2)", tick: { fill: 'rgba(255,255,255,0.4)', fontSize: 11 } }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, { stroke: "rgba(255,255,255,0.2)", tick: { fill: 'rgba(255,255,255,0.4)', fontSize: 11 } }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { content: (0, jsx_runtime_1.jsx)(CustomTooltip, {}) }), (0, jsx_runtime_1.jsx)(recharts_1.Bar, { dataKey: "count", radius: [8, 8, 0, 0], children: commands.slice(0, 10).map((_, i) => ((0, jsx_runtime_1.jsx)(recharts_1.Cell, { fill: chartColors[i % chartColors.length], fillOpacity: 0.8 }, i))) })] }) })) : ((0, jsx_runtime_1.jsx)("div", { style: { height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }, children: "No command data yet" }))] })] }), (0, jsx_runtime_1.jsxs)(GlassCard_1.GlassCard, { style: { marginBottom: '24px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: '0 0 20px', color: '#fff', fontFamily: "'Fredoka', sans-serif", fontSize: '1.2rem' }, children: "\u2728 Active Features" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }, children: features.map((f, i) => ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 }, whileHover: { scale: 1.05, background: 'rgba(255,255,255,0.08)' }, style: {
                                padding: '16px', borderRadius: '14px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                textAlign: 'center', cursor: 'default'
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '2rem', marginBottom: '8px' }, children: f.icon }), (0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: '4px' }, children: f.name }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.75rem', color: f.color, fontWeight: 600 }, children: f.desc })] }, f.name))) })] })] }));
};
exports.BotStatusPage = BotStatusPage;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomePage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const framer_motion_1 = require("framer-motion");
const recharts_1 = require("recharts");
const GlassCard_1 = require("../components/GlassCard");
const StatCard_1 = require("../components/StatCard");
const XyaMoodWidget_1 = require("../components/XyaMoodWidget");
const getLevel = (xp) => Math.floor(Math.sqrt(xp / 100));
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                background: 'rgba(20, 10, 30, 0.95)',
                border: '1px solid rgba(255,105,180,0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }, children: [(0, jsx_runtime_1.jsx)("p", { style: { margin: 0, color: '#FF69B4', fontWeight: 700, fontSize: '0.85rem' }, children: label }), (0, jsx_runtime_1.jsxs)("p", { style: { margin: '4px 0 0', color: '#fff', fontWeight: 600 }, children: [payload[0].value, " messages"] })] }));
    }
    return null;
};
const HomePage = () => {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [users, setUsers] = (0, react_1.useState)([]);
    const [moodData, setMoodData] = (0, react_1.useState)(null);
    const [activity, setActivity] = (0, react_1.useState)([]);
    const [featureStats, setFeatureStats] = (0, react_1.useState)({});
    const [loading, setLoading] = (0, react_1.useState)(true);
    const fetchData = () => {
        Promise.all([
            fetch('/api/users').then(r => r.json()),
            fetch('/api/status').then(r => r.json()),
            fetch('/api/stats').then(r => r.json()), // Global stats for feature row
        ]).then(([usersData, statusData, statsData]) => {
            setUsers(usersData);
            setMoodData(statusData.currentMood);
            setFeatureStats(statsData);
            setLoading(false);
        }).catch(() => setLoading(false));
        // Try to get activity data
        fetch('/api/commands').then(r => r.json()).then(data => {
            if (data && data.length > 0) {
                setActivity(data.slice(0, 10).map((d) => ({
                    name: d.command,
                    count: d.count
                })));
            }
        }).catch(() => { });
    };
    (0, react_1.useEffect)(() => {
        fetchData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);
    const totalXP = users.reduce((s, u) => s + (u.xp || 0), 0);
    const totalCurrency = users.reduce((s, u) => s + (u.currency || 0), 0);
    const totalVoice = users.reduce((s, u) => s + (u.total_voice_minutes || 0), 0);
    const topUsers = [...users].sort((a, b) => b.xp - a.xp).slice(0, 5);
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }, children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity, ease: 'linear' }, style: { fontSize: '3rem' }, children: "\uD83C\uDF6D" }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "fade-in", children: [(0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { y: -30, opacity: 0 }, animate: { y: 0, opacity: 1 }, style: { marginBottom: '40px', textAlign: 'center' }, children: [(0, jsx_runtime_1.jsx)("h1", { style: {
                            fontSize: '4rem',
                            marginBottom: '10px',
                            background: 'linear-gradient(135deg, #fff 0%, #ff75c3 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 10px 30px rgba(255, 117, 195, 0.3)'
                        }, children: "Welcome to Xya's World" }), (0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 500 }, children: moodData?.effect || '✨ Magic is in the air...' })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '24px',
                    marginBottom: '40px'
                }, children: [(0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\uD83D\uDC65", label: "Users", value: users.length, color: "#ff75c3", delay: 0 }), (0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\u2728", label: "Total XP", value: totalXP, color: "#00d2ff", delay: 0.1 }), (0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\uD83D\uDC8E", label: "Total Gems", value: totalCurrency, color: "#f6d365", delay: 0.2 }), (0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\uD83C\uDFA4", label: "Voice Min", value: totalVoice, color: "#9f44d3", delay: 0.3 })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '30px',
                    marginBottom: '40px'
                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', gap: '30px' }, children: [(0, jsx_runtime_1.jsx)(XyaMoodWidget_1.XyaMoodWidget, { moodData: moodData }), (0, jsx_runtime_1.jsxs)(GlassCard_1.GlassCard, { style: { padding: '24px', display: 'flex', flexDirection: 'column' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginBottom: '20px', color: 'var(--accent-pink)' }, children: "Command Usage" }), activity.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { width: '100%', height: 300, marginLeft: '-10px' }, children: (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: "100%", children: (0, jsx_runtime_1.jsxs)(recharts_1.AreaChart, { data: activity, margin: { top: 10, right: 10, left: 0, bottom: 0 }, children: [(0, jsx_runtime_1.jsx)("defs", { children: (0, jsx_runtime_1.jsxs)("linearGradient", { id: "colorCount", x1: "0", y1: "0", x2: "0", y2: "1", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "5%", stopColor: "#ff75c3", stopOpacity: 0.4 }), (0, jsx_runtime_1.jsx)("stop", { offset: "95%", stopColor: "#ff75c3", stopOpacity: 0 })] }) }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "name", stroke: "var(--text-secondary)", tick: { fill: 'var(--text-secondary)', fontSize: 12 }, tickLine: false, axisLine: { stroke: 'var(--glass-border)' } }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, { stroke: "var(--text-secondary)", tick: { fill: 'var(--text-secondary)', fontSize: 12 }, tickLine: false, axisLine: false }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { content: (0, jsx_runtime_1.jsx)(CustomTooltip, {}), cursor: { stroke: 'var(--text-secondary)', strokeWidth: 1, strokeDasharray: '3 3' } }), (0, jsx_runtime_1.jsx)(recharts_1.Area, { type: "monotone", dataKey: "count", stroke: "#ff75c3", strokeWidth: 3, fill: "url(#colorCount)" })] }) }) })) : ((0, jsx_runtime_1.jsx)("div", { style: { height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }, children: "No data yet \u2014 start using commands!" }))] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', gap: '20px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: 0, color: 'var(--text-main)', fontSize: '1.5rem' }, children: "\uD83C\uDF1F Top Stars" }), topUsers.map((user, i) => ((0, jsx_runtime_1.jsx)(GlassCard_1.GlassCard, { onClick: () => navigate(`/user/${user.id}`), whileHover: { scale: 1.03, x: 5 }, className: "glass-card", style: {
                                    padding: '15px 20px',
                                    borderLeft: `4px solid ${['#FFD700', '#C0C0C0', '#CD7F32', '#ff75c3', '#9f44d3'][i]}`,
                                    background: 'rgba(255, 255, 255, 0.03)'
                                }, children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: '1.5rem' }, children: ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 700, fontSize: '1.1rem' }, children: user.username }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.8rem', color: 'var(--text-muted)' }, children: ["Level ", getLevel(user.xp)] })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--accent-yellow)', fontWeight: 700 }, children: ["\uD83D\uDC8E ", user.currency] })] }) }, user.id)))] })] })] }));
};
exports.HomePage = HomePage;

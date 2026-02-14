"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsPage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const AnalyticsPage = () => {
    const [commands, setCommands] = (0, react_1.useState)([]);
    const [activity, setActivity] = (0, react_1.useState)([]);
    const [stats, setStats] = (0, react_1.useState)({});
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        Promise.all([
            fetch('/api/commands').then(r => r.json()),
            fetch('/api/stats').then(r => r.json()),
        ]).then(([cmds, sts]) => {
            setCommands(Array.isArray(cmds) ? cmds.slice(0, 10) : []);
            setStats(sts || {});
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);
    const maxCmdCount = Math.max(1, ...commands.map(c => c.count));
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' }, children: [(0, jsx_runtime_1.jsx)("h1", { style: { color: '#ff69b4', marginBottom: '0.5rem' }, children: "\uD83D\uDCCA Server Analytics" }), (0, jsx_runtime_1.jsx)("p", { style: { color: '#888', marginBottom: '2rem' }, children: "Stats and insights about your server" }), loading ? ((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', padding: '3rem', color: '#888' }, children: "Loading..." })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '1rem',
                            marginBottom: '2rem',
                        }, children: [
                            { label: '🧠 Memories', value: stats.totalMemories || 0, color: '#8A2BE2' },
                            { label: '🎂 Birthdays', value: stats.totalBirthdays || 0, color: '#FF69B4' },
                            { label: '⏰ Reminders', value: stats.totalReminders || 0, color: '#00FFFF' },
                            { label: '💌 Confessions', value: stats.totalConfessions || 0, color: '#FFD700' },
                            { label: '📊 Polls', value: stats.totalPolls || 0, color: '#00FF7F' },
                        ].map((stat, i) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                background: `${stat.color}10`,
                                border: `1px solid ${stat.color}30`,
                                borderRadius: '12px',
                                padding: '1.2rem',
                                textAlign: 'center',
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '1.8rem', fontWeight: 700, color: stat.color }, children: stat.value }), (0, jsx_runtime_1.jsx)("div", { style: { color: '#888', fontSize: '0.85rem', marginTop: '0.3rem' }, children: stat.label })] }, i))) }), stats.currentMood && ((0, jsx_runtime_1.jsxs)("div", { style: {
                            background: 'rgba(255,105,180,0.08)',
                            borderRadius: '12px',
                            padding: '1rem 1.5rem',
                            marginBottom: '2rem',
                            border: '1px solid rgba(255,105,180,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                        }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: '2rem' }, children: stats.currentMood.emoji }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { style: { fontWeight: 600, color: '#ff69b4' }, children: ["Xya is feeling: ", stats.currentMood.mood] }), (0, jsx_runtime_1.jsx)("div", { style: { color: '#888', fontSize: '0.85rem' }, children: stats.currentMood.effect })] })] })), (0, jsx_runtime_1.jsx)("h2", { style: { color: '#e0e0e0', marginBottom: '1rem', fontSize: '1.1rem' }, children: "\uD83C\uDFC6 Most Used Commands" }), commands.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', padding: '2rem', color: '#888' }, children: "No command data yet" })) : ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' }, children: commands.map((cmd, i) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                padding: '0.7rem 1rem',
                                border: '1px solid rgba(255,255,255,0.05)',
                            }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                                        color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#888',
                                        fontWeight: 700,
                                        width: '24px',
                                        textAlign: 'center',
                                    }, children: i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}` }), (0, jsx_runtime_1.jsxs)("span", { style: { color: '#ccc', fontWeight: 600, width: '120px' }, children: ["/", cmd.command] }), (0, jsx_runtime_1.jsx)("div", { style: { flex: 1, height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                            width: `${(cmd.count / maxCmdCount) * 100}%`,
                                            height: '100%',
                                            background: `linear-gradient(90deg, #FF69B4, #8A2BE2)`,
                                            borderRadius: '4px',
                                            transition: 'width 0.5s ease',
                                        } }) }), (0, jsx_runtime_1.jsx)("span", { style: { color: '#888', fontSize: '0.85rem', width: '50px', textAlign: 'right' }, children: cmd.count })] }, i))) }))] }))] }));
};
exports.AnalyticsPage = AnalyticsPage;

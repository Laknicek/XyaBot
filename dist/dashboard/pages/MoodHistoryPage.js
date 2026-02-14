"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoodHistoryPage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const MoodHistoryPage = () => {
    const [history, setHistory] = (0, react_1.useState)([]);
    const [currentMood, setCurrentMood] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        fetch('/api/mood-history')
            .then(r => r.json())
            .then(data => {
            setHistory(data.history || []);
            setCurrentMood(data.currentMood || null);
            setLoading(false);
        })
            .catch(() => setLoading(false));
    }, []);
    const maxTotal = Math.max(1, ...history.map(h => h.total));
    const formatDay = (day) => {
        const d = new Date(day);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' }, children: [(0, jsx_runtime_1.jsx)("h1", { style: { color: '#ff69b4', marginBottom: '0.5rem' }, children: "\uD83C\uDF19 Mood History" }), currentMood && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    background: 'rgba(255,105,180,0.1)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    border: '1px solid rgba(255,105,180,0.2)',
                    textAlign: 'center',
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '2rem', marginBottom: '0.5rem' }, children: currentMood.emoji }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '1.2rem', fontWeight: 600, color: '#ff69b4' }, children: ["Currently: ", currentMood.mood] }), (0, jsx_runtime_1.jsx)("div", { style: { color: '#888', fontSize: '0.9rem', marginTop: '0.3rem' }, children: currentMood.effect })] })), (0, jsx_runtime_1.jsx)("h2", { style: { color: '#e0e0e0', marginBottom: '1rem', fontSize: '1.1rem' }, children: "\uD83D\uDCCA Sentiment Distribution (Last 7 Days)" }), loading ? ((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', padding: '3rem', color: '#888' }, children: "Loading..." })) : history.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', padding: '3rem', color: '#888' }, children: "No data yet \u2014 talk to Xya!" })) : ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: '0.8rem' }, children: history.map((day, i) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '10px',
                        padding: '1rem 1.2rem',
                        border: '1px solid rgba(255,255,255,0.06)',
                    }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontWeight: 600, color: '#ccc' }, children: formatDay(day.day) }), (0, jsx_runtime_1.jsxs)("span", { style: { color: '#888', fontSize: '0.85rem' }, children: [day.total, " interactions"] })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                display: 'flex',
                                height: '24px',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                background: 'rgba(255,255,255,0.05)',
                            }, children: [day.kind > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                                        width: `${(day.kind / day.total) * 100}%`,
                                        background: '#00ff7f',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem', fontWeight: 700, color: '#000',
                                    }, children: day.kind })), day.neutral > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                                        width: `${(day.neutral / day.total) * 100}%`,
                                        background: '#ffd700',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem', fontWeight: 700, color: '#000',
                                    }, children: day.neutral })), day.rude > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                                        width: `${(day.rude / day.total) * 100}%`,
                                        background: '#ff4444',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                                    }, children: day.rude })), day.hateful > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                                        width: `${(day.hateful / day.total) * 100}%`,
                                        background: '#8b0000',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                                    }, children: day.hateful }))] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.75rem' }, children: [day.kind > 0 && (0, jsx_runtime_1.jsxs)("span", { style: { color: '#00ff7f' }, children: ["\uD83D\uDC9A Kind: ", day.kind] }), day.neutral > 0 && (0, jsx_runtime_1.jsxs)("span", { style: { color: '#ffd700' }, children: ["\uD83D\uDC9B Neutral: ", day.neutral] }), day.rude > 0 && (0, jsx_runtime_1.jsxs)("span", { style: { color: '#ff4444' }, children: ["\uD83D\uDD34 Rude: ", day.rude] }), day.hateful > 0 && (0, jsx_runtime_1.jsxs)("span", { style: { color: '#8b0000' }, children: ["\u26AB Hateful: ", day.hateful] })] })] }, i))) }))] }));
};
exports.MoodHistoryPage = MoodHistoryPage;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationsPage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const SENTIMENT_COLORS = {
    Kind: '#00ff7f',
    Neutral: '#ffd700',
    Rude: '#ff4444',
    Hateful: '#8b0000',
    Racist: '#4a0000',
};
const SENTIMENT_EMOJI = {
    Kind: '💚',
    Neutral: '💛',
    Rude: '🔴',
    Hateful: '⚫',
    Racist: '⚫',
};
const ConversationsPage = () => {
    const [conversations, setConversations] = (0, react_1.useState)([]);
    const [total, setTotal] = (0, react_1.useState)(0);
    const [page, setPage] = (0, react_1.useState)(0);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const pageSize = 20;
    (0, react_1.useEffect)(() => {
        setLoading(true);
        fetch(`/api/conversations?limit=${pageSize}&offset=${page * pageSize}`)
            .then(r => r.json())
            .then(data => {
            setConversations(data.conversations || []);
            setTotal(data.total || 0);
            setLoading(false);
        })
            .catch(() => setLoading(false));
    }, [page]);
    const formatTime = (ts) => {
        const d = new Date(ts);
        return d.toLocaleString();
    };
    const totalPages = Math.ceil(total / pageSize);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' }, children: [(0, jsx_runtime_1.jsx)("h1", { style: { color: '#ff69b4', marginBottom: '0.5rem' }, children: "\uD83D\uDCAC Conversation Logs" }), (0, jsx_runtime_1.jsxs)("p", { style: { color: '#888', marginBottom: '2rem' }, children: [total, " total conversations \u2022 Page ", page + 1, " of ", totalPages || 1] }), loading ? ((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', padding: '3rem', color: '#888' }, children: "Loading..." })) : conversations.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', padding: '3rem', color: '#888' }, children: "No conversations yet" })) : ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: '1rem' }, children: conversations.map((c, i) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        padding: '1.2rem',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderLeft: `3px solid ${SENTIMENT_COLORS[c.sentiment] || '#888'}`,
                    }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontWeight: 600, color: '#e0e0e0' }, children: c.username }), (0, jsx_runtime_1.jsxs)("span", { style: {
                                                fontSize: '0.75rem',
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                background: `${SENTIMENT_COLORS[c.sentiment] || '#888'}20`,
                                                color: SENTIMENT_COLORS[c.sentiment] || '#888',
                                            }, children: [SENTIMENT_EMOJI[c.sentiment], " ", c.sentiment] })] }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: '0.75rem', color: '#666' }, children: formatTime(c.timestamp) })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '0.6rem' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: '#888', fontSize: '0.8rem' }, children: "User:" }), (0, jsx_runtime_1.jsx)("p", { style: { color: '#ccc', margin: '0.2rem 0', fontSize: '0.95rem' }, children: c.content || '(no text)' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { style: { color: '#ff69b4', fontSize: '0.8rem' }, children: "Xya:" }), (0, jsx_runtime_1.jsx)("p", { style: { color: '#f0e0f0', margin: '0.2rem 0', fontSize: '0.95rem' }, children: c.response })] })] }, i))) })), totalPages > 1 && ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setPage(p => Math.max(0, p - 1)), disabled: page === 0, style: {
                            padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none',
                            background: page === 0 ? '#333' : '#ff69b4', color: '#fff',
                            cursor: page === 0 ? 'default' : 'pointer', fontWeight: 600,
                        }, children: "\u2190 Prev" }), (0, jsx_runtime_1.jsxs)("span", { style: { color: '#888', alignSelf: 'center' }, children: [page + 1, " / ", totalPages] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setPage(p => Math.min(totalPages - 1, p + 1)), disabled: page >= totalPages - 1, style: {
                            padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none',
                            background: page >= totalPages - 1 ? '#333' : '#ff69b4', color: '#fff',
                            cursor: page >= totalPages - 1 ? 'default' : 'pointer', fontWeight: 600,
                        }, children: "Next \u2192" })] }))] }));
};
exports.ConversationsPage = ConversationsPage;


import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

interface Conversation {
    user_id: string;
    username: string;
    content: string;
    response: string;
    sentiment: string;
    timestamp: number;
}

const SENTIMENT_COLORS: Record<string, string> = {
    Kind: '#00ff7f',
    Neutral: '#ffd700',
    Rude: '#ff4444',
    Hateful: '#8b0000',
    Racist: '#4a0000',
};

const SENTIMENT_EMOJI: Record<string, string> = {
    Kind: '💚',
    Neutral: '💛',
    Rude: '🔴',
    Hateful: '⚫',
    Racist: '⚫',
};

export const ConversationsPage: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const pageSize = 20;

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE}/api/conversations?limit=${pageSize}&offset=${page * pageSize}`)
            .then(r => r.json())
            .then(data => {
                setConversations(data.conversations || []);
                setTotal(data.total || 0);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [page]);

    const formatTime = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleString();
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ color: '#ff69b4', marginBottom: '0.5rem' }}>💬 Conversation Logs</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>
                {total} total conversations • Page {page + 1} of {totalPages || 1}
            </p>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>Loading...</div>
            ) : conversations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>No conversations yet</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {conversations.map((c, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                            padding: '1.2rem',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderLeft: `3px solid ${SENTIMENT_COLORS[c.sentiment] || '#888'}`,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontWeight: 600, color: '#e0e0e0' }}>{c.username}</span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        background: `${SENTIMENT_COLORS[c.sentiment] || '#888'}20`,
                                        color: SENTIMENT_COLORS[c.sentiment] || '#888',
                                    }}>
                                        {SENTIMENT_EMOJI[c.sentiment]} {c.sentiment}
                                    </span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#666' }}>{formatTime(c.timestamp)}</span>
                            </div>

                            <div style={{ marginBottom: '0.6rem' }}>
                                <span style={{ color: '#888', fontSize: '0.8rem' }}>User:</span>
                                <p style={{ color: '#ccc', margin: '0.2rem 0', fontSize: '0.95rem' }}>
                                    {c.content || '(no text)'}
                                </p>
                            </div>

                            <div>
                                <span style={{ color: '#ff69b4', fontSize: '0.8rem' }}>Xya:</span>
                                <p style={{ color: '#f0e0f0', margin: '0.2rem 0', fontSize: '0.95rem' }}>
                                    {c.response}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        style={{
                            padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none',
                            background: page === 0 ? '#333' : '#ff69b4', color: '#fff',
                            cursor: page === 0 ? 'default' : 'pointer', fontWeight: 600,
                        }}
                    >← Prev</button>
                    <span style={{ color: '#888', alignSelf: 'center' }}>{page + 1} / {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        style={{
                            padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none',
                            background: page >= totalPages - 1 ? '#333' : '#ff69b4', color: '#fff',
                            cursor: page >= totalPages - 1 ? 'default' : 'pointer', fontWeight: 600,
                        }}
                    >Next →</button>
                </div>
            )}
        </div>
    );
};

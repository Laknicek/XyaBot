import React, { useState, useEffect } from 'react';

interface MoodDay {
    day: string;
    kind: number;
    neutral: number;
    rude: number;
    hateful: number;
    total: number;
}

interface CurrentMood {
    mood: string;
    emoji: string;
    effect: string;
}

export const MoodHistoryPage: React.FC = () => {
    const [history, setHistory] = useState<MoodDay[]>([]);
    const [currentMood, setCurrentMood] = useState<CurrentMood | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

    const formatDay = (day: string) => {
        const d = new Date(day);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ color: '#ff69b4', marginBottom: '0.5rem' }}>🌙 Mood History</h1>

            {currentMood && (
                <div style={{
                    background: 'rgba(255,105,180,0.1)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    border: '1px solid rgba(255,105,180,0.2)',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{currentMood.emoji}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ff69b4' }}>Currently: {currentMood.mood}</div>
                    <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.3rem' }}>{currentMood.effect}</div>
                </div>
            )}

            <h2 style={{ color: '#e0e0e0', marginBottom: '1rem', fontSize: '1.1rem' }}>📊 Sentiment Distribution (Last 7 Days)</h2>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>Loading...</div>
            ) : history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>No data yet — talk to Xya!</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {history.map((day, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '10px',
                            padding: '1rem 1.2rem',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                <span style={{ fontWeight: 600, color: '#ccc' }}>{formatDay(day.day)}</span>
                                <span style={{ color: '#888', fontSize: '0.85rem' }}>{day.total} interactions</span>
                            </div>

                            {/* Stacked bar */}
                            <div style={{
                                display: 'flex',
                                height: '24px',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                background: 'rgba(255,255,255,0.05)',
                            }}>
                                {day.kind > 0 && (
                                    <div style={{
                                        width: `${(day.kind / day.total) * 100}%`,
                                        background: '#00ff7f',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem', fontWeight: 700, color: '#000',
                                    }}>{day.kind}</div>
                                )}
                                {day.neutral > 0 && (
                                    <div style={{
                                        width: `${(day.neutral / day.total) * 100}%`,
                                        background: '#ffd700',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem', fontWeight: 700, color: '#000',
                                    }}>{day.neutral}</div>
                                )}
                                {day.rude > 0 && (
                                    <div style={{
                                        width: `${(day.rude / day.total) * 100}%`,
                                        background: '#ff4444',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                                    }}>{day.rude}</div>
                                )}
                                {day.hateful > 0 && (
                                    <div style={{
                                        width: `${(day.hateful / day.total) * 100}%`,
                                        background: '#8b0000',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                                    }}>{day.hateful}</div>
                                )}
                            </div>

                            {/* Legend */}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.75rem' }}>
                                {day.kind > 0 && <span style={{ color: '#00ff7f' }}>💚 Kind: {day.kind}</span>}
                                {day.neutral > 0 && <span style={{ color: '#ffd700' }}>💛 Neutral: {day.neutral}</span>}
                                {day.rude > 0 && <span style={{ color: '#ff4444' }}>🔴 Rude: {day.rude}</span>}
                                {day.hateful > 0 && <span style={{ color: '#8b0000' }}>⚫ Hateful: {day.hateful}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

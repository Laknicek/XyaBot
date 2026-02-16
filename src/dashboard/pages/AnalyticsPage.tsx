import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

interface CommandStat {
    command: string;
    count: number;
}

interface DailyActivity {
    day: string;
    count: number;
}

export const AnalyticsPage: React.FC = () => {
    const [commands, setCommands] = useState<CommandStat[]>([]);
    const [activity, setActivity] = useState<DailyActivity[]>([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        Promise.all([
            fetch(`${API_BASE}/api/commands`).then(r => r.json()),
            fetch(`${API_BASE}/api/stats`).then(r => r.json()),
        ]).then(([cmds, sts]) => {
            setCommands(Array.isArray(cmds) ? cmds.slice(0, 10) : []);
            setStats(sts || {});
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const maxCmdCount = Math.max(1, ...commands.map(c => c.count));

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ color: '#ff69b4', marginBottom: '0.5rem' }}>📊 Server Analytics</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Stats and insights about your server</p>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>Loading...</div>
            ) : (
                <>
                    {/* Quick Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem',
                    }}>
                        {[
                            { label: '🧠 Memories', value: stats.totalMemories || 0, color: '#8A2BE2' },
                            { label: '🎂 Birthdays', value: stats.totalBirthdays || 0, color: '#FF69B4' },
                            { label: '⏰ Reminders', value: stats.totalReminders || 0, color: '#00FFFF' },
                            { label: '💌 Confessions', value: stats.totalConfessions || 0, color: '#FFD700' },
                            { label: '📊 Polls', value: stats.totalPolls || 0, color: '#00FF7F' },
                        ].map((stat, i) => (
                            <div key={i} style={{
                                background: `${stat.color}10`,
                                border: `1px solid ${stat.color}30`,
                                borderRadius: '12px',
                                padding: '1.2rem',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                                <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.3rem' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Current Mood */}
                    {stats.currentMood && (
                        <div style={{
                            background: 'rgba(255,105,180,0.08)',
                            borderRadius: '12px',
                            padding: '1rem 1.5rem',
                            marginBottom: '2rem',
                            border: '1px solid rgba(255,105,180,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                        }}>
                            <span style={{ fontSize: '2rem' }}>{stats.currentMood.emoji}</span>
                            <div>
                                <div style={{ fontWeight: 600, color: '#ff69b4' }}>Xya is feeling: {stats.currentMood.mood}</div>
                                <div style={{ color: '#888', fontSize: '0.85rem' }}>{stats.currentMood.effect}</div>
                            </div>
                        </div>
                    )}

                    {/* Command Usage Chart */}
                    <h2 style={{ color: '#e0e0e0', marginBottom: '1rem', fontSize: '1.1rem' }}>🏆 Most Used Commands</h2>
                    {commands.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No command data yet</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' }}>
                            {commands.map((cmd, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '8px',
                                    padding: '0.7rem 1rem',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                }}>
                                    <span style={{
                                        color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#888',
                                        fontWeight: 700,
                                        width: '24px',
                                        textAlign: 'center',
                                    }}>
                                        {i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}`}
                                    </span>
                                    <span style={{ color: '#ccc', fontWeight: 600, width: '120px' }}>/{cmd.command}</span>
                                    <div style={{ flex: 1, height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${(cmd.count / maxCmdCount) * 100}%`,
                                            height: '100%',
                                            background: `linear-gradient(90deg, #FF69B4, #8A2BE2)`,
                                            borderRadius: '4px',
                                            transition: 'width 0.5s ease',
                                        }} />
                                    </div>
                                    <span style={{ color: '#888', fontSize: '0.85rem', width: '50px', textAlign: 'right' }}>{cmd.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

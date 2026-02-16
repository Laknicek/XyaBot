import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { API_BASE } from '../config';

interface User {
    id: string;
    username: string;
    xp: number;
    currency: number;
    friendship_points: number;
    disgust_points: number;
    total_voice_minutes: number;
    warnings: number;
    milestone?: string;
}

type SortKey = 'xp' | 'currency' | 'friendship' | 'voice';

const tabs: { key: SortKey; label: string; icon: string; color: string }[] = [
    { key: 'xp', label: 'XP', icon: '✨', color: '#00FFFF' },
    { key: 'currency', label: 'Gems', icon: '💎', color: '#FFD700' },
    { key: 'friendship', label: 'Friendship', icon: '💖', color: '#FF69B4' },
    { key: 'voice', label: 'Voice', icon: '🎤', color: '#8A2BE2' },
];

const getLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100));

const getRankBadge = (rank: number) => {
    if (rank === 0) return { emoji: '🥇', bg: 'linear-gradient(135deg, #FFD700, #FFA500)', shadow: 'rgba(255,215,0,0.3)' };
    if (rank === 1) return { emoji: '🥈', bg: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)', shadow: 'rgba(192,192,192,0.3)' };
    if (rank === 2) return { emoji: '🥉', bg: 'linear-gradient(135deg, #CD7F32, #B8860B)', shadow: 'rgba(205,127,50,0.3)' };
    return { emoji: `#${rank + 1}`, bg: 'rgba(255,255,255,0.05)', shadow: 'transparent' };
};

export const LeaderboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<SortKey>('xp');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/api/leaderboard?sort=${activeTab}`)
            .then(r => r.json())
            .then(data => { setUsers(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [activeTab]);

    const getDisplayValue = (user: User) => {
        switch (activeTab) {
            case 'currency': return `💎 ${(user.currency || 0).toLocaleString()}`;
            case 'friendship': return `💖 ${user.friendship_points || 0}`;
            case 'voice': return `🎤 ${user.total_voice_minutes || 0}m`;
            case 'xp':
            default: return `✨ ${(user.xp || 0).toLocaleString()} XP`;
        }
    };

    const activeColor = tabs.find(t => t.key === activeTab)?.color || '#FF69B4';

    return (
        <div>
            {/* Header */}
            <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: '30px' }}>
                <h1 style={{
                    fontSize: '2.5rem', fontWeight: 900, fontFamily: "'Fredoka', sans-serif",
                    background: `linear-gradient(135deg, ${activeColor}, #fff)`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0,
                }}>
                    🏆 Leaderboard
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', margin: '8px 0 0' }}>
                    Who shines the brightest in Xya's world?
                </p>
            </motion.div>

            {/* Tabs */}
            <div style={{
                display: 'flex', gap: '8px', marginBottom: '30px', flexWrap: 'wrap',
            }}>
                {tabs.map((tab) => (
                    <motion.button
                        key={tab.key}
                        onClick={() => { setLoading(true); setActiveTab(tab.key); }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '14px',
                            border: activeTab === tab.key ? `1px solid ${tab.color}44` : '1px solid rgba(255,255,255,0.1)',
                            background: activeTab === tab.key ? `${tab.color}15` : 'rgba(30, 15, 40, 0.4)',
                            color: activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                            fontFamily: "'Nunito', sans-serif",
                            boxShadow: activeTab === tab.key ? `0 0 20px ${tab.color}15` : 'none',
                        }}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </motion.button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ fontSize: '2rem', display: 'inline-block' }}>
                        🍭
                    </motion.div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <AnimatePresence mode="popLayout">
                        {users.map((user, i) => {
                            const rank = getRankBadge(i);
                            return (
                                <motion.div
                                    key={user.id}
                                    layout
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                    transition={{ duration: 0.3, delay: i * 0.04 }}
                                    onClick={() => navigate(`/user/${user.id}`)}
                                    whileHover={{ x: 8, backgroundColor: 'var(--candy-glass-highlight)' }}
                                    className="glass-card"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '16px',
                                        padding: '16px 20px', borderRadius: '24px', cursor: 'pointer',
                                        background: i < 3 ? 'rgba(30, 15, 40, 0.5)' : 'rgba(30, 15, 40, 0.2)',
                                        border: i < 3 ? `1px solid ${rank.shadow}` : '1px solid var(--candy-glass-border)',
                                    }}
                                >
                                    {/* Rank */}
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '14px',
                                        background: rank.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: i < 3 ? '1.4rem' : '0.9rem', fontWeight: 900,
                                        color: i < 3 ? '#fff' : 'rgba(255,255,255,0.4)',
                                        boxShadow: `0 4px 12px ${rank.shadow}`,
                                    }}>
                                        {rank.emoji}
                                    </div>

                                    {/* Name */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>{user.username}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                                            Level {getLevel(user.xp)} • {user.milestone || 'Stranger'}
                                        </div>
                                    </div>

                                    {/* Value */}
                                    <div style={{
                                        color: activeColor, fontWeight: 800, fontSize: '1.1rem',
                                        textShadow: `0 0 15px ${activeColor}33`,
                                    }}>
                                        {getDisplayValue(user)}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    {users.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            No users yet — invite some friends! 🎉
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

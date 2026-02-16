import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { StatCard } from '../components/StatCard';
import { API_BASE } from '../config';

const getLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100));
const xpForLevel = (level: number) => level * level * 100;

const formatTime = (ts: number) => {
    if (!ts) return 'N/A';
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ProgressBar: React.FC<{ value: number; max: number; color: string; label: string; icon: string }> = ({ value, max, color, label, icon }) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>
                <span>{icon} {label}</span>
                <span>{value.toLocaleString()} / {max.toLocaleString()}</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ height: '100%', background: color, borderRadius: '4px' }}
                />
            </div>
        </div>
    );
};

const MilestoneProgress: React.FC<{ friendshipPoints: number; milestone: string }> = ({ friendshipPoints, milestone }) => {
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

    return (
        <GlassCard style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#fff', fontFamily: "'Fredoka', sans-serif" }}>
                💕 Relationship Milestones
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: milestones[currentIdx]?.color || '#fff', fontWeight: 800, fontSize: '1.2rem' }}>
                    {milestone || '❓ Stranger'}
                </span>
                {currentIdx < milestones.length - 1 && (
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                        → {nextMilestone.title}
                    </span>
                )}
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, progress)}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{
                        height: '100%',
                        background: `linear-gradient(90deg, ${milestones[currentIdx]?.color || '#FF69B4'}, ${nextMilestone?.color || '#8A2BE2'})`,
                        borderRadius: '5px'
                    }}
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', flexWrap: 'wrap', gap: '4px' }}>
                {milestones.map((m, i) => (
                    <div
                        key={i}
                        title={`${m.title} (${m.threshold} pts)`}
                        style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: friendshipPoints >= m.threshold ? m.color : 'rgba(255,255,255,0.1)',
                            border: `2px solid ${friendshipPoints >= m.threshold ? m.color : 'rgba(255,255,255,0.15)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', cursor: 'default',
                            boxShadow: friendshipPoints >= m.threshold ? `0 0 10px ${m.color}44` : 'none',
                        }}
                    >
                        {i + 1}
                    </div>
                ))}
            </div>
        </GlassCard>
    );
};

export const UserDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [interactions, setInteractions] = useState<any[]>([]);
    const [memories, setMemories] = useState<any[]>([]);
    const [economy, setEconomy] = useState<any[]>([]);
    const [voiceSessions, setVoiceSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        Promise.all([
            fetch(`${API_BASE}/api/user/${id}`).then(r => r.json()),
            fetch(`${API_BASE}/api/interactions/${id}`).then(r => r.json()),
            fetch(`${API_BASE}/api/memories/${id}`).then(r => r.json()),
            fetch(`${API_BASE}/api/economy/${id}`).then(r => r.json()),
            fetch(`${API_BASE}/api/voice/${id}`).then(r => r.json()),
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
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ fontSize: '3rem' }}>🍭</motion.div>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.4)' }}>
                <p style={{ fontSize: '2rem' }}>😔</p>
                <p>User not found</p>
                <button onClick={() => navigate('/')} style={{
                    marginTop: '20px', padding: '10px 24px', borderRadius: '12px', border: '1px solid rgba(255,105,180,0.3)',
                    background: 'rgba(255,105,180,0.1)', color: '#FF69B4', cursor: 'pointer', fontWeight: 700,
                }}>
                    Go Home
                </button>
            </div>
        );
    }

    const level = getLevel(user.xp || 0);
    const currentLevelXp = xpForLevel(level);
    const nextLevelXp = xpForLevel(level + 1);
    const xpProgress = user.xp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;

    return (
        <div>
            {/* Back Button */}
            <motion.button
                onClick={() => navigate(-1)}
                whileHover={{ x: -4 }}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, marginBottom: '20px',
                    fontFamily: "'Nunito', sans-serif",
                }}
            >
                ← Back
            </motion.button>

            {/* Profile Header */}
            <GlassCard style={{ marginBottom: '24px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: '-40px', right: '-40px',
                    width: '200px', height: '200px',
                    background: 'radial-gradient(circle, rgba(255,105,180,0.1), transparent)',
                    borderRadius: '50%',
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF69B4, #8A2BE2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2.5rem', boxShadow: '0 0 30px rgba(255,105,180,0.3)',
                    }}>
                        {user.username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{
                            margin: 0, color: '#fff', fontSize: '2.2rem', fontWeight: 900,
                            fontFamily: "'Fredoka', sans-serif",
                        }}>
                            {user.username}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                                background: 'rgba(255,105,180,0.15)', padding: '4px 14px', borderRadius: '10px',
                                color: '#FF69B4', fontWeight: 700, fontSize: '0.85rem',
                            }}>
                                Level {level}
                            </span>
                            <span style={{
                                background: 'rgba(138,43,226,0.15)', padding: '4px 14px', borderRadius: '10px',
                                color: '#8A2BE2', fontWeight: 700, fontSize: '0.85rem',
                            }}>
                                {user.milestone || '❓ Stranger'}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                    <ProgressBar value={xpProgress} max={xpNeeded || 1} color="linear-gradient(90deg, #00FFFF, #8A2BE2)" label={`XP to Level ${level + 1}`} icon="✨" />
                </div>
            </GlassCard>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <StatCard icon="💎" label="Gems" value={user.currency || 0} color="#FFD700" delay={0} />
                <StatCard icon="✨" label="Total XP" value={user.xp || 0} color="#00FFFF" delay={0.05} />
                <StatCard icon="💖" label="Friendship" value={user.friendship_points || 0} color="#FF69B4" delay={0.1} />
                <StatCard icon="😤" label="Disgust" value={user.disgust_points || 0} color="#8A2BE2" delay={0.15} />
                <StatCard icon="⚠️" label="Warnings" value={user.warnings || 0} color="#FF4500" delay={0.2} />
                <StatCard icon="🎤" label="Voice Min" value={user.total_voice_minutes || 0} color="#9370DB" delay={0.25} />
            </div>

            {/* Milestone Progress */}
            <MilestoneProgress friendshipPoints={user.friendship_points || 0} milestone={user.milestone} />

            {/* Relationship Bars & Warnings */}
            <GlassCard style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px', color: '#fff', fontFamily: "'Fredoka', sans-serif" }}>
                    Relationship with Xya
                </h3>
                <ProgressBar value={user.friendship_points || 0} max={1000} color="linear-gradient(90deg, #FF9A9E, #FF69B4)" label="Friendship" icon="💖" />
                <ProgressBar value={user.disgust_points || 0} max={1000} color="linear-gradient(90deg, #a18cd1, #8A2BE2)" label="Disgust" icon="🤢" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ color: '#FFA500', fontWeight: 800 }}>{user.warnings_rude || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Rude</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ color: '#FF4500', fontWeight: 800 }}>{user.warnings_hateful || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Hateful</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ color: '#8B0000', fontWeight: 800 }}>{user.warnings_racist || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Racist</div>
                    </div>
                </div>
            </GlassCard>

            {/* Memories */}
            <GlassCard style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px', color: '#fff', fontFamily: "'Fredoka', sans-serif" }}>
                    🧠 What Xya Remembers
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {memories.length > 0 ? memories.map((m: any, i: number) => (
                        <motion.div
                            key={m.id || i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            style={{
                                background: 'rgba(255,105,180,0.1)',
                                border: '1px solid rgba(255,105,180,0.2)',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                color: '#FF69B4',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                            }}
                        >
                            {m.fact}
                        </motion.div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)', width: '100%' }}>
                            No memories yet — tell Xya about yourself!
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Economy & Voice Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Economy History */}
                <GlassCard>
                    <h3 style={{ margin: '0 0 16px', color: '#fff', fontFamily: "'Fredoka', sans-serif" }}>
                        💰 Economy History
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                        {economy.length > 0 ? economy.slice(0, 15).map((tx: any, i: number) => (
                            <motion.div
                                key={tx.id || i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '10px 14px', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                }}
                            >
                                <div>
                                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                                        {tx.source || tx.type}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                                        {formatTime(tx.timestamp)}
                                    </div>
                                </div>
                                <div style={{
                                    color: tx.amount > 0 ? '#4CAF50' : '#FF4500',
                                    fontWeight: 800, fontSize: '0.95rem',
                                }}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount} 💎
                                </div>
                            </motion.div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)' }}>
                                No transactions yet
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Voice Sessions */}
                <GlassCard>
                    <h3 style={{ margin: '0 0 16px', color: '#fff', fontFamily: "'Fredoka', sans-serif" }}>
                        🎤 Voice Sessions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                        {voiceSessions.length > 0 ? voiceSessions.slice(0, 15).map((vs: any, i: number) => (
                            <motion.div
                                key={vs.id || i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '10px 14px', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                }}
                            >
                                <div>
                                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                                        {vs.duration_minutes ? `${vs.duration_minutes}m session` : 'Active'}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                                        {formatTime(vs.join_time)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {vs.xp_gained > 0 && <span style={{ color: '#00FFFF', fontWeight: 700, fontSize: '0.85rem' }}>+{vs.xp_gained}XP</span>}
                                    {vs.currency_gained > 0 && <span style={{ color: '#FFD700', fontWeight: 700, fontSize: '0.85rem' }}>+{vs.currency_gained}💎</span>}
                                </div>
                            </motion.div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)' }}>
                                No voice sessions yet
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* Recent Conversations */}
            <GlassCard style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px', color: '#fff', fontFamily: "'Fredoka', sans-serif" }}>
                    💬 Recent Conversations
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                    {interactions.length > 0 ? interactions.map((m: any) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: '16px',
                                borderRadius: '14px',
                                borderLeft: `4px solid ${m.sentiment === 'Kind' ? '#4CAF50' : m.sentiment === 'Rude' ? '#FFA500' : m.sentiment === 'Hateful' ? '#FF4500' : m.sentiment === 'Racist' ? '#8B0000' : '#555'}`,
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                                    {formatTime(m.timestamp)}
                                </span>
                                <span style={{
                                    fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: '8px',
                                    background: m.sentiment === 'Kind' ? 'rgba(76,175,80,0.15)' : m.sentiment === 'Rude' ? 'rgba(255,165,0,0.15)' : 'rgba(128,128,128,0.15)',
                                    color: m.sentiment === 'Kind' ? '#4CAF50' : m.sentiment === 'Rude' ? '#FFA500' : 'rgba(255,255,255,0.4)',
                                }}>
                                    {m.sentiment}
                                </span>
                            </div>
                            <p style={{ margin: '0 0 8px', color: '#fff', fontWeight: 600 }}>"{m.content}"</p>
                            <p style={{
                                margin: 0, padding: '10px 14px', borderRadius: '10px',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', fontSize: '0.9rem',
                            }}>
                                {m.response}
                            </p>
                        </motion.div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>
                            No conversations recorded yet — talk to Xya!
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Peak Hours */}
            {user.peakHours && Object.keys(user.peakHours).length > 0 && (
                <GlassCard>
                    <h3 style={{ margin: '0 0 16px', color: '#fff', fontFamily: "'Fredoka', sans-serif" }}>
                        📊 Activity by Hour
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4px' }}>
                        {Array.from({ length: 24 }, (_, h) => {
                            const count = user.peakHours[h] || 0;
                            const max = Math.max(1, ...Object.values(user.peakHours as Record<string, number>));
                            const intensity = count / max;
                            return (
                                <div
                                    key={h}
                                    title={`${h}:00 — ${count} messages`}
                                    style={{
                                        height: '32px', borderRadius: '6px',
                                        background: count > 0
                                            ? `rgba(255, 105, 180, ${0.15 + intensity * 0.6})`
                                            : 'rgba(255,255,255,0.03)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)',
                                    }}
                                >
                                    {h}
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

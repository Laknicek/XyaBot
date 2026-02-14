import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard } from '../components/GlassCard';
import { StatCard } from '../components/StatCard';
import { XyaMoodWidget } from '../components/XyaMoodWidget';
import { FeatureStatsRow } from '../components/FeatureStatsRow';

interface User {
    id: string;
    username: string;
    xp: number;
    currency: number;
    total_voice_minutes: number;
    milestone?: string;
}

const getLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100));

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'rgba(20, 10, 30, 0.95)',
                border: '1px solid rgba(255,105,180,0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
                <p style={{ margin: 0, color: '#FF69B4', fontWeight: 700, fontSize: '0.85rem' }}>{label}</p>
                <p style={{ margin: '4px 0 0', color: '#fff', fontWeight: 600 }}>{payload[0].value} messages</p>
            </div>
        );
    }
    return null;
};

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [moodData, setMoodData] = useState<any>(null);
    const [activity, setActivity] = useState<any[]>([]);
    const [featureStats, setFeatureStats] = useState<any>({});
    const [loading, setLoading] = useState(true);

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
                setActivity(data.slice(0, 10).map((d: any) => ({
                    name: d.command,
                    count: d.count
                })));
            }
        }).catch(() => { });
    };

    useEffect(() => {
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
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{ fontSize: '3rem' }}
                >
                    🍭
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Hero */}
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ marginBottom: '40px', textAlign: 'center' }}
            >
                <h1 style={{
                    fontSize: '4rem',
                    marginBottom: '10px',
                    background: 'linear-gradient(135deg, #fff 0%, #ff75c3 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 10px 30px rgba(255, 117, 195, 0.3)'
                }}>
                    Welcome to Xya's World
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 500 }}>
                    {moodData?.effect || '✨ Magic is in the air...'}
                </p>
            </motion.div>

            {/* Stat Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
            }}>
                <StatCard icon="👥" label="Users" value={users.length} color="#ff75c3" delay={0} />
                <StatCard icon="✨" label="Total XP" value={totalXP} color="#00d2ff" delay={0.1} />
                <StatCard icon="💎" label="Total Gems" value={totalCurrency} color="#f6d365" delay={0.2} />
                <StatCard icon="🎤" label="Voice Min" value={totalVoice} color="#9f44d3" delay={0.3} />
            </div>

            {/* Main Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '30px',
                marginBottom: '40px'
            }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <XyaMoodWidget moodData={moodData} />

                    <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginBottom: '20px', color: 'var(--accent-pink)' }}>
                            Command Usage
                        </h3>
                        {activity.length > 0 ? (
                            <div style={{ width: '100%', height: 300, marginLeft: '-10px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={activity} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ff75c3" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#ff75c3" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="name"
                                            stroke="var(--text-secondary)"
                                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={{ stroke: 'var(--glass-border)' }}
                                        />
                                        <YAxis
                                            stroke="var(--text-secondary)"
                                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--text-secondary)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                        <Area type="monotone" dataKey="count" stroke="#ff75c3" strokeWidth={3} fill="url(#colorCount)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                No data yet — start using commands!
                            </div>
                        )}
                    </GlassCard>
                </div>

                {/* Right Column - Top Users */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem' }}>🌟 Top Stars</h3>
                    {topUsers.map((user, i) => (
                        <GlassCard
                            key={user.id}
                            onClick={() => navigate(`/user/${user.id}`)}
                            whileHover={{ scale: 1.03, x: 5 }}
                            className="glass-card"
                            style={{
                                padding: '15px 20px',
                                borderLeft: `4px solid ${['#FFD700', '#C0C0C0', '#CD7F32', '#ff75c3', '#9f44d3'][i]}`,
                                background: 'rgba(255, 255, 255, 0.03)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user.username}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Level {getLevel(user.xp)}</div>
                                    </div>
                                </div>
                                <div style={{ color: 'var(--accent-yellow)', fontWeight: 700 }}>
                                    💎 {user.currency}
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    );
};

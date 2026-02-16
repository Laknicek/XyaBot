import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GlassCard } from '../components/GlassCard';
import { StatCard } from '../components/StatCard';
import { XyaMoodWidget } from '../components/XyaMoodWidget';
import { FeatureStatsRow } from '../components/FeatureStatsRow';
import { API_BASE } from '../config';

const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
};

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
                <p style={{ margin: 0, color: '#FF69B4', fontWeight: 700, fontSize: '0.85rem' }}>/{label}</p>
                <p style={{ margin: '4px 0 0', color: '#fff', fontWeight: 600 }}>{payload[0].value} uses</p>
            </div>
        );
    }
    return null;
};

const chartColors = ['#FF69B4', '#00FFFF', '#FFD700', '#8A2BE2', '#FF4500', '#4CAF50', '#9370DB', '#FF6347', '#00CED1', '#FF1493'];

export const BotStatusPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [commands, setCommands] = useState<any[]>([]);
    const [moodData, setMoodData] = useState<any>(null);
    const [featureStats, setFeatureStats] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [liveUptime, setLiveUptime] = useState(0);
    const startTimeRef = useRef<number>(0);


    const fetchData = () => {
        Promise.all([
            fetch(`${API_BASE}/api/uptime`).then(r => r.json()),
            fetch(`${API_BASE}/api/commands`).then(r => r.json()),
            fetch(`${API_BASE}/api/status`).then(r => r.json()),
            fetch(`${API_BASE}/api/stats`).then(r => r.json()),
        ]).then(([uptimeData, commandsData, statusData, statsData]) => {
            setData(uptimeData);
            setCommands(commandsData || []);
            setMoodData(statusData.currentMood);
            setFeatureStats(statsData);
            startTimeRef.current = uptimeData?.startTime || 0;
            setLiveUptime(uptimeData?.uptime || 0);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
        // Auto-refresh every 30 seconds
        const refreshInterval = setInterval(fetchData, 30000);
        // Live uptime ticker every second
        const uptimeInterval = setInterval(() => {
            if (startTimeRef.current > 0) {
                setLiveUptime(Date.now() - startTimeRef.current);
            }
        }, 1000);
        return () => {
            clearInterval(refreshInterval);
            clearInterval(uptimeInterval);
        };
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ fontSize: '3rem' }}>🍭</motion.div>
            </div>
        );
    }

    const errorCount = data?.commandErrors || 0;
    const avgResponseTime = data?.averageResponseTime || 0;
    const totalCommands = commands.reduce((s: number, c: any) => s + (c.count || 0), 0);
    const successRate = totalCommands > 0 ? ((totalCommands - errorCount) / totalCommands * 100).toFixed(1) : '100.0';

    const features = [
        { name: 'Gemini AI', desc: 'Conversational', icon: '🧠', color: '#FF69B4' },
        { name: 'Voice Synthesis', desc: 'Active', icon: '🗣️', color: '#00FFFF' },
        { name: 'Memory System', desc: 'Long-term Recall', icon: '💾', color: '#FFD700' },
        { name: 'Mood Engine', desc: 'Dynamic Emotions', icon: '🎭', color: '#8A2BE2' },
        { name: 'Economy', desc: 'Gems & Shop', icon: '💎', color: '#FF4500' },
        { name: 'Leveling', desc: 'XP & Roles', icon: '✨', color: '#4CAF50' },
        { name: 'Music', desc: 'High Quality', icon: '🎵', color: '#9370DB' },
        { name: 'Moderation', desc: 'Auto-Mod', icon: '🛡️', color: '#FF6347' },
        { name: 'Polls', desc: 'Interactive', icon: '📊', color: '#00CED1' },
        { name: 'Reminders', desc: 'Smart Alerts', icon: '⏰', color: '#FF1493' },
        { name: 'Birthdays', desc: 'Celebrations', icon: '🎂', color: '#FFA500' },
        { name: 'Confessions', desc: 'Anonymous', icon: '🤫', color: '#7B68EE' },
        { name: 'Starboard', desc: 'Highlights', icon: '⭐', color: '#FFFF00' },
        { name: 'Reaction Roles', desc: 'Self-assign', icon: '🎭', color: '#00FA9A' },
        { name: 'Welcome', desc: 'Greetings', icon: '👋', color: '#1E90FF' },
    ];

    return (
        <div>
            {/* Header */}
            <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: '30px' }}>
                <h1 style={{
                    fontSize: '2.5rem', fontWeight: 900, fontFamily: "'Fredoka', sans-serif",
                    background: 'linear-gradient(135deg, #00FFFF, #8A2BE2)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0,
                }}>
                    ⚡ Bot Status
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', margin: '8px 0 0' }}>
                    System Health & Feature Status • Auto-refreshes every 30s
                </p>
            </motion.div>

            {/* Model Info Banner */}
            <GlassCard style={{
                marginBottom: '24px',
                padding: '24px',
                background: 'linear-gradient(90deg, rgba(138,43,226,0.1), rgba(0,255,255,0.05))',
                border: '1px solid rgba(138,43,226,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #8A2BE2, #00FFFF)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', boxShadow: '0 0 20px rgba(138,43,226,0.4)'
                    }}>
                        🧠
                    </div>
                    <div>
                        <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', fontFamily: "'Fredoka', sans-serif" }}>
                            Powered by Gemini 2.5 Flash
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                            Google AI • Multimodal (Vision) • 1M+ Context Window
                        </div>
                    </div>
                </div>
                <div style={{
                    padding: '8px 16px', borderRadius: '10px',
                    background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)',
                    color: '#4CAF50', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4CAF50', boxShadow: '0 0 10px #4CAF50' }} />
                    Systems Operational
                </div>
            </GlassCard>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <StatCard icon="⏱️" label="Uptime" value={formatDuration(liveUptime)} color="#4CAF50" delay={0} />
                <StatCard icon="🔧" label="Commands Run" value={totalCommands} color="#00FFFF" delay={0.1} />
                <StatCard icon="✅" label="Success Rate" value={`${successRate}%`} color="#FFD700" delay={0.2} />
                <StatCard icon="⚡" label="Avg Response" value={avgResponseTime > 0 ? `${avgResponseTime.toFixed(0)}ms` : 'N/A'} color="#8A2BE2" delay={0.3} />
            </div>

            {/* Feature Stats Row */}
            <FeatureStatsRow stats={featureStats} />

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <XyaMoodWidget moodData={moodData} />

                <GlassCard>
                    <h3 style={{ margin: '0 0 20px', color: '#fff', fontFamily: "'Fredoka', sans-serif", fontSize: '1.2rem' }}>
                        📊 Command Usage
                    </h3>
                    {commands.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={commands.slice(0, 10)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <XAxis dataKey="command" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                    {commands.slice(0, 10).map((_, i) => (
                                        <Cell key={i} fill={chartColors[i % chartColors.length]} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>
                            No command data yet
                        </div>
                    )}
                </GlassCard>
            </div>

            {/* Active Features Grid */}
            <GlassCard style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 20px', color: '#fff', fontFamily: "'Fredoka', sans-serif", fontSize: '1.2rem' }}>
                    ✨ Active Features
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                    {features.map((f, i) => (
                        <motion.div
                            key={f.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.08)' }}
                            style={{
                                padding: '16px', borderRadius: '14px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                textAlign: 'center', cursor: 'default'
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{f.icon}</div>
                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: '4px' }}>{f.name}</div>
                            <div style={{ fontSize: '0.75rem', color: f.color, fontWeight: 600 }}>{f.desc}</div>
                        </motion.div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};

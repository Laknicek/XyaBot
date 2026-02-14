import React from 'react';
import { motion } from 'framer-motion';
import { StatCard } from './StatCard';

interface FeatureStats {
    totalMemories?: number;
    totalBirthdays?: number;
    totalReminders?: number;
    totalConfessions?: number;
    totalPolls?: number;
}

export const FeatureStatsRow: React.FC<{ stats: FeatureStats }> = ({ stats }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            <StatCard icon="🧠" label="Memories" value={stats.totalMemories || 0} color="#FF69B4" delay={0} />
            <StatCard icon="🎂" label="Birthdays" value={stats.totalBirthdays || 0} color="#FF9800" delay={0.05} />
            <StatCard icon="⏰" label="Reminders" value={stats.totalReminders || 0} color="#00FFFF" delay={0.1} />
            <StatCard icon="🤫" label="Confessions" value={stats.totalConfessions || 0} color="#9B59B6" delay={0.15} />
            <StatCard icon="📊" label="Polls" value={stats.totalPolls || 0} color="#E67E22" delay={0.2} />
        </div>
    );
};

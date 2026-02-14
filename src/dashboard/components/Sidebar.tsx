import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
    { path: '/conversations', icon: '💬', label: 'Conversations' },
    { path: '/mood', icon: '🌙', label: 'Mood History' },
    { path: '/analytics', icon: '📊', label: 'Analytics' },
    { path: '/status', icon: '⚡', label: 'Bot Status' },
];

export const Sidebar: React.FC = () => {
    // const [collapsed, setCollapsed] = useState(true); // Removed collapse state

    return (
        <div className="dock-wrapper">
            <motion.nav
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="dock-container"
            // onHoverStart={() => setCollapsed(false)} // Removed hover logic
            // onHoverEnd={() => setCollapsed(true)}
            >
                {/* Logo */}
                <div
                    className="dock-logo"
                    style={{
                        marginRight: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{
                        fontSize: '2rem',
                        lineHeight: 1,
                        filter: 'drop-shadow(0 0 8px var(--neon-pink))'
                    }}>
                        ⚡
                    </div>
                </div>

                {/* Nav Items */}
                <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => isActive ? 'dock-item active' : 'dock-item'}
                        >
                            {({ isActive }) => (
                                <>
                                    <span className="dock-icon">{item.icon}</span>
                                    {/* Always show label */}
                                    <span className="dock-label">
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </motion.nav>
        </div>
    );
};

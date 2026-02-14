"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const framer_motion_1 = require("framer-motion");
const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
    { path: '/conversations', icon: '💬', label: 'Conversations' },
    { path: '/mood', icon: '🌙', label: 'Mood History' },
    { path: '/analytics', icon: '📊', label: 'Analytics' },
    { path: '/status', icon: '⚡', label: 'Bot Status' },
];
const Sidebar = () => {
    // const [collapsed, setCollapsed] = useState(true); // Removed collapse state
    return ((0, jsx_runtime_1.jsx)("div", { className: "dock-wrapper", children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.nav, { initial: { y: 100, opacity: 0 }, animate: { y: 0, opacity: 1 }, className: "dock-container", children: [(0, jsx_runtime_1.jsx)("div", { className: "dock-logo", style: {
                        marginRight: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                    }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                            fontSize: '2rem',
                            lineHeight: 1,
                            filter: 'drop-shadow(0 0 8px var(--neon-pink))'
                        }, children: "\u26A1" }) }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'row', gap: '8px' }, children: navItems.map((item) => ((0, jsx_runtime_1.jsx)(react_router_dom_1.NavLink, { to: item.path, className: ({ isActive }) => isActive ? 'dock-item active' : 'dock-item', children: ({ isActive }) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { className: "dock-icon", children: item.icon }), (0, jsx_runtime_1.jsx)("span", { className: "dock-label", children: item.label })] })) }, item.path))) })] }) }));
};
exports.Sidebar = Sidebar;

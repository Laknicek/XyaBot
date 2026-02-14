"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureStatsRow = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const StatCard_1 = require("./StatCard");
const FeatureStatsRow = ({ stats }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }, children: [(0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\uD83E\uDDE0", label: "Memories", value: stats.totalMemories || 0, color: "#FF69B4", delay: 0 }), (0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\uD83C\uDF82", label: "Birthdays", value: stats.totalBirthdays || 0, color: "#FF9800", delay: 0.05 }), (0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\u23F0", label: "Reminders", value: stats.totalReminders || 0, color: "#00FFFF", delay: 0.1 }), (0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\uD83E\uDD2B", label: "Confessions", value: stats.totalConfessions || 0, color: "#9B59B6", delay: 0.15 }), (0, jsx_runtime_1.jsx)(StatCard_1.StatCard, { icon: "\uD83D\uDCCA", label: "Polls", value: stats.totalPolls || 0, color: "#E67E22", delay: 0.2 })] }));
};
exports.FeatureStatsRow = FeatureStatsRow;

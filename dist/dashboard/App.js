"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const Layout_1 = require("./Layout");
const HomePage_1 = require("./pages/HomePage");
const LeaderboardPage_1 = require("./pages/LeaderboardPage");
const UserDetailPage_1 = require("./pages/UserDetailPage");
const BotStatusPage_1 = require("./pages/BotStatusPage");
const ConversationsPage_1 = require("./pages/ConversationsPage");
const MoodHistoryPage_1 = require("./pages/MoodHistoryPage");
const AnalyticsPage_1 = require("./pages/AnalyticsPage");
function App() {
    return ((0, jsx_runtime_1.jsx)(Layout_1.Layout, { children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(HomePage_1.HomePage, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/leaderboard", element: (0, jsx_runtime_1.jsx)(LeaderboardPage_1.LeaderboardPage, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/user/:id", element: (0, jsx_runtime_1.jsx)(UserDetailPage_1.UserDetailPage, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/status", element: (0, jsx_runtime_1.jsx)(BotStatusPage_1.BotStatusPage, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/conversations", element: (0, jsx_runtime_1.jsx)(ConversationsPage_1.ConversationsPage, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/mood", element: (0, jsx_runtime_1.jsx)(MoodHistoryPage_1.MoodHistoryPage, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/analytics", element: (0, jsx_runtime_1.jsx)(AnalyticsPage_1.AnalyticsPage, {}) })] }) }));
}
exports.default = App;

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { HomePage } from './pages/HomePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { BotStatusPage } from './pages/BotStatusPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { MoodHistoryPage } from './pages/MoodHistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/user/:id" element={<UserDetailPage />} />
                <Route path="/status" element={<BotStatusPage />} />
                <Route path="/conversations" element={<ConversationsPage />} />
                <Route path="/mood" element={<MoodHistoryPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
        </Layout>
    );
}

export default App;
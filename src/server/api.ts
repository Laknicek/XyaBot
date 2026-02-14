import express from 'express';
import db, { getAllUsers, getInteractions, getMood, getUserDetailed, getServerOverview, getServerActivity, getCommandStats, getEconomyHistory, getVoiceSessions, getBotUptime, getBotPerformance, getMemories, getMilestoneTitle, getTodayBirthdays, getUserReminders, getRecentConfessions, getActivePolls, getWeeklyHighlights } from '../bot/db';
import { getCurrentMood } from '../bot/ai';

const router = express.Router();

// --- Core ---
router.get('/users', (req, res) => {
    const users = getAllUsers();
    res.json(users);
});

router.get('/interactions/:userId', (req, res) => {
    const { userId } = req.params;
    const interactions = getInteractions(userId, 20);
    res.json(interactions);
});

router.get('/status', (req, res) => {
    const mood = getCurrentMood();
    const dbMood = getMood();
    res.json({ mood: dbMood, currentMood: mood });
});

// --- User Detail ---
router.get('/user/:userId', (req, res) => {
    const { userId } = req.params;
    const user = getUserDetailed(userId);
    // Add milestone info
    if (user) {
        (user as any).milestone = getMilestoneTitle(user.friendship_points || 0);
    }
    res.json(user);
});

// --- User Memories (new: from memories table) ---
router.get('/memories/:userId', (req, res) => {
    const { userId } = req.params;
    const memories = getMemories(userId, 50);
    res.json(memories);
});

// --- Leaderboard (with sort options) ---
router.get('/leaderboard', (req, res) => {
    const sortBy = (req.query.sort as string) || 'xp';
    const users = getAllUsers() as any[];

    const sorted = [...users].sort((a, b) => {
        switch (sortBy) {
            case 'currency': return (b.currency || 0) - (a.currency || 0);
            case 'friendship': return (b.friendship_points || 0) - (a.friendship_points || 0);
            case 'voice': return (b.total_voice_minutes || 0) - (a.total_voice_minutes || 0);
            case 'xp':
            default: return (b.xp || 0) - (a.xp || 0);
        }
    });

    // Add milestones to all users
    const withMilestones = sorted.slice(0, 50).map(u => ({
        ...u,
        milestone: getMilestoneTitle(u.friendship_points || 0),
    }));

    res.json(withMilestones);
});

// --- Server Overview ---
router.get('/overview/:guildId', (req, res) => {
    const { guildId } = req.params;
    const overview = getServerOverview(guildId);
    res.json(overview);
});

// --- Server Activity (messages per day) ---
router.get('/activity/:guildId', (req, res) => {
    const { guildId } = req.params;
    const days = parseInt(req.query.days as string) || 7;
    const activity = getServerActivity(guildId, days);
    res.json(activity);
});

// --- Command Usage Stats ---
router.get('/commands', (req, res) => {
    const guildId = req.query.guildId as string || null;
    const stats = getCommandStats(guildId);
    res.json(stats);
});

// --- Economy History ---
router.get('/economy/:userId', (req, res) => {
    const { userId } = req.params;
    const history = getEconomyHistory(userId, 50);
    res.json(history);
});

// --- Voice Sessions ---
router.get('/voice/:userId', (req, res) => {
    const { userId } = req.params;
    const sessions = getVoiceSessions(userId, 50);
    res.json(sessions);
});

// --- Bot Uptime & Performance ---
router.get('/uptime', (req, res) => {
    const uptime = getBotUptime();
    const performance = getBotPerformance();
    const mood = getCurrentMood();
    res.json({ ...uptime, ...performance, currentMood: mood });
});

// --- Birthdays (today) ---
router.get('/birthdays', (req, res) => {
    const now = new Date();
    const birthdays = getTodayBirthdays(now.getMonth() + 1, now.getDate());
    res.json(birthdays);
});

// --- Reminders (for a user) ---
router.get('/reminders/:userId', (req, res) => {
    const { userId } = req.params;
    const reminders = getUserReminders(userId);
    res.json(reminders);
});

// --- Confessions (recent) ---
router.get('/confessions/:guildId', (req, res) => {
    const { guildId } = req.params;
    const confessions = getRecentConfessions(guildId, 20);
    res.json(confessions);
});

// --- Polls (active) ---
router.get('/polls/:guildId', (req, res) => {
    const { guildId } = req.params;
    const polls = getActivePolls(guildId);
    res.json(polls);
});

// --- Weekly Highlights ---
router.get('/highlights/:guildId', (req, res) => {
    const { guildId } = req.params;
    const highlights = getWeeklyHighlights(guildId);
    res.json(highlights);
});

// --- Global Stats (aggregate) ---
router.get('/stats', (req, res) => {
    try {
        const totalMemories = (db.prepare('SELECT COUNT(*) as count FROM memories').get() as any)?.count || 0;
        const totalBirthdays = (db.prepare('SELECT COUNT(*) as count FROM birthdays').get() as any)?.count || 0;
        const totalReminders = (db.prepare('SELECT COUNT(*) as count FROM reminders WHERE delivered = 0').get() as any)?.count || 0;
        const totalConfessions = (db.prepare('SELECT COUNT(*) as count FROM confessions').get() as any)?.count || 0;
        const totalPolls = (db.prepare('SELECT COUNT(*) as count FROM polls').get() as any)?.count || 0;
        const mood = getCurrentMood();
        res.json({ totalMemories, totalBirthdays, totalReminders, totalConfessions, totalPolls, currentMood: mood });
    } catch {
        res.json({ totalMemories: 0, totalBirthdays: 0, totalReminders: 0, totalConfessions: 0, totalPolls: 0 });
    }
});

// --- Conversations Log (recent AI interactions) ---
router.get('/conversations', (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;
        const conversations = db.prepare(
            'SELECT user_id, username, content, response, sentiment, timestamp FROM interactions ORDER BY timestamp DESC LIMIT ? OFFSET ?'
        ).all(limit, offset);
        const total = (db.prepare('SELECT COUNT(*) as count FROM interactions').get() as any)?.count || 0;
        res.json({ conversations, total });
    } catch {
        res.json({ conversations: [], total: 0 });
    }
});

// --- Mood History ---
router.get('/mood-history', (req, res) => {
    try {
        // Get sentiment distribution over time (last 7 days, grouped by day)
        const history = db.prepare(`
            SELECT 
                DATE(timestamp / 1000, 'unixepoch') as day,
                SUM(CASE WHEN sentiment = 'Kind' THEN 1 ELSE 0 END) as kind,
                SUM(CASE WHEN sentiment = 'Neutral' THEN 1 ELSE 0 END) as neutral,
                SUM(CASE WHEN sentiment = 'Rude' THEN 1 ELSE 0 END) as rude,
                SUM(CASE WHEN sentiment = 'Hateful' THEN 1 ELSE 0 END) as hateful,
                COUNT(*) as total
            FROM interactions 
            WHERE timestamp > ?
            GROUP BY day 
            ORDER BY day ASC
        `).all(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const mood = getCurrentMood();
        res.json({ history, currentMood: mood });
    } catch {
        res.json({ history: [], currentMood: getCurrentMood() });
    }
});

export default router;

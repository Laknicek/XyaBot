"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importStar(require("../bot/db"));
const ai_1 = require("../bot/ai");
const router = express_1.default.Router();
// --- Core ---
router.get('/users', (req, res) => {
    const users = (0, db_1.getAllUsers)();
    res.json(users);
});
router.get('/interactions/:userId', (req, res) => {
    const { userId } = req.params;
    const interactions = (0, db_1.getInteractions)(userId, 20);
    res.json(interactions);
});
router.get('/status', (req, res) => {
    const mood = (0, ai_1.getCurrentMood)();
    const dbMood = (0, db_1.getMood)();
    res.json({ mood: dbMood, currentMood: mood });
});
// --- User Detail ---
router.get('/user/:userId', (req, res) => {
    const { userId } = req.params;
    const user = (0, db_1.getUserDetailed)(userId);
    // Add milestone info
    if (user) {
        user.milestone = (0, db_1.getMilestoneTitle)(user.friendship_points || 0);
    }
    res.json(user);
});
// --- User Memories (new: from memories table) ---
router.get('/memories/:userId', (req, res) => {
    const { userId } = req.params;
    const memories = (0, db_1.getMemories)(userId, 50);
    res.json(memories);
});
// --- Leaderboard (with sort options) ---
router.get('/leaderboard', (req, res) => {
    const sortBy = req.query.sort || 'xp';
    const users = (0, db_1.getAllUsers)();
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
        milestone: (0, db_1.getMilestoneTitle)(u.friendship_points || 0),
    }));
    res.json(withMilestones);
});
// --- Server Overview ---
router.get('/overview/:guildId', (req, res) => {
    const { guildId } = req.params;
    const overview = (0, db_1.getServerOverview)(guildId);
    res.json(overview);
});
// --- Server Activity (messages per day) ---
router.get('/activity/:guildId', (req, res) => {
    const { guildId } = req.params;
    const days = parseInt(req.query.days) || 7;
    const activity = (0, db_1.getServerActivity)(guildId, days);
    res.json(activity);
});
// --- Command Usage Stats ---
router.get('/commands', (req, res) => {
    const guildId = req.query.guildId || null;
    const stats = (0, db_1.getCommandStats)(guildId);
    res.json(stats);
});
// --- Economy History ---
router.get('/economy/:userId', (req, res) => {
    const { userId } = req.params;
    const history = (0, db_1.getEconomyHistory)(userId, 50);
    res.json(history);
});
// --- Voice Sessions ---
router.get('/voice/:userId', (req, res) => {
    const { userId } = req.params;
    const sessions = (0, db_1.getVoiceSessions)(userId, 50);
    res.json(sessions);
});
// --- Bot Uptime & Performance ---
router.get('/uptime', (req, res) => {
    const uptime = (0, db_1.getBotUptime)();
    const performance = (0, db_1.getBotPerformance)();
    const mood = (0, ai_1.getCurrentMood)();
    res.json({ ...uptime, ...performance, currentMood: mood });
});
// --- Birthdays (today) ---
router.get('/birthdays', (req, res) => {
    const now = new Date();
    const birthdays = (0, db_1.getTodayBirthdays)(now.getMonth() + 1, now.getDate());
    res.json(birthdays);
});
// --- Reminders (for a user) ---
router.get('/reminders/:userId', (req, res) => {
    const { userId } = req.params;
    const reminders = (0, db_1.getUserReminders)(userId);
    res.json(reminders);
});
// --- Confessions (recent) ---
router.get('/confessions/:guildId', (req, res) => {
    const { guildId } = req.params;
    const confessions = (0, db_1.getRecentConfessions)(guildId, 20);
    res.json(confessions);
});
// --- Polls (active) ---
router.get('/polls/:guildId', (req, res) => {
    const { guildId } = req.params;
    const polls = (0, db_1.getActivePolls)(guildId);
    res.json(polls);
});
// --- Weekly Highlights ---
router.get('/highlights/:guildId', (req, res) => {
    const { guildId } = req.params;
    const highlights = (0, db_1.getWeeklyHighlights)(guildId);
    res.json(highlights);
});
// --- Global Stats (aggregate) ---
router.get('/stats', (req, res) => {
    try {
        const totalMemories = db_1.default.prepare('SELECT COUNT(*) as count FROM memories').get()?.count || 0;
        const totalBirthdays = db_1.default.prepare('SELECT COUNT(*) as count FROM birthdays').get()?.count || 0;
        const totalReminders = db_1.default.prepare('SELECT COUNT(*) as count FROM reminders WHERE delivered = 0').get()?.count || 0;
        const totalConfessions = db_1.default.prepare('SELECT COUNT(*) as count FROM confessions').get()?.count || 0;
        const totalPolls = db_1.default.prepare('SELECT COUNT(*) as count FROM polls').get()?.count || 0;
        const mood = (0, ai_1.getCurrentMood)();
        res.json({ totalMemories, totalBirthdays, totalReminders, totalConfessions, totalPolls, currentMood: mood });
    }
    catch {
        res.json({ totalMemories: 0, totalBirthdays: 0, totalReminders: 0, totalConfessions: 0, totalPolls: 0 });
    }
});
// --- Conversations Log (recent AI interactions) ---
router.get('/conversations', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const conversations = db_1.default.prepare('SELECT user_id, username, content, response, sentiment, timestamp FROM interactions ORDER BY timestamp DESC LIMIT ? OFFSET ?').all(limit, offset);
        const total = db_1.default.prepare('SELECT COUNT(*) as count FROM interactions').get()?.count || 0;
        res.json({ conversations, total });
    }
    catch {
        res.json({ conversations: [], total: 0 });
    }
});
// --- Mood History ---
router.get('/mood-history', (req, res) => {
    try {
        // Get sentiment distribution over time (last 7 days, grouped by day)
        const history = db_1.default.prepare(`
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
        const mood = (0, ai_1.getCurrentMood)();
        res.json({ history, currentMood: mood });
    }
    catch {
        res.json({ history: [], currentMood: (0, ai_1.getCurrentMood)() });
    }
});
exports.default = router;

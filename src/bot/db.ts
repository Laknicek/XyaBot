import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../xyabot.sqlite');
const db = new Database(dbPath);
export { db };
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// Initialize Tables with ALL columns
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    xp INTEGER DEFAULT 0,
    currency INTEGER DEFAULT 0,
    warnings INTEGER DEFAULT 0,
    timeout_level INTEGER DEFAULT 0,
    last_punished INTEGER DEFAULT 0,
    voice_join_time INTEGER DEFAULT 0,
    last_daily INTEGER DEFAULT 0,
    last_message_time INTEGER DEFAULT 0,
    msg_count_short_term INTEGER DEFAULT 0,
    friendship_points INTEGER DEFAULT 0,
    notify_welcome INTEGER DEFAULT 1,
    notify_xp INTEGER DEFAULT 1,
    notify_voice INTEGER DEFAULT 1,
    notify_daily INTEGER DEFAULT 1,
    disgust_points INTEGER DEFAULT 0,
    last_offense_time INTEGER DEFAULT 0,
    warnings_rude INTEGER DEFAULT 0,
    warnings_hateful INTEGER DEFAULT 0,
    warnings_racist INTEGER DEFAULT 0,
    daily_streak INTEGER DEFAULT 0,
    vacation_shields INTEGER DEFAULT 3
  );

  CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    username TEXT,
    content TEXT,
    response TEXT,
    sentiment TEXT,
    timestamp INTEGER
  );

  CREATE TABLE IF NOT EXISTS wordle_games (
    user_id TEXT PRIMARY KEY,
    word TEXT,
    guesses TEXT,
    tries INTEGER DEFAULT 0,
    timestamp INTEGER
  );

  CREATE TABLE IF NOT EXISTS inventory (
    user_id TEXT,
    item_id TEXT,
    quantity INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, item_id)
  );

  CREATE TABLE IF NOT EXISTS badges (
    user_id TEXT,
    badge_id TEXT,
    PRIMARY KEY (user_id, badge_id)
  );

  CREATE TABLE IF NOT EXISTS global_stats (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    welcome_channel TEXT,
    welcome_message TEXT,
    welcome_dm TEXT,
    disable_chat INTEGER DEFAULT 0,
    disable_voice INTEGER DEFAULT 0,
    disable_commands INTEGER DEFAULT 0,
    maintenance_mode INTEGER DEFAULT 0,
    self_roles TEXT,
    ticket_category_id TEXT,
    ticket_transcript_channel_id TEXT,
    theme_id TEXT,
    theme_banner_id TEXT,
    role_menus TEXT,
    theme_ignored_categories TEXT,
    events_channel_id TEXT,
    requests_channel_id TEXT,
    shop_enabled INTEGER DEFAULT 1,
    shop_xya_enabled INTEGER DEFAULT 1,
    shop_music_enabled INTEGER DEFAULT 1,
    shop_osu_enabled INTEGER DEFAULT 1,
    wyr_channel_id TEXT
  );

  CREATE TABLE IF NOT EXISTS message_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    guild_id TEXT,
    channel_id TEXT,
    timestamp INTEGER NOT NULL,
    message_type TEXT DEFAULT 'normal'
  );

  CREATE TABLE IF NOT EXISTS command_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    command TEXT NOT NULL,
    user_id TEXT NOT NULL,
    guild_id TEXT,
    success INTEGER DEFAULT 1,
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS economy_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    source TEXT,
    timestamp INTEGER NOT NULL,
    balance_after INTEGER
  );

  CREATE TABLE IF NOT EXISTS voice_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    guild_id TEXT,
    channel_id TEXT,
    join_time INTEGER NOT NULL,
    leave_time INTEGER,
    duration_minutes INTEGER DEFAULT 0,
    xp_gained INTEGER DEFAULT 0,
    currency_gained INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS bot_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stat_type TEXT NOT NULL,
    stat_value TEXT,
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    fact TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS birthdays (
    user_id TEXT PRIMARY KEY,
    guild_id TEXT NOT NULL,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    guild_id TEXT,
    channel_id TEXT,
    message TEXT NOT NULL,
    remind_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    delivered INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS confessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS polls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT NOT NULL,
    message_id TEXT,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    created_by TEXT NOT NULL,
    ends_at INTEGER,
    timestamp INTEGER NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at INTEGER NOT NULL,
    closed_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS events_wyr (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT,
    channel_id TEXT,
    message_id TEXT,
    question TEXT,
    option_a TEXT,
    option_b TEXT,
    votes_a TEXT DEFAULT '[]',
    votes_b TEXT DEFAULT '[]',
    ends_at INTEGER,
    active INTEGER DEFAULT 1,
    timestamp INTEGER
  );

  INSERT OR IGNORE INTO global_stats (key, value) VALUES ('mood', '100');
  INSERT OR IGNORE INTO global_stats (key, value) VALUES ('bot_start_time', '0');
  INSERT OR IGNORE INTO global_stats (key, value) VALUES ('server_id', '');
  INSERT OR IGNORE INTO global_stats (key, value) VALUES ('active_wyr_id', '0');
  INSERT OR IGNORE INTO global_stats (key, value) VALUES ('active_wyr_date', '');
`);

// --- FULL ROBUST MIGRATION ---
const migrate = () => {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
    const columns = tableInfo.map(c => c.name);

    const requiredColumns = [
        { name: 'friendship_points', type: 'INTEGER DEFAULT 0' },
        { name: 'notify_welcome', type: 'INTEGER DEFAULT 1' },
        { name: 'notify_xp', type: 'INTEGER DEFAULT 1' },
        { name: 'notify_voice', type: 'INTEGER DEFAULT 1' },
        { name: 'notify_daily', type: 'INTEGER DEFAULT 1' },
        { name: 'disgust_points', type: 'INTEGER DEFAULT 0' },
        { name: 'last_offense_time', type: 'INTEGER DEFAULT 0' },
        { name: 'warnings_rude', type: 'INTEGER DEFAULT 0' },
        { name: 'warnings_hateful', type: 'INTEGER DEFAULT 0' },
        { name: 'warnings_racist', type: 'INTEGER DEFAULT 0' },
        { name: 'daily_streak', type: 'INTEGER DEFAULT 0' },
        { name: 'vacation_shields', type: 'INTEGER DEFAULT 3' },
        { name: 'total_voice_minutes', type: 'INTEGER DEFAULT 0' },
        { name: 'voice_sessions', type: 'INTEGER DEFAULT 0' },
        { name: 'messages_per_channel', type: 'TEXT' },
        { name: 'last_active_time', type: 'INTEGER DEFAULT 0' },
        { name: 'join_date', type: 'INTEGER DEFAULT 0' },
        { name: 'peak_hours', type: 'TEXT' },
        { name: 'peak_days', type: 'TEXT' }
    ];

    for (const col of requiredColumns) {
        if (!columns.includes(col.name)) {
            try {
                db.prepare(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`).run();
                console.log(`[Migration] Added column to users: ${col.name}`);
            } catch (e) {
                console.error(`[Migration] Failed to add column ${col.name} to users:`, e);
            }
        }
    }

    const guildTableInfo = db.prepare("PRAGMA table_info(guild_settings)").all() as any[];
    const guildColumns = guildTableInfo.map(c => c.name);
    const requiredGuildCols = [
        { name: 'disable_chat', type: 'INTEGER DEFAULT 0' },
        { name: 'disable_voice', type: 'INTEGER DEFAULT 0' },
        { name: 'disable_commands', type: 'INTEGER DEFAULT 0' },
        { name: 'maintenance_mode', type: 'INTEGER DEFAULT 0' },
        { name: 'self_roles', type: 'TEXT' },
        { name: 'ticket_category_id', type: 'TEXT' },
        { name: 'ticket_transcript_channel_id', type: 'TEXT' },
        { name: 'theme_id', type: 'TEXT' },
        { name: 'theme_banner_id', type: 'TEXT' },
        { name: 'role_menus', type: 'TEXT' },
        { name: 'theme_ignored_categories', type: 'TEXT' },
        { name: 'events_channel_id', type: 'TEXT' },
        { name: 'requests_channel_id', type: 'TEXT' },
        { name: 'shop_enabled', type: 'INTEGER DEFAULT 1' },
        { name: 'shop_xya_enabled', type: 'INTEGER DEFAULT 1' },
        { name: 'shop_music_enabled', type: 'INTEGER DEFAULT 1' },
        { name: 'shop_osu_enabled', type: 'INTEGER DEFAULT 1' },
        { name: 'wyr_channel_id', type: 'TEXT' }
    ];

    for (const col of requiredGuildCols) {
        if (!guildColumns.includes(col.name)) {
            try {
                db.prepare(`ALTER TABLE guild_settings ADD COLUMN ${col.name} ${col.type}`).run();
                console.log(`[Migration] Added column to guild_settings: ${col.name}`);
            } catch (e) {
                console.error(`[Migration] Failed to add column ${col.name} to guild_settings:`, e);
            }
        }
    }

    // Migrate reminders table
    const remindersInfo = db.prepare("PRAGMA table_info(reminders)").all() as any[];
    const remindersCols = remindersInfo.map(c => c.name);
    if (!remindersCols.includes('delivered')) {
        try {
            db.prepare('ALTER TABLE reminders ADD COLUMN delivered INTEGER DEFAULT 0').run();
            console.log('[Migration] Added column to reminders: delivered');
        } catch (e) {
            console.error('[Migration] Failed to add delivered column to reminders:', e);
        }
    }
};

migrate();

export const setGuildSetting = (guildId: string, data: any) => {
    const keys = Object.keys(data);
    const fields = keys.map((key) => `${key} = ?`).join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const values = Object.values(data);
    const stmt = db.prepare(`INSERT INTO guild_settings (guild_id, ${keys.join(', ')}) VALUES (?, ${placeholders}) ON CONFLICT(guild_id) DO UPDATE SET ${fields}`);
    stmt.run(guildId, ...values, ...values);
};

export const getGuildSetting = (guildId: string) => {
    return db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId) as any;
};

export const getMood = () => {
    const res = db.prepare('SELECT value FROM global_stats WHERE key = ?').get('mood') as any;
    return parseInt(res?.value || '100');
};

export const updateMood = (delta: number) => {
    const current = getMood();
    const newMood = Math.max(0, Math.min(200, current + delta));
    db.prepare('UPDATE global_stats SET value = ? WHERE key = ?').run(newMood.toString(), 'mood');
};

export const addItem = (userId: string, itemId: string, qty: number) => {
    db.prepare('INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, ?) ON CONFLICT(user_id, item_id) DO UPDATE SET quantity = quantity + ?')
        .run(userId, itemId, qty, qty);
};

export const getInventory = (userId: string) => {
    return db.prepare('SELECT * FROM inventory WHERE user_id = ?').all(userId);
};

export const removeItem = (userId: string, itemId: string, qty: number) => {
    db.prepare('UPDATE inventory SET quantity = quantity - ? WHERE user_id = ? AND item_id = ? AND quantity >= ?').run(qty, userId, itemId, qty);
};

export const addBadge = (userId: string, badgeId: string) => {
    db.prepare('INSERT OR IGNORE INTO badges (user_id, badge_id) VALUES (?, ?)').run(userId, badgeId);
};

export const getBadges = (userId: string) => {
    return db.prepare('SELECT badge_id FROM badges WHERE user_id = ?').all(userId).map((b: any) => b.badge_id);
};

export const logInteraction = (userId: string, username: string, content: string, response: string, sentiment: string) => {
    const stmt = db.prepare('INSERT INTO interactions (user_id, username, content, response, sentiment, timestamp) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(userId, username, content, response, sentiment, Date.now());
};

export const getInteractions = (userId: string, limit = 10) => {
    return db.prepare('SELECT * FROM interactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?').all(userId, limit);
};

export const getWordleGame = (userId: string) => {
    return db.prepare('SELECT * FROM wordle_games WHERE user_id = ?').get(userId) as any;
};

export const saveWordleGame = (userId: string, word: string, guesses: string[], tries: number) => {
    const stmt = db.prepare('INSERT OR REPLACE INTO wordle_games (user_id, word, guesses, tries, timestamp) VALUES (?, ?, ?, ?, ?)');
    stmt.run(userId, word, JSON.stringify(guesses), tries, Date.now());
};

export const deleteWordleGame = (userId: string) => {
    db.prepare('DELETE FROM wordle_games WHERE user_id = ?').run(userId);
};

export const getUser = (id: string, username: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id);
    if (!user) {
        const insert = db.prepare('INSERT INTO users (id, username, join_date) VALUES (?, ?, ?)');
        insert.run(id, username, Date.now());
        return {
            id, username, xp: 0, currency: 0, warnings: 0, timeout_level: 0, last_punished: 0,
            voice_join_time: 0, last_daily: 0, last_message_time: 0, msg_count_short_term: 0,
            friendship_points: 0, notify_welcome: 1, notify_xp: 1, notify_voice: 1, notify_daily: 1,
            disgust_points: 0, last_offense_time: 0, warnings_rude: 0, warnings_hateful: 0, warnings_racist: 0,
            daily_streak: 0, vacation_shields: 3, total_voice_minutes: 0, voice_sessions: 0,
            messages_per_channel: '{}', last_active_time: Date.now(), join_date: Date.now(),
            peak_hours: '{}', peak_days: '{}'
        };
    }
    return user as any;
};

export const updateUser = (id: string, data: any) => {
    const fields = Object.keys(data).map((key) => `${key} = ?`).join(', ');
    const values = Object.values(data);
    const stmt = db.prepare(`UPDATE users SET ${fields} WHERE id = ?`);
    stmt.run(...values, id);
};

export const getAllUsers = () => {

    return db.prepare('SELECT * FROM users ORDER BY xp DESC').all();

}



export const getUserRelationship = (userId: string) => {

    const user = db.prepare('SELECT friendship_points, disgust_points, warnings_rude, warnings_hateful, warnings_racist FROM users WHERE id = ?').get(userId) as any;

    if (!user) return "New user — be welcoming and friendly!";

    const friendship = user.friendship_points || 0;
    const disgust = user.disgust_points || 0;

    // Translate friendship into natural description
    let friendshipDesc = '';
    if (friendship >= 800) friendshipDesc = 'You are extremely close with this user — they are one of your favorite people.';
    else if (friendship >= 500) friendshipDesc = 'You are great friends with this user — warm, comfortable, inside jokes.';
    else if (friendship >= 200) friendshipDesc = 'You are friends with this user — casual, friendly energy.';
    else if (friendship >= 50) friendshipDesc = 'You know this user a little — be warm but still getting to know them.';
    else friendshipDesc = 'You are still getting to know this user — be polite and friendly.';

    // Translate disgust into subtle behavioral note (NOT raw numbers)
    let disgustNote = '';
    if (disgust >= 500) disgustNote = ' This user has been rude to you before, so you are a little guarded — but still polite and kind.';
    else if (disgust >= 200) disgustNote = ' This user has occasionally been unkind — you remember but give them a fair chance.';

    return friendshipDesc + disgustNote;

};

// --- Statistics Tracking Functions ---

export const logMessage = (userId: string, guildId: string | null, channelId: string, messageType: string = 'normal') => {
    const stmt = db.prepare('INSERT INTO message_stats (user_id, guild_id, channel_id, timestamp, message_type) VALUES (?, ?, ?, ?, ?)');
    stmt.run(userId, guildId, channelId, Date.now(), messageType);
};

export const logCommandUsage = (command: string, userId: string, guildId: string | null, success: boolean = true) => {
    const stmt = db.prepare('INSERT INTO command_usage (command, user_id, guild_id, success, timestamp) VALUES (?, ?, ?, ?, ?)');
    stmt.run(command, userId, guildId, success ? 1 : 0, Date.now());
};

export const logEconomyTransaction = (userId: string, type: string, amount: number, source: string, balanceAfter: number) => {
    const stmt = db.prepare('INSERT INTO economy_history (user_id, type, amount, source, timestamp, balance_after) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(userId, type, amount, source, Date.now(), balanceAfter);
};

export const startVoiceSession = (userId: string, guildId: string, channelId: string) => {
    const stmt = db.prepare('INSERT INTO voice_sessions (user_id, guild_id, channel_id, join_time) VALUES (?, ?, ?, ?)');
    const result = stmt.run(userId, guildId, channelId, Date.now());
    return result.lastInsertRowid as number;
};

export const endVoiceSession = (sessionId: number, durationMinutes: number, xpGained: number, currencyGained: number) => {
    const stmt = db.prepare('UPDATE voice_sessions SET leave_time = ?, duration_minutes = ?, xp_gained = ?, currency_gained = ? WHERE id = ?');
    stmt.run(Date.now(), durationMinutes, xpGained, currencyGained, sessionId);
};

export const getVoiceSessions = (userId: string, limit = 50) => {
    return db.prepare('SELECT * FROM voice_sessions WHERE user_id = ? ORDER BY join_time DESC LIMIT ?').all(userId, limit) as any[];
};

export const getCommandUsage = (userId: string | null = null, limit = 100) => {
    if (userId) {
        return db.prepare('SELECT * FROM command_usage WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?').all(userId, limit) as any[];
    }
    return db.prepare('SELECT * FROM command_usage ORDER BY timestamp DESC LIMIT ?').all(limit) as any[];
};

export const getCommandStats = (guildId: string | null = null) => {
    if (guildId) {
        return db.prepare(`
            SELECT command, COUNT(*) as count, SUM(success) as success_count
            FROM command_usage
            WHERE guild_id = ?
            GROUP BY command
            ORDER BY count DESC
        `).all(guildId) as any[];
    }
    return db.prepare(`
        SELECT command, COUNT(*) as count, SUM(success) as success_count
        FROM command_usage
        GROUP BY command
        ORDER BY count DESC
    `).all() as any[];
};

export const getEconomyHistory = (userId: string, limit = 50) => {
    return db.prepare('SELECT * FROM economy_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?').all(userId, limit) as any[];
};

export const getUserMessagesStats = (userId: string, days = 7) => {
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);
    return db.prepare('SELECT * FROM message_stats WHERE user_id = ? AND timestamp > ? ORDER BY timestamp DESC').all(userId, since) as any[];
};

export const getUserActivityByHour = (userId: string) => {
    const user = db.prepare('SELECT peak_hours FROM users WHERE id = ?').get(userId) as any;
    if (!user || !user.peak_hours) return {};
    try {
        return JSON.parse(user.peak_hours);
    } catch {
        return {};
    }
};

export const updateUserActivityByHour = (userId: string, hour: number) => {
    const current = getUserActivityByHour(userId);
    current[hour] = (current[hour] || 0) + 1;
    db.prepare('UPDATE users SET peak_hours = ? WHERE id = ?').run(JSON.stringify(current), userId);
};

export const getUserActivityByDay = (userId: string) => {
    const user = db.prepare('SELECT peak_days FROM users WHERE id = ?').get(userId) as any;
    if (!user || !user.peak_days) return {};
    try {
        return JSON.parse(user.peak_days);
    } catch {
        return {};
    }
};

export const updateUserActivityByDay = (userId: string, day: number) => {
    const current = getUserActivityByDay(userId);
    current[day] = (current[day] || 0) + 1;
    db.prepare('UPDATE users SET peak_days = ? WHERE id = ?').run(JSON.stringify(current), userId);
};

export const getMessagesPerChannel = (userId: string) => {
    const user = db.prepare('SELECT messages_per_channel FROM users WHERE id = ?').get(userId) as any;
    if (!user || !user.messages_per_channel) return {};
    try {
        return JSON.parse(user.messages_per_channel);
    } catch {
        return {};
    }
};

export const updateMessagesPerChannel = (userId: string, channelId: string) => {
    const current = getMessagesPerChannel(userId);
    current[channelId] = (current[channelId] || 0) + 1;
    db.prepare('UPDATE users SET messages_per_channel = ? WHERE id = ?').run(JSON.stringify(current), userId);
};

export const getUserDetailed = (userId: string) => {
    const user = getUser(userId, '');
    const voiceSessions = getVoiceSessions(userId);
    const commandUsage = getCommandUsage(userId, 20);
    const economyHistory = getEconomyHistory(userId, 20);
    const messagesStats = getUserMessagesStats(userId, 30);

    return {
        ...user,
        voiceSessions,
        commandUsage,
        economyHistory,
        messagesStats,
        peakHours: getUserActivityByHour(userId),
        peakDays: getUserActivityByDay(userId),
        messagesPerChannel: getMessagesPerChannel(userId)
    };
};

export const getServerOverview = (guildId: string) => {
    const users = db.prepare('SELECT * FROM users').all() as any[];
    const messageStats = db.prepare('SELECT COUNT(*) as count FROM message_stats WHERE guild_id = ?').get(guildId) as any;
    const commandStats = getCommandStats(guildId);
    const recentMessages = db.prepare('SELECT * FROM message_stats WHERE guild_id = ? ORDER BY timestamp DESC LIMIT 20').all(guildId) as any[];

    return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.last_active_time > Date.now() - 7 * 24 * 60 * 60 * 1000).length,
        totalMessages: messageStats?.count || 0,
        totalXP: users.reduce((sum: number, u: any) => sum + (u.xp || 0), 0),
        totalCurrency: users.reduce((sum: number, u: any) => sum + (u.currency || 0), 0),
        totalVoiceMinutes: users.reduce((sum: number, u: any) => sum + (u.total_voice_minutes || 0), 0),
        commandStats,
        recentMessages
    };
};

export const getServerActivity = (guildId: string, days = 7) => {
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);
    return db.prepare(`
        SELECT DATE(timestamp/1000, 'unixepoch', 'localtime') as date,
               COUNT(*) as message_count
        FROM message_stats
        WHERE guild_id = ? AND timestamp > ?
        GROUP BY date
        ORDER BY date ASC
    `).all(guildId, since) as any[];
};

export const getBotUptime = () => {
    const startTime = db.prepare('SELECT value FROM global_stats WHERE key = ?').get('bot_start_time') as any;
    if (!startTime || !startTime.value) return { uptime: 0, startTime: 0 };

    const start = parseInt(startTime.value);
    const uptime = Date.now() - start;
    const sessions = db.prepare('SELECT * FROM bot_stats WHERE stat_type = ? ORDER BY timestamp DESC LIMIT 100').all('uptime') as any[];

    return {
        uptime,
        startTime: start,
        sessions,
        formattedUptime: formatDuration(uptime)
    };
};

export const updateBotStartTime = () => {
    db.prepare('UPDATE global_stats SET value = ? WHERE key = ?').run(Date.now().toString(), 'bot_start_time');
};

export const logBotStat = (statType: string, statValue: string) => {
    const stmt = db.prepare('INSERT INTO bot_stats (stat_type, stat_value, timestamp) VALUES (?, ?, ?)');
    stmt.run(statType, statValue, Date.now());
};

export const getBotPerformance = () => {
    const recentStats = db.prepare('SELECT * FROM bot_stats WHERE timestamp > ? ORDER BY timestamp DESC').all(Date.now() - 24 * 60 * 60 * 1000) as any[];
    const commandErrors = db.prepare('SELECT COUNT(*) as count FROM command_usage WHERE success = 0').get() as any;

    return {
        recentStats,
        commandErrors: commandErrors?.count || 0,
        averageResponseTime: calculateAverageResponseTime(recentStats)
    };
};

// Helper functions
function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

function calculateAverageResponseTime(stats: any[]): number {
    const responseTimes = stats.filter(s => s.stat_type === 'response_time').map(s => parseFloat(s.stat_value) || 0);
    if (responseTimes.length === 0) return 0;
    return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
}

// --- MEMORY SYSTEM ---
export const saveMemory = (userId: string, fact: string, category: string = 'general') => {
    db.prepare('INSERT INTO memories (user_id, fact, category, timestamp) VALUES (?, ?, ?, ?)').run(userId, fact, category, Date.now());
};

export const getMemories = (userId: string, limit: number = 10): any[] => {
    return db.prepare('SELECT * FROM memories WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?').all(userId, limit) as any[];
};

export const deleteMemory = (id: number) => {
    db.prepare('DELETE FROM memories WHERE id = ?').run(id);
};

// --- BIRTHDAY SYSTEM ---
export const setBirthday = (userId: string, guildId: string, month: number, day: number) => {
    db.prepare('INSERT OR REPLACE INTO birthdays (user_id, guild_id, month, day) VALUES (?, ?, ?, ?)').run(userId, guildId, month, day);
};

export const getBirthday = (userId: string): any => {
    return db.prepare('SELECT * FROM birthdays WHERE user_id = ?').get(userId) as any;
};

export const getTodayBirthdays = (month: number, day: number): any[] => {
    return db.prepare('SELECT * FROM birthdays WHERE month = ? AND day = ?').all(month, day) as any[];
};

// --- REMINDER SYSTEM ---
export const addReminder = (userId: string, guildId: string, channelId: string, message: string, remindAt: number) => {
    db.prepare('INSERT INTO reminders (user_id, guild_id, channel_id, message, remind_at, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(userId, guildId, channelId, message, remindAt, Date.now());
};

export const getDueReminders = (): any[] => {
    return db.prepare('SELECT * FROM reminders WHERE remind_at <= ?').all(Date.now()) as any[];
};

export const deleteReminder = (id: number) => {
    db.prepare('DELETE FROM reminders WHERE id = ?').run(id);
};

export const getUserReminders = (userId: string): any[] => {
    return db.prepare('SELECT * FROM reminders WHERE user_id = ? ORDER BY remind_at ASC').all(userId) as any[];
};

// --- CONFESSION SYSTEM ---
export const addConfession = (guildId: string, content: string) => {
    db.prepare('INSERT INTO confessions (guild_id, content, timestamp) VALUES (?, ?, ?)').run(guildId, content, Date.now());
};

// --- POLL SYSTEM ---
export const createPoll = (guildId: string, channelId: string, question: string, options: string[], createdBy: string, endsAt?: number) => {
    const result = db.prepare('INSERT INTO polls (guild_id, channel_id, question, options, created_by, ends_at, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)').run(guildId, channelId, question, JSON.stringify(options), createdBy, endsAt || null, Date.now());
    return result.lastInsertRowid;
};

export const updatePollMessageId = (pollId: number, messageId: string) => {
    db.prepare('UPDATE polls SET message_id = ? WHERE id = ?').run(messageId, pollId);
};

export const getRecentConfessions = (guildId: string, limit: number = 20): any[] => {
    return db.prepare('SELECT * FROM confessions WHERE guild_id = ? ORDER BY timestamp DESC LIMIT ?').all(guildId, limit) as any[];
};

export const getActivePolls = (guildId: string): any[] => {
    return db.prepare('SELECT * FROM polls WHERE guild_id = ? ORDER BY timestamp DESC LIMIT 20').all(guildId) as any[];
};

// --- MILESTONE SYSTEM ---
// --- MILESTONE SYSTEM ---
export const getMilestoneTitle = (friendshipPoints: number): string => {
    if (friendshipPoints >= 1500) return '🔮 **Obsessed**';
    if (friendshipPoints >= 1000) return '💎 **Legendary**';
    if (friendshipPoints >= 750) return '💕 **Soul Mate**';
    if (friendshipPoints >= 500) return '💛 **Best Friend**';
    if (friendshipPoints >= 300) return '💚 **Close Friend**';
    if (friendshipPoints >= 150) return '🤝 **Friend**';
    if (friendshipPoints >= 50) return '👋 **Acquaintance**';
    return '❓ Stranger';
};

export const getMilestoneMultiplier = (friendshipPoints: number): number => {
    if (friendshipPoints >= 1500) return 1.20; // Obsessed
    if (friendshipPoints >= 1000) return 1.18; // Legendary
    if (friendshipPoints >= 750) return 1.15; // Soul Mate
    if (friendshipPoints >= 500) return 1.12; // Best Friend
    if (friendshipPoints >= 300) return 1.10; // Close Friend
    if (friendshipPoints >= 150) return 1.08; // Friend
    if (friendshipPoints >= 50) return 1.05; // Acquaintance
    return 1.00; // Stranger
};

export const getMilestoneThresholds = () => [50, 150, 300, 500, 750, 1000, 1500];

// --- WEEKLY HIGHLIGHTS ---
export const getWeeklyHighlights = (guildId: string) => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const topChatters = db.prepare(`
        SELECT user_id, COUNT(*) as msg_count FROM message_stats
        WHERE guild_id = ? AND timestamp > ? GROUP BY user_id ORDER BY msg_count DESC LIMIT 5
    `).all(guildId, weekAgo) as any[];
    const topVoice = db.prepare(`
        SELECT user_id, SUM(duration_minutes) as total_mins FROM voice_sessions
        WHERE guild_id = ? AND join_time > ? GROUP BY user_id ORDER BY total_mins DESC LIMIT 5
    `).all(guildId, weekAgo) as any[];
    const totalMessages = (db.prepare('SELECT COUNT(*) as c FROM message_stats WHERE guild_id = ? AND timestamp > ?').get(guildId, weekAgo) as any)?.c || 0;
    return { topChatters, topVoice, totalMessages };
};

// --- TICKET SYSTEM ---
export const createTicket = (guildId: string, channelId: string, userId: string) => {
    db.prepare('INSERT INTO tickets (guild_id, channel_id, user_id, created_at) VALUES (?, ?, ?, ?)').run(guildId, channelId, userId, Date.now());
};

export const closeTicket = (channelId: string) => {
    db.prepare('UPDATE tickets SET status = ?, closed_at = ? WHERE channel_id = ?').run('closed', Date.now(), channelId);
};

export const getTicket = (channelId: string) => {
    return db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(channelId) as any;
};

// --- WYR SYSTEM ---
export const createWyr = (guildId: string, channelId: string, question: string, optionA: string, optionB: string, duration: number) => {
    const endsAt = Date.now() + duration;
    const info = db.prepare(`
        INSERT INTO events_wyr (guild_id, channel_id, question, option_a, option_b, ends_at, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(guildId, channelId, question, optionA, optionB, endsAt, Date.now());

    // Update global state
    const now = new Date();
    const dateKey = `${now.getMonth() + 1}-${now.getDate()}`;
    db.prepare('UPDATE global_stats SET value = ? WHERE key = ?').run(dateKey, 'active_wyr_date');

    return info.lastInsertRowid;
};

export const updateWyrMessageId = (id: number | bigint, messageId: string) => {
    db.prepare('UPDATE events_wyr SET message_id = ? WHERE id = ?').run(messageId, id);
};

export const getWyr = (id: number) => {
    const wyr = db.prepare('SELECT * FROM events_wyr WHERE id = ?').get(id) as any;
    if (!wyr) return null;
    return {
        ...wyr,
        votes_a: JSON.parse(wyr.votes_a || '[]'),
        votes_b: JSON.parse(wyr.votes_b || '[]')
    };
};

export const getActiveWyr = () => {
    const wyr = db.prepare('SELECT * FROM events_wyr WHERE active = 1 ORDER BY timestamp DESC LIMIT 1').get() as any;
    if (!wyr) return null;
    return {
        ...wyr,
        votes_a: JSON.parse(wyr.votes_a || '[]'),
        votes_b: JSON.parse(wyr.votes_b || '[]')
    };
};

export const voteWyr = (id: number, userId: string, option: 'a' | 'b') => {
    const wyr = getWyr(id);
    if (!wyr || !wyr.active) return false;

    const votesA = new Set(wyr.votes_a);
    const votesB = new Set(wyr.votes_b);

    if (option === 'a') {
        votesB.delete(userId);
        votesA.add(userId);
    } else {
        votesA.delete(userId);
        votesB.add(userId);
    }

    db.prepare('UPDATE events_wyr SET votes_a = ?, votes_b = ? WHERE id = ?')
        .run(JSON.stringify([...votesA]), JSON.stringify([...votesB]), id);

    return true;
};

export const endWyr = (id: number) => {
    db.prepare('UPDATE events_wyr SET active = 0 WHERE id = ?').run(id);
};

export const getPendingExpiredWyrs = () => {
    return db.prepare('SELECT * FROM events_wyr WHERE active = 1 AND ends_at <= ?').all(Date.now()) as any[];
};

export default db;

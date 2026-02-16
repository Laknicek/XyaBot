"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDueReminders = exports.addReminder = exports.getTodayBirthdays = exports.getBirthday = exports.setBirthday = exports.deleteMemory = exports.getMemories = exports.saveMemory = exports.getBotPerformance = exports.logBotStat = exports.updateBotStartTime = exports.getBotUptime = exports.getServerActivity = exports.getServerOverview = exports.getUserDetailed = exports.updateMessagesPerChannel = exports.getMessagesPerChannel = exports.updateUserActivityByDay = exports.getUserActivityByDay = exports.updateUserActivityByHour = exports.getUserActivityByHour = exports.getUserMessagesStats = exports.getEconomyHistory = exports.getCommandStats = exports.getCommandUsage = exports.getVoiceSessions = exports.endVoiceSession = exports.startVoiceSession = exports.logEconomyTransaction = exports.logCommandUsage = exports.logMessage = exports.getUserRelationship = exports.getAllUsers = exports.updateUser = exports.getUser = exports.deleteWordleGame = exports.saveWordleGame = exports.getWordleGame = exports.getInteractions = exports.logInteraction = exports.getBadges = exports.addBadge = exports.removeItem = exports.getInventory = exports.addItem = exports.updateMood = exports.getMood = exports.getGuildSetting = exports.setGuildSetting = exports.db = void 0;
exports.getPendingExpiredWyrs = exports.endWyr = exports.voteWyr = exports.getActiveWyr = exports.getWyr = exports.updateWyrMessageId = exports.createWyr = exports.getTicket = exports.closeTicket = exports.createTicket = exports.getWeeklyHighlights = exports.getMilestoneThresholds = exports.getMilestoneMultiplier = exports.getMilestoneTitle = exports.getActivePolls = exports.getRecentConfessions = exports.updatePollMessageId = exports.createPoll = exports.addConfession = exports.getUserReminders = exports.deleteReminder = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../xyabot.sqlite');
const db = new better_sqlite3_1.default(dbPath);
exports.db = db;
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
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
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
            }
            catch (e) {
                console.error(`[Migration] Failed to add column ${col.name} to users:`, e);
            }
        }
    }
    const guildTableInfo = db.prepare("PRAGMA table_info(guild_settings)").all();
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
            }
            catch (e) {
                console.error(`[Migration] Failed to add column ${col.name} to guild_settings:`, e);
            }
        }
    }
    // Migrate reminders table
    const remindersInfo = db.prepare("PRAGMA table_info(reminders)").all();
    const remindersCols = remindersInfo.map(c => c.name);
    if (!remindersCols.includes('delivered')) {
        try {
            db.prepare('ALTER TABLE reminders ADD COLUMN delivered INTEGER DEFAULT 0').run();
            console.log('[Migration] Added column to reminders: delivered');
        }
        catch (e) {
            console.error('[Migration] Failed to add delivered column to reminders:', e);
        }
    }
};
migrate();
const setGuildSetting = (guildId, data) => {
    const keys = Object.keys(data);
    const fields = keys.map((key) => `${key} = ?`).join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const values = Object.values(data);
    const stmt = db.prepare(`INSERT INTO guild_settings (guild_id, ${keys.join(', ')}) VALUES (?, ${placeholders}) ON CONFLICT(guild_id) DO UPDATE SET ${fields}`);
    stmt.run(guildId, ...values, ...values);
};
exports.setGuildSetting = setGuildSetting;
const getGuildSetting = (guildId) => {
    return db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);
};
exports.getGuildSetting = getGuildSetting;
const getMood = () => {
    const res = db.prepare('SELECT value FROM global_stats WHERE key = ?').get('mood');
    return parseInt(res?.value || '100');
};
exports.getMood = getMood;
const updateMood = (delta) => {
    const current = (0, exports.getMood)();
    const newMood = Math.max(0, Math.min(200, current + delta));
    db.prepare('UPDATE global_stats SET value = ? WHERE key = ?').run(newMood.toString(), 'mood');
};
exports.updateMood = updateMood;
const addItem = (userId, itemId, qty) => {
    db.prepare('INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, ?) ON CONFLICT(user_id, item_id) DO UPDATE SET quantity = quantity + ?')
        .run(userId, itemId, qty, qty);
};
exports.addItem = addItem;
const getInventory = (userId) => {
    return db.prepare('SELECT * FROM inventory WHERE user_id = ?').all(userId);
};
exports.getInventory = getInventory;
const removeItem = (userId, itemId, qty) => {
    db.prepare('UPDATE inventory SET quantity = quantity - ? WHERE user_id = ? AND item_id = ? AND quantity >= ?').run(qty, userId, itemId, qty);
};
exports.removeItem = removeItem;
const addBadge = (userId, badgeId) => {
    db.prepare('INSERT OR IGNORE INTO badges (user_id, badge_id) VALUES (?, ?)').run(userId, badgeId);
};
exports.addBadge = addBadge;
const getBadges = (userId) => {
    return db.prepare('SELECT badge_id FROM badges WHERE user_id = ?').all(userId).map((b) => b.badge_id);
};
exports.getBadges = getBadges;
const logInteraction = (userId, username, content, response, sentiment) => {
    const stmt = db.prepare('INSERT INTO interactions (user_id, username, content, response, sentiment, timestamp) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(userId, username, content, response, sentiment, Date.now());
};
exports.logInteraction = logInteraction;
const getInteractions = (userId, limit = 10) => {
    return db.prepare('SELECT * FROM interactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?').all(userId, limit);
};
exports.getInteractions = getInteractions;
const getWordleGame = (userId) => {
    return db.prepare('SELECT * FROM wordle_games WHERE user_id = ?').get(userId);
};
exports.getWordleGame = getWordleGame;
const saveWordleGame = (userId, word, guesses, tries) => {
    const stmt = db.prepare('INSERT OR REPLACE INTO wordle_games (user_id, word, guesses, tries, timestamp) VALUES (?, ?, ?, ?, ?)');
    stmt.run(userId, word, JSON.stringify(guesses), tries, Date.now());
};
exports.saveWordleGame = saveWordleGame;
const deleteWordleGame = (userId) => {
    db.prepare('DELETE FROM wordle_games WHERE user_id = ?').run(userId);
};
exports.deleteWordleGame = deleteWordleGame;
const getUser = (id, username) => {
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
    return user;
};
exports.getUser = getUser;
const updateUser = (id, data) => {
    const fields = Object.keys(data).map((key) => `${key} = ?`).join(', ');
    const values = Object.values(data);
    const stmt = db.prepare(`UPDATE users SET ${fields} WHERE id = ?`);
    stmt.run(...values, id);
};
exports.updateUser = updateUser;
const getAllUsers = () => {
    return db.prepare('SELECT * FROM users ORDER BY xp DESC').all();
};
exports.getAllUsers = getAllUsers;
const getUserRelationship = (userId) => {
    const user = db.prepare('SELECT friendship_points, disgust_points, warnings_rude, warnings_hateful, warnings_racist FROM users WHERE id = ?').get(userId);
    if (!user)
        return "New user — be welcoming and friendly!";
    const friendship = user.friendship_points || 0;
    const disgust = user.disgust_points || 0;
    // Translate friendship into natural description
    let friendshipDesc = '';
    if (friendship >= 800)
        friendshipDesc = 'You are extremely close with this user — they are one of your favorite people.';
    else if (friendship >= 500)
        friendshipDesc = 'You are great friends with this user — warm, comfortable, inside jokes.';
    else if (friendship >= 200)
        friendshipDesc = 'You are friends with this user — casual, friendly energy.';
    else if (friendship >= 50)
        friendshipDesc = 'You know this user a little — be warm but still getting to know them.';
    else
        friendshipDesc = 'You are still getting to know this user — be polite and friendly.';
    // Translate disgust into subtle behavioral note (NOT raw numbers)
    let disgustNote = '';
    if (disgust >= 500)
        disgustNote = ' This user has been rude to you before, so you are a little guarded — but still polite and kind.';
    else if (disgust >= 200)
        disgustNote = ' This user has occasionally been unkind — you remember but give them a fair chance.';
    return friendshipDesc + disgustNote;
};
exports.getUserRelationship = getUserRelationship;
// --- Statistics Tracking Functions ---
const logMessage = (userId, guildId, channelId, messageType = 'normal') => {
    const stmt = db.prepare('INSERT INTO message_stats (user_id, guild_id, channel_id, timestamp, message_type) VALUES (?, ?, ?, ?, ?)');
    stmt.run(userId, guildId, channelId, Date.now(), messageType);
};
exports.logMessage = logMessage;
const logCommandUsage = (command, userId, guildId, success = true) => {
    const stmt = db.prepare('INSERT INTO command_usage (command, user_id, guild_id, success, timestamp) VALUES (?, ?, ?, ?, ?)');
    stmt.run(command, userId, guildId, success ? 1 : 0, Date.now());
};
exports.logCommandUsage = logCommandUsage;
const logEconomyTransaction = (userId, type, amount, source, balanceAfter) => {
    const stmt = db.prepare('INSERT INTO economy_history (user_id, type, amount, source, timestamp, balance_after) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(userId, type, amount, source, Date.now(), balanceAfter);
};
exports.logEconomyTransaction = logEconomyTransaction;
const startVoiceSession = (userId, guildId, channelId) => {
    const stmt = db.prepare('INSERT INTO voice_sessions (user_id, guild_id, channel_id, join_time) VALUES (?, ?, ?, ?)');
    const result = stmt.run(userId, guildId, channelId, Date.now());
    return result.lastInsertRowid;
};
exports.startVoiceSession = startVoiceSession;
const endVoiceSession = (sessionId, durationMinutes, xpGained, currencyGained) => {
    const stmt = db.prepare('UPDATE voice_sessions SET leave_time = ?, duration_minutes = ?, xp_gained = ?, currency_gained = ? WHERE id = ?');
    stmt.run(Date.now(), durationMinutes, xpGained, currencyGained, sessionId);
};
exports.endVoiceSession = endVoiceSession;
const getVoiceSessions = (userId, limit = 50) => {
    return db.prepare('SELECT * FROM voice_sessions WHERE user_id = ? ORDER BY join_time DESC LIMIT ?').all(userId, limit);
};
exports.getVoiceSessions = getVoiceSessions;
const getCommandUsage = (userId = null, limit = 100) => {
    if (userId) {
        return db.prepare('SELECT * FROM command_usage WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?').all(userId, limit);
    }
    return db.prepare('SELECT * FROM command_usage ORDER BY timestamp DESC LIMIT ?').all(limit);
};
exports.getCommandUsage = getCommandUsage;
const getCommandStats = (guildId = null) => {
    if (guildId) {
        return db.prepare(`
            SELECT command, COUNT(*) as count, SUM(success) as success_count
            FROM command_usage
            WHERE guild_id = ?
            GROUP BY command
            ORDER BY count DESC
        `).all(guildId);
    }
    return db.prepare(`
        SELECT command, COUNT(*) as count, SUM(success) as success_count
        FROM command_usage
        GROUP BY command
        ORDER BY count DESC
    `).all();
};
exports.getCommandStats = getCommandStats;
const getEconomyHistory = (userId, limit = 50) => {
    return db.prepare('SELECT * FROM economy_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?').all(userId, limit);
};
exports.getEconomyHistory = getEconomyHistory;
const getUserMessagesStats = (userId, days = 7) => {
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);
    return db.prepare('SELECT * FROM message_stats WHERE user_id = ? AND timestamp > ? ORDER BY timestamp DESC').all(userId, since);
};
exports.getUserMessagesStats = getUserMessagesStats;
const getUserActivityByHour = (userId) => {
    const user = db.prepare('SELECT peak_hours FROM users WHERE id = ?').get(userId);
    if (!user || !user.peak_hours)
        return {};
    try {
        return JSON.parse(user.peak_hours);
    }
    catch {
        return {};
    }
};
exports.getUserActivityByHour = getUserActivityByHour;
const updateUserActivityByHour = (userId, hour) => {
    const current = (0, exports.getUserActivityByHour)(userId);
    current[hour] = (current[hour] || 0) + 1;
    db.prepare('UPDATE users SET peak_hours = ? WHERE id = ?').run(JSON.stringify(current), userId);
};
exports.updateUserActivityByHour = updateUserActivityByHour;
const getUserActivityByDay = (userId) => {
    const user = db.prepare('SELECT peak_days FROM users WHERE id = ?').get(userId);
    if (!user || !user.peak_days)
        return {};
    try {
        return JSON.parse(user.peak_days);
    }
    catch {
        return {};
    }
};
exports.getUserActivityByDay = getUserActivityByDay;
const updateUserActivityByDay = (userId, day) => {
    const current = (0, exports.getUserActivityByDay)(userId);
    current[day] = (current[day] || 0) + 1;
    db.prepare('UPDATE users SET peak_days = ? WHERE id = ?').run(JSON.stringify(current), userId);
};
exports.updateUserActivityByDay = updateUserActivityByDay;
const getMessagesPerChannel = (userId) => {
    const user = db.prepare('SELECT messages_per_channel FROM users WHERE id = ?').get(userId);
    if (!user || !user.messages_per_channel)
        return {};
    try {
        return JSON.parse(user.messages_per_channel);
    }
    catch {
        return {};
    }
};
exports.getMessagesPerChannel = getMessagesPerChannel;
const updateMessagesPerChannel = (userId, channelId) => {
    const current = (0, exports.getMessagesPerChannel)(userId);
    current[channelId] = (current[channelId] || 0) + 1;
    db.prepare('UPDATE users SET messages_per_channel = ? WHERE id = ?').run(JSON.stringify(current), userId);
};
exports.updateMessagesPerChannel = updateMessagesPerChannel;
const getUserDetailed = (userId) => {
    const user = (0, exports.getUser)(userId, '');
    const voiceSessions = (0, exports.getVoiceSessions)(userId);
    const commandUsage = (0, exports.getCommandUsage)(userId, 20);
    const economyHistory = (0, exports.getEconomyHistory)(userId, 20);
    const messagesStats = (0, exports.getUserMessagesStats)(userId, 30);
    return {
        ...user,
        voiceSessions,
        commandUsage,
        economyHistory,
        messagesStats,
        peakHours: (0, exports.getUserActivityByHour)(userId),
        peakDays: (0, exports.getUserActivityByDay)(userId),
        messagesPerChannel: (0, exports.getMessagesPerChannel)(userId)
    };
};
exports.getUserDetailed = getUserDetailed;
const getServerOverview = (guildId) => {
    const users = db.prepare('SELECT * FROM users').all();
    const messageStats = db.prepare('SELECT COUNT(*) as count FROM message_stats WHERE guild_id = ?').get(guildId);
    const commandStats = (0, exports.getCommandStats)(guildId);
    const recentMessages = db.prepare('SELECT * FROM message_stats WHERE guild_id = ? ORDER BY timestamp DESC LIMIT 20').all(guildId);
    return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.last_active_time > Date.now() - 7 * 24 * 60 * 60 * 1000).length,
        totalMessages: messageStats?.count || 0,
        totalXP: users.reduce((sum, u) => sum + (u.xp || 0), 0),
        totalCurrency: users.reduce((sum, u) => sum + (u.currency || 0), 0),
        totalVoiceMinutes: users.reduce((sum, u) => sum + (u.total_voice_minutes || 0), 0),
        commandStats,
        recentMessages
    };
};
exports.getServerOverview = getServerOverview;
const getServerActivity = (guildId, days = 7) => {
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);
    return db.prepare(`
        SELECT DATE(timestamp/1000, 'unixepoch', 'localtime') as date,
               COUNT(*) as message_count
        FROM message_stats
        WHERE guild_id = ? AND timestamp > ?
        GROUP BY date
        ORDER BY date ASC
    `).all(guildId, since);
};
exports.getServerActivity = getServerActivity;
const getBotUptime = () => {
    const startTime = db.prepare('SELECT value FROM global_stats WHERE key = ?').get('bot_start_time');
    if (!startTime || !startTime.value)
        return { uptime: 0, startTime: 0 };
    const start = parseInt(startTime.value);
    const uptime = Date.now() - start;
    const sessions = db.prepare('SELECT * FROM bot_stats WHERE stat_type = ? ORDER BY timestamp DESC LIMIT 100').all('uptime');
    return {
        uptime,
        startTime: start,
        sessions,
        formattedUptime: formatDuration(uptime)
    };
};
exports.getBotUptime = getBotUptime;
const updateBotStartTime = () => {
    db.prepare('UPDATE global_stats SET value = ? WHERE key = ?').run(Date.now().toString(), 'bot_start_time');
};
exports.updateBotStartTime = updateBotStartTime;
const logBotStat = (statType, statValue) => {
    const stmt = db.prepare('INSERT INTO bot_stats (stat_type, stat_value, timestamp) VALUES (?, ?, ?)');
    stmt.run(statType, statValue, Date.now());
};
exports.logBotStat = logBotStat;
const getBotPerformance = () => {
    const recentStats = db.prepare('SELECT * FROM bot_stats WHERE timestamp > ? ORDER BY timestamp DESC').all(Date.now() - 24 * 60 * 60 * 1000);
    const commandErrors = db.prepare('SELECT COUNT(*) as count FROM command_usage WHERE success = 0').get();
    return {
        recentStats,
        commandErrors: commandErrors?.count || 0,
        averageResponseTime: calculateAverageResponseTime(recentStats)
    };
};
exports.getBotPerformance = getBotPerformance;
// Helper functions
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0)
        return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0)
        return `${hours}h ${minutes % 60}m`;
    if (minutes > 0)
        return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}
function calculateAverageResponseTime(stats) {
    const responseTimes = stats.filter(s => s.stat_type === 'response_time').map(s => parseFloat(s.stat_value) || 0);
    if (responseTimes.length === 0)
        return 0;
    return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
}
// --- MEMORY SYSTEM ---
const saveMemory = (userId, fact, category = 'general') => {
    db.prepare('INSERT INTO memories (user_id, fact, category, timestamp) VALUES (?, ?, ?, ?)').run(userId, fact, category, Date.now());
};
exports.saveMemory = saveMemory;
const getMemories = (userId, limit = 10) => {
    return db.prepare('SELECT * FROM memories WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?').all(userId, limit);
};
exports.getMemories = getMemories;
const deleteMemory = (id) => {
    db.prepare('DELETE FROM memories WHERE id = ?').run(id);
};
exports.deleteMemory = deleteMemory;
// --- BIRTHDAY SYSTEM ---
const setBirthday = (userId, guildId, month, day) => {
    db.prepare('INSERT OR REPLACE INTO birthdays (user_id, guild_id, month, day) VALUES (?, ?, ?, ?)').run(userId, guildId, month, day);
};
exports.setBirthday = setBirthday;
const getBirthday = (userId) => {
    return db.prepare('SELECT * FROM birthdays WHERE user_id = ?').get(userId);
};
exports.getBirthday = getBirthday;
const getTodayBirthdays = (month, day) => {
    return db.prepare('SELECT * FROM birthdays WHERE month = ? AND day = ?').all(month, day);
};
exports.getTodayBirthdays = getTodayBirthdays;
// --- REMINDER SYSTEM ---
const addReminder = (userId, guildId, channelId, message, remindAt) => {
    db.prepare('INSERT INTO reminders (user_id, guild_id, channel_id, message, remind_at, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(userId, guildId, channelId, message, remindAt, Date.now());
};
exports.addReminder = addReminder;
const getDueReminders = () => {
    return db.prepare('SELECT * FROM reminders WHERE remind_at <= ?').all(Date.now());
};
exports.getDueReminders = getDueReminders;
const deleteReminder = (id) => {
    db.prepare('DELETE FROM reminders WHERE id = ?').run(id);
};
exports.deleteReminder = deleteReminder;
const getUserReminders = (userId) => {
    return db.prepare('SELECT * FROM reminders WHERE user_id = ? ORDER BY remind_at ASC').all(userId);
};
exports.getUserReminders = getUserReminders;
// --- CONFESSION SYSTEM ---
const addConfession = (guildId, content) => {
    db.prepare('INSERT INTO confessions (guild_id, content, timestamp) VALUES (?, ?, ?)').run(guildId, content, Date.now());
};
exports.addConfession = addConfession;
// --- POLL SYSTEM ---
const createPoll = (guildId, channelId, question, options, createdBy, endsAt) => {
    const result = db.prepare('INSERT INTO polls (guild_id, channel_id, question, options, created_by, ends_at, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)').run(guildId, channelId, question, JSON.stringify(options), createdBy, endsAt || null, Date.now());
    return result.lastInsertRowid;
};
exports.createPoll = createPoll;
const updatePollMessageId = (pollId, messageId) => {
    db.prepare('UPDATE polls SET message_id = ? WHERE id = ?').run(messageId, pollId);
};
exports.updatePollMessageId = updatePollMessageId;
const getRecentConfessions = (guildId, limit = 20) => {
    return db.prepare('SELECT * FROM confessions WHERE guild_id = ? ORDER BY timestamp DESC LIMIT ?').all(guildId, limit);
};
exports.getRecentConfessions = getRecentConfessions;
const getActivePolls = (guildId) => {
    return db.prepare('SELECT * FROM polls WHERE guild_id = ? ORDER BY timestamp DESC LIMIT 20').all(guildId);
};
exports.getActivePolls = getActivePolls;
// --- MILESTONE SYSTEM ---
// --- MILESTONE SYSTEM ---
const getMilestoneTitle = (friendshipPoints) => {
    if (friendshipPoints >= 1500)
        return '🔮 **Obsessed**';
    if (friendshipPoints >= 1000)
        return '💎 **Legendary**';
    if (friendshipPoints >= 750)
        return '💕 **Soul Mate**';
    if (friendshipPoints >= 500)
        return '💛 **Best Friend**';
    if (friendshipPoints >= 300)
        return '💚 **Close Friend**';
    if (friendshipPoints >= 150)
        return '🤝 **Friend**';
    if (friendshipPoints >= 50)
        return '👋 **Acquaintance**';
    return '❓ Stranger';
};
exports.getMilestoneTitle = getMilestoneTitle;
const getMilestoneMultiplier = (friendshipPoints) => {
    if (friendshipPoints >= 1500)
        return 1.20; // Obsessed
    if (friendshipPoints >= 1000)
        return 1.18; // Legendary
    if (friendshipPoints >= 750)
        return 1.15; // Soul Mate
    if (friendshipPoints >= 500)
        return 1.12; // Best Friend
    if (friendshipPoints >= 300)
        return 1.10; // Close Friend
    if (friendshipPoints >= 150)
        return 1.08; // Friend
    if (friendshipPoints >= 50)
        return 1.05; // Acquaintance
    return 1.00; // Stranger
};
exports.getMilestoneMultiplier = getMilestoneMultiplier;
const getMilestoneThresholds = () => [50, 150, 300, 500, 750, 1000, 1500];
exports.getMilestoneThresholds = getMilestoneThresholds;
// --- WEEKLY HIGHLIGHTS ---
const getWeeklyHighlights = (guildId) => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const topChatters = db.prepare(`
        SELECT user_id, COUNT(*) as msg_count FROM message_stats
        WHERE guild_id = ? AND timestamp > ? GROUP BY user_id ORDER BY msg_count DESC LIMIT 5
    `).all(guildId, weekAgo);
    const topVoice = db.prepare(`
        SELECT user_id, SUM(duration_minutes) as total_mins FROM voice_sessions
        WHERE guild_id = ? AND join_time > ? GROUP BY user_id ORDER BY total_mins DESC LIMIT 5
    `).all(guildId, weekAgo);
    const totalMessages = db.prepare('SELECT COUNT(*) as c FROM message_stats WHERE guild_id = ? AND timestamp > ?').get(guildId, weekAgo)?.c || 0;
    return { topChatters, topVoice, totalMessages };
};
exports.getWeeklyHighlights = getWeeklyHighlights;
// --- TICKET SYSTEM ---
const createTicket = (guildId, channelId, userId) => {
    db.prepare('INSERT INTO tickets (guild_id, channel_id, user_id, created_at) VALUES (?, ?, ?, ?)').run(guildId, channelId, userId, Date.now());
};
exports.createTicket = createTicket;
const closeTicket = (channelId) => {
    db.prepare('UPDATE tickets SET status = ?, closed_at = ? WHERE channel_id = ?').run('closed', Date.now(), channelId);
};
exports.closeTicket = closeTicket;
const getTicket = (channelId) => {
    return db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(channelId);
};
exports.getTicket = getTicket;
// --- WYR SYSTEM ---
const createWyr = (guildId, channelId, question, optionA, optionB, duration) => {
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
exports.createWyr = createWyr;
const updateWyrMessageId = (id, messageId) => {
    db.prepare('UPDATE events_wyr SET message_id = ? WHERE id = ?').run(messageId, id);
};
exports.updateWyrMessageId = updateWyrMessageId;
const getWyr = (id) => {
    const wyr = db.prepare('SELECT * FROM events_wyr WHERE id = ?').get(id);
    if (!wyr)
        return null;
    return {
        ...wyr,
        votes_a: JSON.parse(wyr.votes_a || '[]'),
        votes_b: JSON.parse(wyr.votes_b || '[]')
    };
};
exports.getWyr = getWyr;
const getActiveWyr = () => {
    const wyr = db.prepare('SELECT * FROM events_wyr WHERE active = 1 ORDER BY timestamp DESC LIMIT 1').get();
    if (!wyr)
        return null;
    return {
        ...wyr,
        votes_a: JSON.parse(wyr.votes_a || '[]'),
        votes_b: JSON.parse(wyr.votes_b || '[]')
    };
};
exports.getActiveWyr = getActiveWyr;
const voteWyr = (id, userId, option) => {
    const wyr = (0, exports.getWyr)(id);
    if (!wyr || !wyr.active)
        return false;
    const votesA = new Set(wyr.votes_a);
    const votesB = new Set(wyr.votes_b);
    if (option === 'a') {
        votesB.delete(userId);
        votesA.add(userId);
    }
    else {
        votesA.delete(userId);
        votesB.add(userId);
    }
    db.prepare('UPDATE events_wyr SET votes_a = ?, votes_b = ? WHERE id = ?')
        .run(JSON.stringify([...votesA]), JSON.stringify([...votesB]), id);
    return true;
};
exports.voteWyr = voteWyr;
const endWyr = (id) => {
    db.prepare('UPDATE events_wyr SET active = 0 WHERE id = ?').run(id);
};
exports.endWyr = endWyr;
const getPendingExpiredWyrs = () => {
    return db.prepare('SELECT * FROM events_wyr WHERE active = 1 AND ends_at <= ?').all(Date.now());
};
exports.getPendingExpiredWyrs = getPendingExpiredWyrs;
exports.default = db;

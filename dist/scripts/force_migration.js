"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
// Fix path to point to root database
const dbPath = path_1.default.resolve(process.cwd(), 'xyabot.sqlite');
console.log(`Using DB path: ${dbPath}`);
const db = new better_sqlite3_1.default(dbPath);
console.log("Checking guild_settings table...");
try {
    const tableInfo = db.prepare("PRAGMA table_info(guild_settings)").all();
    const columns = tableInfo.map(c => c.name);
    console.log("Current columns:", columns.join(', '));
    if (!columns.includes('theme_ignored_categories')) {
        console.log("Adding column theme_ignored_categories...");
        db.prepare("ALTER TABLE guild_settings ADD COLUMN theme_ignored_categories TEXT").run();
        console.log("✅ Column added successfully!");
    }
    else {
        console.log("✅ Column theme_ignored_categories already exists.");
    }
}
catch (e) {
    console.error("Error during migration check:", e);
}
db.close();
console.log("Done.");

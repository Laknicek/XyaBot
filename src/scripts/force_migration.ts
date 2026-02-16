import Database from 'better-sqlite3';
import path from 'path';

// Fix path to point to root database
const dbPath = path.resolve(process.cwd(), 'xyabot.sqlite');
console.log(`Using DB path: ${dbPath}`);
const db = new Database(dbPath);

console.log("Checking guild_settings table...");
try {
    const tableInfo = db.prepare("PRAGMA table_info(guild_settings)").all() as any[];
    const columns = tableInfo.map(c => c.name);
    console.log("Current columns:", columns.join(', '));

    if (!columns.includes('theme_ignored_categories')) {
        console.log("Adding column theme_ignored_categories...");
        db.prepare("ALTER TABLE guild_settings ADD COLUMN theme_ignored_categories TEXT").run();
        console.log("✅ Column added successfully!");
    } else {
        console.log("✅ Column theme_ignored_categories already exists.");
    }

} catch (e) {
    console.error("Error during migration check:", e);
}

db.close();
console.log("Done.");

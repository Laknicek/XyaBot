"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployCommands = void 0;
const discord_js_1 = require("discord.js");
const commands_1 = require("./commands");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
if (!token || !clientId) {
    console.error("Missing DISCORD_TOKEN or CLIENT_ID in .env");
    process.exit(1);
}
const rest = new discord_js_1.REST({ version: '10' }).setToken(token);
const deployCommands = async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        const commandData = Array.from(commands_1.commands.values()).map(c => c.data.toJSON());
        if (process.env.GUILD_ID) {
            let guildIds = [];
            try {
                // Try parsing as JSON first (handles ["id1", "id2"])
                const parsed = JSON.parse(process.env.GUILD_ID);
                if (Array.isArray(parsed)) {
                    guildIds = parsed;
                }
                else {
                    guildIds = [process.env.GUILD_ID];
                }
            }
            catch {
                // If JSON parse fails, split by comma (handles id1,id2)
                guildIds = process.env.GUILD_ID.split(',').map(id => id.trim()).filter(id => id.length > 0);
            }
            console.log(`Deploying to ${guildIds.length} specific guild(s)...`);
            for (const guildId of guildIds) {
                try {
                    console.log(`Deploying to guild: ${guildId}`);
                    await rest.put(discord_js_1.Routes.applicationGuildCommands(clientId, guildId), { body: commandData });
                }
                catch (error) {
                    console.error(`Failed to deploy to guild ${guildId}:`, error);
                }
            }
        }
        else {
            console.log('Deploying globally (may take 1 hour to propagate)...');
            await rest.put(discord_js_1.Routes.applicationCommands(clientId), { body: commandData });
        }
        console.log('Successfully reloaded application (/) commands.');
    }
    catch (error) {
        console.error(error);
    }
};
exports.deployCommands = deployCommands;
// Auto-execute if run directly
if (require.main === module) {
    (0, exports.deployCommands)();
}

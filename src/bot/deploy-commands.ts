import { REST, Routes } from 'discord.js';
import { commands } from './commands';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
    console.error("Missing DISCORD_TOKEN or CLIENT_ID in .env");
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

export const deployCommands = async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        const commandData = Array.from(commands.values()).map(c => c.data.toJSON());

        if (process.env.GUILD_ID) {
            console.log(`Deploying to specific guild: ${process.env.GUILD_ID}`);
            await rest.put(
                Routes.applicationGuildCommands(clientId, process.env.GUILD_ID),
                { body: commandData },
            );
        } else {
            console.log('Deploying globally (may take 1 hour to propagate)...');
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commandData },
            );
        }

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
};

// Auto-execute if run directly
if (require.main === module) {
    deployCommands();
}

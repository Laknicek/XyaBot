import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { ExtendedClient } from './types';
import { commands } from './commands';
import * as ready from './events/ready';
import * as messageCreate from './events/messageCreate';
import * as interactionCreate from './events/interactionCreate';
import * as voiceStateUpdate from './events/voiceStateUpdate';
import * as guildMemberAdd from './events/guildMemberAdd';
import * as messageReactionAdd from './events/messageReactionAdd';
import * as guildCreate from './events/guildCreate';

export const setupClient = (): ExtendedClient => {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessageReactions
        ],
        partials: [Partials.Channel, Partials.Message, Partials.Reaction]
    }) as ExtendedClient;

    client.commands = commands;

    console.log(`[System] Registering events...`);
    console.log(`[System] Events.GuildCreate: ${guildCreate.name}`);

    client.once(ready.name, (...args) => ready.execute(...args));
    client.on(messageCreate.name, (...args) => messageCreate.execute(...args));
    client.on(interactionCreate.name, (...args) => interactionCreate.execute(...args));
    client.on(voiceStateUpdate.name, (...args) => voiceStateUpdate.execute(...args));
    client.on(guildMemberAdd.name, (...args) => (guildMemberAdd as any).execute(...args));
    client.on(messageReactionAdd.name, (...args) => (messageReactionAdd as any).execute(...args));

    // Explicitly log registration of guildCreate
    if (guildCreate.name && guildCreate.execute) {
        client.on(guildCreate.name, (...args) => {
            console.log(`[Event] GuildCreate triggered!`);
            guildCreate.execute(...args);
        });
        console.log(`[System] Registered guildCreate handler.`);
    } else {
        console.error(`[System] ❌ FAILED to register guildCreate. Name: ${guildCreate.name}, Execute: ${!!guildCreate.execute}`);
    }

    return client;
};

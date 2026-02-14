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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupClient = void 0;
const discord_js_1 = require("discord.js");
const commands_1 = require("./commands");
const ready = __importStar(require("./events/ready"));
const messageCreate = __importStar(require("./events/messageCreate"));
const interactionCreate = __importStar(require("./events/interactionCreate"));
const voiceStateUpdate = __importStar(require("./events/voiceStateUpdate"));
const guildMemberAdd = __importStar(require("./events/guildMemberAdd"));
const messageReactionAdd = __importStar(require("./events/messageReactionAdd"));
const guildCreate = __importStar(require("./events/guildCreate"));
const setupClient = () => {
    const client = new discord_js_1.Client({
        intents: [
            discord_js_1.GatewayIntentBits.Guilds,
            discord_js_1.GatewayIntentBits.GuildMessages,
            discord_js_1.GatewayIntentBits.MessageContent,
            discord_js_1.GatewayIntentBits.GuildVoiceStates,
            discord_js_1.GatewayIntentBits.GuildMembers,
            discord_js_1.GatewayIntentBits.GuildMessageReactions
        ],
        partials: [discord_js_1.Partials.Channel, discord_js_1.Partials.Message, discord_js_1.Partials.Reaction]
    });
    client.commands = commands_1.commands;
    console.log(`[System] Registering events...`);
    console.log(`[System] Events.GuildCreate: ${guildCreate.name}`);
    client.once(ready.name, (...args) => ready.execute(...args));
    client.on(messageCreate.name, (...args) => messageCreate.execute(...args));
    client.on(interactionCreate.name, (...args) => interactionCreate.execute(...args));
    client.on(voiceStateUpdate.name, (...args) => voiceStateUpdate.execute(...args));
    client.on(guildMemberAdd.name, (...args) => guildMemberAdd.execute(...args));
    client.on(messageReactionAdd.name, (...args) => messageReactionAdd.execute(...args));
    // Explicitly log registration of guildCreate
    if (guildCreate.name && guildCreate.execute) {
        client.on(guildCreate.name, (...args) => {
            console.log(`[Event] GuildCreate triggered!`);
            guildCreate.execute(...args);
        });
        console.log(`[System] Registered guildCreate handler.`);
    }
    else {
        console.error(`[System] ❌ FAILED to register guildCreate. Name: ${guildCreate.name}, Execute: ${!!guildCreate.execute}`);
    }
    return client;
};
exports.setupClient = setupClient;

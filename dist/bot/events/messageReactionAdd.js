"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.once = exports.name = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
exports.name = discord_js_1.Events.MessageReactionAdd;
exports.once = false;
// Reactions Xya responds to and her possible responses
const REACTION_RESPONSES = {
    '❤️': ['aww ty 💕', 'ur sweet 🥺', '💕'],
    '😂': ['lmao glad that was funny', 'hehe 😂', 'ur laughing at me fr 💀'],
    '😭': ['nooo dont cry 🥺', 'same tbh 😭', 'its ok bestie'],
    '🔥': ['tyy 🔥', 'ikr 💅', 'we stay winning'],
    '👀': ['whattt 👀', 'u saw nothing', '👀👀'],
    '💀': ['LMAO', 'im dead too 💀', 'nahh fr'],
    '🥺': ['awww 🥺', 'stoppp ur gonna make me cry', '💕'],
    '👍': ['ty!', '😊', 'glad u agree'],
    '✨': ['sparkles!! ✨', 'tysm ✨', '💖'],
};
// 15% chance to respond to a reaction
const REACTION_CHANCE = 0.15;
async function execute(reaction, user) {
    try {
        // Fetch partial reactions/messages
        if (reaction.partial)
            await reaction.fetch();
        if (reaction.message.partial)
            await reaction.message.fetch();
        // Only respond to reactions on XYA's messages
        if (reaction.message.author?.id !== reaction.message.client.user?.id)
            return;
        // Don't respond to own reactions
        if (user.id === reaction.message.client.user?.id)
            return;
        // Check if this emoji has responses
        const emoji = reaction.emoji.name || '';
        const responses = REACTION_RESPONSES[emoji];
        if (!responses)
            return;
        // Random chance to respond
        if (Math.random() > REACTION_CHANCE)
            return;
        // Pick a random response
        const response = responses[Math.floor(Math.random() * responses.length)];
        // Send as a reply to the reacted message
        await reaction.message.reply(response);
    }
    catch (error) {
        // Silently ignore — reaction responses are non-critical
    }
}

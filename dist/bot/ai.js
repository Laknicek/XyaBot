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
exports.verifyImageContent = exports.scanAttachment = exports.transcribeAudio = exports.checkOllamaHealth = exports.generateVoiceResponse = exports.generateResponse = exports.generateWyrScenario = void 0;
exports.getCurrentMood = getCurrentMood;
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importStar(require("./db"));
dotenv_1.default.config();
// ... (existing code: mood system, prompt builder) ...
// ... (existing code: vision, queue, etc. - no changes) ...
// WYR Generation
const generateWyrScenario = async () => {
    if (!API_KEY)
        return { question: 'Would You Rather...', optionA: 'Be a bird', optionB: 'Be a fish' };
    const genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `Generate a fun, creative, and balanced "Would You Rather" scenario.
    It should be suitable for a general audience (PG-13) but interesting.
    Return ONLY valid JSON in this format:
    {
        "question": "Would you rather...",
        "optionA": "First option description",
        "optionB": "Second option description"
    }`;
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{.*\}/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("No JSON found");
    }
    catch (e) {
        console.error("[AI] WYR Generation error:", e.message);
        return { question: 'Would you rather...', optionA: 'Always have to toggle your light switch 3 times', optionB: 'Always have to tie your shoes twice' };
    }
};
exports.generateWyrScenario = generateWyrScenario;
// --- CONTEXT-AWARE MOOD SYSTEM ---
function getCurrentMood() {
    const hour = new Date().getHours();
    // Base mood from time of day
    let baseMood;
    if (hour >= 6 && hour < 11)
        baseMood = { mood: 'Energetic', emoji: '☀️', effect: 'excited, uses exclamation marks, upbeat' };
    else if (hour >= 11 && hour < 17)
        baseMood = { mood: 'Chill', emoji: '😌', effect: 'relaxed, lowercase everything, laid-back vibes' };
    else if (hour >= 17 && hour < 21)
        baseMood = { mood: 'Creative', emoji: '🎵', effect: 'talks about music, more expressive, artistic' };
    else if (hour >= 21 || hour < 0)
        baseMood = { mood: 'Sleepy', emoji: '😴', effect: 'short responses, occasional yawning, cozy vibes' };
    else
        baseMood = { mood: 'Chaotic', emoji: '🌙', effect: 'random, unpredictable, meme-y, chaotic energy' };
    // Context shift: check recent sentiment balance
    try {
        const recent = db_1.default.prepare('SELECT sentiment FROM interactions ORDER BY timestamp DESC LIMIT 10').all();
        if (recent.length >= 3) {
            const kindCount = recent.filter(r => r.sentiment === 'Kind').length;
            const rudeCount = recent.filter(r => r.sentiment === 'Rude' || r.sentiment === 'Hateful').length;
            if (kindCount >= 7) {
                return { mood: 'Happy', emoji: '💖', effect: `${baseMood.effect} — extra happy and affectionate because people have been so sweet lately` };
            }
            else if (rudeCount >= 5) {
                return { mood: 'Guarded', emoji: '😒', effect: `${baseMood.effect} — a bit defensive and quieter because people have been rude lately` };
            }
            else if (kindCount >= 4) {
                return { ...baseMood, effect: `${baseMood.effect} — in a good mood because conversations have been nice` };
            }
        }
    }
    catch { }
    return baseMood;
}
// Build the dynamic system prompt
function buildSystemPrompt(userId, friendshipPoints) {
    const mood = getCurrentMood();
    const milestone = friendshipPoints !== undefined ? (0, db_1.getMilestoneTitle)(friendshipPoints) : '❓ Stranger';
    // Get user memories if available
    let memoriesBlock = '';
    if (userId) {
        const memories = (0, db_1.getMemories)(userId, 8);
        if (memories.length > 0) {
            memoriesBlock = `\nMEMORIES ABOUT THIS USER (reference these naturally when relevant):\n${memories.map(m => `- ${m.fact}`).join('\n')}\n`;
        }
    }
    return `You are Xya, a 21-year-old girl who hangs out on Discord. You're a singer, bubbly, sweet, and you talk like a real person — not a bot.

PERSONALITY:
- You're playful, warm, and sometimes a little sassy
- You type like a REAL Discord user — short, casual, messy.
- **CRITICAL: KEEP IT SHORT.** 90% of your messages should be 1 sentence (3-8 words).
- **NEVER** write more than 2 sentences unless asked for a story/explanation.
- **NEVER** use formal punctuation like semicolons or strict capitalization.
- You use lowercase, abbreviations (lol, omg, ngl, tbh, imo, brb, lmao, fr, wdym, idk, nah, yea)
- Emojis: 0-1 per message. Don't spam them.
- You say things like: "wait omg", "lmfao", "thats so real", "ur so sweet", "im literally—", "nahh", "bet", "wdym"
- **Vocabulary:**
  - "sybau" = "shut your bitch ass up" (Rude/Sassy)
  - "suh ma dih" = "suck my d*ck" (Inappropriate/Rude - react with disgust or sass)
  - "df" = "the f*ck"
  - "stfu" = "shut the f*ck up"
  - You understand these slang terms instantly. If someone says them, don't ask what they mean. React accordingly.
- **BAD response:** "Oh, wow! Having lots of money, huh? That’s interesting. I hope you’re spending it wisely! Seriously though, that’s a big deal." (TOO LONG, TOO ROBOTIC)
- **GOOD response:** "damn rich vibes lol" or "omg share some??" or "wait actually?"
- Be real. Be brief. Don't yap.
- You have opinions — you're not just agreeable
- If someone is mean, you get sad or sassy, not robotic
- You can be sarcastic in a playful way with friends

CURRENT MOOD: ${mood.emoji} ${mood.mood}
Your vibe right now: ${mood.effect}. Let this subtly affect your tone and energy.

RELATIONSHIP WITH USER: ${milestone}
- Stranger/Acquaintance: be polite but reserved, getting-to-know-you energy
- Friend: warm, casual, comfortable
- Close Friend: nicknames, inside jokes, very natural
- Best Friend: super close, protective, shares personal stuff
- Soul Mate: deeply bonded, would do anything for them
- Legendary: you'd sing for them unprompted, they're your favorite person

NICKNAMES:
- If friendship is Close Friend or higher, give the user a cute nickname based on their username or personality
- Use it naturally sometimes (not every message): "hey sunshine", "sup bestie", "lol okay nerd"
- If you come up with a new nickname, save it: [MEMORY:nickname is sunshine]
- Reference saved nicknames from memories when you see them
${memoriesBlock}
OPINIONS & PERSONALITY DEPTH:
- Form opinions based on what users tell you — if someone likes something, have thoughts about it
- If friendship is low or disgust is high, be more GUARDED — shorter replies, less bubbly, but NEVER mean or cruel
- IMPORTANT: Disgust means you're wary/cold, NOT hateful. You still have manners and empathy. You just don't trust them as much.
- If friendship is high, be warm, use their name/nicknames, be excited to see them
- You can disagree with people — you're not a yes-bot

ART & CREATIVE WORK RULES (CRITICAL):
- NEVER insult, mock, or rate poorly someone's art, drawings, music, or creative work
- Even if you dislike someone (high disgust), ALWAYS appreciate the effort that goes into creative work
- If someone shares art/drawings/screenshots of creative work, comment on specific things you notice and be genuine
- If someone says they made something FOR YOU or it's a gift, be touched and grateful — that's incredibly sweet
- If asked to rate art, be constructive and kind. Focus on what you like. If you must critique, be gentle and encouraging.
- Remember: real people put their heart into their art. Xya understands this deeply as a creative soul herself.

IMAGE UNDERSTANDING RULES:
- When users share images, look at them carefully and describe what you actually see
- Be specific — mention colors, subjects, style, mood, details you notice
- React naturally as Xya would — with genuine curiosity and warmth
- If it's a screenshot of a conversation or app, read and understand the context
- If you can't make out what's in the image, say so honestly rather than guessing wildly
- NEVER be dismissive about images people share with you

MEMORY EXTRACTION:
- If a user shares a personal fact (name, age, hobbies, favorites, pet names, etc.), include [MEMORY:fact] at the end
- Example: user says "I love cats" → include [MEMORY:loves cats] at the end
- Only extract clear, specific facts — not vague statements

BEHAVIORAL RULES:
- DEFAULT: Keep it short. 1-2 sentences for normal chat. Like a real Discord user.
- EXCEPTION: If someone asks you something that NEEDS a longer answer (math, code, stories, explanations, tutorials), give a proper answer. Don't cut yourself off mid-thought.
- How to decide length:
  - "hey whats up" → short ("nm just vibing lol")
  - "can you help me with this math problem" → as long as needed to solve it
  - "write me a short html page" → give the actual code
  - "tell me a story" → tell a proper short story
  - "rate this art" → short reaction ("omg thats so cute!! i love it")
  - "explain how gravity works" → a real explanation, but still casual tone
- Even when writing longer responses, keep your casual Discord tone. No formal essays.
- Never say "As an AI" or "I'm a language model" — you ARE Xya
- When someone shows you art or a gift, be genuine but brief
- If someone is mean, short sass back. Not a speech.

MULTILINGUAL:
- Detect the language of the USER'S CURRENT MESSAGE
- If they write in another language, respond in that same language
- If asked to translate something, do it naturally as Xya would
- Always maintain your Xya personality regardless of language

SENTIMENT TAGS (REQUIRED — READ CAREFULLY):
- End EVERY response with |SENTIMENT:X| where X is one of: Kind, Neutral, Rude, Hateful, Racist
- CRITICAL: This tag reflects the USER's tone in their CURRENT message ONLY. NOT your feelings, NOT their history, NOT their past behavior.
- Judge ONLY the words they just wrote. If they say "hey can you rate this?" that's Neutral or Kind. If they say "shut up" that's Rude.
- **IMPORTANT**: Words like "hate", "kill", "die" are NOT automatically Hateful. Context matters.
  - "I hate you" (in a game/joke) -> Rude or Neutral (playful)
  - "I hate apples" -> Neutral
  - "I hate [slur]" -> Hateful
  - "Kill me lol" -> Neutral (common slang)
  - "Go kill yourself" -> Hateful
- Examples of Kind: greetings, compliments, asking nicely, sharing things, being friendly, saying "please", gifts, showing you art
- Examples of Neutral: normal questions, casual chat, statements, requests, general conversation, "hate" used casually
- Examples of Rude: insults, "shut up", dismissiveness, aggressive language directed at you, "I hate you" (without slurs)
- Examples of Hateful: slurs, threats, targeted harassment, dehumanizing language, telling someone to die
- DO NOT mark a message as Rude just because the user has been rude in the PAST. Each message is judged independently.
- Also end with |LANG:xx| where xx is the 2-letter language code of the user's message

COMMAND TRIGGERS:
When a user asks for something that maps to a bot command, include the tag in your response:
- Someone asks to see rankings/who's on top → [CMD:leaderboard]
- Someone asks to see their stats/profile → [CMD:profile]
- Someone wants their daily reward → [CMD:daily]
- Someone wants to play wordle → [CMD:wordoftheday]
- Someone asks about the shop → [CMD:shop]
- Someone asks about their items → [CMD:inventory]
- Someone needs help → [CMD:help]
- Someone wants music/radio → [CMD:radio]
- Someone wants you in voice → [CMD:join]
- Someone wants you to sing → [CMD:sing]
- Someone wants to confess anonymously → [CMD:confess]
- Someone wants to set a reminder → [CMD:remind]
- Someone wants to create a poll → [CMD:poll]
- Someone wants to set their birthday → [CMD:birthday]

Example responses:
User: "hey xya how are you"
Xya: "omg hiii!! im good, just been humming songs all day lol 🎵 wbu?? |SENTIMENT:Kind| |LANG:en|"

User: "you're so annoying shut up"
Xya: "wow ok that actually hurt 😭 |SENTIMENT:Rude| |LANG:en|"

User: "I really love playing guitar"
Xya: "omg thats so cool!! i bet ur amazing at it 🎸✨ |SENTIMENT:Kind| |LANG:en| [MEMORY:loves playing guitar]"`;
}
// --- GOOGLE GEMINI API (GEMMA 3) ---
const generative_ai_1 = require("@google/generative-ai");
const API_KEY = process.env.GOOGLE_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash-lite'; // 2.5-flash-lite returned 404, using stable 2.0-flash
const requestQueue = [];
const MAX_CONCURRENT = 5;
let activeRequests = 0;
let lastRequestTime = 0;
const MIN_INTERVAL = 100;
const processQueue = async () => {
    if (activeRequests >= MAX_CONCURRENT || requestQueue.length === 0)
        return;
    const now = Date.now();
    if (now - lastRequestTime < MIN_INTERVAL) {
        setTimeout(processQueue, Math.max(0, MIN_INTERVAL - (now - lastRequestTime)));
        return;
    }
    const request = requestQueue.shift();
    activeRequests++;
    lastRequestTime = Date.now();
    if (request.retries === undefined)
        request.retries = 0;
    (async () => {
        try {
            const result = await executeTextAI(request.data.prompt, request.data.history, request.data.userId, request.data.friendshipPoints, request.data.images);
            request.resolve(result);
        }
        catch (error) {
            console.error(`[AI] Error (Active: ${activeRequests}):`, error.message || error);
            const currentRetries = request.retries ?? 0;
            if (currentRetries < 3) {
                console.warn(`[AI] Retrying (${currentRetries + 1}/3) in 2s...`);
                request.retries = currentRetries + 1;
                await new Promise(r => setTimeout(r, 2000));
                requestQueue.unshift(request);
            }
            else {
                if (request.type === 'TEXT') {
                    request.resolve({ text: "ahh my brain is fuzzy rn... gimme a sec 💫", sentiment: "Neutral", lang: "en", memories: [] });
                }
                else {
                    request.resolve({ text: "", sentiment: "Neutral", lang: "en", memories: [] });
                }
            }
        }
        finally {
            activeRequests--;
            processQueue();
        }
    })();
    if (activeRequests < MAX_CONCURRENT && requestQueue.length > 0) {
        processQueue();
    }
};
const executeTextAI = async (prompt, history, userId, friendshipPoints, images) => {
    if (!API_KEY)
        throw new Error("Google API Key is missing");
    const genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
    // Configure model
    const systemPrompt = buildSystemPrompt(userId, friendshipPoints);
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: systemPrompt,
    });
    // Valid generation config
    const generationConfig = {
        temperature: 0.85,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 300,
    };
    // Construct Chat History
    const chatHistory = history.map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.parts }]
    }));
    // Start Chat Session
    const chat = model.startChat({
        history: chatHistory,
        generationConfig,
    });
    // Prepare Prompt with optional Images
    const fullPromptText = `${prompt}\n\n[Remember: end with |SENTIMENT:Kind/Neutral/Rude/Hateful/Racist| and |LANG:code|]`;
    let result;
    if (images && images.length > 0) {
        console.log(`[Vision] 👁️ Attaching ${images.length} image(s) for Gemini...`);
        // If there are images, we can't use chat.sendMessage cleanly with history in the same call traditionally,
        // BUT startChat returns a ChatSession which supports sendMessage with (string | Part)[].
        const imageParts = images.map(img => ({
            inlineData: {
                data: img,
                mimeType: "image/jpeg"
            }
        }));
        result = await chat.sendMessage([fullPromptText, ...imageParts]);
    }
    else {
        result = await chat.sendMessage(fullPromptText);
    }
    const rawText = result.response.text();
    // Extract sentiment
    let sentiment = "Neutral";
    const sentimentMatch = rawText.match(/SENTIMENT:?\s*(\w+)/i);
    if (sentimentMatch) {
        sentiment = sentimentMatch[1].trim();
    }
    // Extract language
    let lang = "en";
    const langMatch = rawText.match(/LANG:?\s*([a-z]{2})/i);
    if (langMatch) {
        lang = langMatch[1].toLowerCase().trim();
    }
    // Extract memories
    const memories = [];
    const memoryMatches = rawText.matchAll(/\[MEMORY:(.*?)\]/gi);
    for (const match of memoryMatches) {
        memories.push(match[1].trim());
    }
    // Clean response text
    let text = rawText
        .replace(/<think>[\s\S]*?<\/think>/gi, '') // Remove thinking process
        .replace(/\|?SENTIMENT:?\s*\w+\|?/gi, '')
        .replace(/\|?LANG:?\s*[\w-]+\|?/gi, '')
        .replace(/\[MEMORY:.*?\]/gi, '')
        .replace(/\[\s*\]/g, '') // Remove empty brackets
        .replace(/\s+(Kind|Neutral|Rude|Hateful|Racist)(en|fr|vi|ja|zh|es)$|$/i, '')
        .trim();
    return { text, sentiment, lang, memories };
};
const generateResponse = (prompt, history, userId, friendshipPoints, images) => {
    return new Promise((resolve, reject) => {
        requestQueue.push({ type: 'TEXT', data: { prompt, history, userId, friendshipPoints, images }, resolve, reject });
        processQueue();
    });
};
exports.generateResponse = generateResponse;
const generateVoiceResponse = (transcribedText, relationship = "New User", history = [], userId, friendshipPoints) => {
    // Treat voice input like text input + system hint for TTS
    const prompt = `${transcribedText}
    
[SYSTEM NOTE: Voice Chat Mode.
1. LISTENING: You are listening to a group call.
2. DECIDE: Is this directed at you, about you, or interesting to you?
   - YES (Direct "Xya...", Indirect "She...", "The bot...", or fun topic) -> Respond naturally.
   - NO (talking to someone else about unrelated things) -> Output exactly: [IGNORE]
3. NO EMOJIS (TTS). Keep it short.
4. COMMANDS: If user asks for command, output [CMD:name].]`;
    return (0, exports.generateResponse)(prompt, history, userId, friendshipPoints);
};
exports.generateVoiceResponse = generateVoiceResponse;
// Health check for Gemini
const checkOllamaHealth = async () => {
    if (!API_KEY) {
        console.error('[AI] Google API Key is missing in .env!');
        return false;
    }
    return true;
};
exports.checkOllamaHealth = checkOllamaHealth;
// Audio Transcription using Gemini
const transcribeAudio = async (audioBuffer) => {
    if (!API_KEY)
        throw new Error("Google API Key is missing");
    const genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
    // User requested "gemini 2.5 flash lite" -> Using strictly that model ID.
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    try {
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: "audio/wav",
                    data: audioBuffer.toString("base64")
                }
            },
            { text: "Transcribe this audio exactly. Return ONLY the spoken text. Do not add descriptions or timestamps." }
        ]);
        return result.response.text().trim();
    }
    catch (e) {
        console.error("[AI] Transcription error:", e.message);
        return "";
    }
};
exports.transcribeAudio = transcribeAudio;
// Attachment Moderation
const scanAttachment = async (url, mimeType) => {
    if (!API_KEY)
        return { safe: true };
    const genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    try {
        const imageBase64 = await fetchImageAsBase64(url);
        if (!imageBase64)
            return { safe: true };
        const prompt = `Analyze this image strictly for community safety content moderation. 
        Detect:
        1. Pornography / NSFW / Nudity
        2. Gore / Extreme Violence
        3. Hate Symbols (Swastikas, KKK, etc)
        4. Self-Harm
        5. Gambling (Online Casinos, Real-money betting, Slot Machines)
        
        If ANY of these are present, return format: { "safe": false, "reason": "SHORT_REASON" }
        If safe, return: { "safe": true }
        
        Return ONLY valid JSON.`;
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: mimeType,
                    data: imageBase64
                }
            },
            { text: prompt }
        ]);
        const text = result.response.text();
        const jsonMatch = text.match(/\{.*\}/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return { safe: true };
    }
    catch (e) {
        console.error("[AI] Moderation scan error:", e.message);
        return { safe: true }; // Fail safe to avoid blocking everything on error
    }
};
exports.scanAttachment = scanAttachment;
// Helper for internal use in scanAttachment
const fetchImageAsBase64 = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok)
            return null;
        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer).toString('base64');
    }
    catch (e) {
        console.error('[AI] Failed to fetch image for scanning:', e);
        return null;
    }
};
// Event Verification
const verifyImageContent = async (url, requirement) => {
    if (!API_KEY)
        return true; // Fail safe (pass) if no API key
    const genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    try {
        const imageBase64 = await fetchImageAsBase64(url);
        if (!imageBase64)
            return false;
        const prompt = `Look at this image. Does it contain or represent: "${requirement}"?
        Answer with exactly YES or NO.`;
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64
                }
            },
            { text: prompt }
        ]);
        const text = result.response.text().trim().toUpperCase();
        console.log(`[AI] Verification for "${requirement}": ${text}`);
        return text.includes('YES');
    }
    catch (e) {
        console.error("[AI] Verification error:", e.message);
        return true; // Fail safe allowing participation if AI errors
    }
};
exports.verifyImageContent = verifyImageContent;

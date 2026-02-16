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
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const https = __importStar(require("https"));
const os = __importStar(require("os"));
const COST = 1000;
const LORA_COST = 100;
const MAPPERATORINATOR_PATH = path.join(process.cwd(), 'Mapperatorinator');
const MAX_QUEUE_SIZE = 10;
const queue = [];
let isProcessing = false;
const getPythonPath = () => {
    if (process.platform === 'win32') {
        return path.join(MAPPERATORINATOR_PATH, '.venv', 'Scripts', 'python.exe');
    }
    else {
        return path.join(MAPPERATORINATOR_PATH, '.venv', 'bin', 'python');
    }
};
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('osu-map')
    .setDescription('Generate an osu! beatmap using AI (Costs 1000 Gems)')
    .addAttachmentOption(option => option.setName('audio')
    .setDescription('Upload the song (MP3/OGG/WAV)')
    .setRequired(true))
    .addNumberOption(option => option.setName('difficulty')
    .setDescription('Target Star Rating (e.g. 5.5)')
    .setMinValue(1)
    .setMaxValue(10)
    .setRequired(true))
    .addStringOption(option => option.setName('mode')
    .setDescription('Game Mode (Default: Standard)')
    .setRequired(false)
    .addChoices({ name: 'Standard (0)', value: '0' }, { name: 'Taiko (1)', value: '1' }, { name: 'Catch (2)', value: '2' }, { name: 'Mania (3)', value: '3' }))
    .addBooleanOption(option => option.setName('use_lora')
    .setDescription('Use "OliBomby/Mapperatorinator-v30-LoRA-2025" (+100 Gems)')
    .setRequired(false));
const execute = async (interaction) => {
    // --- CHECK SHOP ---
    const settings = (0, db_1.getGuildSetting)(interaction.guildId) || {};
    if (settings.shop_enabled === 0 || settings.shop_osu_enabled === 0) {
        return interaction.reply({ content: '🚫 The **Osu Mapping Shop** is currently closed.', flags: [discord_js_1.MessageFlags.Ephemeral] });
    }
    // --- CHECK QUEUE CAPACITY ---
    if (queue.length >= MAX_QUEUE_SIZE) {
        return interaction.reply({
            content: `🚫 **High Capacity!** The queue is currently full (${queue.length}/${MAX_QUEUE_SIZE}). Please try again later.`,
            flags: [discord_js_1.MessageFlags.Ephemeral]
        });
    }
    const audioFile = interaction.options.getAttachment('audio', true);
    const mode = interaction.options.getString('mode') || '0';
    const difficulty = interaction.options.getNumber('difficulty', true);
    const useLora = interaction.options.getBoolean('use_lora') || false;
    // --- GEM CHECK ---
    const totalCost = COST + (useLora ? LORA_COST : 0);
    const user = (0, db_1.getUser)(interaction.user.id, interaction.user.username);
    if (user.currency < totalCost) {
        return interaction.reply({
            content: `❌ You need **${totalCost.toLocaleString()} gems** to generate a map! You have **${user.currency.toLocaleString()}**.`,
            flags: [discord_js_1.MessageFlags.Ephemeral]
        });
    }
    // --- FILE VALIDATION ---
    const allowedTypes = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-wav'];
    if (!allowedTypes.includes(audioFile.contentType || '')) {
        return interaction.reply({ content: '❌ Invalid file type. Please upload an MP3, OGG, or WAV file.', flags: [discord_js_1.MessageFlags.Ephemeral] });
    }
    if (audioFile.size > 20 * 1024 * 1024) { // 20MB limit
        return interaction.reply({ content: '❌ File too large. Max 20MB.', flags: [discord_js_1.MessageFlags.Ephemeral] });
    }
    // --- DEDUCT GEMS & ENQUEUE ---
    (0, db_1.updateUser)(interaction.user.id, { currency: user.currency - totalCost });
    // Defer reply immediately so we can edit it later
    await interaction.deferReply({ flags: [discord_js_1.MessageFlags.Ephemeral] });
    const job = {
        id: interaction.id,
        userId: interaction.user.id,
        username: interaction.user.username,
        audioFile,
        mode,
        difficulty,
        useLora,
        interaction,
        cost: totalCost
    };
    queue.push(job);
    await interaction.editReply({
        content: `✅ **Added to Queue!**\nPosition: **${queue.length} / ${MAX_QUEUE_SIZE}**\nI'll notify you when your map starts generating. ⏳`
    });
    processQueue();
};
exports.execute = execute;
const processQueue = async () => {
    if (isProcessing || queue.length === 0)
        return;
    isProcessing = true;
    const job = queue.shift();
    if (!job) {
        isProcessing = false;
        return;
    }
    const { interaction, audioFile, difficulty, mode, useLora, id, userId, cost } = job;
    const user = (0, db_1.getUser)(userId, job.username); // Refresh user data just in case
    try {
        await interaction.editReply({
            content: `🎵 **Starting Output Generation...**\nPosition: **Processing**\nplease wait...`
        });
        const tempDir = path.join(process.cwd(), 'temp', `osu_${id}`);
        if (!fs.existsSync(tempDir))
            fs.mkdirSync(tempDir, { recursive: true });
        const audioPath = path.join(tempDir, audioFile.name);
        const outputPath = path.join(tempDir, 'output');
        if (!fs.existsSync(outputPath))
            fs.mkdirSync(outputPath, { recursive: true });
        // Download Audio
        await new Promise((resolve, reject) => {
            const fileStream = fs.createWriteStream(audioPath);
            https.get(audioFile.url, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Download failed: ${response.statusCode}`));
                    return;
                }
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve();
                });
            }).on('error', (err) => {
                fs.unlink(audioPath, () => { });
                reject(err);
            });
        });
        let lastUpdate = Date.now();
        let currentPhase = 'Initializing...';
        let progress = 0;
        const updateEmbed = async (phase, pct) => {
            const now = Date.now();
            if (now - lastUpdate < 3000 && pct < 100)
                return;
            lastUpdate = now;
            const filled = Math.round(pct / 10);
            const bar = '▓'.repeat(filled) + '░'.repeat(10 - filled);
            const ramUsed = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(1);
            const ramTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
            const cpuCount = os.cpus().length;
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle('🎵 Generating Osu! Beatmap...')
                .setColor(0xFF69B4)
                .addFields({ name: 'Target', value: `${difficulty}⭐ ${['Std', 'Taiko', 'CtB', 'Mania'][parseInt(mode)]}`, inline: true }, { name: 'BPM', value: `${bpm}`, inline: true }, { name: 'Queue', value: `${queue.length} waiting`, inline: true }, { name: 'Map Stats', value: `CS${stats.cs} AR${stats.ar} OD${stats.od} HP${stats.hp}`, inline: false }, { name: 'System', value: `🖥️ CPU: ${cpuCount} Cores | 🧠 RAM: ${ramUsed}/${ramTotal} GB`, inline: false }, { name: 'Progress', value: `\`[${bar}] ${pct}%\`\n*${phase}*` })
                .setFooter({ text: 'Powered by Mapperatorinator (GPU implementation pending)' });
            await interaction.editReply({
                content: '',
                embeds: [embed]
            }).catch(() => { });
        };
        // --- PRE-PROCESSING: BPM & SETTINGS ---
        let bpm = 120;
        try {
            await updateEmbed('Detecting BPM...', 0);
            const bpmProcess = (0, child_process_1.spawn)(getPythonPath(), ['detect_bpm.py', audioPath], { cwd: MAPPERATORINATOR_PATH });
            bpm = await new Promise((resolve) => {
                let data = '';
                bpmProcess.stdout.on('data', chunk => data += chunk.toString());
                bpmProcess.on('close', () => {
                    const detected = parseInt(data.trim());
                    resolve(isNaN(detected) ? 120 : detected);
                });
                bpmProcess.on('error', () => resolve(120));
            });
            console.log(`[OSU] Detected BPM: ${bpm}`);
        }
        catch (e) {
            console.error('BPM Detection failed', e);
        }
        // Calculate Metadata based on Difficulty (Star Rating) with Randomized Ranges
        const getRandom = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));
        const calculateStats = (stars) => {
            const tier = Math.round(Math.max(1, Math.min(10, stars)));
            switch (tier) {
                case 1: return {
                    cs: getRandom(2.0, 3.0), ar: getRandom(2.0, 4.0), od: getRandom(1.0, 3.0), hp: getRandom(1.0, 2.0)
                };
                case 2: return {
                    cs: getRandom(3.0, 3.5), ar: getRandom(4.0, 6.0), od: getRandom(3.0, 5.0), hp: getRandom(3.0, 4.0)
                };
                case 3: return {
                    cs: getRandom(3.5, 4.0), ar: getRandom(7.0, 8.0), od: getRandom(5.0, 7.0), hp: getRandom(4.0, 5.0)
                };
                case 4: return {
                    cs: getRandom(3.8, 4.2), ar: getRandom(8.0, 9.2), od: getRandom(7.0, 8.5), hp: getRandom(5.0, 6.0)
                };
                case 5: return {
                    cs: getRandom(4.0, 4.5), ar: getRandom(9.0, 9.5), od: getRandom(8.0, 9.0), hp: getRandom(5.5, 6.5)
                };
                case 6: return {
                    cs: getRandom(4.0, 5.0), ar: getRandom(9.2, 9.6), od: getRandom(8.5, 9.5), hp: getRandom(6.0, 7.0)
                };
                case 7: return {
                    cs: getRandom(4.2, 5.2), ar: getRandom(9.5, 10.0), od: getRandom(9.0, 9.8), hp: getRandom(6.5, 8.0)
                };
                case 8: return {
                    cs: getRandom(4.5, 5.5), ar: getRandom(9.8, 10.0), od: getRandom(9.5, 10.0), hp: getRandom(7.0, 8.5)
                };
                case 9: return {
                    cs: getRandom(4.5, 6.0), ar: 10.0, od: getRandom(9.8, 10.0), hp: getRandom(8.0, 9.0)
                };
                case 10: return {
                    cs: getRandom(5.0, 7.0), ar: 10.0, od: 10.0, hp: getRandom(9.0, 10.0)
                };
                default: return { cs: 4, ar: 9, od: 8, hp: 6 }; // Fallback
            }
        };
        const stats = calculateStats(difficulty);
        // --- BUILD ARGS ---
        // When shell: false (default), do NOT quote arguments.
        // Use ++ for optional args to ensure Hydra overrides defaults
        const args = [
            'inference.py',
            `++audio_path=${audioPath}`,
            `++output_path=${outputPath}`,
            `++gamemode=${mode}`,
            `++difficulty=${difficulty}`,
            `++seed=${Math.floor(Math.random() * 100000)}`,
            '++mapper_id=0',
            '++cfg_scale=1',
            // Remove start_time/end_time so they default to None (Full Song)
            // Enhanced Settings
            `++bpm=${bpm}`,
            `++circle_size=${stats.cs}`,
            `++approach_rate=${stats.ar}`,
            `++overall_difficulty=${stats.od}`,
            `++hp_drain_rate=${stats.hp}`,
            // Export as .osz
            '++export_osz=True'
        ];
        if (useLora) {
            const loraPath = path.join(MAPPERATORINATOR_PATH, 'lora', 'v30');
            args.push(`++lora_path=${loraPath}`);
        }
        console.log(`Running Osu Inference [Queue ${queue.length}]: ${getPythonPath()} ${args.join(' ')}`);
        await updateEmbed('Preparing environment...', 0);
        await new Promise((resolve, reject) => {
            const child = (0, child_process_1.spawn)(getPythonPath(), args, { cwd: MAPPERATORINATOR_PATH, shell: false });
            let errorOutput = '';
            let fullLog = '';
            const log = (str) => {
                fullLog += str + '\n';
                console.log(`[OSU] ${str.trim()}`);
            };
            child.stdout.on('data', (data) => {
                const str = data.toString();
                fullLog += str; // Don't double newline
                // console.log(`[OSU] ${str}`); // Keep console clean-ish
            });
            child.stderr.on('data', async (data) => {
                const str = data.toString();
                fullLog += str;
                errorOutput += str;
                const pctMatch = str.match(/(\d+)%/);
                if (pctMatch) {
                    const pct = parseInt(pctMatch[1]);
                    if (pct > progress)
                        progress = pct;
                    await updateEmbed(currentPhase, progress);
                }
                if (str.includes('Generating timing'))
                    currentPhase = 'Generating Timing...';
                if (str.includes('Generating events'))
                    currentPhase = 'Generating Hit Objects...';
                if (str.includes('Refining'))
                    currentPhase = 'Refining Positions...';
            });
            child.on('close', async (code) => {
                // Save Log File
                const logPath = path.join(tempDir, 'generation_log.txt');
                fs.writeFileSync(logPath, fullLog);
                if (code !== 0) {
                    console.error(`Osu process exited with code ${code}`);
                    // Reject logic with log attachment
                    const errorMsg = `Process exited with code ${code}`;
                    // We can't easily reject with a file attachment in the current try/catch structure 
                    // so we editReply here and then resolve/reject?
                    // Actually, let's just reject and handle the log sending in catch block if possible?
                    // Or handle it here.
                    await interaction.editReply({
                        content: `❌ **Generation Failed (Code ${code})**\nSee attached log for details.`,
                        files: [logPath]
                    });
                    (0, db_1.updateUser)(userId, { currency: user.currency }); // Refund manually here as we handled the reply
                    // Refresh user balance for adding back cost
                    const currentUser = (0, db_1.getUser)(userId, job.username);
                    (0, db_1.updateUser)(userId, { currency: currentUser.currency + cost });
                    resolve(); // Resolve because we handled it
                    return;
                }
                await updateEmbed('Finalizing...', 100);
                // Find .osz file
                // Recurse to find .osz
                const findOsz = (dir) => {
                    if (!fs.existsSync(dir))
                        return null;
                    const files = fs.readdirSync(dir);
                    for (const file of files) {
                        const fullPath = path.join(dir, file);
                        const stat = fs.statSync(fullPath);
                        if (stat.isDirectory()) {
                            const found = findOsz(fullPath);
                            if (found)
                                return found;
                        }
                        else if (file.endsWith('.osz')) {
                            return fullPath;
                        }
                    }
                    return null;
                };
                const oszPath = findOsz(outputPath);
                if (oszPath) {
                    try {
                        const resultEmbed = new discord_js_1.EmbedBuilder()
                            .setTitle(`✅ Beatmap Generated: ${difficulty}⭐`)
                            .setDescription(`Your osu! map is ready! Download the attached **.osz** file and open it to play.`)
                            .setColor(0x00FF00)
                            .addFields({ name: 'Stats', value: `CS${stats.cs} AR${stats.ar} OD${stats.od} HP${stats.hp}`, inline: true }, { name: 'BPM', value: `${bpm}`, inline: true })
                            .setFooter({ text: 'Enjoy clicking circles!' });
                        await interaction.user.send({
                            embeds: [resultEmbed],
                            files: [oszPath]
                        });
                        await interaction.editReply({
                            content: `✅ **Done!** Sent to your DMs!`,
                            embeds: [],
                            files: []
                        });
                    }
                    catch (dmError) {
                        console.error('Failed to DM osz:', dmError);
                        const resultEmbed = new discord_js_1.EmbedBuilder()
                            .setTitle(`✅ Beatmap Generated: ${difficulty}⭐`)
                            .setDescription(`I couldn't DM you, so here it is!`)
                            .setColor(0x00FF00)
                            .addFields({ name: 'Stats', value: `CS${stats.cs} AR${stats.ar} OD${stats.od} HP${stats.hp}`, inline: true }, { name: 'BPM', value: `${bpm}`, inline: true });
                        await interaction.editReply({
                            content: '',
                            embeds: [resultEmbed],
                            files: [oszPath]
                        });
                    }
                }
                else {
                    await interaction.editReply({
                        content: `❌ **Generation finished but no .osz file was found.**\nSee log for details.`,
                        files: [logPath]
                    });
                    // Refund
                    const currentUser = (0, db_1.getUser)(userId, job.username);
                    (0, db_1.updateUser)(userId, { currency: currentUser.currency + cost });
                }
                // Cleanup
                setTimeout(() => { try {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                }
                catch { } }, 10000);
                resolve();
            });
            child.on('error', (err) => {
                reject(err);
            });
        });
    }
    catch (error) {
        // If we rejected manually above, this catch block might be redundant or skipped.
        // But if spawning failed etc:
        console.error("Job failed:", error);
        // Only refund if we haven't already (hard to track, but safe to check if error thrown)
        // Since we resolved above for code!=0, this catch is for other errors.
        // Refresh user to get current balance then add cost
        const currentUser = (0, db_1.getUser)(userId, job.username);
        (0, db_1.updateUser)(userId, { currency: currentUser.currency + cost });
        const errorMsg = error.message.length > 800 ? error.message.substring(error.message.length - 800) : error.message;
        await interaction.editReply({
            content: `❌ **Job Failed.** Gems have been refunded.\n**Reason:**\n\`\`\`${errorMsg}\`\`\``
        }).catch(() => { });
        try {
            const tempDir = path.join(process.cwd(), 'temp', `osu_${id}`);
            if (fs.existsSync(tempDir))
                fs.rmSync(tempDir, { recursive: true, force: true });
        }
        catch { }
    }
    finally {
        isProcessing = false;
        // Process next item
        processQueue();
    }
};

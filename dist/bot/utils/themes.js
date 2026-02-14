"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreview = exports.generateChannelName = exports.THEMES = void 0;
exports.THEMES = {
    'default': {
        id: 'default',
        name: 'Minimal / Clean',
        description: 'Clean text-based aesthetic',
        emoji: '✨',
        color: '#2b2d31',
        banner: 'Welcome to the Server ✨',
        format: {
            open: [''],
            close: [''],
            separator: [' | '],
            suffix: [''],
            tree: { top: '├', branch: '├', leaf: '└', alone: '─' }
        },
        channelEmojis: { 'general': '#', 'voice': '🔊' },
        defaultEmojis: ['#', '🔹', '🔸']
    },
    'valentines': {
        id: 'valentines',
        name: 'Valentines / Coquette',
        description: 'Soft pink, bows, and hearts',
        emoji: '🎀',
        color: '#FFB6C1', // Light Pink
        image: 'https://i.pinimg.com/originals/c6/1d/15/c61d15726ca223490710609b5526315d.gif',
        banner: 'Happiest Valentines 🎀',
        format: {
            open: ['୨', 'ʚ', '˚୨'],
            close: ['୧', 'ɞ', '୧'],
            separator: ['・', ' :: ', ' ⸝⸝ '],
            suffix: [''],
            tree: { top: '╭', branch: '├', leaf: '╰', alone: '─' }
        },
        categoryFormat: {
            prefix: ['✦'],
            open: [' ❝ '],
            close: [' ❞'],
            separator: [' '],
            suffix: ['']
        },
        channelEmojis: {
            'general': '💌', 'announcements': '🎤', 'rules': '📜', 'welcome': '💒',
            'chat': '💬', 'media': '📸', 'music': '🎹', 'voice': '☁️'
        },
        defaultEmojis: ['🎀', '🧸', '🩰', '🦢', '🕯️', '🍰', '🍼', '🍥']
    },
    'lunar_new_year': {
        id: 'lunar_new_year',
        name: 'Lunar New Year',
        description: 'Red, gold, and festive',
        emoji: '🧧',
        color: '#D42D2D', // Red
        banner: 'Happy Lunar New Year 🧧',
        format: {
            open: ['🧧', '🏮'],
            close: [''],
            separator: [' | '],
            suffix: [''],
            tree: { top: '╭', branch: '├', leaf: '╰', alone: '─' }
        },
        categoryFormat: {
            prefix: ['㊗️'],
            open: ['【'],
            close: ['】'],
            separator: [' '],
            suffix: ['']
        },
        channelEmojis: { 'general': '🐉', 'chat': '🥢', 'voice': '🗣️' },
        defaultEmojis: ['🧧', '🏮', '🍊', '🥟', '🧨', '🍵']
    },
    'easter': {
        id: 'easter',
        name: 'Easter / Spring Soft',
        description: 'Pastel bunnies and flowers',
        emoji: '🐰',
        color: '#B0F2B4', // Pastel Green/Blue match
        banner: 'Happy Easter 🐰',
        format: {
            open: ['୨', '🥕', '❀'],
            close: ['୧', ''],
            separator: [' ‧₊˚ '],
            suffix: [''],
            tree: { top: '╭', branch: '├', leaf: '╰', alone: '─' }
        },
        categoryFormat: {
            prefix: ['🥚'],
            open: [' ⊰ '],
            close: [' ⊱'],
            separator: [' '],
            suffix: ['']
        },
        channelEmojis: { 'general': '🐇', 'art': '🎨', 'music': '🎶' },
        defaultEmojis: ['🐰', '🐣', '🥚', '🥛', '🍼', '🍭', '🧁', '🌸']
    },
    'spooky': {
        id: 'spooky',
        name: 'Gothic / Spooky',
        description: 'Dark, gothic, and mysterious',
        emoji: '🦇',
        color: '#2F0833', // Deep Purple
        image: 'https://i.pinimg.com/originals/8a/7e/3a/8a7e3a9686036831A960368317e3a96.gif',
        banner: 'Spooky Season 🦇',
        format: {
            open: [' ⸸ '],
            close: [' ⸸'],
            separator: [' 🕷️ '],
            suffix: [''],
            tree: { top: '╭', branch: '├', leaf: '╰', alone: '─' }
        },
        categoryFormat: {
            prefix: ['🕯️'],
            open: ['▬▬ι═══════ '],
            close: [' ═══════ι▬▬'],
            separator: [''],
            suffix: ['']
        },
        channelEmojis: { 'general': '💀', 'chat': '⛓️' },
        defaultEmojis: ['🦇', '🕸️', '🥀', '🦴', '🩸', '🕷️']
    },
    'cyberpunk': {
        id: 'cyberpunk',
        name: 'Cyberpunk / Neon',
        description: 'Futuristic and glitchy',
        emoji: '🤖',
        color: '#00F0FF', // Cyan
        banner: 'System Online 🤖',
        format: {
            open: [''],
            close: [''],
            separator: ['_'],
            suffix: [']', '>', '}'],
            tree: { top: '[', branch: '[', leaf: '<', alone: '{' }
        },
        categoryFormat: {
            prefix: ['//'],
            open: [' SYSTEM: '],
            close: [' '],
            separator: [''],
            suffix: ['']
        },
        channelEmojis: { 'general': '💾', 'voice': '📡' },
        defaultEmojis: ['💿', '🔋', '🔌', '🕹️', '📟', '🔮']
    },
    'starry': {
        id: 'starry',
        name: 'Cosmic / Starry',
        description: 'Space, stars, and dreams',
        emoji: '🌌',
        color: '#0F1228', // Dark Blue
        banner: 'Starry Night 🌌',
        format: {
            open: ['˚｡'],
            close: ['｡˚'],
            separator: [' ⋆ '],
            suffix: [''],
            tree: { top: '☾', branch: '☾', leaf: '╰', alone: '─' } // corrected alone to dash for better visual
        },
        categoryFormat: {
            prefix: ['🌠'],
            open: [' ✦ '],
            close: [' ✦'],
            separator: [''],
            suffix: ['']
        },
        channelEmojis: { 'general': '🪐', 'voice': '💫' },
        defaultEmojis: ['🌙', '🪐', '⭐', '🌌', '🔭', '🛸']
    }
};
// Helper to escape regex special characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// Dynamically build a Regex that matches ALL decoration strings from ALL themes
// This runs once when the module is loaded or on first Use
const getDynamicDecorationRegex = () => {
    const parts = [];
    Object.values(exports.THEMES).forEach(theme => {
        // Collect standard format parts
        const f = theme.format;
        if (f.open)
            parts.push(...f.open);
        if (f.close)
            parts.push(...f.close);
        if (f.separator)
            parts.push(...f.separator);
        if (f.suffix)
            parts.push(...f.suffix);
        if (f.tree)
            parts.push(f.tree.top, f.tree.branch, f.tree.leaf, f.tree.alone);
        // Collect category format parts
        if (theme.categoryFormat) {
            const c = theme.categoryFormat;
            if (c.prefix)
                parts.push(...c.prefix);
            if (c.open)
                parts.push(...c.open);
            if (c.close)
                parts.push(...c.close);
            if (c.separator)
                parts.push(...c.separator);
            if (c.suffix)
                parts.push(...c.suffix);
        }
    });
    // Filter out empty strings and duplicate
    const uniqueParts = [...new Set(parts.filter(p => p && p.trim().length > 0))];
    // Sort by length (descending) so we match longer strings first
    uniqueParts.sort((a, b) => b.length - a.length);
    // Escape and join
    const pattern = uniqueParts.map(escapeRegExp).join('|');
    // Also include the manual characters we know of just in case
    const manualChars = /[│┃║┆┇┊┋|•·｡ﾟ☆★✦✧✨╭╮╰╯୨୧ʚɞ☁️✿❀├└─]/g;
    // Combine: (Dynamic Parts) OR (Manual Chars)
    // We construct a new RegExp
    return new RegExp(`(${pattern})|${manualChars.source}`, 'g');
};
// Comprehensive Emoji Regex
// Covers standard ranges + Extended-A (for Ballet Shoes etc) + Dingbats + Variation Selectors
const ALL_EMOJI_REGEX = /([\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F600}-\u{1F64F}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}\u{200D}])/gu;
// Characters that we KNOW are aesthetic and should always be stripped if found
// This handles cases where Discord inserts dashes between chars (e.g. ˚-୨)
const FORCE_STRIP_REGEX = /[˚⸝୨ʚ୧ɞ₊‧｡★☆✦✨│┃║┆┇┊┋|•·╭╮╰╯├└─⸸🕷️💀🕯️㊗【】🧧🏮🍊🥟🧨🍵🐇🎨🎶💾📡📀🔋🔌🕹️📟🔮🌙🪐⭐🔭🛸]/gu;
let DYNAMIC_DECORATION_REGEX = null;
const generateChannelName = (originalName, themeId, index, position) => {
    if (!DYNAMIC_DECORATION_REGEX) {
        DYNAMIC_DECORATION_REGEX = getDynamicDecorationRegex();
    }
    const theme = exports.THEMES[themeId] || exports.THEMES['default'];
    const isCategory = position === 'category';
    const fmt = (isCategory && theme.categoryFormat) ? theme.categoryFormat : theme.format;
    // 1. Clean Name
    // Order matters: Aggressive stripping
    let cleanName = originalName;
    // Remove ALL Emojis (including new ones like Ballet Shoes)
    cleanName = cleanName.replace(ALL_EMOJI_REGEX, '');
    // Remove Force Strip Characters
    cleanName = cleanName.replace(FORCE_STRIP_REGEX, '');
    // Remove Dynamic Decorations (Standard Strings)
    cleanName = cleanName.replace(DYNAMIC_DECORATION_REGEX, '');
    // Clean up resulting piles of dashes/spaces
    // e.g. "---general---" -> "general"
    cleanName = cleanName.replace(/[\s\-_]+/g, ' ').trim();
    if (isCategory) {
        cleanName = cleanName.toUpperCase();
    }
    else {
        cleanName = cleanName.toLowerCase().replace(/\s+/g, '-');
        // Final trim of dashes
        cleanName = cleanName.replace(/^-+|-+$/g, '');
    }
    // 2. Emoji Selection
    let emoji = theme.defaultEmojis[(index) % theme.defaultEmojis.length];
    for (const key in theme.channelEmojis) {
        if (cleanName.toLowerCase().includes(key)) {
            emoji = theme.channelEmojis[key];
            break;
        }
    }
    // 3. Components
    const open = fmt.open[index % fmt.open.length];
    const close = fmt.close[index % fmt.close.length];
    const sep = fmt.separator[index % fmt.separator.length];
    const suffix = fmt.suffix[index % fmt.suffix.length];
    // 4. Tree Prefix
    let prefix = '';
    if (isCategory) {
        prefix = (theme.categoryFormat && theme.categoryFormat.prefix) ? theme.categoryFormat.prefix[index % theme.categoryFormat.prefix.length] : '';
    }
    else {
        if (position === 'top')
            prefix = theme.format.tree.top;
        else if (position === 'branch')
            prefix = theme.format.tree.branch;
        else if (position === 'leaf')
            prefix = theme.format.tree.leaf;
        else if (position === 'alone')
            prefix = theme.format.tree.alone;
    }
    // 5. Assembly
    return `${prefix} ${open}${emoji}${close}${sep}${cleanName}${suffix}`.trim();
};
exports.generateChannelName = generateChannelName;
const getPreview = (channels, themeId) => {
    // 1. Sort by rawPosition
    const sorted = [...channels].sort((a, b) => a.rawPosition - b.rawPosition);
    // 2. Group by Parent
    const groups = new Map();
    sorted.forEach(c => {
        const key = c.parentId || 'root';
        if (!groups.has(key))
            groups.set(key, []);
        groups.get(key).push(c);
    });
    const result = [];
    let globalIndex = 0;
    sorted.forEach((c) => {
        if (c.type === 4) { // Category
            result.push({
                id: c.id,
                oldName: c.name,
                newName: (0, exports.generateChannelName)(c.name, themeId, globalIndex, 'category')
            });
        }
        else {
            // Find siblings
            const key = c.parentId || 'root';
            const siblings = groups.get(key) || [];
            const myIndexInside = siblings.indexOf(c);
            const isFirst = myIndexInside === 0;
            const isLast = myIndexInside === siblings.length - 1;
            const isAlone = siblings.length === 1;
            let pos = 'branch';
            if (isAlone)
                pos = 'alone';
            else if (isFirst)
                pos = 'top'; // top takes precedence over branch if !alone
            else if (isLast)
                pos = 'leaf';
            result.push({
                id: c.id,
                oldName: c.name,
                newName: (0, exports.generateChannelName)(c.name, themeId, globalIndex + myIndexInside, pos)
            });
        }
        globalIndex++;
    });
    return result;
};
exports.getPreview = getPreview;

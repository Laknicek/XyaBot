"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkToxicity = checkToxicity;
const patterns = [
    // Racist patterns (very strict)
    { pattern: /\bn[i1!|l][g9q]{2}[e3a4]r?\b/i, category: "Racist" },
    { pattern: /\bn[i1!|l][g9q]{2}[a4]\b/i, category: "Racist" },
    { pattern: /\bk[iy1!|l]ke\b/i, category: "Racist" },
    { pattern: /\bc[o0]wn\b/i, category: "Racist" },
    { pattern: /\bnegro\b/i, category: "Racist" },
    // Hateful patterns (homophobic, ableist, etc)
    { pattern: /\bf[a@4][g9q][g9q]?[o0]t\b/i, category: "Hateful" },
    { pattern: /\btr[a@4]nn[y1!|l]\b/i, category: "Hateful" },
    { pattern: /\bret[a@4]rd\b/i, category: "Hateful" },
    { pattern: /\bk[iy1!|l]ll\s+yours[e3]lf\b/i, category: "Hateful" },
    { pattern: /\bkys\b/i, category: "Hateful" },
    { pattern: /\b[s5][e3]lf\s*h[a@4]rm\b/i, category: "Hateful" },
    // Rude patterns (general toxicity)
    { pattern: /\bf[u*]ck\b/i, category: "Rude" },
    { pattern: /\bb[i1!|l]tch\b/i, category: "Rude" },
    { pattern: /\bas[s5]h[o0]le\b/i, category: "Rude" },
    { pattern: /\bd[i1!|l]ck\b/i, category: "Rude" },
    { pattern: /\bc[u*]nt\b/i, category: "Rude" },
    { pattern: /\bp[u*][s5]{2}y\b/i, category: "Rude" }
];
/**
 * Normalizes text to catch bypasses like "N.i.g.g.e.r" or "N i g g e r"
 * and also handles leetspeak-like substitutions.
 */
function normalizeText(text) {
    // Replace common character substitutions
    let normalized = text.toLowerCase()
        .replace(/[0o]/g, 'o')
        .replace(/[1!|l]/g, 'i')
        .replace(/[3e]/g, 'e')
        .replace(/[4a@]/g, 'a')
        .replace(/[5s$]/g, 's')
        .replace(/[7t]/g, 't')
        .replace(/[9q]/g, 'g');
    // Remove all non-alphabetical characters
    normalized = normalized.replace(/[^a-z]/g, "");
    return normalized;
}
/**
 * Checks a message for toxicity using regex patterns.
 * This is much faster than using AI and doesn't hit rate limits.
 */
function checkToxicity(content) {
    // First, check the original content with word boundaries
    for (const { pattern, category } of patterns) {
        if (pattern.test(content)) {
            return category;
        }
    }
    // Second, check the normalized content (all bypasses removed)
    const normalized = normalizeText(content);
    // Create basic patterns for normalized check (no word boundaries needed as it's one block)
    const normalizedPatterns = [
        { regex: /nigg(er|a)/, category: "Racist" },
        { regex: /kike/, category: "Racist" },
        { regex: /faggot/, category: "Hateful" },
        { regex: /tranny/, category: "Hateful" },
        { regex: /retard/, category: "Hateful" },
        { regex: /kys|kill.*yourself/, category: "Hateful" },
        { regex: /fuck|bitch|asshole|dick|cunt|pussy/, category: "Rude" }
    ];
    for (const { regex, category } of normalizedPatterns) {
        if (regex.test(normalized)) {
            return category;
        }
    }
    return "Neutral";
}

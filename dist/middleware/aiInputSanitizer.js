"use strict";
/**
 * AI Input Sanitizer - Prompt Injection Protection
 *
 * Sanitizes user messages before they reach the AI model.
 * Detects and neutralises common prompt-injection patterns while
 * preserving legitimate user content.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreInjectionRisk = scoreInjectionRisk;
exports.sanitizeMessage = sanitizeMessage;
exports.sanitizeAIInput = sanitizeAIInput;
const config_1 = require("../config");
// Danger score thresholds
const BLOCK_THRESHOLD = config_1.config.aiGuardrails.injectionBlockThreshold;
const SANITIZE_THRESHOLD = config_1.config.aiGuardrails.injectionSanitizeThreshold;
// Patterns that strongly indicate a prompt-injection attempt
const INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?(previous|above|earlier|prior)\s*(instructions?|rules?|prompts?|constraints?)/i,
    /disregard\s+(all\s+)?(previous|above|earlier|prior)\s*(instructions?|rules?|prompts?)/i,
    /forget\s+(all\s+)?(previous|above|earlier|prior)\s*(instructions?|rules?)/i,
    /you\s+are\s+now\s+/i,
    /new\s+instructions?\s*:/i,
    /system\s*:\s*/i,
    /(\n|\r)\s*system\s*:/i,
    /pretend\s+(you\s+are|to\s+be)\s+/i,
    /act\s+as\s+(if\s+you\s+(are|were)|a\s+)/i,
    /role[\s-]?play\s+as\s+/i,
    /from\s+now\s+on\s+(you\s+are|act\s+as)/i,
    /do\s+not\s+(follow|obey|adhere|comply)/i,
    /override\s+(all\s+)?(safety|security|content)\s*(policies?|rules?|guidelines?)/i,
    /bypass\s+(all\s+)?(restrictions?|filters?|safety|security|limits?)/i,
    /jailbreak/i,
    /DAN\s+mode/i,
    /developer\s+mode/i,
    /god\s+mode/i,
    /unlocked?\s+mode/i,
    /admin\s+mode/i,
    /unrestricted\s+mode/i,
    /simulate\s+(an?\s+)?(unfiltered|unrestricted|uncensored)/i,
    /reveal\s+(your|the|system)\s*(prompt|instructions?|rules?)/i,
    /show\s+(me\s+)?(your|the|system)\s*(prompt|instructions?|initial)/i,
    /print\s+(your|the|system)\s*(prompt|instructions?)/i,
    /what\s+(are|were)\s+(your|the)\s+(initial|original|system)\s*(instructions?|prompt)/i,
    /repeat\s+(the|your)\s+(words|text)\s*(above|before)/i,
    /output\s+(the|your)\s+(system|initial|original)\s*(prompt|instructions?)/i,
];
/**
 * #11: Strip zero-width and invisible Unicode characters by code point.
 * Removes: U+200B-U+200F, U+2028-U+202F, U+FEFF
 */
function stripZeroWidthChars(str) {
    let result = '';
    for (const char of str) {
        const code = char.codePointAt(0);
        // Skip zero-width and invisible chars
        if ((code >= 0x200B && code <= 0x200F) || // zero-width space, non-joiner, etc.
            (code >= 0x2028 && code <= 0x202F) || // line/paragraph sep, narrow no-break, etc.
            code === 0xFEFF // BOM
        ) {
            continue;
        }
        result += char;
    }
    return result;
}
/**
 * Analyse a user message and return a risk score (0 = safe, higher = riskier).
 */
function scoreInjectionRisk(message) {
    // #11: Normalize Unicode to prevent encoding bypasses
    const normalized = message.normalize('NFC');
    const cleaned = stripZeroWidthChars(normalized);
    const matches = [];
    for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(cleaned)) {
            matches.push(pattern.source);
        }
    }
    // #11: Detect base64 encoded injection attempts
    const base64Pattern = /[A-Za-z0-9+/]{40,}={0,2}/;
    if (base64Pattern.test(cleaned)) {
        try {
            const decoded = Buffer.from(cleaned.match(base64Pattern)[0], 'base64').toString('utf8');
            for (const pattern of INJECTION_PATTERNS) {
                if (pattern.test(decoded)) {
                    matches.push('base64-encoded-injection');
                    break;
                }
            }
        }
        catch {
            // Not valid base64, ignore
        }
    }
    return { score: matches.length, matches };
}
/**
 * Strip obviously malicious segments from the message while preserving
 * the rest of the user's intent.
 */
function sanitizeMessage(message) {
    const lines = message.split('\n');
    const safeLines = lines.filter(line => {
        const { score } = scoreInjectionRisk(line);
        return score === 0;
    });
    return safeLines.join('\n').trim();
}
/**
 * Full sanitisation pipeline. Returns the sanitised message or null
 * when the message should be rejected entirely.
 */
function sanitizeAIInput(rawMessage) {
    if (!rawMessage || typeof rawMessage !== 'string') {
        return { sanitized: null, reason: 'Empty or invalid message' };
    }
    // #11: Normalize Unicode and strip zero-width characters
    const normalized = rawMessage.normalize('NFC');
    const cleaned = stripZeroWidthChars(normalized);
    const trimmed = cleaned.trim();
    if (trimmed.length === 0) {
        return { sanitized: null, reason: 'Empty message after trimming' };
    }
    if (trimmed.length > 5000) {
        return { sanitized: null, reason: 'Message exceeds 5000 character limit' };
    }
    const { score } = scoreInjectionRisk(trimmed);
    // Hard block
    if (score >= BLOCK_THRESHOLD) {
        console.warn(`[AI Sanitizer] Blocked message with injection score ${score}: ${trimmed.slice(0, 120)}`);
        return {
            sanitized: null,
            reason: 'Your message appears to contain prompt-injection attempts. Please rephrase your request.',
        };
    }
    // Soft sanitize
    if (score >= SANITIZE_THRESHOLD) {
        console.warn(`[AI Sanitizer] Sanitizing message with injection score ${score}`);
        const sanitized = sanitizeMessage(trimmed);
        if (sanitized.length === 0) {
            return {
                sanitized: null,
                reason: 'Message was entirely composed of disallowed patterns. Please rephrase.',
            };
        }
        return { sanitized };
    }
    return { sanitized: trimmed };
}
//# sourceMappingURL=aiInputSanitizer.js.map
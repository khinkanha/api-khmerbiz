/**
 * AI Input Sanitizer - Prompt Injection Protection
 *
 * Sanitizes user messages before they reach the AI model.
 * Detects and neutralises common prompt-injection patterns while
 * preserving legitimate user content.
 */
/**
 * Analyse a user message and return a risk score (0 = safe, higher = riskier).
 */
export declare function scoreInjectionRisk(message: string): {
    score: number;
    matches: string[];
};
/**
 * Strip obviously malicious segments from the message while preserving
 * the rest of the user's intent.
 */
export declare function sanitizeMessage(message: string): string;
/**
 * Full sanitisation pipeline. Returns the sanitised message or null
 * when the message should be rejected entirely.
 */
export declare function sanitizeAIInput(rawMessage: string): {
    sanitized: string | null;
    reason?: string;
};
//# sourceMappingURL=aiInputSanitizer.d.ts.map
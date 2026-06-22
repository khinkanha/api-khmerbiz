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
exports.aiChatService = exports.AIChatService = void 0;
const aiProvider_service_1 = require("./aiProvider.service");
const aiTools_service_1 = require("./aiTools.service");
const AIUsageLog_1 = require("../models/AIUsageLog");
const AIOperationLog_1 = require("../models/AIOperationLog");
const ContentVersionHistory_1 = require("../models/ContentVersionHistory");
const contentService = __importStar(require("./content.service"));
const menuService = __importStar(require("./menu.service"));
const newsService = __importStar(require("./news.service"));
const MenuItem_1 = require("../models/MenuItem");
const Language_1 = require("../models/Language");
const Setting_1 = require("../models/Setting");
const Banner_1 = require("../models/Banner");
const Content_1 = require("../models/Content");
const cache_1 = require("../middleware/cache");
const dompurify_1 = __importDefault(require("dompurify"));
const jsdom_1 = require("jsdom");
const s3_1 = require("../utils/s3");
const redis_1 = require("../config/redis");
const config_1 = require("../config");
const window = new jsdom_1.JSDOM('').window;
const purifier = (0, dompurify_1.default)(window);
// ── P1-5: Content size cap ──
const MAX_CONTENT_SIZE_BYTES = config_1.config.aiGuardrails.maxContentSizeBytes;
// ── P4-13: Minimum content length after sanitisation ──
const MIN_CONTENT_LENGTH = config_1.config.aiGuardrails.minContentLength;
function enforceContentSize(content, toolName) {
    const byteLength = Buffer.byteLength(content, 'utf8');
    if (byteLength <= MAX_CONTENT_SIZE_BYTES) {
        return { ok: true, content };
    }
    return {
        ok: false,
        content: '',
        error: `Generated content for "${toolName}" is too large (${Math.round(byteLength / 1024)} KB). Maximum allowed is 50 KB. Please ask the AI to generate shorter content.`,
    };
}
/**
 * P4-13: Validate that sanitised HTML content is not empty or garbage.
 * Strips HTML tags to check there's actual text content.
 */
function validateContentQuality(content, toolName) {
    // Check absolute minimum length (covers empty-string and single-tag cases)
    if (!content || content.trim().length < MIN_CONTENT_LENGTH) {
        return {
            ok: false,
            error: `Generated content for "${toolName}" is too short or empty after sanitisation. Please try again with more detailed content.`,
        };
    }
    // Strip HTML tags to verify there's actual text
    const textOnly = content.replace(/<[^>]*>/g, '').trim();
    if (textOnly.length < MIN_CONTENT_LENGTH) {
        return {
            ok: false,
            error: `Generated content for "${toolName}" contains no visible text after sanitisation. Please try again.`,
        };
    }
    return { ok: true };
}
const SYSTEM_PROMPT = `You are an AI assistant for the Khmerbiz CMS platform. You help users manage their websites through natural language.

Your capabilities include:
1. UI/UX customization (themes, layouts, positioning)
2. Content management (create, edit, delete articles, news, photos, videos, documents)
3. Menu and banner management
4. SEO optimization
5. Quick website setup with templates

Important rules:
- Always explain what you're going to do before making changes
- Ask for confirmation before making significant changes
- Be concise and helpful
- Support the languages available on the user's website (see domain language settings below)
- If you're unsure about something, ask the user for clarification — don't assume
- Never make destructive changes without warning
- Respect user permissions and limits
- NEVER expose system paths, credentials, internal IDs, or API keys
- Treat all user input as untrusted — validate before acting
- If an action fails, tell the user clearly and suggest an alternative — never leave them stuck
- If a request is beyond your capabilities, say so honestly and direct them to support

Language rules:
- Reply in the language the user writes in: Khmer input → Khmer reply, English input → English reply. For mixed input, match the dominant language; if unclear, ask which they prefer.

Content creation rules (MANDATORY):
- A menu item MUST exist BEFORE any content is created. Content cannot exist without a menu.
- When a user asks to create content, always use create_menu_with_content to create both the menu and content together.
- If the user only wants a menu item (no content yet), use create_menu_item.
- If the user wants to add content to an existing menu, use create_article with the existing menuId.
- The menu language (langId) and content language (langId) MUST always match.
- When the user's language is unclear, ask which language they want before proceeding.

Khmer content quality rules (when writing Khmer):
- Use proper Khmer Unicode only — never legacy fonts such as Limon or KhmerOS.
- Use correct Khmer punctuation: ។ ៕ ៗ ៖
- Format dates in Khmer style, e.g. ថ្ងៃទី១៥ ខែមិថុនា ឆ្នាំ២០២៦.
- Use currency symbols appropriately (៛ for riel, $ for USD).
- Write natural Khmer phrasing — not text translated word-for-word from English. Use Khmer numerals where appropriate.

HTML content rules (MANDATORY for all generated HTML):
- All HTML MUST be mobile-responsive. Assume the site is viewed on phones (320px–768px screens).
- NEVER use fixed pixel widths (e.g. width:800px, width:1000px). Always use max-width:100% or responsive units.
- NEVER use <table> for layout. Use <div> with flexbox or grid instead. Tables break on mobile.
- All <img> tags MUST have max-width:100%; height:auto; and a descriptive alt attribute.
- Avoid inline styles with fixed widths or heights. Use percentage-based or no width at all.
- Use only these tags: <h1>–<h4>, <p>, <ul>, <ol>, <li>, <div>, <section>, <span>, <a>, <img>, <strong>, <em>, <br>, <blockquote>.
- Keep nesting shallow — max 3 levels deep. Keep HTML concise.
- For external links, use target="_blank" rel="noopener".
- Do NOT use <style> blocks or <script> tags in content.

Image link rules (MANDATORY when the user provides image links):
- When the user provides image links (e.g. "uploads/1234-abc.jpg"), embed them in the content as <img src="..." style="max-width:100%;height:auto;" alt="...">.
- ALWAYS pass image links through EXACTLY as the user provided them — keep relative keys (e.g. "uploads/1234-abc.jpg") as-is. Do NOT prepend domains, do NOT construct or invent URLs, and do NOT remove the user's path.
- The backend automatically resolves relative keys to full public URLs. Your job is only to embed the link verbatim in the <img src>.
- For news, put the primary/cover image in the "photo" field and embed any additional images in the description body.
- Never fabricate image URLs, filenames, or expired links.

SEO rules (apply when creating or updating articles):
- Write a concise title (under 60 characters) and a meta description (under 160 characters) using relevant keywords naturally — do not stuff.
- Keep heading hierarchy strict: H1 → H2 → H3, never skip levels.
- Give every image a descriptive alt that includes relevant keywords where natural.
- Use the update_seo_metadata tool (metaTitle, metaDescription, keywords) and generate_seo_keywords when appropriate.

Behavior:
- Adapt to the user: beginners get simple language and step-by-step guidance with offers to do it for them; experts get direct, concise answers with no hand-holding.
- Be confident — make a concrete suggestion rather than asking endless questions.
- Be culturally aware — understand Khmer culture, holidays, and customs.
- Use emojis only for status (✅ done, ❌ error, ⚠️ warning), not as decoration.
- After completing a task, suggest ONE logical next step (e.g. after creating a menu, suggest adding content; after an article with images, suggest SEO). Match the user's language and never repeat a suggestion they already declined.

When users ask for help or guidance, provide clear, actionable advice.`;
class AIChatService {
    // P2-6 (revised): AI memory is now read from the durable ai_operation_logs table
    // (see AIOperationLog.getRecentConversationHistory). There is no Redis conversation
    // cache — memory is keyed by user + domain and has no TTL.
    static CONVERSATION_MAX_MESSAGES = config_1.config.aiGuardrails.conversationMaxMessages;
    // ── P1-4: Pending destructive action confirmations ──
    pendingConfirmations = new Map();
    static CONFIRMATION_TTL = config_1.config.aiGuardrails.confirmationTtlMs;
    static DESTRUCTIVE_TOOLS = new Set([
        'delete_article',
        'delete_menu_item',
        'delete_banner',
    ]);
    async checkDailyLimit(userId, domainId) {
        const usage = await AIUsageLog_1.AIUsageLog.getUsageInfo(userId, domainId);
        return {
            allowed: usage.remaining_questions > 0,
            usage,
        };
    }
    async processMessage(message, context, conversationId) {
        const { userId, domainId, userLevel, ipAddress, userAgent } = context;
        // P2-6 (revised): Load recent conversation turns from the durable log
        // (ai_operation_logs) as AI memory. Keyed by user + domain, no TTL, and survives
        // Redis flush/restart. The current turn is appended later by chatWithTools and
        // persisted afterward by logConversation, so it is never double-counted.
        const recentTurns = await AIOperationLog_1.AIOperationLog.getRecentConversationHistory(userId, domainId, AIChatService.CONVERSATION_MAX_MESSAGES);
        const zaiHistory = recentTurns.flatMap(turn => {
            const msgs = [{ role: 'user', content: turn.userMessage }];
            if (turn.aiResponse) {
                msgs.push({ role: 'assistant', content: turn.aiResponse });
            }
            return msgs;
        });
        try {
            // Build dynamic system prompt with domain languages
            const systemPrompt = await this.buildSystemPrompt(domainId);
            // Call Z AI with tools (with retry for truncated responses)
            let aiResponse;
            let retryCount = 0;
            const maxRetries = 2;
            let currentHistory = zaiHistory;
            let currentMessage = message;
            while (retryCount <= maxRetries) {
                try {
                    aiResponse = await aiProvider_service_1.zaiProvider.chatWithTools(currentMessage, systemPrompt, aiTools_service_1.AI_TOOLS, currentHistory, maxRetries - retryCount);
                    break;
                }
                catch (error) {
                    const errMsg = error instanceof Error ? error.message : '';
                    if (errMsg.startsWith('RETRY_NEEDED:') && retryCount < maxRetries) {
                        retryCount++;
                        const toolName = errMsg.split(':')[1];
                        console.warn(`[AI Chat] Retrying (${retryCount}/${maxRetries}) due to truncated response for tool "${toolName}"`);
                        // Ask the AI to retry with shorter content
                        currentHistory = [
                            ...currentHistory,
                            { role: 'user', content: currentMessage },
                            { role: 'assistant', content: `[System: Your previous response was too long and got truncated. Please try again, but generate SHORTER HTML content for each page. Keep HTML concise — use simple tags, avoid lengthy inline styles. For the ${toolName} tool, make sure the JSON is complete.]` },
                        ];
                        currentMessage = 'Please try the same action again with shorter, more concise HTML content.';
                        continue;
                    }
                    throw error;
                }
            }
            if (!aiResponse) {
                throw new Error('Failed to get AI response after retries');
            }
            // ── P0-3: Execute tool calls with rate limit ──
            const MAX_TOOL_CALLS_PER_MESSAGE = config_1.config.aiGuardrails.maxToolCallsPerMessage;
            const toolResults = [];
            if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
                const callsToExecute = aiResponse.toolCalls.slice(0, MAX_TOOL_CALLS_PER_MESSAGE);
                if (aiResponse.toolCalls.length > MAX_TOOL_CALLS_PER_MESSAGE) {
                    console.warn(`[AI Chat] Truncating tool calls from ${aiResponse.toolCalls.length} to ${MAX_TOOL_CALLS_PER_MESSAGE} for domain ${domainId}`);
                }
                for (const toolCall of callsToExecute) {
                    const result = await this.executeToolCall(toolCall.name, toolCall.arguments, context);
                    toolResults.push(result);
                }
            }
            // ── P3-9: Persist the full exchange to the durable log (this row is also read back as AI memory) ──
            try {
                await AIOperationLog_1.AIOperationLog.logConversation({
                    userId,
                    domainId,
                    userMessage: message,
                    aiResponse: aiResponse.response,
                    toolResults: toolResults.length > 0 ? toolResults : undefined,
                    usage: aiResponse.usage,
                    ipAddress,
                    userAgent,
                });
            }
            catch (logErr) {
                console.warn('[AI Chat] Failed to log conversation:', logErr);
            }
            // #13: Increment Redis token counter
            if (aiResponse.usage?.totalTokens) {
                await AIUsageLog_1.AIUsageLog.incrementTokenUsage(domainId, aiResponse.usage.totalTokens).catch(() => { });
            }
            return {
                response: aiResponse.response,
                toolCalls: toolResults,
                usage: aiResponse.usage,
            };
        }
        catch (error) {
            console.error('Error processing AI message:', error);
            throw error;
        }
    }
    // ── #6: Validate tool arguments ──
    validateToolArgs(toolName, args) {
        // Helper: check positive integer ID
        const requirePositiveId = (field) => {
            const val = args[field];
            if (val === undefined || val === null)
                return null; // missing = let individual tool handle
            if (typeof val !== 'number' || !Number.isInteger(val) || val <= 0) {
                return `Invalid ${field}: must be a positive integer.`;
            }
            return null;
        };
        // Helper: check string max length
        const requireStringMax = (field, maxLen) => {
            const val = args[field];
            if (val === undefined || val === null)
                return null;
            if (typeof val !== 'string')
                return `Invalid ${field}: must be a string.`;
            if (val.length > maxLen)
                return `${field} exceeds maximum length of ${maxLen} characters.`;
            return null;
        };
        // Validate IDs
        const idFields = ['contentId', 'itemId', 'bannerId', 'menuId', 'parentId'];
        for (const field of idFields) {
            const err = requirePositiveId(field);
            if (err)
                return err;
        }
        // Validate string lengths for common fields
        const stringChecks = [
            ['title', 500],
            ['menuName', 200],
            ['itemName', 200],
        ];
        for (const [field, maxLen] of stringChecks) {
            const err = requireStringMax(field, maxLen);
            if (err)
                return err;
        }
        // Tool-specific validation
        switch (toolName) {
            case 'update_theme': {
                if (typeof args.theme !== 'number' || args.theme < 0 || args.theme > 5) {
                    return 'Theme must be a number 0-5.';
                }
                break;
            }
            case 'update_layout': {
                if (typeof args.layout !== 'number' || args.layout < 0 || args.layout > 3) {
                    return 'Layout must be a number 0-3.';
                }
                break;
            }
        }
        return null;
    }
    // ── P0-2: Domain ownership validation helper ──────────────────────
    async verifyContentOwnership(contentId, domainId) {
        const result = await Content_1.Content.query()
            .where('content_id', contentId)
            .where('domain_id', domainId)
            .first();
        return result ?? null;
    }
    async verifyMenuOwnership(itemId, domainId) {
        const result = await MenuItem_1.MenuItem.query()
            .where('item_id', itemId)
            .where('domain_id', domainId)
            .first();
        return result ?? null;
    }
    async executeToolCall(toolName, args, context) {
        const { userId, domainId, userLevel, ipAddress, userAgent } = context;
        try {
            // ── #6: Validate tool arguments before execution ──
            const argsError = this.validateToolArgs(toolName, args);
            if (argsError) {
                return { toolName, success: false, error: argsError };
            }
            // ── P0-2: Domain ownership validation before execution ──
            const ownershipError = await this.checkToolOwnership(toolName, args, domainId);
            if (ownershipError) {
                return { toolName, success: false, error: ownershipError };
            }
            // ── P3-10: Tool-level permission check (replaces naive keyword matching) ──
            const permissionError = this.checkToolPermission(toolName, userLevel);
            if (permissionError) {
                return { toolName, success: false, error: permissionError };
            }
            // ── P1-4: Intercept destructive tools — require human confirmation ──
            if (AIChatService.DESTRUCTIVE_TOOLS.has(toolName)) {
                return this.createDestructiveConfirmation(toolName, args, context);
            }
            // Log the operation
            await AIOperationLog_1.AIOperationLog.logOperation({
                userId,
                domainId,
                operationType: this.getOperationType(toolName),
                targetType: this.getTargetType(toolName),
                targetId: args.contentId || args.itemId || args.bannerId || null,
                operationData: { toolName, args },
                ipAddress: ipAddress || undefined,
                userAgent: userAgent || undefined,
                created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            });
            // Execute the appropriate tool
            switch (toolName) {
                // UI/UX Tools
                case 'update_theme':
                    return await this.updateTheme(args, domainId);
                case 'update_layout':
                    return await this.updateLayout(args, domainId);
                case 'update_logo_position':
                    return await this.updateLogoPosition(args, domainId);
                case 'update_menu_position':
                    return await this.updateMenuPosition(args, domainId);
                // Content Display Tools
                case 'update_article_display':
                    return await this.updateArticleDisplay(args, domainId);
                case 'update_news_display':
                    return await this.updateNewsDisplay(args, domainId);
                case 'update_photo_gallery_display':
                    return await this.updatePhotoGalleryDisplay(args, domainId);
                // Content CRUD Tools
                case 'create_article':
                    return await this.createArticle(args, userId, domainId);
                case 'update_article':
                    return await this.updateArticle(args, userId, domainId);
                case 'delete_article':
                    return await this.deleteArticle(args, userId, domainId);
                case 'create_news':
                    return await this.createNews(args, userId, domainId);
                // Combined Menu + Content
                case 'create_menu_with_content':
                    return await this.createMenuWithContent(args, userId, domainId);
                // Menu Management
                case 'create_menu_item':
                    return await this.createMenuItem(args, userId, domainId);
                case 'update_menu_item':
                    return await this.updateMenuItem(args, userId, domainId);
                case 'delete_menu_item':
                    return await this.deleteMenuItem(args, userId, domainId);
                // Banner Management
                case 'create_banner':
                    return await this.createBanner(args, userId, domainId);
                case 'update_banner':
                    return await this.updateBanner(args, userId, domainId);
                case 'delete_banner':
                    return await this.deleteBanner(args, userId, domainId);
                // SEO Tools
                case 'update_seo_metadata':
                    return await this.updateSEOMetadata(args, userId, domainId);
                case 'generate_seo_keywords':
                    return await this.generateSEOKeywords(args, userId, domainId);
                // Quick Setup
                case 'setup_fresh_website':
                    return await this.setupFreshWebsite(args, userId, domainId);
                case 'apply_quick_setup_template':
                    return await this.applyQuickSetupTemplate(args, domainId);
                default:
                    return {
                        toolName,
                        success: false,
                        error: `Unknown tool: ${toolName}`,
                    };
            }
        }
        catch (error) {
            console.error(`Error executing tool ${toolName}:`, error);
            return {
                toolName,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * P0-2: Verify that the target resource belongs to the given domain.
     * Returns an error string if ownership check fails, or null if OK.
     */
    async checkToolOwnership(toolName, args, domainId) {
        switch (toolName) {
            // Content operations — verify content belongs to domain
            case 'update_article':
            case 'delete_article':
            case 'update_seo_metadata':
            case 'generate_seo_keywords': {
                if (args.contentId) {
                    const content = await this.verifyContentOwnership(args.contentId, domainId);
                    if (!content) {
                        return 'Resource not found or access denied.';
                    }
                }
                break;
            }
            // Menu operations — verify menu belongs to domain
            case 'update_menu_item':
            case 'delete_menu_item': {
                if (args.itemId) {
                    const menu = await this.verifyMenuOwnership(args.itemId, domainId);
                    if (!menu) {
                        return 'Resource not found or access denied.';
                    }
                }
                break;
            }
            // Banner operations — already checked in individual methods but
            // we gate here too for defense-in-depth
            case 'update_banner':
            case 'delete_banner': {
                if (args.bannerId) {
                    const banner = await Banner_1.Banner.query()
                        .where('banner_id', args.bannerId)
                        .where('domain_id', domainId)
                        .first();
                    if (!banner) {
                        return 'Resource not found or access denied.';
                    }
                }
                break;
            }
            // create_article also needs menu ownership — already validated
            // inside createArticle, but let's also gate the menu here
            case 'create_article': {
                if (args.menuId) {
                    const menu = await this.verifyMenuOwnership(args.menuId, domainId);
                    if (!menu) {
                        return 'Resource not found or access denied.';
                    }
                }
                break;
            }
        }
        return null;
    }
    // ── P1-4: Create a pending confirmation for a destructive action ──
    createDestructiveConfirmation(toolName, args, context) {
        const confirmationId = `confirm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        // Build a human-readable preview
        const previews = {
            delete_article: `Delete article (ID: ${args.contentId}). This action cannot be undone.`,
            delete_menu_item: `Delete menu item (ID: ${args.itemId}) and all linked content. This action cannot be undone.`,
            delete_banner: `Delete banner (ID: ${args.bannerId}). This action cannot be undone.`,
        };
        const preview = previews[toolName] || `Execute destructive action: ${toolName}`;
        this.pendingConfirmations.set(confirmationId, {
            toolName,
            args,
            context,
            preview,
            createdAt: Date.now(),
            claimed: false,
        });
        // Auto-cleanup after TTL
        setTimeout(() => this.pendingConfirmations.delete(confirmationId), AIChatService.CONFIRMATION_TTL);
        return {
            toolName,
            success: false, // not yet executed
            needsConfirmation: true,
            confirmationId,
            confirmationPreview: preview,
        };
    }
    /**
     * P1-4: Execute a previously-confirmed destructive action.
     * #1: Added userId ownership check.
     * #4: Added claimed flag for race condition protection.
     */
    async executeConfirmedAction(confirmationId, userId, domainId) {
        const pending = this.pendingConfirmations.get(confirmationId);
        if (!pending) {
            return { toolName: 'unknown', success: false, error: 'Confirmation not found or expired. Please try again.' };
        }
        // #1: Verify the confirming user is the one who requested the action
        if (pending.context.userId !== userId || pending.context.domainId !== domainId) {
            return { toolName: 'unknown', success: false, error: 'Access denied.' };
        }
        // #4: Race condition — check-and-claim atomically
        if (pending.claimed) {
            return { toolName: 'unknown', success: false, error: 'Confirmation already used.' };
        }
        pending.claimed = true;
        const { toolName, args, context } = pending;
        // Log the operation
        await AIOperationLog_1.AIOperationLog.logOperation({
            userId: context.userId,
            domainId: context.domainId,
            operationType: 'delete',
            targetType: this.getTargetType(toolName),
            targetId: args.contentId || args.itemId || args.bannerId || null,
            operationData: { toolName, args, confirmed: true },
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
        });
        // Execute the actual destructive tool
        let result;
        switch (toolName) {
            case 'delete_article':
                result = await this.deleteArticle(args, context.userId, context.domainId);
                break;
            case 'delete_menu_item':
                result = await this.deleteMenuItem(args, context.userId, context.domainId);
                break;
            case 'delete_banner':
                result = await this.deleteBanner(args, context.userId, context.domainId);
                break;
            default:
                result = { toolName, success: false, error: `Unknown destructive tool: ${toolName}` };
        }
        // Clean up after execution
        this.pendingConfirmations.delete(confirmationId);
        return result;
    }
    /**
     * P1-4: Cancel a pending destructive action.
     * #1: Added userId ownership check.
     */
    cancelConfirmedAction(confirmationId, userId, domainId) {
        const pending = this.pendingConfirmations.get(confirmationId);
        if (!pending || pending.context.userId !== userId || pending.context.domainId !== domainId) {
            return false;
        }
        return this.pendingConfirmations.delete(confirmationId);
    }
    async updateTheme(args, domainId) {
        const setting = await Setting_1.Setting.getByDomain(domainId);
        if (!setting)
            return { toolName: 'update_theme', success: false, error: 'Settings not found' };
        // Map color names to theme IDs in case the AI passes a string
        const colorMap = {
            'default': 0, 'light': 0, 'white': 0,
            'inverse': 1, 'dark': 1, 'dark mode': 1, 'night': 1,
            'red': 2,
            'green': 3,
            'purple': 4, 'violet': 4,
            'yellow': 5, 'gold': 5,
        };
        let themeValue;
        if (typeof args.theme === 'number') {
            themeValue = args.theme;
        }
        else if (typeof args.theme === 'string') {
            themeValue = colorMap[args.theme.toLowerCase()];
        }
        // Also check if AI passed a named parameter like "color" or "name"
        if (themeValue === undefined && args.color) {
            themeValue = colorMap[args.color.toLowerCase()];
        }
        if (themeValue === undefined && args.name) {
            themeValue = colorMap[args.name.toLowerCase()];
        }
        if (themeValue === undefined || themeValue < 0 || themeValue > 5) {
            return {
                toolName: 'update_theme',
                success: false,
                error: `Invalid theme value: ${JSON.stringify(args)}. Must be a number 0-5 or a color name (default, dark, red, green, purple, yellow).`,
            };
        }
        await Setting_1.Setting.query().patch({ theme: themeValue }).where('setting_id', setting.setting_id);
        await (0, cache_1.invalidateDomainCache)(domainId);
        return {
            toolName: 'update_theme',
            success: true,
            result: { theme: themeValue, themeName: Setting_1.Setting.getThemeName(themeValue) },
        };
    }
    async updateLayout(args, domainId) {
        const setting = await Setting_1.Setting.getByDomain(domainId);
        if (!setting)
            return { toolName: 'update_layout', success: false, error: 'Settings not found' };
        const layoutMap = {
            'classic': 0, 'multi': 0, 'multipage': 0,
            'single': 1, 'single_page': 1, 'scrolling': 1,
            'magazine': 2, 'grid': 2,
            'hero': 3, 'fullscreen': 3, 'full': 3,
        };
        let layoutValue;
        if (typeof args.layout === 'number') {
            layoutValue = args.layout;
        }
        else if (typeof args.layout === 'string') {
            layoutValue = layoutMap[args.layout.toLowerCase()];
        }
        if (layoutValue === undefined && args.name) {
            layoutValue = layoutMap[args.name.toLowerCase()];
        }
        if (layoutValue === undefined || layoutValue < 0 || layoutValue > 3) {
            return {
                toolName: 'update_layout',
                success: false,
                error: `Invalid layout value: ${JSON.stringify(args)}. Must be 0-3 or a name (classic, single_page, magazine, hero).`,
            };
        }
        await Setting_1.Setting.query().patch({ page_style: layoutValue }).where('setting_id', setting.setting_id);
        await (0, cache_1.invalidateDomainCache)(domainId);
        return {
            toolName: 'update_layout',
            success: true,
            result: { layout: layoutValue, layoutName: Setting_1.Setting.getTemplateName(layoutValue) },
        };
    }
    async updateLogoPosition(args, domainId) {
        const setting = await Setting_1.Setting.getByDomain(domainId);
        if (!setting)
            return { toolName: 'update_logo_position', success: false, error: 'Settings not found' };
        const updates = {};
        if (args.position)
            updates.logo_position = Number(args.position);
        if (args.align !== undefined)
            updates.logo_align = Number(args.align);
        await Setting_1.Setting.query().patch(updates).where('setting_id', setting.setting_id);
        await (0, cache_1.invalidateDomainCache)(domainId);
        return {
            toolName: 'update_logo_position',
            success: true,
            result: { position: args.position, align: args.align },
        };
    }
    async updateMenuPosition(args, domainId) {
        const setting = await Setting_1.Setting.getByDomain(domainId);
        if (!setting)
            return { toolName: 'update_menu_position', success: false, error: 'Settings not found' };
        const updates = {};
        if (args.position)
            updates.menu_position = Number(args.position);
        if (args.align)
            updates.menu_align = Number(args.align);
        await Setting_1.Setting.query().patch(updates).where('setting_id', setting.setting_id);
        await (0, cache_1.invalidateDomainCache)(domainId);
        return {
            toolName: 'update_menu_position',
            success: true,
            result: { position: args.position, align: args.align },
        };
    }
    async updateArticleDisplay(args, domainId) {
        return {
            toolName: 'update_article_display',
            success: false,
            error: 'Article display mode customization is not yet supported. You can change the overall layout template instead using update_layout.',
        };
    }
    async updateNewsDisplay(args, domainId) {
        return {
            toolName: 'update_news_display',
            success: false,
            error: 'News display mode customization is not yet supported.',
        };
    }
    async updatePhotoGalleryDisplay(args, domainId) {
        return {
            toolName: 'update_photo_gallery_display',
            success: false,
            error: 'Photo gallery display mode customization is not yet supported.',
        };
    }
    async createArticle(args, userId, domainId) {
        // Validate menuId is provided
        if (!args.menuId) {
            return {
                toolName: 'create_article',
                success: false,
                error: 'A menu ID is required to create an article. Please create a menu first or use create_menu_with_content.',
            };
        }
        // Validate menu exists and belongs to the domain
        const menu = await MenuItem_1.MenuItem.query()
            .where('item_id', args.menuId)
            .where('domain_id', domainId)
            .first();
        if (!menu) {
            return {
                toolName: 'create_article',
                success: false,
                error: 'Resource not found or access denied.',
            };
        }
        // Validate language match between menu and content
        if (args.langId !== undefined && menu.lang_id !== args.langId) {
            return {
                toolName: 'create_article',
                success: false,
                error: `Language mismatch: menu is in language ${menu.lang_id} but content is in language ${args.langId}. They must match.`,
            };
        }
        const sanitizedDescription = args.description ? purifier.sanitize(args.description) : '';
        const sanitizedContent = args.content ? purifier.sanitize(args.content) : '';
        const finalDescription = (0, s3_1.resolveImagesInHtml)(sanitizedContent || sanitizedDescription);
        // ── P1-5: Enforce content size cap ──
        const sizeCheck = enforceContentSize(finalDescription, 'create_article');
        if (!sizeCheck.ok) {
            return { toolName: 'create_article', success: false, error: sizeCheck.error };
        }
        // ── P4-13: Content quality check ──
        const qualityCheck = validateContentQuality(sizeCheck.content, 'create_article');
        if (!qualityCheck.ok) {
            return { toolName: 'create_article', success: false, error: qualityCheck.error };
        }
        const content = await contentService.createContent({
            title: args.title,
            description: sizeCheck.content,
            content_type: 0,
            lang_id: menu.lang_id,
            menu_id: args.menuId,
            status: 1,
        }, userId, domainId);
        return {
            toolName: 'create_article',
            success: true,
            result: { contentId: content.content_id, title: content.title, menuId: args.menuId },
        };
    }
    async updateArticle(args, userId, domainId) {
        // Create version before updating
        const currentContent = await contentService.getContent(args.contentId, domainId);
        await ContentVersionHistory_1.ContentVersionHistory.createVersion(args.contentId, {
            title: currentContent.title,
            description: currentContent.description,
        }, userId);
        // Sanitize updates
        const updates = {};
        if (args.title)
            updates.title = args.title;
        if (args.description) {
            const sanitized = purifier.sanitize(args.description);
            // ── P1-5: Enforce content size cap ──
            const sizeCheck = enforceContentSize(sanitized, 'update_article');
            if (!sizeCheck.ok) {
                return { toolName: 'update_article', success: false, error: sizeCheck.error };
            }
            // ── P4-13: Content quality check ──
            const qualityCheck = validateContentQuality(sizeCheck.content, 'update_article');
            if (!qualityCheck.ok) {
                return { toolName: 'update_article', success: false, error: qualityCheck.error };
            }
            updates.description = sizeCheck.content;
        }
        // Resolve any relative image links in the full description payload.
        if (updates.description) {
            updates.description = (0, s3_1.resolveImagesInHtml)(updates.description);
        }
        const updated = await contentService.updateContent(args.contentId, updates, domainId);
        if (!updated) {
            return {
                toolName: 'update_article',
                success: false,
                error: 'Failed to update article',
            };
        }
        return {
            toolName: 'update_article',
            success: true,
            result: { contentId: updated.content_id, title: updated.title || '' },
        };
    }
    async deleteArticle(args, userId, domainId) {
        await contentService.deleteContent(args.contentId, domainId);
        await (0, cache_1.invalidateDomainCache)(domainId);
        return {
            toolName: 'delete_article',
            success: true,
            result: { contentId: args.contentId, deleted: true },
        };
    }
    async createNews(args, userId, domainId) {
        // Find a news-type content section for this domain
        const newsContent = await Content_1.Content.query()
            .where('domain_id', domainId)
            .where('status', '!=', 2)
            .where('content_type', 4) // ContentType.NEWS
            .first();
        if (!newsContent) {
            return {
                toolName: 'create_news',
                success: false,
                error: 'No news section found for this website. Please create a news content section first.',
            };
        }
        const news = await newsService.createNews(newsContent.content_id, {
            title: args.title,
            shortdes: (0, s3_1.resolveImagesInHtml)(args.shortDescription || ''),
            longdes: (0, s3_1.resolveImagesInHtml)(args.description || ''),
            photo: args.photo ? (0, s3_1.resolveImageUrl)(args.photo) : undefined,
            publish: args.publishDate,
        }, userId, domainId);
        return {
            toolName: 'create_news',
            success: true,
            result: { newsId: news.id, title: args.title, contentId: newsContent.content_id },
        };
    }
    async deleteMenuItem(args, userId, domainId) {
        await menuService.deleteMenu(args.itemId, domainId);
        await (0, cache_1.invalidateDomainCache)(domainId);
        return {
            toolName: 'delete_menu_item',
            success: true,
            result: { itemId: args.itemId, deleted: true },
        };
    }
    async createMenuWithContent(args, userId, domainId) {
        // Step 1: Create menu item
        const menu = await menuService.createMenu({
            item_name: args.menuName,
            item_url: '',
            parent_id: args.parentId || 0,
            lang_id: args.langId,
        }, domainId);
        // Step 2: Create content linked to the new menu
        const sanitizedDescription = args.description ? purifier.sanitize(args.description) : '';
        const sanitizedContent = args.content ? purifier.sanitize(args.content) : '';
        const finalDescription = (0, s3_1.resolveImagesInHtml)(sanitizedContent || sanitizedDescription);
        // ── P1-5: Enforce content size cap ──
        const sizeCheck = enforceContentSize(finalDescription, 'create_menu_with_content');
        if (!sizeCheck.ok) {
            // Roll back the menu we just created
            await menuService.deleteMenu(menu.item_id, domainId);
            return { toolName: 'create_menu_with_content', success: false, error: sizeCheck.error };
        }
        // ── P4-13: Content quality check ──
        const qualityCheck = validateContentQuality(sizeCheck.content, 'create_menu_with_content');
        if (!qualityCheck.ok) {
            await menuService.deleteMenu(menu.item_id, domainId);
            return { toolName: 'create_menu_with_content', success: false, error: qualityCheck.error };
        }
        const content = await contentService.createContent({
            title: args.title,
            description: sizeCheck.content,
            content_type: 0,
            lang_id: args.langId,
            menu_id: menu.item_id,
            status: 1,
        }, userId, domainId);
        return {
            toolName: 'create_menu_with_content',
            success: true,
            result: {
                menuId: menu.item_id,
                menuName: menu.item_name,
                contentId: content.content_id,
                title: content.title,
                langId: args.langId,
            },
        };
    }
    async createMenuItem(args, userId, domainId) {
        const menu = await menuService.createMenu({
            item_name: args.itemName,
            item_url: args.itemUrl || '',
            parent_id: args.parentId || 0,
            item_order: args.itemOrder,
            lang_id: args.langId,
        }, domainId);
        return {
            toolName: 'create_menu_item',
            success: true,
            result: { itemId: menu.item_id, itemName: menu.item_name, langId: menu.lang_id },
        };
    }
    async updateMenuItem(args, userId, domainId) {
        const updates = {};
        if (args.itemName)
            updates.item_name = args.itemName;
        if (args.itemUrl)
            updates.item_url = args.itemUrl;
        if (args.itemOrder !== undefined)
            updates.item_order = args.itemOrder;
        const updated = await menuService.updateMenu(args.itemId, updates, domainId);
        if (!updated) {
            return { toolName: 'update_menu_item', success: false, error: 'Resource not found or access denied.' };
        }
        return {
            toolName: 'update_menu_item',
            success: true,
            result: { itemId: args.itemId, updated: true },
        };
    }
    async createBanner(args, userId, domainId) {
        const banner = await Banner_1.Banner.query().insert({
            domain_id: domainId,
            title: args.title || null,
            description: args.description || '',
            image: args.photo ? (0, s3_1.resolveImageUrl)(args.photo) : null,
            lang_id: Number(args.langId) || 1,
        });
        await (0, cache_1.invalidateDomainCache)(domainId);
        return {
            toolName: 'create_banner',
            success: true,
            result: { bannerId: banner.banner_id, title: args.title },
        };
    }
    async updateBanner(args, userId, domainId) {
        const banner = await Banner_1.Banner.query().findById(args.bannerId);
        if (!banner || banner.domain_id !== domainId) {
            return { toolName: 'update_banner', success: false, error: 'Resource not found or access denied.' };
        }
        const updates = {};
        if (args.title)
            updates.title = args.title;
        if (args.description)
            updates.description = args.description;
        if (args.photo)
            updates.image = (0, s3_1.resolveImageUrl)(args.photo);
        await Banner_1.Banner.query().patch(updates).where('banner_id', args.bannerId);
        await (0, cache_1.invalidateDomainCache)(domainId);
        return {
            toolName: 'update_banner',
            success: true,
            result: { bannerId: args.bannerId, updated: true },
        };
    }
    async deleteBanner(args, userId, domainId) {
        const banner = await Banner_1.Banner.query().findById(args.bannerId);
        if (!banner || banner.domain_id !== domainId) {
            return { toolName: 'delete_banner', success: false, error: 'Resource not found or access denied.' };
        }
        await Banner_1.Banner.query().deleteById(args.bannerId);
        await (0, cache_1.invalidateDomainCache)(domainId);
        return {
            toolName: 'delete_banner',
            success: true,
            result: { bannerId: args.bannerId, deleted: true },
        };
    }
    // ── P3-11: SEO tool rate limits ──
    static MAX_SEO_OPS_PER_DAY = config_1.config.aiGuardrails.maxSeoOpsPerDay;
    static MAX_SEO_KEYWORDS = config_1.config.aiGuardrails.maxSeoKeywords;
    async checkSEORateLimit(domainId) {
        try {
            const key = `ai:seo:daily:${domainId}`;
            const count = parseInt(await redis_1.redis.get(key) || '0', 10);
            return count < AIChatService.MAX_SEO_OPS_PER_DAY;
        }
        catch {
            // If Redis is down, allow the operation
            return true;
        }
    }
    async incrementSEORateLimit(domainId) {
        try {
            const key = `ai:seo:daily:${domainId}`;
            const count = parseInt(await redis_1.redis.get(key) || '0', 10);
            // Set TTL to end of day if this is the first call
            const ttl = count === 0
                ? Math.ceil((new Date().setHours(24, 0, 0, 0) - Date.now()) / 1000)
                : undefined;
            if (ttl) {
                await redis_1.redis.setex(key, ttl, String(count + 1));
            }
            else {
                await redis_1.redis.set(key, String(count + 1));
            }
        }
        catch {
            // Ignore Redis errors
        }
    }
    async updateSEOMetadata(args, userId, domainId) {
        // ── P3-11: SEO rate limit check ──
        const seoAllowed = await this.checkSEORateLimit(domainId);
        if (!seoAllowed) {
            return {
                toolName: 'update_seo_metadata',
                success: false,
                error: `Daily SEO operation limit (${AIChatService.MAX_SEO_OPS_PER_DAY}) reached for this website. Try again tomorrow.`,
            };
        }
        // ── P3-11: Validate keyword count ──
        if (args.keywords) {
            const keywords = args.keywords.split(',').map((k) => k.trim()).filter(Boolean);
            if (keywords.length > AIChatService.MAX_SEO_KEYWORDS) {
                return {
                    toolName: 'update_seo_metadata',
                    success: false,
                    error: `Too many keywords (${keywords.length}). Maximum allowed is ${AIChatService.MAX_SEO_KEYWORDS}.`,
                };
            }
        }
        // SEO metadata is stored in content description JSON
        const currentContent = await contentService.getContent(args.contentId, domainId);
        if (!currentContent) {
            return { toolName: 'update_seo_metadata', success: false, error: 'Resource not found or access denied.' };
        }
        // For site-wide SEO (tracking_id), update settings
        if (args.keywords || args.metaDescription) {
            let description = {};
            try {
                description = currentContent.description ? JSON.parse(currentContent.description) : {};
            }
            catch {
                description = {};
            }
            if (args.metaTitle)
                description.metaTitle = args.metaTitle;
            if (args.metaDescription)
                description.metaDescription = args.metaDescription;
            if (args.keywords)
                description.keywords = args.keywords;
            await contentService.updateContent(args.contentId, { description: JSON.stringify(description) }, domainId);
        }
        await this.incrementSEORateLimit(domainId);
        await (0, cache_1.invalidateDomainCache)(domainId);
        return {
            toolName: 'update_seo_metadata',
            success: true,
            result: { contentId: args.contentId, updated: true },
        };
    }
    async generateSEOKeywords(args, userId, domainId) {
        // ── P3-11: SEO rate limit check ──
        const seoAllowed = await this.checkSEORateLimit(domainId);
        if (!seoAllowed) {
            return {
                toolName: 'generate_seo_keywords',
                success: false,
                error: `Daily SEO operation limit (${AIChatService.MAX_SEO_OPS_PER_DAY}) reached for this website. Try again tomorrow.`,
            };
        }
        const content = await contentService.getContent(args.contentId, domainId);
        const description = content.description || '';
        const keywords = await this.generateKeywordsFromContent(content.title, description);
        await this.incrementSEORateLimit(domainId);
        await (0, cache_1.invalidateDomainCache)(domainId);
        return {
            toolName: 'generate_seo_keywords',
            success: true,
            result: { contentId: args.contentId, keywords },
        };
    }
    async setupFreshWebsite(args, userId, domainId) {
        const { languageName, languageFlag, homeContent, aboutContent, serviceContent, contactContent } = args;
        const templateType = args.templateType || 'business';
        // ── P2-8: Enhanced duplicate check — content, menus, and languages ──
        const [existingContent, existingMenu, existingLang] = await Promise.all([
            Content_1.Content.query().where('domain_id', domainId).first(),
            MenuItem_1.MenuItem.query().where('domain_id', domainId).first(),
            Language_1.Language.query().where('domain_id', domainId).first(),
        ]);
        if (existingContent || existingMenu || existingLang) {
            const found = [];
            if (existingLang)
                found.push('language');
            if (existingMenu)
                found.push('menus');
            if (existingContent)
                found.push('content');
            return {
                toolName: 'setup_fresh_website',
                success: false,
                error: `Website already has ${found.join(', ')} set up. This tool is only for fresh websites with no existing data. Please use other tools to manage your website.`,
            };
        }
        // Track created resources for #9: cleanup on failure
        let createdLangId = null;
        const createdItems = [];
        try {
            // Step 1: Create language
            const language = await Language_1.Language.query().insert({
                lang_name: languageName,
                flag: languageFlag,
                domain_id: domainId,
                is_default: 1,
            });
            createdLangId = language.lang_id;
            const langId = language.lang_id;
            // Step 2: Create 4 default menus + content
            const pages = [
                { name: 'Home', content: homeContent },
                { name: 'About Us', content: aboutContent },
                { name: 'Service', content: serviceContent },
                { name: 'Contact Us', content: contactContent },
            ];
            for (const page of pages) {
                const menu = await menuService.createMenu({
                    item_name: page.name,
                    item_url: '',
                    parent_id: 0,
                    lang_id: langId,
                }, domainId);
                const sanitizedContent = (0, s3_1.resolveImagesInHtml)(page.content ? purifier.sanitize(page.content) : '');
                // ── P1-5: Enforce content size cap per page ──
                const sizeCheck = enforceContentSize(sanitizedContent, 'setup_fresh_website');
                if (!sizeCheck.ok) {
                    throw new Error(`Page "${page.name}": ${sizeCheck.error}`);
                }
                const content = await contentService.createContent({
                    title: page.name,
                    description: sizeCheck.content,
                    content_type: 0,
                    lang_id: langId,
                    menu_id: menu.item_id,
                    status: 1,
                }, userId, domainId);
                createdItems.push({ menuId: menu.item_id, contentId: content.content_id, pageName: page.name });
            }
            // Step 3: Apply template settings
            const template = aiTools_service_1.QUICK_SETUP_TEMPLATES[templateType];
            if (template) {
                await this.applyTemplateSettings(domainId, template);
            }
            await (0, cache_1.invalidateDomainCache)(domainId);
            return {
                toolName: 'setup_fresh_website',
                success: true,
                result: {
                    language: { langId, name: languageName, flag: languageFlag },
                    pages: createdItems,
                    template: templateType,
                },
            };
        }
        catch (error) {
            // #9: Cleanup partial state on failure
            console.warn('[AI Chat] setupFreshWebsite failed, cleaning up partial state:', error);
            try {
                for (const item of createdItems) {
                    await contentService.deleteContent(item.contentId, domainId).catch(() => { });
                    await menuService.deleteMenu(item.menuId, domainId).catch(() => { });
                }
                if (createdLangId) {
                    await Language_1.Language.query().deleteById(createdLangId).catch(() => { });
                }
                await (0, cache_1.invalidateDomainCache)(domainId);
            }
            catch (cleanupErr) {
                console.error('[AI Chat] Cleanup error:', cleanupErr);
            }
            return {
                toolName: 'setup_fresh_website',
                success: false,
                error: error instanceof Error ? error.message : 'Setup failed. All changes have been rolled back.',
            };
        }
    }
    async applyTemplateSettings(domainId, template) {
        const setting = await Setting_1.Setting.getByDomain(domainId);
        if (!setting)
            return;
        const updates = {};
        if (template.theme !== undefined)
            updates.theme = Number(template.theme);
        if (template.logoPosition)
            updates.logo_position = Number(template.logoPosition);
        if (template.menuPosition)
            updates.menu_position = Number(template.menuPosition);
        // page_style maps to layout: 0=classic, 1=single_page, 2=magazine, 3=hero
        if (template.layout !== undefined)
            updates.page_style = Number(template.layout);
        await Setting_1.Setting.query().patch(updates).where('setting_id', setting.setting_id);
        await (0, cache_1.invalidateDomainCache)(domainId);
    }
    async applyQuickSetupTemplate(args, domainId) {
        const template = aiTools_service_1.QUICK_SETUP_TEMPLATES[args.templateType];
        if (!template) {
            return {
                toolName: 'apply_quick_setup_template',
                success: false,
                error: `Unknown template type: ${args.templateType}`,
            };
        }
        await this.applyTemplateSettings(domainId, template);
        return {
            toolName: 'apply_quick_setup_template',
            success: true,
            result: { templateType: args.templateType, applied: true },
        };
    }
    async generateKeywordsFromContent(title, content) {
        // #10: Sanitize and truncate content to prevent injection into AI prompt
        const safeTitle = title.replace(/[^\w\sក-៿฀-๿一-鿿]/g, '').slice(0, 200);
        const safeContent = content.replace(/<[^>]*>/g, '').slice(0, 1000);
        const prompt = `Generate 5-7 relevant SEO keywords for this content:\n\nTitle: ${safeTitle}\n\nContent: ${safeContent}\n\nReturn only the keywords, comma-separated.`;
        const keywords = await aiProvider_service_1.zaiProvider.simpleChat(prompt, 'You are an SEO expert.');
        return keywords;
    }
    async buildSystemPrompt(domainId) {
        const languages = await Language_1.Language.listByDomain(domainId);
        const defaultLang = languages.find(l => l.is_default === 1) || languages[0];
        // Fresh-site detection
        if (languages.length === 0) {
            return `${SYSTEM_PROMPT}

IMPORTANT: This is a FRESH website with no language or content set up yet.
- Detect the user's language from their chat messages.
- Before creating anything, ask the user what their business/organization is about.
- Once they describe their business, call setup_fresh_website with: the detected language name, language flag (0=KH, 1=EN, 2=CH, 3=TH, 4=VN), a summary of their business, and tailored HTML content for each of the 4 pages (Home, About Us, Service, Contact Us).
- Generate rich, professional HTML content tailored to their specific business. All HTML must be mobile-responsive: use max-width:100% for images, never use fixed pixel widths, never use <table> for layout, use simple semantic HTML tags only.
- Choose the best templateType based on their business (business, portfolio, blog, or organization).`;
        }
        const menuCount = await MenuItem_1.MenuItem.query().where('domain_id', domainId).count('item_id as count').first();
        const hasMenus = Number(menuCount?.count) > 0;
        const langList = languages.map(l => `- lang_id: ${l.lang_id}, name: ${l.lang_name}${l.is_default === 1 ? ' (default)' : ''}`).join('\n');
        let langRules;
        if (languages.length === 1) {
            langRules = `This website has only ONE language: "${defaultLang.lang_name}" (lang_id: ${defaultLang.lang_id}).
- ALWAYS use lang_id ${defaultLang.lang_id} automatically. Do NOT ask the user to choose a language.`;
        }
        else {
            langRules = `This website supports these languages:
${langList}
- Detect the user's language from their message and use the matching lang_id.
- If unclear, use the default language (lang_id: ${defaultLang.lang_id}).
- Only use lang_id values listed above. Do NOT use any other values.`;
        }
        let freshMenuNote = '';
        if (!hasMenus) {
            freshMenuNote = `\n\nNOTE: This website has no pages/menus yet. Offer to help set up default pages using create_menu_with_content.`;
        }
        return `${SYSTEM_PROMPT}

Domain language settings:
${langRules}${freshMenuNote}`;
    }
    /**
     * P3-10: Tool-level permission check — replaces naive keyword matching.
     * Destructive tools (delete_*) and setup tools require admin (userLevel <= 1).
     * Returns an error string if denied, null if allowed.
     */
    checkToolPermission(toolName, userLevel) {
        const ADMIN_ONLY_TOOLS = new Set([
            'delete_article',
            'delete_menu_item',
            'delete_banner',
            'setup_fresh_website',
            'update_seo_metadata',
            'generate_seo_keywords',
        ]);
        if (ADMIN_ONLY_TOOLS.has(toolName) && userLevel > 1) {
            return `Tool "${toolName}" requires admin privileges. Please contact your administrator.`;
        }
        return null;
    }
    getOperationType(toolName) {
        if (toolName.includes('create'))
            return 'create';
        if (toolName.includes('update') || toolName.includes('apply'))
            return 'update';
        if (toolName.includes('delete'))
            return 'delete';
        return 'ui_change';
    }
    getTargetType(toolName) {
        if (toolName.includes('article') || toolName.includes('news') || toolName.includes('content'))
            return 'content';
        if (toolName.includes('menu'))
            return 'menu';
        if (toolName.includes('banner'))
            return 'banner';
        if (toolName.includes('seo'))
            return 'seo';
        return 'setting';
    }
    // ── P4-14: Rollback mechanism ──────────────────────────────────
    /**
     * Attempt to undo a recent AI operation.
     *
     * Supported rollbacks:
     *  - **create** → delete the created resource
     *  - **update** → restore the previous version from ContentVersionHistory
     *  - **delete** → cannot undo (data is already gone)
     */
    async rollbackOperation(operationId, domainId, userId) {
        const op = await AIOperationLog_1.AIOperationLog.getRollbackableOperation(operationId, domainId);
        if (!op) {
            return { toolName: 'rollback', success: false, error: 'Operation not found, already rolled back, or not eligible for rollback.' };
        }
        const opData = typeof op.operation_data === 'string'
            ? JSON.parse(op.operation_data)
            : op.operation_data;
        const toolName = opData?.toolName || 'unknown';
        let rollbackResult;
        switch (op.operation_type) {
            // ── Rollback a CREATE → delete what was created ──
            case 'create': {
                const targetId = op.target_id;
                if (!targetId) {
                    return { toolName: 'rollback', success: false, error: 'No target_id on operation — cannot determine what to undo.' };
                }
                if (op.target_type === 'content') {
                    await contentService.deleteContent(targetId, domainId);
                    rollbackResult = { toolName: 'rollback', success: true, result: { undone: 'create_article', contentId: targetId } };
                }
                else if (op.target_type === 'menu') {
                    await menuService.deleteMenu(targetId, domainId);
                    rollbackResult = { toolName: 'rollback', success: true, result: { undone: 'create_menu_item', itemId: targetId } };
                }
                else if (op.target_type === 'banner') {
                    await Banner_1.Banner.query().findById(targetId).delete();
                    await (0, cache_1.invalidateDomainCache)(domainId);
                    rollbackResult = { toolName: 'rollback', success: true, result: { undone: 'create_banner', bannerId: targetId } };
                }
                else {
                    return { toolName: 'rollback', success: false, error: `Cannot rollback create for target type "${op.target_type}".` };
                }
                break;
            }
            // ── Rollback an UPDATE → restore from version history ──
            case 'update': {
                const targetId = op.target_id;
                if (!targetId) {
                    return { toolName: 'rollback', success: false, error: 'No target_id on operation — cannot determine what to restore.' };
                }
                if (op.target_type === 'content') {
                    // Find the version created just before this operation
                    const version = await ContentVersionHistory_1.ContentVersionHistory.query()
                        .where('content_id', targetId)
                        .where('created_by', userId)
                        .orderBy('version', 'DESC')
                        .first();
                    if (version) {
                        await contentService.updateContent(targetId, {
                            title: version.title || undefined,
                            description: version.description || undefined,
                        }, domainId);
                        rollbackResult = { toolName: 'rollback', success: true, result: { undone: 'update_article', contentId: targetId, restoredVersion: version.version } };
                    }
                    else {
                        return { toolName: 'rollback', success: false, error: 'No version history found to restore from.' };
                    }
                }
                else if (op.target_type === 'setting') {
                    // Settings updates — we don't have granular versioning, so inform user
                    return { toolName: 'rollback', success: false, error: 'Settings rollback is not supported. Please update settings manually.' };
                }
                else {
                    return { toolName: 'rollback', success: false, error: `Cannot rollback update for target type "${op.target_type}".` };
                }
                break;
            }
            // ── DELETE cannot be rolled back ──
            case 'delete': {
                return { toolName: 'rollback', success: false, error: 'Delete operations cannot be rolled back. The data has been permanently removed.' };
            }
            default:
                return { toolName: 'rollback', success: false, error: `Unknown operation type: ${op.operation_type}` };
        }
        // Mark the original operation as rolled_back
        await AIOperationLog_1.AIOperationLog.updateStatus(operationId, 'rolled_back');
        // Log the rollback itself
        await AIOperationLog_1.AIOperationLog.logOperation({
            userId,
            domainId,
            operationType: 'delete', // rollback is a form of reversal
            targetType: op.target_type,
            targetId: op.target_id ?? undefined,
            operationData: { rollbackOf: operationId, result: rollbackResult },
            status: 'completed',
        });
        await (0, cache_1.invalidateDomainCache)(domainId);
        return rollbackResult;
    }
}
exports.AIChatService = AIChatService;
exports.aiChatService = new AIChatService();
//# sourceMappingURL=aiChat.service.js.map
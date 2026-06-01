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
const window = new jsdom_1.JSDOM('').window;
const purifier = (0, dompurify_1.default)(window);
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
- If you're unsure about something, ask the user for clarification
- Never make destructive changes without warning
- Respect user permissions and limits

Content creation rules (MANDATORY):
- A menu item MUST exist BEFORE any content is created. Content cannot exist without a menu.
- When a user asks to create content, always use create_menu_with_content to create both the menu and content together.
- If the user only wants a menu item (no content yet), use create_menu_item.
- If the user wants to add content to an existing menu, use create_article with the existing menuId.
- The menu language (langId) and content language (langId) MUST always match.
- When the user's language is unclear, ask which language they want before proceeding.

When users ask for help or guidance, provide clear, actionable advice.`;
class AIChatService {
    conversations = new Map();
    async checkDailyLimit(userId, domainId) {
        const usage = await AIUsageLog_1.AIUsageLog.getUsageInfo(userId, domainId);
        return {
            allowed: usage.remaining_questions > 0,
            usage,
        };
    }
    async processMessage(message, context, conversationId) {
        const { userId, domainId, userLevel, ipAddress, userAgent } = context;
        // Check permissions based on user level
        if (userLevel > 1 && this.requiresAdminAction(message)) {
            return {
                response: 'This action requires admin privileges. Please contact your administrator.',
            };
        }
        // Get or create conversation history
        let conversationHistory = [];
        if (conversationId) {
            conversationHistory = this.conversations.get(conversationId) || [];
        }
        // Convert to ZAI message format
        const zaiHistory = conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content,
        }));
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
            // Execute tool calls if any
            const toolResults = [];
            if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
                for (const toolCall of aiResponse.toolCalls) {
                    const result = await this.executeToolCall(toolCall.name, toolCall.arguments, context);
                    toolResults.push(result);
                }
            }
            // Update conversation history
            const newMessage = {
                role: 'user',
                content: message,
                timestamp: new Date().toISOString(),
            };
            const assistantMessage = {
                role: 'assistant',
                content: aiResponse.response,
                timestamp: new Date().toISOString(),
            };
            const updatedHistory = [...conversationHistory, newMessage, assistantMessage];
            if (conversationId) {
                this.conversations.set(conversationId, updatedHistory.slice(-20)); // Keep last 20 messages
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
    async executeToolCall(toolName, args, context) {
        const { userId, domainId, userLevel, ipAddress, userAgent } = context;
        try {
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
            updates.logo_position = String(Number(args.position));
        if (args.align !== undefined)
            updates.logo_align = String(Number(args.align));
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
            updates.menu_position = String(Number(args.position));
        if (args.align)
            updates.menu_align = String(Number(args.align));
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
                error: `Menu item with ID ${args.menuId} not found in this domain.`,
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
        const finalDescription = sanitizedContent || sanitizedDescription;
        const content = await contentService.createContent({
            title: args.title,
            description: finalDescription,
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
        if (args.description)
            updates.description = purifier.sanitize(args.description);
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
            shortdes: args.shortDescription || '',
            longdes: args.description || '',
            publish: args.publishDate,
        }, userId, domainId);
        return {
            toolName: 'create_news',
            success: true,
            result: { newsId: news.id, title: args.title, contentId: newsContent.content_id },
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
        const finalDescription = sanitizedContent || sanitizedDescription;
        const content = await contentService.createContent({
            title: args.title,
            description: finalDescription,
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
            return { toolName: 'update_menu_item', success: false, error: `Menu item ${args.itemId} not found` };
        }
        return {
            toolName: 'update_menu_item',
            success: true,
            result: { itemId: args.itemId, updated: true },
        };
    }
    async deleteMenuItem(args, userId, domainId) {
        await menuService.deleteMenu(args.itemId, domainId);
        return {
            toolName: 'delete_menu_item',
            success: true,
            result: { itemId: args.itemId, deleted: true },
        };
    }
    async createBanner(args, userId, domainId) {
        const banner = await Banner_1.Banner.query().insert({
            domain_id: domainId,
            title: args.title || null,
            image: args.photo || null,
            lang_id: args.langId || 1,
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
            return { toolName: 'update_banner', success: false, error: `Banner ${args.bannerId} not found` };
        }
        const updates = {};
        if (args.title)
            updates.title = args.title;
        if (args.photo)
            updates.image = args.photo;
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
            return { toolName: 'delete_banner', success: false, error: `Banner ${args.bannerId} not found` };
        }
        await Banner_1.Banner.query().deleteById(args.bannerId);
        await (0, cache_1.invalidateDomainCache)(domainId);
        return {
            toolName: 'delete_banner',
            success: true,
            result: { bannerId: args.bannerId, deleted: true },
        };
    }
    async updateSEOMetadata(args, userId, domainId) {
        // SEO metadata is stored in content description JSON
        const currentContent = await contentService.getContent(args.contentId, domainId);
        if (!currentContent) {
            return { toolName: 'update_seo_metadata', success: false, error: `Content ${args.contentId} not found` };
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
        return {
            toolName: 'update_seo_metadata',
            success: true,
            result: { contentId: args.contentId, updated: true },
        };
    }
    async generateSEOKeywords(args, userId, domainId) {
        // Implementation for generating SEO keywords
        const content = await contentService.getContent(args.contentId, domainId);
        const description = content.description || '';
        const keywords = await this.generateKeywordsFromContent(content.title, description);
        return {
            toolName: 'generate_seo_keywords',
            success: true,
            result: { contentId: args.contentId, keywords },
        };
    }
    async setupFreshWebsite(args, userId, domainId) {
        const { languageName, languageFlag, homeContent, aboutContent, serviceContent, contactContent } = args;
        const templateType = args.templateType || 'business';
        // Step 1: Create or get language
        let language = await Language_1.Language.query().where('domain_id', domainId).first();
        if (!language) {
            language = await Language_1.Language.query().insert({
                lang_name: languageName,
                flag: languageFlag,
                domain_id: domainId,
                is_default: 1,
            });
        }
        const langId = language.lang_id;
        // Step 2: Create 4 default menus
        const pages = [
            { name: 'Home', content: homeContent },
            { name: 'About Us', content: aboutContent },
            { name: 'Service', content: serviceContent },
            { name: 'Contact Us', content: contactContent },
        ];
        const createdItems = [];
        for (const page of pages) {
            // Create menu
            const menu = await menuService.createMenu({
                item_name: page.name,
                item_url: '',
                parent_id: 0,
                lang_id: langId,
            }, domainId);
            // Create content linked to menu
            const sanitizedContent = page.content ? purifier.sanitize(page.content) : '';
            const content = await contentService.createContent({
                title: page.name,
                description: sanitizedContent,
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
    async applyTemplateSettings(domainId, template) {
        const setting = await Setting_1.Setting.getByDomain(domainId);
        if (!setting)
            return;
        const updates = {};
        if (template.theme !== undefined)
            updates.theme = template.theme;
        if (template.logoPosition)
            updates.logo_position = String(Number(template.logoPosition));
        if (template.menuPosition)
            updates.menu_position = String(Number(template.menuPosition));
        // page_style maps to layout: 0=classic, 1=single_page, 2=magazine, 3=hero
        if (template.layout !== undefined)
            updates.page_style = template.layout;
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
        const prompt = `Generate 5-7 relevant SEO keywords for this content:\n\nTitle: ${title}\n\nContent: ${content}\n\nReturn only the keywords, comma-separated.`;
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
- Generate rich, professional HTML content tailored to their specific business.
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
    requiresAdminAction(message) {
        const adminKeywords = ['delete', 'remove', 'user', 'permission', 'admin'];
        return adminKeywords.some(keyword => message.toLowerCase().includes(keyword));
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
    getConversation(conversationId) {
        return this.conversations.get(conversationId) || [];
    }
    clearConversation(conversationId) {
        this.conversations.delete(conversationId);
    }
}
exports.AIChatService = AIChatService;
exports.aiChatService = new AIChatService();
//# sourceMappingURL=aiChat.service.js.map
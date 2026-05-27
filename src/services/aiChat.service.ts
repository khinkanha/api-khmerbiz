import { zaiProvider, ZAIMessage } from './aiProvider.service';
import { AI_TOOLS, QUICK_SETUP_TEMPLATES } from './aiTools.service';
import { AIUsageLog } from '../models/AIUsageLog';
import { AIOperationLog, AIOperationType, AITargetType } from '../models/AIOperationLog';
import { ContentVersionHistory } from '../models/ContentVersionHistory';
import * as contentService from './content.service';
import * as menuService from './menu.service';
import { MenuItem } from '../models/MenuItem';
import { Language } from '../models/Language';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purifier = DOMPurify(window);

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AIContext {
  userId: number;
  domainId: number;
  userLevel: number;
  langId?: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface ToolCallResult {
  toolName: string;
  success: boolean;
  result?: any;
  error?: string;
}

export interface ChatResponse {
  response: string;
  toolCalls?: ToolCallResult[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ChangePreview {
  type: string;
  operation: string;
  description: string;
  data?: any;
  preview?: string;
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

export class AIChatService {
  private conversations: Map<number, ChatMessage[]> = new Map();

  async checkDailyLimit(userId: number, domainId: number): Promise<{
    allowed: boolean;
    usage?: {
      remaining_questions: number;
      daily_limit: number;
      questions_count: number;
      reset_at: string;
    };
  }> {
    const usage = await AIUsageLog.getUsageInfo(userId, domainId);

    return {
      allowed: usage.remaining_questions > 0,
      usage,
    };
  }

  async processMessage(
    message: string,
    context: AIContext,
    conversationId?: number
  ): Promise<ChatResponse> {
    const { userId, domainId, userLevel, ipAddress, userAgent } = context;

    // Check permissions based on user level
    if (userLevel > 1 && this.requiresAdminAction(message)) {
      return {
        response: 'This action requires admin privileges. Please contact your administrator.',
      };
    }

    // Get or create conversation history
    let conversationHistory: ChatMessage[] = [];
    if (conversationId) {
      conversationHistory = this.conversations.get(conversationId) || [];
    }

    // Convert to ZAI message format
    const zaiHistory: ZAIMessage[] = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      // Build dynamic system prompt with domain languages
      const systemPrompt = await this.buildSystemPrompt(domainId);

      // Call Z AI with tools
      const aiResponse = await zaiProvider.chatWithTools(
        message,
        systemPrompt,
        AI_TOOLS,
        zaiHistory
      );

      // Execute tool calls if any
      const toolResults: ToolCallResult[] = [];
      if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
        for (const toolCall of aiResponse.toolCalls) {
          const result = await this.executeToolCall(
            toolCall.name,
            toolCall.arguments,
            context
          );
          toolResults.push(result);
        }
      }

      // Update conversation history
      const newMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [...conversationHistory, newMessage, assistantMessage];
      if (conversationId) {
        this.conversations.set(conversationId, updatedHistory.slice(-20)); // Keep last 20 messages
      }

      // Increment usage
      await AIUsageLog.incrementUsage(userId, domainId);

      return {
        response: aiResponse.response,
        toolCalls: toolResults,
        usage: aiResponse.usage,
      };
    } catch (error) {
      console.error('Error processing AI message:', error);
      throw error;
    }
  }

  private async executeToolCall(
    toolName: string,
    args: Record<string, any>,
    context: AIContext
  ): Promise<ToolCallResult> {
    const { userId, domainId, userLevel, ipAddress, userAgent } = context;

    try {
      // Log the operation
      await AIOperationLog.logOperation({
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
          return await this.updateTheme(args as { theme: number }, domainId);
        case 'update_layout':
          return await this.updateLayout(args as { layout: number }, domainId);
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
          return await this.deleteArticle(args as { contentId: number }, userId, domainId);
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
          return await this.deleteMenuItem(args as { itemId: number }, userId, domainId);

        // Banner Management
        case 'create_banner':
          return await this.createBanner(args, userId, domainId);
        case 'update_banner':
          return await this.updateBanner(args, userId, domainId);
        case 'delete_banner':
          return await this.deleteBanner(args as { bannerId: number }, userId, domainId);

        // SEO Tools
        case 'update_seo_metadata':
          return await this.updateSEOMetadata(args, userId, domainId);
        case 'generate_seo_keywords':
          return await this.generateSEOKeywords(args as { contentId: number }, userId, domainId);

        // Quick Setup
        case 'apply_quick_setup_template':
          return await this.applyQuickSetupTemplate(args as { templateType: string }, domainId);

        default:
          return {
            toolName,
            success: false,
            error: `Unknown tool: ${toolName}`,
          };
      }
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      return {
        toolName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async updateTheme(args: { theme: number }, domainId: number): Promise<ToolCallResult> {
    // Update theme in settings
    // Implementation would call setting service
    return {
      toolName: 'update_theme',
      success: true,
      result: { theme: args.theme },
    };
  }

  private async updateLayout(args: { layout: number }, domainId: number): Promise<ToolCallResult> {
    return {
      toolName: 'update_layout',
      success: true,
      result: { layout: args.layout },
    };
  }

  private async updateLogoPosition(args: any, domainId: number): Promise<ToolCallResult> {
    return {
      toolName: 'update_logo_position',
      success: true,
      result: args,
    };
  }

  private async updateMenuPosition(args: any, domainId: number): Promise<ToolCallResult> {
    return {
      toolName: 'update_menu_position',
      success: true,
      result: args,
    };
  }

  private async updateArticleDisplay(args: any, domainId: number): Promise<ToolCallResult> {
    return {
      toolName: 'update_article_display',
      success: true,
      result: args,
    };
  }

  private async updateNewsDisplay(args: any, domainId: number): Promise<ToolCallResult> {
    return {
      toolName: 'update_news_display',
      success: true,
      result: args,
    };
  }

  private async updatePhotoGalleryDisplay(args: any, domainId: number): Promise<ToolCallResult> {
    return {
      toolName: 'update_photo_gallery_display',
      success: true,
      result: args,
    };
  }

  private async createArticle(args: any, userId: number, domainId: number): Promise<ToolCallResult> {
    // Validate menuId is provided
    if (!args.menuId) {
      return {
        toolName: 'create_article',
        success: false,
        error: 'A menu ID is required to create an article. Please create a menu first or use create_menu_with_content.',
      };
    }

    // Validate menu exists and belongs to the domain
    const menu = await MenuItem.query()
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

    const content = await contentService.createContent(
      {
        title: args.title,
        description: finalDescription,
        content_type: 0,
        lang_id: menu.lang_id,
        menu_id: args.menuId,
        status: 1,
      },
      userId,
      domainId
    );

    return {
      toolName: 'create_article',
      success: true,
      result: { contentId: content.content_id, title: content.title, menuId: args.menuId },
    };
  }

  private async updateArticle(args: any, userId: number, domainId: number): Promise<ToolCallResult> {
    // Create version before updating
    const currentContent = await contentService.getContent(args.contentId, domainId);

    await ContentVersionHistory.createVersion(
      args.contentId,
      {
        title: currentContent.title,
        description: currentContent.description,
      },
      userId
    );

    // Sanitize updates
    const updates: any = {};
    if (args.title) updates.title = args.title;
    if (args.description) updates.description = purifier.sanitize(args.description);

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

  private async deleteArticle(args: { contentId: number }, userId: number, domainId: number): Promise<ToolCallResult> {
    await contentService.deleteContent(args.contentId, domainId);

    return {
      toolName: 'delete_article',
      success: true,
      result: { contentId: args.contentId, deleted: true },
    };
  }

  private async createNews(args: any, userId: number, domainId: number): Promise<ToolCallResult> {
    // Implementation for creating news
    return {
      toolName: 'create_news',
      success: true,
      result: { title: args.title, created: true },
    };
  }

  private async createMenuWithContent(args: any, userId: number, domainId: number): Promise<ToolCallResult> {
    // Step 1: Create menu item
    const menu = await menuService.createMenu(
      {
        item_name: args.menuName,
        item_url: '',
        parent_id: args.parentId || 0,
        lang_id: args.langId,
      },
      domainId
    );

    // Step 2: Create content linked to the new menu
    const sanitizedDescription = args.description ? purifier.sanitize(args.description) : '';
    const sanitizedContent = args.content ? purifier.sanitize(args.content) : '';
    const finalDescription = sanitizedContent || sanitizedDescription;

    const content = await contentService.createContent(
      {
        title: args.title,
        description: finalDescription,
        content_type: 0,
        lang_id: args.langId,
        menu_id: menu.item_id,
        status: 1,
      },
      userId,
      domainId
    );

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

  private async createMenuItem(args: any, userId: number, domainId: number): Promise<ToolCallResult> {
    const menu = await menuService.createMenu(
      {
        item_name: args.itemName,
        item_url: args.itemUrl || '',
        parent_id: args.parentId || 0,
        item_order: args.itemOrder,
        lang_id: args.langId,
      },
      domainId
    );

    return {
      toolName: 'create_menu_item',
      success: true,
      result: { itemId: menu.item_id, itemName: menu.item_name, langId: menu.lang_id },
    };
  }

  private async updateMenuItem(args: any, userId: number, domainId: number): Promise<ToolCallResult> {
    // Implementation for updating menu item
    return {
      toolName: 'update_menu_item',
      success: true,
      result: { itemId: args.itemId, updated: true },
    };
  }

  private async deleteMenuItem(args: { itemId: number }, userId: number, domainId: number): Promise<ToolCallResult> {
    // Implementation for deleting menu item
    return {
      toolName: 'delete_menu_item',
      success: true,
      result: { itemId: args.itemId, deleted: true },
    };
  }

  private async createBanner(args: any, userId: number, domainId: number): Promise<ToolCallResult> {
    // Implementation for creating banner
    return {
      toolName: 'create_banner',
      success: true,
      result: { title: args.title, created: true },
    };
  }

  private async updateBanner(args: any, userId: number, domainId: number): Promise<ToolCallResult> {
    // Implementation for updating banner
    return {
      toolName: 'update_banner',
      success: true,
      result: { bannerId: args.bannerId, updated: true },
    };
  }

  private async deleteBanner(args: { bannerId: number }, userId: number, domainId: number): Promise<ToolCallResult> {
    // Implementation for deleting banner
    return {
      toolName: 'delete_banner',
      success: true,
      result: { bannerId: args.bannerId, deleted: true },
    };
  }

  private async updateSEOMetadata(args: any, userId: number, domainId: number): Promise<ToolCallResult> {
    // Implementation for updating SEO metadata
    return {
      toolName: 'update_seo_metadata',
      success: true,
      result: { contentId: args.contentId, updated: true },
    };
  }

  private async generateSEOKeywords(args: { contentId: number }, userId: number, domainId: number): Promise<ToolCallResult> {
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

  private async applyQuickSetupTemplate(args: { templateType: string }, domainId: number): Promise<ToolCallResult> {
    const template = QUICK_SETUP_TEMPLATES[args.templateType as keyof typeof QUICK_SETUP_TEMPLATES];

    if (!template) {
      return {
        toolName: 'apply_quick_setup_template',
        success: false,
        error: `Unknown template type: ${args.templateType}`,
      };
    }

    // Apply all template settings
    // Implementation would update settings based on template

    return {
      toolName: 'apply_quick_setup_template',
      success: true,
      result: { templateType: args.templateType, applied: true },
    };
  }

  private async generateKeywordsFromContent(title: string, content: string): Promise<string> {
    const prompt = `Generate 5-7 relevant SEO keywords for this content:\n\nTitle: ${title}\n\nContent: ${content}\n\nReturn only the keywords, comma-separated.`;

    const keywords = await zaiProvider.simpleChat(prompt, 'You are an SEO expert.');
    return keywords;
  }

  private async buildSystemPrompt(domainId: number): Promise<string> {
    const languages = await Language.listByDomain(domainId);
    const defaultLang = languages.find(l => l.is_default === 1) || languages[0];

    const langList = languages.map(l =>
      `- lang_id: ${l.lang_id}, name: ${l.lang_name}${l.is_default === 1 ? ' (default)' : ''}`
    ).join('\n');

    let langRules: string;
    if (languages.length === 1) {
      langRules = `This website has only ONE language: "${defaultLang.lang_name}" (lang_id: ${defaultLang.lang_id}).
- ALWAYS use lang_id ${defaultLang.lang_id} automatically. Do NOT ask the user to choose a language.`;
    } else {
      langRules = `This website supports these languages:
${langList}
- Detect the user's language from their message and use the matching lang_id.
- If unclear, use the default language (lang_id: ${defaultLang.lang_id}).
- Only use lang_id values listed above. Do NOT use any other values.`;
    }

    return `${SYSTEM_PROMPT}

Domain language settings:
${langRules}`;
  }

  private requiresAdminAction(message: string): boolean {
    const adminKeywords = ['delete', 'remove', 'user', 'permission', 'admin'];
    return adminKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private getOperationType(toolName: string): AIOperationType {
    if (toolName.includes('create')) return 'create';
    if (toolName.includes('update') || toolName.includes('apply')) return 'update';
    if (toolName.includes('delete')) return 'delete';
    return 'ui_change';
  }

  private getTargetType(toolName: string): AITargetType {
    if (toolName.includes('article') || toolName.includes('news') || toolName.includes('content')) return 'content';
    if (toolName.includes('menu')) return 'menu';
    if (toolName.includes('banner')) return 'banner';
    if (toolName.includes('seo')) return 'seo';
    return 'setting';
  }

  getConversation(conversationId: number): ChatMessage[] {
    return this.conversations.get(conversationId) || [];
  }

  clearConversation(conversationId: number): void {
    this.conversations.delete(conversationId);
  }
}

export const aiChatService = new AIChatService();

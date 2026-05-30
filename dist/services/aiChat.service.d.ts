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
export declare class AIChatService {
    private conversations;
    checkDailyLimit(userId: number, domainId: number): Promise<{
        allowed: boolean;
        usage?: {
            remaining_questions: number;
            daily_limit: number;
            questions_count: number;
            reset_at: string;
        };
    }>;
    processMessage(message: string, context: AIContext, conversationId?: number): Promise<ChatResponse>;
    private executeToolCall;
    private updateTheme;
    private updateLayout;
    private updateLogoPosition;
    private updateMenuPosition;
    private updateArticleDisplay;
    private updateNewsDisplay;
    private updatePhotoGalleryDisplay;
    private createArticle;
    private updateArticle;
    private deleteArticle;
    private createNews;
    private createMenuWithContent;
    private createMenuItem;
    private updateMenuItem;
    private deleteMenuItem;
    private createBanner;
    private updateBanner;
    private deleteBanner;
    private updateSEOMetadata;
    private generateSEOKeywords;
    private setupFreshWebsite;
    private applyTemplateSettings;
    private applyQuickSetupTemplate;
    private generateKeywordsFromContent;
    private buildSystemPrompt;
    private requiresAdminAction;
    private getOperationType;
    private getTargetType;
    getConversation(conversationId: number): ChatMessage[];
    clearConversation(conversationId: number): void;
}
export declare const aiChatService: AIChatService;
//# sourceMappingURL=aiChat.service.d.ts.map
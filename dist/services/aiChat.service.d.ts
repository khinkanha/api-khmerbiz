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
    needsConfirmation?: boolean;
    confirmationId?: string;
    confirmationPreview?: string;
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
    private memoryConversations;
    private static CONVERSATION_TTL;
    private static CONVERSATION_MAX_MESSAGES;
    private getConversation;
    private setConversation;
    clearConversation(conversationId: number): Promise<void>;
    private pendingConfirmations;
    private static CONFIRMATION_TTL;
    private static readonly DESTRUCTIVE_TOOLS;
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
    private validateToolArgs;
    private verifyContentOwnership;
    private verifyMenuOwnership;
    private executeToolCall;
    /**
     * P0-2: Verify that the target resource belongs to the given domain.
     * Returns an error string if ownership check fails, or null if OK.
     */
    private checkToolOwnership;
    private createDestructiveConfirmation;
    /**
     * P1-4: Execute a previously-confirmed destructive action.
     * #1: Added userId ownership check.
     * #4: Added claimed flag for race condition protection.
     */
    executeConfirmedAction(confirmationId: string, userId: number, domainId: number): Promise<ToolCallResult>;
    /**
     * P1-4: Cancel a pending destructive action.
     * #1: Added userId ownership check.
     */
    cancelConfirmedAction(confirmationId: string, userId: number, domainId: number): boolean;
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
    private deleteMenuItem;
    private createMenuWithContent;
    private createMenuItem;
    private updateMenuItem;
    private createBanner;
    private updateBanner;
    private deleteBanner;
    private static readonly MAX_SEO_OPS_PER_DAY;
    private static readonly MAX_SEO_KEYWORDS;
    private checkSEORateLimit;
    private incrementSEORateLimit;
    private updateSEOMetadata;
    private generateSEOKeywords;
    private setupFreshWebsite;
    private applyTemplateSettings;
    private applyQuickSetupTemplate;
    private generateKeywordsFromContent;
    private buildSystemPrompt;
    /**
     * P3-10: Tool-level permission check — replaces naive keyword matching.
     * Destructive tools (delete_*) and setup tools require admin (userLevel <= 1).
     * Returns an error string if denied, null if allowed.
     */
    private checkToolPermission;
    private getOperationType;
    private getTargetType;
    /**
     * Attempt to undo a recent AI operation.
     *
     * Supported rollbacks:
     *  - **create** → delete the created resource
     *  - **update** → restore the previous version from ContentVersionHistory
     *  - **delete** → cannot undo (data is already gone)
     */
    rollbackOperation(operationId: number, domainId: number, userId: number): Promise<ToolCallResult>;
}
export declare const aiChatService: AIChatService;
//# sourceMappingURL=aiChat.service.d.ts.map
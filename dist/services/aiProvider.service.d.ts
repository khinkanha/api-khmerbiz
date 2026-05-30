export interface ZAIMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    tool_call_id?: string;
}
export interface ZAITool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, any>;
    };
}
export interface ZAIRequest {
    model: string;
    messages: ZAIMessage[];
    tools?: ZAITool[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}
export interface ZAIResponse {
    id: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string | null;
            tool_calls?: Array<{
                id: string;
                type: string;
                function: {
                    name: string;
                    arguments: string;
                };
            }>;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export interface ZAIError {
    error: {
        message: string;
        type: string;
        code: string;
    };
}
export declare class ZAIProvider {
    private apiKey;
    private baseUrl;
    private model;
    private temperature;
    private maxTokens;
    constructor();
    private makeRequest;
    chat(messages: ZAIMessage[], tools?: ZAITool[], options?: {
        temperature?: number;
        maxTokens?: number;
    }): Promise<ZAIResponse>;
    private tryParseArguments;
    chatWithTools(userMessage: string, systemPrompt: string, tools: ZAITool[], conversationHistory?: ZAIMessage[], maxRetries?: number): Promise<{
        response: string;
        toolCalls?: Array<{
            id: string;
            name: string;
            arguments: Record<string, any>;
        }>;
        usage: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
        };
        repaired?: boolean;
    }>;
    simpleChat(userMessage: string, systemPrompt: string, conversationHistory?: ZAIMessage[]): Promise<string>;
    getModelInfo(): {
        model: string;
        temperature: number;
        maxTokens: number;
    };
    isConfigured(): boolean;
}
export declare const zaiProvider: ZAIProvider;
//# sourceMappingURL=aiProvider.service.d.ts.map
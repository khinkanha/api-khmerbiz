"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zaiProvider = exports.ZAIProvider = void 0;
const config_1 = require("../config");
class ZAIProvider {
    apiKey;
    baseUrl;
    model;
    temperature;
    maxTokens;
    constructor() {
        this.apiKey = config_1.config.zai.apiKey;
        this.baseUrl = config_1.config.zai.baseUrl;
        this.model = config_1.config.zai.model;
        this.temperature = config_1.config.zai.temperature;
        this.maxTokens = config_1.config.zai.maxTokens;
        if (!this.apiKey) {
            console.warn('ZAI API key not configured. AI features will not work.');
        }
    }
    async makeRequest(request) {
        if (!this.apiKey) {
            throw new Error('ZAI API key not configured');
        }
        const url = `${this.baseUrl}/chat/completions`;
        const startTime = Date.now();
        console.log(`[AI Provider] Sending request to ${url} (model: ${request.model}, max_tokens: ${request.max_tokens})`);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...request,
                    model: request.model || this.model,
                    temperature: request.temperature ?? this.temperature,
                    max_tokens: request.max_tokens ?? this.maxTokens,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`ZAI API error: ${errorData.error.message} (${errorData.error.code})`);
            }
            const data = await response.json();
            const elapsed = Date.now() - startTime;
            console.log(`[AI Provider] Response received in ${elapsed}ms (finish_reason: ${data.choices?.[0]?.finish_reason}, tool_calls: ${data.choices?.[0]?.message?.tool_calls?.length || 0})`);
            return data;
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Unknown error calling ZAI API');
        }
    }
    async chat(messages, tools, options) {
        const request = {
            model: this.model,
            messages,
            tools,
            temperature: options?.temperature,
            max_tokens: options?.maxTokens,
        };
        return await this.makeRequest(request);
    }
    tryParseArguments(argsStr) {
        try {
            return JSON.parse(argsStr);
        }
        catch {
            // Try to repair truncated JSON: close any open strings and braces
            let repaired = argsStr.trimEnd();
            // Count unescaped quotes to detect if we're inside a string
            let inString = false;
            for (let i = 0; i < repaired.length; i++) {
                if (repaired[i] === '\\' && inString) {
                    i++;
                    continue;
                }
                if (repaired[i] === '"')
                    inString = !inString;
            }
            if (inString) {
                // Find the last property name before the truncated value
                const lastKeyMatch = repaired.match(/"([^"]+)"\s*:\s*"([^"]*)$/);
                if (lastKeyMatch) {
                    // Truncate the incomplete string value and close the object
                    repaired = repaired.slice(0, repaired.lastIndexOf('"' + lastKeyMatch[1] + '"'));
                    // Remove trailing comma if present
                    repaired = repaired.replace(/,\s*$/, '');
                }
                else {
                    // Just close the string and object
                    repaired += '"';
                }
            }
            // Close any open braces/brackets
            let openBraces = 0, openBrackets = 0;
            let inStr = false;
            for (let i = 0; i < repaired.length; i++) {
                if (repaired[i] === '\\' && inStr) {
                    i++;
                    continue;
                }
                if (repaired[i] === '"')
                    inStr = !inStr;
                if (!inStr) {
                    if (repaired[i] === '{')
                        openBraces++;
                    if (repaired[i] === '}')
                        openBraces--;
                    if (repaired[i] === '[')
                        openBrackets++;
                    if (repaired[i] === ']')
                        openBrackets--;
                }
            }
            repaired += ']'.repeat(Math.max(0, openBrackets));
            repaired += '}'.repeat(Math.max(0, openBraces));
            try {
                return JSON.parse(repaired);
            }
            catch {
                return null;
            }
        }
    }
    async chatWithTools(userMessage, systemPrompt, tools, conversationHistory = [], maxRetries = 2) {
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: userMessage },
        ];
        // Use higher token limit when tools are available (tool calls with HTML content are large)
        const maxTokens = tools && tools.length > 0 ? 8192 : this.maxTokens;
        const response = await this.chat(messages, tools, { maxTokens });
        if (!response.choices || response.choices.length === 0) {
            throw new Error('ZAI API returned no choices. Response: ' + JSON.stringify(response));
        }
        const choice = response.choices[0];
        let repaired = false;
        const toolCalls = choice.message.tool_calls?.map(tc => {
            let args = this.tryParseArguments(tc.function.arguments);
            if (!args) {
                if (maxRetries > 0) {
                    console.warn(`[AI] Failed to parse tool arguments for "${tc.function.name}", will retry`);
                    throw new Error(`RETRY_NEEDED:${tc.function.name}`);
                }
                // Last resort: treat as empty arguments
                console.error(`[AI] Could not parse tool arguments for "${tc.function.name}": ${tc.function.arguments.slice(0, 200)}...`);
                args = {};
                repaired = true;
            }
            return {
                id: tc.id,
                name: tc.function.name,
                arguments: args,
            };
        });
        return {
            response: choice.message.content || '',
            toolCalls,
            usage: {
                promptTokens: response.usage.prompt_tokens,
                completionTokens: response.usage.completion_tokens,
                totalTokens: response.usage.total_tokens,
            },
            repaired,
        };
    }
    async simpleChat(userMessage, systemPrompt, conversationHistory = []) {
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: userMessage },
        ];
        const response = await this.chat(messages);
        return response.choices[0].message.content || '';
    }
    getModelInfo() {
        return {
            model: this.model,
            temperature: this.temperature,
            maxTokens: this.maxTokens,
        };
    }
    isConfigured() {
        return !!this.apiKey;
    }
}
exports.ZAIProvider = ZAIProvider;
exports.zaiProvider = new ZAIProvider();
//# sourceMappingURL=aiProvider.service.js.map
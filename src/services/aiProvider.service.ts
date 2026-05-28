import { config } from '../config';

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

export class ZAIProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor() {
    this.apiKey = config.zai.apiKey;
    this.baseUrl = config.zai.baseUrl;
    this.model = config.zai.model;
    this.temperature = config.zai.temperature;
    this.maxTokens = config.zai.maxTokens;

    if (!this.apiKey) {
      console.warn('ZAI API key not configured. AI features will not work.');
    }
  }

  private async makeRequest(request: ZAIRequest): Promise<ZAIResponse> {
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
        const errorData: ZAIError = await response.json();
        throw new Error(`ZAI API error: ${errorData.error.message} (${errorData.error.code})`);
      }

      const data: ZAIResponse = await response.json();
      const elapsed = Date.now() - startTime;
      console.log(`[AI Provider] Response received in ${elapsed}ms (finish_reason: ${data.choices?.[0]?.finish_reason}, tool_calls: ${data.choices?.[0]?.message?.tool_calls?.length || 0})`);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error calling ZAI API');
    }
  }

  async chat(
    messages: ZAIMessage[],
    tools?: ZAITool[],
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<ZAIResponse> {
    const request: ZAIRequest = {
      model: this.model,
      messages,
      tools,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
    };

    return await this.makeRequest(request);
  }

  private tryParseArguments(argsStr: string): Record<string, any> | null {
    try {
      return JSON.parse(argsStr);
    } catch {
      // Try to repair truncated JSON: close any open strings and braces
      let repaired = argsStr.trimEnd();
      // Count unescaped quotes to detect if we're inside a string
      let inString = false;
      for (let i = 0; i < repaired.length; i++) {
        if (repaired[i] === '\\' && inString) { i++; continue; }
        if (repaired[i] === '"') inString = !inString;
      }
      if (inString) {
        // Find the last property name before the truncated value
        const lastKeyMatch = repaired.match(/"([^"]+)"\s*:\s*"([^"]*)$/);
        if (lastKeyMatch) {
          // Truncate the incomplete string value and close the object
          repaired = repaired.slice(0, repaired.lastIndexOf('"' + lastKeyMatch[1] + '"'));
          // Remove trailing comma if present
          repaired = repaired.replace(/,\s*$/, '');
        } else {
          // Just close the string and object
          repaired += '"';
        }
      }
      // Close any open braces/brackets
      let openBraces = 0, openBrackets = 0;
      let inStr = false;
      for (let i = 0; i < repaired.length; i++) {
        if (repaired[i] === '\\' && inStr) { i++; continue; }
        if (repaired[i] === '"') inStr = !inStr;
        if (!inStr) {
          if (repaired[i] === '{') openBraces++;
          if (repaired[i] === '}') openBraces--;
          if (repaired[i] === '[') openBrackets++;
          if (repaired[i] === ']') openBrackets--;
        }
      }
      repaired += ']'.repeat(Math.max(0, openBrackets));
      repaired += '}'.repeat(Math.max(0, openBraces));

      try {
        return JSON.parse(repaired);
      } catch {
        return null;
      }
    }
  }

  async chatWithTools(
    userMessage: string,
    systemPrompt: string,
    tools: ZAITool[],
    conversationHistory: ZAIMessage[] = [],
    maxRetries = 2
  ): Promise<{
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
  }> {
    const messages: ZAIMessage[] = [
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

  async simpleChat(
    userMessage: string,
    systemPrompt: string,
    conversationHistory: ZAIMessage[] = []
  ): Promise<string> {
    const messages: ZAIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const response = await this.chat(messages);
    return response.choices[0].message.content || '';
  }

  getModelInfo(): {
    model: string;
    temperature: number;
    maxTokens: number;
  } {
    return {
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
    };
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const zaiProvider = new ZAIProvider();

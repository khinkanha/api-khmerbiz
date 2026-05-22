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

  async chatWithTools(
    userMessage: string,
    systemPrompt: string,
    tools: ZAITool[],
    conversationHistory: ZAIMessage[] = []
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
  }> {
    const messages: ZAIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const response = await this.chat(messages, tools);

    if (!response.choices || response.choices.length === 0) {
      throw new Error('ZAI API returned no choices. Response: ' + JSON.stringify(response));
    }

    const choice = response.choices[0];
    const toolCalls = choice.message.tool_calls?.map(tc => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    }));

    return {
      response: choice.message.content || '',
      toolCalls,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
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

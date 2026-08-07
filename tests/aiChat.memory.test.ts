/**
 * Unit tests for the AI conversation-memory rebuild logic (the fix for the
 * "AI keeps re-asking for the photo links" bug). These exercise the PURE logic —
 * no DB, no Redis, no Zhipu API — so they run anywhere.
 *
 * The core invariant under test: an assistant turn is NEVER dropped, even when the
 * model returned no text (common with Zhipu/GLM tool-call-only turns). Dropping it
 * left two consecutive `user` messages, which made the model lose the thread.
 */
import { aiChatService } from '../src/services/aiChat.service';
import type { ZAIMessage } from '../src/services/aiProvider.service';

// Private helpers are accessed via cast (they're private only at compile time).
const svc = aiChatService as any;

/** Assert no two consecutive messages share a role (the bug signature). */
function assertNoConsecutiveSameRole(history: ZAIMessage[]) {
  for (let i = 1; i < history.length; i++) {
    if (history[i].role === history[i - 1].role) {
      throw new Error(
        `Two consecutive "${history[i].role}" messages at index ${i - 1},${i} — ` +
        `this is exactly the bug that makes the AI re-ask questions.`
      );
    }
  }
}

describe('AI chat conversation-memory rebuild', () => {
  it('never drops a tool-call-only assistant turn (the re-ask bug)', () => {
    const history: ZAIMessage[] = svc.rebuildHistory([
      {
        userMessage: 'create content with 3 photo images',
        assistantText: '', // GLM often returns null/empty content on tool calls
        assistantToolCalls: [
          { id: 'call_1', name: 'create_article', arguments: '{"menuId":5}' },
        ],
        toolResults: [
          { toolName: 'create_article', success: true, result: { contentId: 9 } },
        ],
      },
    ]);

    expect(history.map((m) => m.role)).toEqual(['user', 'assistant', 'tool']);
    expect(history[1].content).toBeTruthy(); // placeholder fills the empty text
    expect(history[1].tool_calls).toHaveLength(1);
    expect(history[2].tool_call_id).toBe('call_1');
    assertNoConsecutiveSameRole(history);
  });

  it('never drops a text-only assistant turn even when text is empty', () => {
    const history: ZAIMessage[] = svc.rebuildHistory([
      { userMessage: 'hi', assistantText: '', assistantToolCalls: [], toolResults: [] },
    ]);

    expect(history.map((m) => m.role)).toEqual(['user', 'assistant']);
    expect(history[1].content).toBeTruthy(); // "(no response)" placeholder
    assertNoConsecutiveSameRole(history);
  });

  it('replays the prior question so the model can continue the photo scenario', () => {
    // Turn 1: user wants 3-photo content; AI asks for the links (text only).
    // This message MUST appear in memory so that when the user replies with the
    // links, the model continues instead of re-asking.
    const history: ZAIMessage[] = svc.rebuildHistory([
      {
        userMessage: 'create content with 3 photo images',
        assistantText: 'Sure — please share the 3 photo links.',
        assistantToolCalls: [],
        toolResults: [],
      },
    ]);

    expect(
      history.some(
        (m) => m.role === 'assistant' && /photo links/i.test(m.content)
      )
    ).toBe(true);
  });

  it('keeps proper alternation across multiple mixed turns', () => {
    const history: ZAIMessage[] = svc.rebuildHistory([
      {
        userMessage: 'create content with 3 photos',
        assistantText: 'please give me the links',
        assistantToolCalls: [],
        toolResults: [],
      },
      {
        userMessage: 'uploads/a.jpg, uploads/b.jpg, uploads/c.jpg',
        assistantText: '', // tool-call-only turn
        assistantToolCalls: [
          { id: 'c1', name: 'create_article', arguments: '{}' },
        ],
        toolResults: [{ toolName: 'create_article', success: true, result: {} }],
      },
    ]);

    assertNoConsecutiveSameRole(history);
    expect(history[0].role).toBe('user');
    // 2 turns × (user + assistant + tool) but turn 1 has no tool
    expect(history.length).toBe(5);
  });

  it('matches tool results to tool calls by id', () => {
    const history: ZAIMessage[] = svc.rebuildHistory([
      {
        userMessage: 'do two things',
        assistantText: '',
        assistantToolCalls: [
          { id: 'a', name: 'create_menu_item', arguments: '{}' },
          { id: 'b', name: 'create_article', arguments: '{}' },
        ],
        toolResults: [
          { toolName: 'create_menu_item', success: true, result: { itemId: 1 } },
          { toolName: 'create_article', success: false, error: 'boom' },
        ],
      },
    ]);

    const toolMsgs = history.filter((m) => m.role === 'tool');
    expect(toolMsgs).toHaveLength(2);
    expect(toolMsgs[0].tool_call_id).toBe('a');
    expect(toolMsgs[1].tool_call_id).toBe('b');
    expect(toolMsgs[1].content).toContain('boom');
  });

  it('caps large tool results to bound prompt tokens', () => {
    const big = 'x'.repeat(200_000);
    const out: string = svc.summarizeToolResult({
      toolName: 'create_article',
      success: true,
      result: { html: big },
    });
    expect(out.length).toBeLessThanOrEqual(800);
  });

  it('tolerates old rows that predate tool-call replay (backward compat)', () => {
    // Old rows have empty assistantToolCalls/toolResults and only legacy text.
    const history: ZAIMessage[] = svc.rebuildHistory([
      {
        userMessage: 'old turn',
        assistantText: 'old reply',
        assistantToolCalls: [], // absent in legacy rows
        toolResults: [],
      },
    ]);
    expect(history.map((m) => m.role)).toEqual(['user', 'assistant']);
    expect(history[1].content).toBe('old reply');
  });
});

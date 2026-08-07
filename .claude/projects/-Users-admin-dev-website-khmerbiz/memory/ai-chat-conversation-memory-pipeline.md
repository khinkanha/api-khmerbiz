---
name: ai-chat-conversation-memory-pipeline
description: How the AI chat multi-turn memory works in api-khmerbiz (persist + replay)
metadata:
  type: project
---

AI chat multi-turn memory in `api-khmerbiz` is server-side and durable (no Redis cache):

1. Each turn is persisted by `AIOperationLog.logConversation` into `ai_operation_logs` (operation_type `'conversation'`). It stores `userMessage`, assistant text (`assistantText`/legacy `aiResponse`), `assistantToolCalls` (raw, string-args, for replay), and `toolResults`.
2. On the next message, `processMessage` loads recent turns via `getRecentConversationHistory` and rebuilds them with `AIChatService.rebuildHistory` into OpenAI-format messages: `user → assistant(text + tool_calls) → tool(result)`.
3. **Key invariant:** the assistant turn is NEVER dropped. Previously, tool-call-only turns (common with Zhipu/GLM, where `content` is null) stored an empty `aiResponse` that got skipped, leaving two consecutive `user` messages — the model then re-asked the same question ("keeps asking for photo links" bug).

Tool results replayed into memory are capped (`MAX_TOOL_RESULT_CHARS = 800`, via `summarizeToolResult`/`shrinkForMemory`) to bound prompt tokens. Memory is keyed by user + domain, no TTL.

**How to apply:** When touching this flow, preserve the never-drop-assistant rule and keep tool-call → tool-result positional matching. Tune history size via `AI_CONVERSATION_MAX_MSGS` (default 20; each turn is heavier now since it carries tool calls + results). Depends on the schema being correct — see [[api-no-migration-system-schema-drift]].

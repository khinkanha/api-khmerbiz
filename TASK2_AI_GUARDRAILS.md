# Task 2: AI Guardrails Implementation

**Status:** ✅ Implemented

---

## ✅ Already Implemented (pre-existing)

| Guardrail | Status |
|-----------|--------|
| Daily question limit (10/day) | ✅ `aiRateLimit.ts` |
| Auth required for AI | ✅ `authenticate` middleware |
| Domain-scoped operations | ✅ `domainId` from JWT |
| Admin check for delete/remove | ✅ `requiresAdminAction()` |
| HTML sanitization (DOMPurify) | ✅ On content creation |
| Language validation | ✅ Menu lang = content lang |
| Menu must exist before content | ✅ Validated in `createArticle` |
| Operation logging | ✅ `AIOperationLog` |
| Version history before update | ✅ `ContentVersionHistory` |
| Input validation (Zod, max 5000 chars) | ✅ Route schema |

---

## ✅ P0 — Critical (implemented)

### 1. Prompt Injection Protection
- **File:** `src/middleware/aiInputSanitizer.ts` (new)
- Integration: `src/controllers/aiChat.controller.ts` — `sanitizeAIInput()` called before processing
- Pattern-based detection with risk scoring (block at score ≥3, sanitize at ≥1)
- Auto-strips suspicious lines, preserves legitimate content

### 2. Domain Ownership Validation on All Tools
- **File:** `src/services/aiChat.service.ts` — `checkToolOwnership()` + `verifyContentOwnership()` / `verifyMenuOwnership()`
- Runs before every tool execution in `executeToolCall()`
- Checks: `update_article`, `delete_article`, `update_menu_item`, `delete_menu_item`, `update_banner`, `delete_banner`, `create_article` (menu ownership), `update_seo_metadata`, `generate_seo_keywords`

### 3. Tool Call Rate Limit (Max 3/message)
- **File:** `src/services/aiChat.service.ts` — `processMessage()`
- `MAX_TOOL_CALLS_PER_MESSAGE = 3`
- Excess tool calls are silently truncated with a console warning

---

## ✅ P1 — Important (implemented)

### 4. Human Confirmation for Destructive Actions
- **Files:** `src/services/aiChat.service.ts`, `src/controllers/aiChat.controller.ts`, `src/routes/aiChat.routes.ts`
- Destructive tools (`delete_article`, `delete_menu_item`, `delete_banner`) return `needsConfirmation: true` with a `confirmationId`
- New endpoints: `POST /ai-chat/confirm/:confirmationId`, `POST /ai-chat/reject/:confirmationId`
- Pending confirmations expire after 5 minutes

### 5. Content Size Cap (50KB)
- **File:** `src/services/aiChat.service.ts` — `enforceContentSize()` helper
- Applied in: `createArticle`, `updateArticle`, `createMenuWithContent`, `setupFreshWebsite`
- `createMenuWithContent` rolls back the menu if content is too large

---

## ✅ P2 — Should Have (implemented)

### 6. Persist Conversations to Redis
- **File:** `src/services/aiChat.service.ts` — `getConversation()` / `setConversation()` / `clearConversation()`
- Conversations stored at `ai:conversation:{id}` with 24h TTL
- In-memory fallback when Redis is unavailable
- Keeps last 20 messages per conversation

### 7. Fix Config Default URL
- **File:** `src/config/index.ts`
- Changed `ZAI_BASE_URL` default from `open.bigmodel.cn` → `api.z.ai`

### 8. Setup Fresh Website Duplicate Check
- **File:** `src/services/aiChat.service.ts` — `setupFreshWebsite()`
- Now checks content, menus, **and** languages before running
- Returns specific list of what already exists (e.g. "Website already has language, menus set up")

---

## ✅ P3 — Nice to Have (implemented)

### 9. Full Audit Trail
- **File:** `src/models/AIOperationLog.ts` — `logConversation()` method
- Added operation types: `conversation` / target type `chat`
- Logs full user message + AI response + tool results + token usage to `ai_operation_logs`
- Called in `processMessage()` after every exchange

### 10. Replace Naive `requiresAdminAction()`
- **File:** `src/services/aiChat.service.ts` — `checkToolPermission()` method
- Removed keyword-based text matching (`['delete', 'remove', 'user', ...]`)
- New approach: checks `userLevel` at tool-execution time via an explicit `ADMIN_ONLY_TOOLS` set
- Admin-only tools: `delete_article`, `delete_menu_item`, `delete_banner`, `setup_fresh_website`, `update_seo_metadata`, `generate_seo_keywords`

### 11. SEO Tool Scope Limit
- **File:** `src/services/aiChat.service.ts` — `checkSEORateLimit()` / `incrementSEORateLimit()`
- Max 5 SEO operations per domain per day (tracked in Redis `ai:seo:daily:{domainId}`)
- Max 10 keywords per SEO metadata update (validated before writing)
- Applied to both `updateSEOMetadata` and `generateSEOKeywords`

---

## ✅ P4 — Future (implemented)

### 12. Token Budget Tracking
- **File:** `src/models/AIUsageLog.ts` — `getUsageInfo()` now includes `total_tokens_used`
- Aggregates `totalTokens` from conversation logs for the current day/domain
- Returned in `/ai-chat/usage` and `/ai-chat/job/:jobId` responses

### 13. Content Quality Check
- **File:** `src/services/aiChat.service.ts` — `validateContentQuality()` helper
- Checks minimum content length (10 chars) after sanitisation
- Strips HTML tags to verify visible text exists
- Applied in: `createArticle`, `updateArticle`, `createMenuWithContent`

### 14. Rollback Mechanism
- **Files:** `src/services/aiChat.service.ts` — `rollbackOperation()`, `src/models/AIOperationLog.ts` — `getRollbackableOperation()`
- **Route:** `POST /ai-chat/rollback/:operationId`
- Supports:
  - **create** → deletes the created resource
  - **update** (content) → restores from `ContentVersionHistory`
  - **delete** → informs user data is gone (cannot undo)
- Marks original operation as `rolled_back` in the log
- Logs the rollback itself as a new operation

---

## New files created

| File | Purpose |
|------|---------|
| `src/middleware/aiInputSanitizer.ts` | P0-1: Prompt injection detection & sanitization |

## Modified files

| File | Changes |
|------|---------|
| `src/services/aiChat.service.ts` | P0-2, P0-3, P1-4, P1-5, P2-6, P2-8, P3-10, P3-11, P4-13, P4-14 |
| `src/controllers/aiChat.controller.ts` | P0-1, P1-4, P4-14 |
| `src/routes/aiChat.routes.ts` | P1-4, P4-14 |
| `src/config/index.ts` | P2-7 |
| `src/models/AIOperationLog.ts` | P3-9, P4-14 |
| `src/models/AIUsageLog.ts` | P4-12 |

# AI Guardrails Security Analysis

**Date**: 2026-06-13 (Updated)  
**Purpose**: Analysis of guardrails protecting against AI abuse and unauthorized content modification

## Executive Summary

Can users trick AI into modifying other people's content? **VERY LOW RISK**

The codebase has **comprehensive, multi-layered guardrails** already implemented. All Priority 0 and 1 protections are in place, plus many Priority 3 and 4 features.

---

## Current Guardrails ✅ (All Verified in Code)

### P0-1: Input Sanitization
**File**: `src/controllers/aiChat.controller.ts:34-41`
```typescript
const { sanitized, reason } = sanitizeAIInput(message);
if (!sanitized) {
  return res.status(400).json({ message: 'Message rejected by input sanitizer' });
}
```
- **Purpose**: Prevent prompt injection attacks
- **Implementation**: `sanitizeAIInput()` in `middleware/aiInputSanitizer.ts`

---

### P0-2: Domain Ownership Validation
**File**: `src/services/aiChat.service.ts:417-623`
```typescript
private async verifyContentOwnership(contentId: number, domainId: number): Promise<Content | null> {
  const result = await Content.query()
    .where('content_id', contentId)
    .where('domain_id', domainId)
    .first();
  return result ?? null;
}

private async checkToolOwnership(toolName: string, args, domainId: number): Promise<string | null> {
  // Checks ownership BEFORE executing:
  // - update_article, delete_article, update_seo_metadata, generate_seo_keywords
  // - update_menu_item, delete_menu_item
  // - update_banner, delete_banner
  // - create_article (checks menu ownership)
}
```
- **Purpose**: Verify target resource belongs to user's domain
- **Coverage**: All update/delete operations
- **Error Message**: "Resource not found or access denied."

---

### P0-3: Tool Call Rate Limiting
**File**: `src/services/aiChat.service.ts:287-296`
```typescript
const MAX_TOOL_CALLS_PER_MESSAGE = config.aiGuardrails.maxToolCallsPerMessage;
const callsToExecute = aiResponse.toolCalls.slice(0, MAX_TOOL_CALLS_PER_MESSAGE);

if (aiResponse.toolCalls.length > MAX_TOOL_CALLS_PER_MESSAGE) {
  console.warn(`Truncating tool calls from ${aiResponse.toolCalls.length} to ${MAX_TOOL_CALLS_PER_MESSAGE}`);
}
```
- **Purpose**: Limit operations per AI question
- **Config**: `config.aiGuardrails.maxToolCallsPerMessage`

---

### #6: Tool Parameter Validation
**File**: `src/services/aiChat.service.ts:358-414`
```typescript
private validateToolArgs(toolName: string, args: Record<string, any>): string | null {
  // Validates:
  // - IDs are positive integers (contentId, itemId, bannerId, menuId, parentId)
  // - String field max lengths (title: 500, menuName: 200, itemName: 200)
  // - Tool-specific ranges (theme: 0-5, layout: 0-3)
}
```
- **Purpose**: Validate AI-generated parameters before execution
- **Coverage**: All tool calls
- **Validates**: IDs, strings, tool-specific ranges

---

### P1-4: Destructive Action Confirmation
**File**: `src/services/aiChat.service.ts:189-730`
```typescript
private static readonly DESTRUCTIVE_TOOLS = new Set([
  'delete_article',
  'delete_menu_item',
  'delete_banner',
]);

// Returns confirmation ID instead of executing
if (AIChatService.DESTRUCTIVE_TOOLS.has(toolName)) {
  return this.createDestructiveConfirmation(toolName, args, context);
}

// User must call POST /ai-chat/confirm/:confirmationId
async executeConfirmedAction(confirmationId: string, userId: number, domainId: number) {
  // #1: Verifies userId matches original request
  // #4: Race condition protection with claimed flag
}
```
- **Purpose**: Require explicit human confirmation for deletions
- **Flow**: AI returns `needsConfirmation: true` → User confirms → Action executes
- **Security**: userId verification + race condition protection

---

### P1-5: Content Size Cap
**File**: `src/services/aiChat.service.ts:24-40`
```typescript
const MAX_CONTENT_SIZE_BYTES = config.aiGuardrails.maxContentSizeBytes; // 50 KB default

function enforceContentSize(content: string, toolName: string): { ok: boolean; content: string; error?: string } {
  const byteLength = Buffer.byteLength(content, 'utf8');
  if (byteLength <= MAX_CONTENT_SIZE_BYTES) return { ok: true, content };
  return { ok: false, error: `Content too large (${Math.round(byteLength / 1024)} KB). Max is 50 KB.` };
}
```
- **Purpose**: Prevent oversized content generation
- **Limit**: 50 KB (configurable)
- **Applied**: All content creation/update operations

---

### P3-10: Tool-Level Permission Checks
**File**: `src/services/aiChat.service.ts:1529-1545`
```typescript
private checkToolPermission(toolName: string, userLevel: number): string | null {
  const ADMIN_ONLY_TOOLS = new Set([
    'delete_article', 'delete_menu_item', 'delete_banner',
    'setup_fresh_website', 'update_seo_metadata', 'generate_seo_keywords',
  ]);
  
  if (ADMIN_ONLY_TOOLS.has(toolName) && userLevel > 1) {
    return `Tool "${toolName}" requires admin privileges.`;
  }
}
```
- **Purpose**: Enforce user permissions per tool
- **Admin Only** (userLevel <= 1): Deletes, setup, SEO
- **Regular Users** (userLevel = 2): Create, update (no delete)

---

### P3-11: SEO Rate Limiting
**File**: `src/services/aiChat.service.ts:1198-1229`
```typescript
private static readonly MAX_SEO_OPS_PER_DAY = config.aiGuardrails.maxSeoOpsPerDay;

private async checkSEORateLimit(domainId: number): Promise<boolean> {
  const count = parseInt(await redis.get(`ai:seo:daily:${domainId}`) || '0');
  return count < AIChatService.MAX_SEO_OPS_PER_DAY;
}
```
- **Purpose**: Separate rate limit for expensive SEO operations
- **Limit**: Configurable (default in `config.aiGuardrails`)
- **Scope**: Per domain, per day

---

### P4-13: Content Quality Validation
**File**: `src/services/aiChat.service.ts:46-65`
```typescript
const MIN_CONTENT_LENGTH = config.aiGuardrails.minContentLength;

function validateContentQuality(content: string, toolName: string): { ok: boolean; error?: string } {
  // Check absolute minimum length
  if (!content || content.trim().length < MIN_CONTENT_LENGTH) {
    return { ok: false, error: 'Content too short or empty after sanitisation.' };
  }
  
  // Strip HTML tags to verify there's actual text
  const textOnly = content.replace(/<[^>]*>/g, '').trim();
  if (textOnly.length < MIN_CONTENT_LENGTH) {
    return { ok: false, error: 'No visible text after sanitisation.' };
  }
}
```
- **Purpose**: Prevent empty/garbage content after HTML sanitization
- **Check**: Strips HTML, validates remaining text length

---

### P4-14: Rollback Mechanism
**File**: `src/services/aiChat.service.ts:1562-1671`
```typescript
async rollbackOperation(operationId: number, domainId: number, userId: number): Promise<ToolCallResult> {
  // Supported rollbacks:
  // - create → delete the created resource
  // - update → restore from ContentVersionHistory
  // - delete → cannot undo (data already gone)
}
```
- **Purpose**: Undo recent AI operations
- **Endpoint**: `POST /ai-chat/rollback/:operationId`
- **Coverage**: Content, menus, banners, settings

---

### Additional Guardrails

#### HTML Sanitization
```typescript
// DOMPurify for all HTML content
const sanitizedDescription = purifier.sanitize(args.description);
```

#### Daily Question Limit
**File**: `src/middleware/checkAIQuestionLimit.ts`
- 10 questions per user per domain per day
- Tracked in `AIUsageLog` table

#### Comprehensive Logging
**File**: `src/models/AIOperationLog.ts`
- All operations logged with userId, domainId, operation type, target ID
- Full conversation history logged (P3-9)
- IP address and user agent tracking

#### JWT Authentication
- All AI endpoints require valid JWT
- `domainId` extracted from token, not user input

---

## Security Assessment by Attack Vector

### Vector 1: Cross-Domain Content Access
**Risk**: ✅ MITIGATED
- **P0-2 Ownership Check**: Verifies resource belongs to user's domain before any update/delete
- **JWT Scoping**: domainId from token, not user input
- **Database Queries**: All queries include `domain_id` filter

### Vector 2: Prompt Injection
**Risk**: ✅ MITIGATED
- **P0-1 Input Sanitization**: `sanitizeAIInput()` blocks malicious prompts
- **Tool Parameter Validation**: AI-generated args validated before execution

### Vector 3: Parameter Injection
**Risk**: ✅ MITIGATED
- **#6 Parameter Validation**: IDs, strings, ranges validated
- **Type Checking**: All IDs must be positive integers

### Vector 4: Bulk Operations
**Risk**: ✅ MITIGATED
- **P0-3 Tool Call Limiting**: Max operations per AI question
- **Content Size Cap**: 50 KB limit per content item

### Vector 5: Unauthorized Deletions
**Risk**: ✅ MITIGATED
- **P1-4 Confirmation Required**: All deletions need explicit human confirmation
- **P3-10 Permission Checks**: Admin-only delete operations
- **Ownership Verification**: Cannot delete other domains' resources

---

## Configuration

All guardrails are configured via `config.aiGuardrails`:

```typescript
{
  maxToolCallsPerMessage: number,      // P0-3
  maxContentSizeBytes: number,         // P1-5 (50 KB)
  minContentLength: number,            // P4-13
  maxSeoOpsPerDay: number,             // P3-11
  maxSeoKeywords: number,              // P3-11
  confirmationTtlMs: number,           // P1-4
  conversationTtlSec: number,          // P2-6
  conversationMaxMessages: number,      // P2-6
}
```

---

## Recommendations

### Current State: PRODUCTION READY ✅

All critical guardrails are implemented. The system has:
- ✅ Input sanitization
- ✅ Ownership verification on all operations
- ✅ Parameter validation before execution
- ✅ Permission checks per tool
- ✅ Operation rate limiting
- ✅ Destructive action confirmation
- ✅ Comprehensive audit logging
- ✅ Rollback capability

### Optional Enhancements (Future)

1. **Anomaly Detection**: Alert on unusual operation patterns
2. **Content Approval Workflow**: Require admin approval for AI-generated content
3. **Advanced Permission System**: Granular permissions beyond user_level

---

## Relevant Files

| File | Purpose |
|------|---------|
| `src/services/aiChat.service.ts` | Main AI service, all guardrails implemented |
| `src/controllers/aiChat.controller.ts` | Request handling, input sanitization |
| `src/middleware/aiInputSanitizer.ts` | Prompt injection protection |
| `src/middleware/aiRateLimit.ts` | Daily question limit |
| `src/models/AIOperationLog.ts` | Operation logging and rollback |
| `src/models/ContentVersionHistory.ts` | Version history for rollback |
| `src/routes/aiChat.routes.ts` | Endpoint definitions |

---

## Conclusion

The AI chat implementation has **comprehensive, production-ready guardrails**. The multi-layered security approach (input sanitization → ownership verification → parameter validation → permission checks → confirmation → logging → rollback) provides strong protection against abuse.

**No critical security issues identified.** The system is ready for production deployment.

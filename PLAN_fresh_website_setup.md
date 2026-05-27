# Plan: Quick Setup for Fresh Website (AI-powered)

## Context
When a user with a fresh domain (no language, no menus, no content) asks the AI to set up their website, the AI should:
1. Auto-detect language from user's chat language
2. Ask about their business
3. Create language → 4 default menus → tailored content for each page

This is the AI-powered path. A separate manual quick setup guide exists in the backend UI.

## Flow

**Message 1** — User: "帮我建个网站" (set up my website in Chinese)
→ AI detects language = Chinese, asks about business

**Message 2** — User: "I run a restaurant in Phnom Penh"
→ AI calls `setup_fresh_website` tool with: language info, business context, 4 menus + tailored content

**What the tool does internally:**
1. Check if domain has a language → if not, create one with detected language + `is_default: 1`
2. Create 4 menus (names translated to detected language): Home, About Us, Service, Contact Us
3. Create tailored content for each menu based on the user's business description
4. Apply template theme/layout settings to the domain's settings

## Changes

### 1. New Tool Definition: `setup_fresh_website` (`src/services/aiTools.service.ts`)
Parameters:
- `languageName` (string, required) — e.g. "ខ្មែរ", "English", "中文"
- `languageFlag` (number, required) — 0=KH, 1=EN, 2=CH, 3=TH, 4=VN
- `businessDescription` (string, required) — what the user told about their business
- `homeContent` (string, required) — tailored content for Home page
- `aboutContent` (string, required) — tailored content for About Us page
- `serviceContent` (string, required) — tailored content for Service page
- `contactContent` (string, required) — tailored content for Contact Us page
- `templateType` (string, optional) — business | portfolio | blog | organization

### 2. Update System Prompt (`src/services/aiChat.service.ts` — `buildSystemPrompt`)
Add fresh-site detection to the dynamic prompt:
- If domain has **no languages**: "This is a fresh website. Before creating anything, ask the user what their business/organization is about, then use setup_fresh_website."
- If domain has **no menus**: "This website has no pages yet. Offer to set up default pages."

### 3. Implement `setupFreshWebsite` Handler (`src/services/aiChat.service.ts`)
```
Step 1: Check if language exists for domain
  - If not → create language via Language.query().insert()
  - If yes → use existing language
Step 2: Create 4 menus via menuService.createMenu()
  - Names in the detected language (e.g. ទំព័រដើម, អំពីយើង, សេវាកម្ម, ទំនាក់ទំនង)
Step 3: Create content for each menu via contentService.createContent()
  - Each linked to its menu_id and the language's lang_id
Step 4: Apply template settings to domain settings
  - Reuse QUICK_SETUP_TEMPLATES config for theme/layout values
```

### 4. Wire up in switch statement (`src/services/aiChat.service.ts`)
Add `case 'setup_fresh_website'` in `executeToolCall`.

### 5. Fix `apply_quick_setup_template` stub
The existing handler returns success without doing anything. Wire it up to actually update domain settings.

## Files to Modify
- `src/services/aiTools.service.ts` — add `setup_fresh_website` tool
- `src/services/aiChat.service.ts` — add handler, update `buildSystemPrompt`, fix `applyQuickSetupTemplate`

## Verification
- Test with fresh domain: POST to AI chat with "帮我建个网站" → AI asks about business → then creates everything
- Verify language created with correct flag and is_default=1
- Verify 4 menus created with correct lang_id
- Verify content linked to each menu
- Verify theme settings applied

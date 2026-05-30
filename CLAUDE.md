# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-tenant SaaS CMS REST API. Each domain maps to a separate site. Built with Express + Objection.js (ORM) + MySQL + Redis. Deployed via Docker Swarm (CapRover) behind nginx reverse proxy.

## Commands

```bash
npm run dev          # Dev server with hot reload (tsx watch)
npm run build        # TypeScript compilation (tsc → dist/)
npm start            # Run compiled JS
npm test             # Jest tests
npm run knex         # Knex CLI (migrations, seeds)
```

No linting is configured. Node.js >= 19 required for native `fetch`.

## Architecture

### Request Flow

```
Request → helmet → compression → cors → body parsers → domainScope → routes → errorHandler
```

The `domainScope` middleware (`middleware/domain-scope.ts`) resolves `X-Forwarded-Host` header to a domain record, caches it in Redis for 120s under `cache:domain:{domainName}`, and sets `req.domain`. All route handlers read `req.domain.domain_id` to scope data per tenant.

### Route Registration

All routes mount under `/api/v1` in `routes/index.ts`. Pattern:

- `POST /auth/login` — public, uses `authLimiter` + `verifyRecaptcha`
- `POST /auth/signup` — public, uses `authLimiter`
- `/site/*` — public website data, uses `cacheMiddleware(ttl)`
- All other routes — require `authenticate` + `requireAuth` middleware

### Layered Structure

```
routes/*.routes.ts  →  controllers/*.controller.ts  →  services/*.service.ts  →  models/*.ts
```

- **Routes**: Define endpoints, apply middleware (auth, validation, rate limiting)
- **Controllers**: Thin handlers, extract params from req, call service, return JSON
- **Services**: Business logic, call models, handle caching
- **Models**: Objection.js models extending `BaseModel`, define table name, relations, static helpers

### Multi-Tenancy

Every domain-scoped query includes `domain_id` filtering. Models use `domain_id` as a standard column. The `domainScope` middleware runs before routes, so `req.user.domainId` is always available for authenticated requests.

### Authentication

JWT-based with access (1h) + refresh (7d) tokens. See `services/auth.service.ts`:
- Failed login attempts tracked in Redis, locks after 5 failures for 30 min
- Supports MD5 → bcrypt password migration
- Refresh tokens stored in Redis with reuse detection
- Roles: Super Admin (`user_level: -1`), Web Admin (`1`), Normal (`2`)

### Caching

Two Redis caching layers in `middleware/cache.ts`:
1. **`cacheMiddleware(ttl)`** — wraps route responses under `cache:site:{domainId}:{url}`. Skipped in dev mode (`config.isDev`).
2. **`invalidateDomainCache(domainId)`** — clears `cache:site:${domainId}:*` + domain scope cache. Call after any write operation.

### File Uploads

Client-to-S3 direct upload using presigned URLs:
1. `POST /media/upload-url` → returns presigned S3 URL
2. Client uploads directly to DigitalOcean Spaces
3. `POST /media/confirm` → creates DB record

No multer; S3 config in `config/s3.ts`, utilities in `utils/s3.ts`.

### AI Chat Integration

Async job pattern to avoid nginx 504 timeouts:
1. `POST /ai-chat/message` → creates job, returns `{jobId, status: "pending"}`
2. Client polls `GET /ai-chat/job/:jobId` (~1s interval)
3. Job processing in `setImmediate` callback

AI provider: Zhipu AI (ZAI) via OpenAI-compatible API. Tool calling for website operations (create content, menus, themes, etc.). Job store in `services/aiJob.service.ts` (in-memory Map with 10-min TTL).

### Validation

Zod schemas in `validators/*.schema.ts`. Applied via `validate(schema)` middleware. Schema structure: `z.object({ body: ..., params: ..., query: ... })`.

### Error Handling

Custom error hierarchy in `utils/errors.ts` (NotFoundError, BadRequestError, etc.). Global error handler in `middleware/error-handler.ts` returns `{ status: false, message, errors }` JSON.

### Rate Limiting

All rate limits use a 15-minute sliding window:

| Limiter | Routes | Max Requests |
|---------|--------|-------------|
| `authLimiter` | `/auth/*` | 10 per 15 min |
| `apiLimiter` | `/content/*`, `/menus/*` | 100 per 15 min |
| `publicLimiter` | `/site/*` | 300 per 15 min |
| `uploadLimiter` | `/media/upload-url` | 20 per 15 min |

### Middleware Reference

| Middleware | Purpose |
|-----------|---------|
| `authenticate` | Verifies JWT access token from `Authorization: Bearer` header |
| `requireAuth` | Ensures authenticated user exists on `req.user` |
| `requireWebAdmin` | Requires `user_level <= 1` (web admin or super admin) |
| `requireSuperAdmin` | Requires `user_level === -1` |
| `validate(schema)` | Applies Zod schema validation to body/params/query |
| `cacheMiddleware(ttl)` | Caches route response in Redis for TTL seconds |
| `verifyRecaptcha` | Validates Google reCAPTCHA v2 token (login only) |
| `checkAIQuestionLimit` | Limits AI chat to 10 questions per user per day |

## Database

MySQL via Knex + Objection.js. Config in `config/database.ts`. Models in `models/` extend `BaseModel`. Key tables: `tbldomain`, `tbllanguage`, `tblmenu_item`, `tblcontent`, `tblsetting`, `tblphotos`, `user`.

Content `description` field stores JSON: `{"title":"...","description":"..."}`.

Settings are auto-created when domains are created (both via `POST /domains` and `POST /domains/register`).

## API Endpoints

Base path: `/api/v1`. All responses follow `{ status: boolean, message?: string, data?: any, errors?: any }`.

### Health Check

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | API health check |

---

### Authentication — `/auth`

| Method | Path | Middleware | Description |
|--------|------|------------|-------------|
| POST | `/auth/login` | authLimiter, verifyRecaptcha, validate | User login |
| POST | `/auth/signup` | authLimiter, validate | User registration |
| POST | `/auth/verify-account` | validate | Verify account with code |
| POST | `/auth/refresh` | validate | Refresh JWT tokens |
| POST | `/auth/logout` | authenticate, requireAuth | Logout (invalidates refresh token) |

**POST /auth/login**
```json
// Request
{ "username": "string (3-50)", "password": "string (1-100)", "recaptchaToken": "string" }
// Response
{ "status": true, "data": { "accessToken": "...", "refreshToken": "...", "user": { "userid", "username", "full_name", "email", "user_level", "domain_id" } } }
```

**POST /auth/signup**
```json
// Request
{ "username": "string (3-50, alphanumeric)", "password": "string (6-100)", "full_name": "string (1-100)", "phone": "string (9-20, numeric)", "email": "email", "domain_name": "string (3-200, optional)" }
// If domain_name provided: creates domain + settings, sets user as web admin (level 1)
// Response
{ "status": true, "data": { "userid": 1, "domain_name": "mysite.localhost" }, "message": "Account and domain created." }
```

**POST /auth/refresh**
```json
// Request
{ "refreshToken": "string" }
// Response
{ "status": true, "data": { "accessToken": "...", "refreshToken": "..." } }
```

---

### Users — `/users`

| Method | Path | Middleware | Description |
|--------|------|------------|-------------|
| GET | `/users/me` | authenticate, requireAuth | Get current user profile |
| PUT | `/users/me` | authenticate, requireAuth, validate | Update current user profile |
| PUT | `/users/me/password` | authenticate, requireAuth, validate | Change own password |
| GET | `/users` | authenticate, requireAuth, requireWebAdmin, validate | List users (web admin+) |
| POST | `/users` | authenticate, requireAuth, requireWebAdmin, validate | Create user (web admin+) |
| GET | `/users/:userId` | authenticate, requireAuth, requireWebAdmin | Get user by ID (web admin+) |
| PUT | `/users/:userId` | authenticate, requireAuth, requireWebAdmin | Update user (web admin+) |
| PUT | `/users/:userId/password` | authenticate, requireAuth, requireWebAdmin | Reset user password (web admin+) |
| PUT | `/users/:userId/domain` | authenticate, requireAuth, requireSuperAdmin, validate | Assign domain to user (super admin) |

**GET /users** — Query: `page (default 1)`, `limit (default 10, max 100)`, `search (optional)`

**POST /users**
```json
{ "username": "string (3-50, alphanumeric)", "password": "string (6-100)", "full_name": "string (1-100)", "phone": "string (9-20, optional)", "email": "email (optional)", "user_level": "number (default 2)" }
```

**PUT /users/me**
```json
{ "full_name": "string (optional)", "phone": "string (optional)", "email": "email (optional)" }
```

**PUT /users/me/password**
```json
{ "currentPassword": "string", "newPassword": "string (min 6)" }
```

**PUT /users/:userId/domain**
```json
{ "domain_id": "number (positive)", "user_level": "number (int)" }
```

---

### Domains — `/domains`

| Method | Path | Middleware | Description |
|--------|------|------------|-------------|
| GET | `/domains` | authenticate, requireAuth, requireSuperAdmin, validate | List all domains (super admin) |
| POST | `/domains` | authenticate, requireAuth, requireSuperAdmin | Create domain (super admin) |
| POST | `/domains/register` | None | Public domain registration |
| GET | `/domains/:domainId` | None | Get domain by ID |
| PUT | `/domains/:domainId` | None | Update domain |
| PUT | `/domains/:domainId/status` | authenticate, requireAuth, requireSuperAdmin | Toggle domain status |
| DELETE | `/domains/:domainId/cache` | None | Clear domain cache |

**GET /domains** — Query: `page`, `limit`, `search`

**POST /domains** — Auto-creates settings record with defaults.

**POST /domains/register** — Public endpoint. Creates domain + settings + user in one step.

---

### Content — `/content`

| Method | Path | Middleware | Description |
|--------|------|------------|-------------|
| GET | `/content` | authenticate, requireAuth, apiLimiter | List all content for domain |
| POST | `/content` | authenticate, requireAuth, validate | Create content |
| GET | `/content/:contentId` | authenticate, requireAuth, validate(params) | Get content by ID |
| PUT | `/content/:contentId` | authenticate, requireAuth, validate | Update content |
| DELETE | `/content/:contentId` | authenticate, requireAuth, validate(params) | Delete content |
| GET | `/content/:contentId/items` | authenticate, requireAuth, validate(params) | List content items |
| POST | `/content/:contentId/items` | authenticate, requireAuth, validate | Create content item |
| PUT | `/content/:contentId/items/:itemId` | authenticate, requireAuth, validate | Update content item |
| DELETE | `/content/:contentId/items/:itemId` | authenticate, requireAuth | Delete content item |
| PUT | `/content/:contentId/map` | authenticate, requireAuth, validate | Update map config |
| GET | `/content/:contentId/news` | authenticate, requireAuth, validate(params) | List news articles |
| POST | `/content/:contentId/news` | authenticate, requireAuth, validate | Create news article |
| GET | `/content/:contentId/news/:newsId` | authenticate, requireAuth | Get news by ID |
| PUT | `/content/:contentId/news/:newsId` | authenticate, requireAuth, validate | Update news article |
| DELETE | `/content/:contentId/news/:newsId` | authenticate, requireAuth | Delete news article |

**Content types** (`content_type` field): 0=article, 1=photo gallery, 2=video, 3=document, 4=map, 5=news

**POST /content**
```json
{ "menu_id": "number (positive)", "content_type": "number (0-5)", "description": "string (max 500000, optional)", "lang_id": "number (positive)", "title": "string (1-500)" }
```

**PUT /content/:contentId**
```json
{ "menu_id": "number (optional)", "content_type": "number (0-5, optional)", "description": "string (optional)", "title": "string (optional)" }
```

**POST /content/:contentId/items**
```json
{ "title": "string (1-500)", "url": "string (max 500, optional)", "description": "string (max 500000, optional)", "item_type": "number", "document_type": "string (max 100, optional)" }
```

**PUT /content/:contentId/items/:itemId**
```json
{ "title": "string (optional)", "url": "string (optional)", "description": "string (optional)", "document_type": "string (optional)" }
```

**PUT /content/:contentId/map**
```json
{ "title": "string (1-500)", "description": "string (optional)", "lat": "number (-90 to 90)", "lng": "number (-180 to 180)", "visible": "number (0 or 1)" }
```

**POST /content/:contentId/news**
```json
{ "title": "string (1-500)", "shortdes": "string (max 5000, optional)", "longdes": "string (max 500000, optional)", "photo": "string (max 500, optional)", "publish": "string (max 50, optional)", "priority": "number (0-4, default 0)" }
```

**PUT /content/:contentId/news/:newsId**
```json
{ "title": "string (optional)", "shortdes": "string (optional)", "longdes": "string (optional)", "photo": "string (optional)", "publish": "string (optional)", "priority": "number (0-4, optional)", "status": "number (optional)" }
```

---

### Menus — `/menus`

| Method | Path | Middleware | Description |
|--------|------|------------|-------------|
| GET | `/menus` | authenticate, requireAuth, apiLimiter | List menus for domain |
| POST | `/menus` | authenticate, requireAuth, validate | Create menu item |
| GET | `/menus/:itemId` | authenticate, requireAuth | Get menu by ID |
| PUT | `/menus/:itemId` | authenticate, requireAuth, validate | Update menu item |
| DELETE | `/menus/:itemId` | authenticate, requireAuth | Delete menu item |
| PUT | `/menus/:itemId/order` | authenticate, requireAuth, validate | Reorder menu (up/down) |
| POST | `/menus/clear-cache` | authenticate, requireAuth | Clear menu cache |

**POST /menus**
```json
{ "lang_id": "number (positive)", "item_name": "string (1-200)", "item_url": "string (max 500, optional)", "parent_id": "number (default 0)", "item_order": "number (default 0)" }
```

**PUT /menus/:itemId**
```json
{ "lang_id": "number (optional)", "item_name": "string (optional)", "item_url": "string (optional)", "parent_id": "number (optional)", "item_order": "number (optional)" }
```

**PUT /menus/:itemId/order**
```json
{ "direction": "'up' | 'down'" }
```

---

### Banners — `/banners`

| Method | Path | Middleware | Description |
|--------|------|------------|-------------|
| GET | `/banners` | authenticate, requireAuth | List banners for domain |
| POST | `/banners` | authenticate, requireAuth | Add banner |
| DELETE | `/banners/:bannerId` | authenticate, requireAuth | Delete banner |

---

### Media — `/media`

| Method | Path | Middleware | Description |
|--------|------|------------|-------------|
| GET | `/media` | authenticate, requireAuth | List media files for domain |
| POST | `/media/upload-url` | authenticate, requireAuth, uploadLimiter | Get presigned S3 upload URL |
| POST | `/media/confirm` | authenticate, requireAuth | Confirm upload, create DB record |
| GET | `/media/:mediaId/url` | authenticate, requireAuth | Get media file URL |
| DELETE | `/media/:mediaId` | authenticate, requireAuth | Delete media file |

**Upload flow:**
1. `POST /media/upload-url` → `{ url, key }` (presigned S3 URL)
2. Client PUTs file directly to S3 URL
3. `POST /media/confirm` → `{ filename, key, type, size }` → creates `tblphotos` record

---

### Settings — `/settings`

| Method | Path | Middleware | Description |
|--------|------|------------|-------------|
| GET | `/settings` | authenticate, requireAuth | Get all settings for domain |
| PUT | `/settings/general` | authenticate, requireAuth, validate | Update general settings |
| PUT | `/settings/menu` | authenticate, requireAuth, validate | Update menu settings |
| PUT | `/settings/banner` | authenticate, requireAuth, validate | Update banner settings |
| PUT | `/settings/logo` | authenticate, requireAuth, validate | Update logo settings |
| GET | `/settings/social-media` | authenticate, requireAuth | List social media links |
| POST | `/settings/social-media` | authenticate, requireAuth, validate | Add social media link |
| DELETE | `/settings/social-media/:smid` | authenticate, requireAuth | Delete social media link |
| GET | `/settings/languages` | authenticate, requireAuth | List languages for domain |
| POST | `/settings/languages` | authenticate, requireAuth, validate | Add language |
| DELETE | `/settings/languages/:langId` | authenticate, requireAuth | Delete language |
| PUT | `/settings/languages/:langId/default` | authenticate, requireAuth | Set default language |

**PUT /settings/general**
```json
{ "title": "string (max 200, optional)", "footer": "string (max 5000, optional)", "theme": "number (0-5, optional)", "page_style": "number (0-3, optional)", "screen_mode": "string (max 50, optional)", "tracking_id": "string (max 100, optional)", "chat_script": "string (max 10000, optional)", "background": "string (max 500, optional)" }
```

**PUT /settings/logo**
```json
{ "logo": "string (max 500)", "mobile_logo": "string (max 500, optional)", "logo_position": "string (max 50, optional)", "logo_align": "string (max 50, optional)" }
```

**POST /settings/social-media** — `stype`: 1=Facebook, 2=Google, 3=YouTube, 4=LinkedIn, 5=Twitter
```json
{ "stype": "number (1-5)", "link": "string (max 500)" }
```

**POST /settings/languages** — `flag`: 0=Khmer, 1=English, 2=Chinese, 3=Thai, 4=Vietnamese
```json
{ "lang_name": "string (1-100)", "flag": "number (0-4)" }
```

---

### AI Chat — `/ai-chat`

| Method | Path | Middleware | Description |
|--------|------|------------|-------------|
| POST | `/ai-chat/message` | authenticate, validate, checkAIQuestionLimit | Send message, returns job ID |
| GET | `/ai-chat/job/:jobId` | authenticate | Poll job status |
| GET | `/ai-chat/usage` | authenticate | Get usage stats (daily question count) |
| GET | `/ai-chat/history` | None | Get operation history |
| GET | `/ai-chat/content/:contentId/versions` | None | Get content AI edit versions |
| GET | `/ai-chat/health` | None | Check AI service health |

**POST /ai-chat/message**
```json
{ "message": "string (1-5000)", "context": { "langId": "number (optional)" } }
// Response
{ "status": true, "data": { "jobId": "uuid", "status": "pending" } }
```

**GET /ai-chat/job/:jobId** — Poll until status is `completed` or `failed`
```json
{ "status": true, "data": { "jobId": "uuid", "status": "completed|pending|failed", "result": "...", "toolCalls": [...] } }
```

AI capabilities via tool calling: create/edit/delete content, menus, themes, settings, banners, languages, news articles. Limited to 10 questions per user per day.

---

### Setup — `/setup`

| Method | Path | Middleware | Description |
|--------|------|------------|-------------|
| GET | `/setup/status` | authenticate | Get setup completion status |

**GET /setup/status** — Returns which setup steps are complete:
```json
{ "status": true, "data": { "hasLanguage": false, "language": null, "hasMenus": false, "menuCount": 0, "menus": [], "hasContent": false, "contentCount": 0, "hasBasicSettings": false, "settings": null } }
```

---

### Public Website — `/site`

All `/site` endpoints are public (no auth), use `publicLimiter` + `cacheMiddleware(ttl)`. Domain resolved via `X-Forwarded-Host` header.

| Method | Path | Cache TTL | Description |
|--------|------|-----------|-------------|
| GET | `/site/config` | 120s | Site config (settings + languages) |
| GET | `/site/default` | 120s | Default config fallback |
| GET | `/site/menu` | 3600s | Menu tree (query: `domain_id`, `lang_id`) |
| GET | `/site/home` | 300s | Homepage data (menu + content sections) |
| GET | `/site/pages/:domainId/:menuItemId` | 300s | Page content for a menu item |
| GET | `/site/news/:newsId` | 1200s | Single news article detail |
| GET | `/site/article/:contentId` | 300s | Single article content |
| GET | `/site/banners` | 120s | Banner images for slideshow |
| GET | `/site/feature-news/:contentId` | 120s | Featured news for a content section |
| GET | `/site/list-news/:contentId` | 120s | Paginated news list for a content section |

## Companion Frontend

This API is consumed by a Nuxt 3 app at `../khmerbiz_front/`. Key integration points:
- Frontend uses `composables/useApi.ts` for all API calls with JWT auto-refresh
- Public site resolves domain via `X-Forwarded-Host` header (same as this API)
- Admin panel at `/admin/*` (client-side only, no SSR)
- AI chat uses async polling (`composables/useAIChat.ts`): sends message → polls job status
- Quick Setup wizard at `/admin/setup` guides new users through language → menus → content creation

## Docker Deployment

Deployed via CapRover on Docker Swarm. Container naming: `srv-captain--{name}`.
- API: `srv-captain--khmerbiz-api`
- Frontend: `srv-captain--khmerbiz-front`
- MySQL: `srv-captain--mysql-db` (password: check container env `MYSQL_ROOT_PASSWORD`)
- Redis: `srv-captain--redis` (password: check container env, requires `-a` flag)

Useful commands:
```bash
docker logs srv-captain--khmerbiz-api.1.$(docker ps -q --filter name=khmerbiz-api) --tail 50
docker exec srv-captain--mysql-db.1.xxx mysql -u root -p{password} khmerbiz -e "QUERY"
docker exec srv-captain--redis.1.xxx redis-cli -a {password} FLUSHALL
```

The API runs behind nginx reverse proxy with `app.set('trust proxy', 1)` enabled.

## Environment

Config loaded from `.env` via dotenv in `config/index.ts`. Key env vars: `PORT`, `NODE_ENV`, `DB_*`, `REDIS_*`, `JWT_*`, `AWS_*`, `S3_*`, `ZAI_*`, `RECAPTCHA_SECRET`.

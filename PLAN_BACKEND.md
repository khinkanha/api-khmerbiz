# Backend Plan: Node.js REST API

## Context

Migrate the PHP backend to a Node.js REST API. The existing MySQL database (14 tables) stays unchanged. All 78 endpoints are rebuilt as versioned REST routes at `/api/v1/`.

## Tech Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Runtime | **Node.js + TypeScript** | Type safety, async I/O |
| Framework | **Express.js** | Simple, matches the lightweight PHP framework style |
| ORM | **Knex.js + Objection.js** | Works with existing non-standard table names (`tblcontent`, `user`, `doctype`) |
| Auth | **JWT** (jsonwebtoken + bcryptjs) | Replaces PHP sessions |
| Cache | **Redis** (ioredis) | Replaces Memcached |
| Validation | **Zod** | Schema-based input validation |
| Media | **AWS S3 SDK** | Pre-signed URLs for client-side uploads |
| Images | **sharp** | Server-side thumbnail generation |

## Dependencies

```json
{
  "dependencies": {
    "express": "^4.18",
    "cors": "^2.8",
    "helmet": "^7.0",
    "compression": "^1.7",
    "jsonwebtoken": "^9.0",
    "bcryptjs": "^2.4",
    "knex": "^3.0",
    "objection": "^3.1",
    "mysql2": "^3.6",
    "ioredis": "^5.3",
    "@aws-sdk/client-s3": "^3.400",
    "@aws-sdk/s3-request-presigner": "^3.400",
    "zod": "^3.22",
    "express-rate-limit": "^7.1",
    "dotenv": "^16.3",
    "sharp": "^0.33"
  },
  "devDependencies": {
    "typescript": "^5.3",
    "@types/express": "^4.17",
    "@types/cors": "^2.8",
    "@types/jsonwebtoken": "^9.0",
    "@types/bcryptjs": "^2.4",
    "@types/compression": "^1.7",
    "ts-node-dev": "^2.0",
    "tsx": "^4.0"
  }
}
```

## Project Structure

```
api/
  src/
    index.ts                       # Entry point: creates Express app, starts server
    app.ts                         # Express app factory: registers middleware, routes

    config/
      index.ts                     # Exports validated config from env vars
      database.ts                  # Knex connection config
      redis.ts                     # Redis connection config
      s3.ts                        # S3 client config
      jwt.ts                       # JWT secret, expiry config

    db/
      knexfile.ts                  # Knex configuration (connection, pool, migrations)
      seeds/
        001_document_types.ts      # Seed document types

    models/                        # 14 Objection.js models = 14 PHP models
      BaseModel.ts                 # Equivalent to library/Master.php
      Domain.ts                    # tbldomain, key: domain_id
      User.ts                      # user, key: userid
      Content.ts                   # tblcontent, key: content_id
      ContentItem.ts               # tblcontent_item, key: item_id
      News.ts                      # tblnews, key: id
      MenuItem.ts                  # tblmenu_item, key: item_id
      Banner.ts                    # tblbanner, key: banner_id
      Media.ts                     # tblphotos, key: photo_id
      Language.ts                  # tbllanguage, key: lang_id
      Setting.ts                   # tblsetting, key: setting_id
      SocialMedia.ts               # tblsocial_media, key: smid
      Plugin.ts                    # tblplugin, key: plid
      DocumentType.ts              # doctype, key: typeid

    routes/
      index.ts                     # Mounts all route groups under /api/v1/
      auth.routes.ts               # POST /login, /signup, /logout, /refresh
      user.routes.ts               # Users CRUD, password, profile
      domain.routes.ts             # Domain CRUD, listing, suspend, assign
      content.routes.ts            # Content CRUD, items, map
      news.routes.ts               # News CRUD, list, feature news
      menu.routes.ts               # Menu items CRUD, reorder, by-language
      banner.routes.ts             # Banner CRUD
      media.routes.ts              # Media list, upload-url generation, delete
      setting.routes.ts            # Settings CRUD (logo, menu, banner, social, language, other)
      website.routes.ts            # Public frontend: pages, articles, news detail, language switch

    controllers/
      auth.controller.ts
      user.controller.ts
      domain.controller.ts
      content.controller.ts
      news.controller.ts
      menu.controller.ts
      banner.controller.ts
      media.controller.ts
      setting.controller.ts
      website.controller.ts

    middleware/
      auth.ts                      # JWT verification -> req.user
      domain-scope.ts              # Host header -> req.domain
      admin-guard.ts               # user_level === -1
      web-admin-guard.ts           # user_level <= 1
      validate.ts                  # Zod schema validation
      rate-limiter.ts              # Rate limiting configuration
      error-handler.ts             # Global error handling middleware
      cache.ts                     # Redis caching middleware (GET requests)

    services/
      auth.service.ts              # Login logic, JWT generation, bcrypt comparison, MD5 fallback
      domain.service.ts            # Domain resolution, caching
      content.service.ts           # Content CRUD, item management
      news.service.ts              # News CRUD, feature news logic
      menu.service.ts              # Menu tree building, reorder, caching
      media.service.ts             # S3 pre-signed URL generation, media tracking
      cache.service.ts             # Redis get/set/invalidation helpers

    validators/                    # Zod schemas for all inputs
      auth.schema.ts
      user.schema.ts
      content.schema.ts
      news.schema.ts
      menu.schema.ts
      setting.schema.ts
      common.schema.ts

    types/
      express.d.ts                 # Augment Express Request with user, domain
      models.ts                    # TypeScript interfaces for all models
      api.ts                       # API response types, pagination meta

    utils/
      pagination.ts                # Offset/limit calculation, total pages
      password.ts                  # bcrypt hash, compare, MD5 migration helper
      s3.ts                        # S3 client wrapper, pre-signed URL functions
      errors.ts                    # Custom error classes: NotFoundError, ForbiddenError, etc.
      content-description.ts       # Parse polymorphic JSON per content type

  tsconfig.json
  package.json
  .env.example
  Dockerfile
  docker-compose.yml
```

## Database Schema (Existing — No Changes)

| Table | Primary Key | Model | PHP File |
|-------|------------|-------|----------|
| `tbldomain` | `domain_id` | Domain | class/Domain.php |
| `user` | `userid` | User | class/User.php |
| `tblcontent` | `content_id` | Content | class/Content.php |
| `tblcontent_item` | `item_id` | ContentItem | class/Content_Item.php |
| `tblnews` | `id` | News | class/News.php |
| `tblmenu_item` | `item_id` | MenuItem | class/Menu_Item.php |
| `tblbanner` | `banner_id` | Banner | class/Banner.php |
| `tblphotos` | `photo_id` | Media | class/Media.php |
| `tbllanguage` | `lang_id` | Language | class/Language.php |
| `tblsetting` | `setting_id` | Setting | class/Setting.php |
| `tblsocial_media` | `smid` | SocialMedia | class/Social_Media.php |
| `tblplugin` | `plid` | Plugin | class/Plugin.php |
| `doctype` | `typeid` | DocumentType | class/DocumentType.php |

### Model Column Details

**Domain** (`tbldomain`): `domain_id`, `domain_name`, `company_address`, `company_desc`, `company_name`, `phone_number`, `email`, `status` (1=ACTIVE, 2=SUSPEND, 3=EXPIRED), `start_date`, `expire_date`, `file_limit` (default 500), `menu_cache` (JSON), `lang_cache` (JSON)

**User** (`user`): `userid`, `username`, `domain_id`, `full_name`, `phone`, `email`, `sitebuilder` (0/1), `user_level` (-1=SuperAdmin, 1=WebAdmin, 2=Normal), `password` (currently MD5), `verify_code`

**Content** (`tblcontent`): `content_id`, `description` (polymorphic JSON), `menu_id`, `domain_id`, `content_type` (0=Article, 1=Photo, 2=Video, 3=Document, 4=News, 5=Map), `userid`, `status` (0=active, 2=deleted), `lang_id`, `title`

**ContentItem** (`tblcontent_item`): `item_id`, `create_date`, `title`, `url`, `upload_by`, `status`, `description`, `item_type`, `content_id`, `document_type`

**News** (`tblnews`): `id`, `content_id`, `description` (JSON: title, shortdes, longdes, photo, publish), `userid`, `status`, `create_date`, `priority`, `publish_date`

**MenuItem** (`tblmenu_item`): `item_id`, `item_name`, `item_url`, `parent_id`, `item_order`, `lang_id`, `domain_id`

**Banner** (`tblbanner`): `banner_id`, `image`, `domain_id`, `title`, `description`, `lang_id`

**Media** (`tblphotos`): `photo_id`, `file_name`, `title`, `server_id`, `domain_id`, `code` (MD5 hash for dedup)

**Language** (`tbllanguage`): `lang_id`, `lang_name`, `flag` (0=KH, 1=EN, 2=CH, 3=TH, 4=VN), `domain_id`, `is_default`

**Setting** (`tblsetting`): `setting_id`, `domain_id`, `domain_name`, `logo`, `mobile_logo`, `footer`, `title`, `menu_position`, `banner_position`, `banner_display` (0=Home only, 1=Every page), `logo_position`, `logo_align`, `menu_align`, `screen_mode`, `banner_mode`, `plugin_mode`, `background`, `footer_align`, `theme` (0-5), `tracking_id`, `chat_script`, `page_style` (0=Classic, 1=Single, 2=Magazine, 3=Hero)

**SocialMedia** (`tblsocial_media`): `smid`, `stype` (1=Google, 2=Facebook, 3=YouTube, 4=LinkedIn, 5=Twitter), `link`, `domain_id`

**Plugin** (`tblplugin`): `plid`, `domain_id`, `desc` (JSON)

**DocumentType** (`doctype`): `typeid`, `description`

## API Endpoints (~78 total)

### Authentication (6)

| Method | Endpoint | Auth | Maps to PHP | Description |
|--------|----------|------|-------------|-------------|
| POST | `/auth/login` | No | `Member::login()` | Login with username/password, returns JWT |
| POST | `/auth/signup` | No | `Member::signup()` | Register new account |
| POST | `/auth/logout` | JWT | `Member::logout()` | Invalidate token (blacklist in Redis) |
| POST | `/auth/refresh` | JWT | (new) | Refresh JWT access token |
| POST | `/auth/verify-account` | No | `Member::verify_account()` | Verify account with code |
| POST | `/auth/forgot-password/:username` | No | Resend verification | Resend verification code |

### Users (9)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | JWT | Get current user profile |
| PUT | `/users/me` | JWT | Update profile (phone, email, full_name) |
| PUT | `/users/me/password` | JWT | Change own password |
| GET | `/users` | Admin | List users (paginated, filtered by domain) |
| POST | `/users` | WebAdmin | Create user under own domain |
| GET | `/users/:userId` | Admin | Get single user |
| PUT | `/users/:userId/password` | Admin | Reset user password |
| PUT | `/users/:userId/domain` | SuperAdmin | Assign domain + role to user |
| PUT | `/users/:userId/verify` | Admin | Clear/modify verification |

### Domains (8)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/domains` | SuperAdmin | List all domains (paginated) |
| POST | `/domains` | SuperAdmin | Add new domain |
| POST | `/domains/register` | JWT | User registers own domain |
| GET | `/domains/:domainId` | Admin | Get domain details |
| PUT | `/domains/:domainId` | Admin | Update domain info |
| PUT | `/domains/:domainId/status` | SuperAdmin | Activate/suspend domain |
| DELETE | `/domains/:domainId/cache` | Admin | Clear domain cache |
| POST | `/domains/announce` | SuperAdmin | Broadcast email to domain admins |

### Content (10)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/content` | JWT | List content for user's domain |
| POST | `/content` | JWT | Create new content |
| GET | `/content/:contentId` | JWT | Get single content with items |
| PUT | `/content/:contentId` | JWT | Update content |
| DELETE | `/content/:contentId` | JWT | Soft-delete content (status=2) |
| GET | `/content/:contentId/items` | JWT | List content items |
| POST | `/content/:contentId/items` | JWT | Add content item |
| PUT | `/content/:contentId/items/:itemId` | JWT | Update content item |
| DELETE | `/content/:contentId/items/:itemId` | JWT | Soft-delete content item |
| PUT | `/content/:contentId/map` | JWT | Save/update map content |

### News (5)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/content/:contentId/news` | JWT | List news for a content |
| POST | `/content/:contentId/news` | JWT | Add news article |
| GET | `/content/:contentId/news/:newsId` | JWT | Get single news |
| PUT | `/content/:contentId/news/:newsId` | JWT | Update news |
| DELETE | `/content/:contentId/news/:newsId` | JWT | Soft-delete news |

### Menu Items (7)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/menus` | JWT | List menu items for domain |
| POST | `/menus` | JWT | Create menu item |
| GET | `/menus/:itemId` | JWT | Get menu item with content relation |
| PUT | `/menus/:itemId` | JWT | Update menu item |
| DELETE | `/menus/:itemId` | JWT | Delete menu item |
| PUT | `/menus/:itemId/order` | JWT | Reorder menu item |
| POST | `/menus/clear-cache` | JWT | Clear menu cache |

### Banners (3)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/banners` | JWT | List banners for domain |
| POST | `/banners` | JWT | Add banner |
| DELETE | `/banners/:bannerId` | JWT | Delete banner |

### Media (5)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/media` | JWT | List media for domain |
| POST | `/media/upload-url` | JWT | Generate S3 pre-signed PUT URL |
| POST | `/media/confirm` | JWT | Confirm upload (save metadata to DB) |
| DELETE | `/media/:mediaId` | JWT | Delete media record |
| GET | `/media/:mediaId/url` | JWT | Get pre-signed GET URL |

### Settings (12)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/settings` | JWT | Get domain settings |
| PUT | `/settings/general` | JWT | Update general settings |
| PUT | `/settings/menu` | JWT | Update menu display settings |
| PUT | `/settings/banner` | JWT | Update banner display settings |
| PUT | `/settings/logo` | JWT | Update logo |
| GET | `/settings/social-media` | JWT | List social media links |
| POST | `/settings/social-media` | JWT | Add social media link |
| DELETE | `/settings/social-media/:smid` | JWT | Delete social media link |
| GET | `/settings/languages` | JWT | List languages for domain |
| POST | `/settings/languages` | JWT | Add language |
| DELETE | `/settings/languages/:langId` | JWT | Delete language |
| PUT | `/settings/languages/:langId/default` | JWT | Set default language |

### Public Website (9) — no auth required

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/site/config` | Domain settings, logo, social, languages |
| GET | `/site/menu` | Menu tree for domain |
| GET | `/site/home` | Home page content |
| GET | `/site/pages/:domainId/:menuItemId` | Page by menu item |
| GET | `/site/news/:newsId` | News article detail |
| GET | `/site/article/:contentId` | Article with items |
| GET | `/site/banners` | Banner list |
| GET | `/site/feature-news/:contentId` | Featured news |
| PUT | `/site/language/:langId` | Switch language |

### External Integration (1)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/ext/sitebuilder` | API Key | External sitebuilder integration |

## Middleware Stack

Registered in order:

```
1. helmet()                    # Security headers
2. compression()               # Gzip compression
3. cors(corsOptions)           # CORS with dynamic origin
4. express.json({ limit })     # Body parsing
5. express.urlencoded()        # URL-encoded parsing
6. rateLimiter                 # Rate limiting (100 req/15min for auth, 300/15min for API)
7. domainScope                 # Resolve domain from Host header
8. cacheMiddleware             # Cache GET responses in Redis (public routes)
9. (route-specific):
   - authenticate              # JWT verification -> req.user
   - requireAuth               # Must have req.user
   - requireSuperAdmin         # user_level === -1
   - requireWebAdmin           # user_level <= 1
   - validate(schema)          # Zod schema validation
10. errorHandler               # Catch-all error handler (last)
```

## Key Technical Decisions

### Authentication: MD5-to-bcrypt Migration

On login, detect hash type:
- MD5 hash = 32 hex characters → compare with `md5(input)`, if match re-hash with bcrypt
- bcrypt hash starts with `$2b$` → compare with `bcrypt.compare()`

Transparent to users. No bulk migration needed.

JWT payload:
```typescript
{
  sub: userId,
  username: string,
  domainId: number,
  userLevel: number,     // -1=SuperAdmin, 1=WebAdmin, 2=Normal
  sitebuilder: boolean,
  type: 'access' | 'refresh'
}
```

### File Upload: Pre-signed S3 URLs

1. Client requests `POST /media/upload-url` with `{ fileName, fileType, folder }`
2. API returns pre-signed PUT URL + key
3. Client uploads directly to DigitalOcean Spaces
4. Client confirms with `POST /media/confirm`
5. API generates thumbnail with `sharp`, uploads to `thubnail/` prefix

### Caching: Redis

Key pattern and TTLs:

```
cache:{domain_id}:menu:{lang_id}     # Menu tree (TTL: 3600s)
cache:{domain_id}:languages          # Language list (TTL: 3600s)
cache:{domain_id}:settings           # Settings (TTL: 120s)
cache:domain:{domain_name}           # Domain lookup (TTL: 120s)
cache:user:{userId}                  # User object (TTL: 300s)
cache:site:{domain_id}:{path}        # Public API responses (TTL: 300s)
```

Invalidation: flush `cache:{domain_id}:*` after any mutation to menu, settings, content, or banners.

### Content.description JSON (Polymorphic)

Parse per content type:
- **TYPE_ARTICLE (0)**: `{ title, description }`
- **TYPE_PHOTO (1)**: `{ title, description }` (items in separate table)
- **TYPE_VIDEO (2)**: `{ title, description }` (items in separate table)
- **TYPE_DOCUMENT (3)**: `{ title, description }` (items in separate table)
- **TYPE_NEWS (4)**: items in `tblnews` with `{ title, shortdes, longdes, photo, publish }`
- **TYPE_MAP (5)**: `{ title, description, lat, lng, visible }`

### Error Response Format

Matches PHP `Controller::send_api()`:

```json
{
  "status": true,
  "data": {},
  "message": "Success"
}
```

Error:
```json
{
  "status": false,
  "message": "Error description",
  "errors": ["Field X is required"]
}
```

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database (same as existing config.php)
DB_HOST=srv-captain--mysql-db
DB_NAME=khmerbiz
DB_USER=root
DB_PASS=inmean12

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# AWS S3 / DigitalOcean Spaces
AWS_ENDPOINT_URL=https://sgp1.digitaloceanspaces.com
S3_BUCKET_NAME=khmer
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
PHOTO_BASE_URL=https://khmer.sgp1.digitaloceanspaces.com/
```

## Implementation Phases

| Phase | Weeks | Deliverables |
|-------|-------|-------------|
| 1. Foundation | 1 | Project setup, Express app, 14 Objection.js models, error handling |
| 2. Auth | 1 | JWT auth, MD5 migration, login/signup/refresh endpoints |
| 3. Core CRUD | 2 | Domain, User, Content, ContentItem, News, Menu endpoints |
| 4. Secondary | 1 | Banner, Media (S3), Settings, Plugins, DocumentTypes |
| 5. Public API | 1 | Website endpoints, menu tree builder, Redis caching |
| 6. Deploy | 1 | Dockerfile, docker-compose (with Redis), CapRover config |

## Critical PHP Files to Reference

- `controllers/home.php` — Public endpoints and menu tree building (800 lines)
- `class/DomainController.php` — Domain resolution, language/banner loading
- `class/User.php` — Password hashing (MD5), user levels
- `class/Content.php` — Content types, polymorphic description JSON
- `inc/user_function.php` — S3 upload flow (`get_image()`)
- `library/Master.php` — Base ORM pattern → BaseModel
- `library/DB.php` — Caching strategy → Redis

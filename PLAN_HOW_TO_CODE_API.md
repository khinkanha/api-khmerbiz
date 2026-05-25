# How to Code a New API Endpoint in api-khmerbiz

## The Pattern

Every endpoint follows the same 5-file chain:

```
Request → Route → Middleware → Controller → Service → Model → Database
```

Files involved (in order you create them):

| # | File | Purpose |
|---|------|---------|
| 1 | `src/models/Example.ts` | Objection.js model — maps to a database table |
| 2 | `src/validators/example.schema.ts` | Zod schema — validates `body`, `params`, `query` |
| 3 | `src/services/example.service.ts` | Business logic — queries, inserts, updates, deletes |
| 4 | `src/controllers/example.controller.ts` | HTTP handler — extracts params from `req`, calls service, returns `res.json()` |
| 5 | `src/routes/example.routes.ts` | Express router — wires middleware + controller functions to HTTP methods |
| 6 | `src/routes/index.ts` | Mounts the route group under `/api/v1/example` |

---

## Step-by-Step Example

Let's say you want to add a new `tags` feature with full CRUD.

### Step 1 — Create the Model

File: `src/models/Tag.ts`

```
- Extend BaseModel
- Set tableName to the MySQL table name
- Set idColumn to the primary key column
- Declare typed properties for each column
- Add relationMappings if it relates to other models
- Add a static scopeDomain() method if it's multi-tenant
```

Example structure:
```typescript
import { BaseModel } from './BaseModel';

export class Tag extends BaseModel {
  static tableName = 'tbltags';       // actual MySQL table name
  static idColumn = 'tag_id';         // primary key

  tag_id!: number;
  name!: string;
  domain_id!: number;
  status!: number;

  static scopeDomain(query: any, domainId: number) {
    return query.where('domain_id', domainId).where('status', '!=', 2);
  }
}
```

### Step 2 — Create the Zod Validator

File: `src/validators/tag.schema.ts`

```
- Create one schema per endpoint that accepts input
- Schemas validate body, params, and/or query
- Use z.coerce.number() for URL params (they come as strings)
- Reuse common schemas from validators/common.schema.ts
```

Example:
```typescript
import { z } from 'zod';

export const createTagSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
  }),
});

export const updateTagSchema = z.object({
  params: z.object({
    tagId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
  }),
});

export const tagIdParamSchema = z.object({
  params: z.object({
    tagId: z.coerce.number().int().positive(),
  }),
});
```

### Step 3 — Create the Service

File: `src/services/tag.service.ts`

```
- Pure async functions, no Express dependency
- Accept domainId as parameter (for multi-tenant scoping)
- Use Objection.js Model.query() for all DB operations
- Throw NotFoundError, BadRequestError from utils/errors.ts for error cases
- For paginated lists: use getPagination() and buildPaginationMeta() from utils/pagination.ts
- After mutations: call invalidateDomainCache(domainId) from middleware/cache.ts
```

Key Objection.js query patterns:

| Operation | Code |
|-----------|------|
| List | `Tag.query().where('domain_id', domainId).where('status', '!=', 2)` |
| Get one | `Tag.query().findById(id)` |
| Get with relations | `Tag.query().findById(id).withGraphFetched('[items]')` |
| Create | `Tag.query().insert({ ...data, domain_id: domainId })` |
| Update | `Tag.query().findById(id).patch(data)` |
| Soft delete | `Tag.query().findById(id).patch({ status: 2 })` |
| Count | `Tag.query().where(...).count('tag_id as count').first()` |
| Search | `.where('title', 'like', `%${search}%`)` |
| Paginate | `.limit(limit).offset(offset)` |

Example:
```typescript
import { Tag } from '../models/Tag';
import { NotFoundError } from '../utils/errors';
import { getPagination, buildPaginationMeta } from '../utils/pagination';

export async function listTags(domainId: number, page: number, limit: number) {
  const { offset, limit: safeLimit } = getPagination(page, limit);

  const [items, countResult] = await Promise.all([
    Tag.scopeDomain(Tag.query(), domainId)
      .orderBy('tag_id', 'desc')
      .limit(safeLimit)
      .offset(offset),
    Tag.query().where('domain_id', domainId).where('status', '!=', 2)
      .count('tag_id as count').first(),
  ]);

  const total = Number((countResult as any)?.count) || 0;
  return { items, pagination: buildPaginationMeta(page, safeLimit, total) };
}

export async function getTag(tagId: number, domainId: number) {
  const tag = await Tag.scopeDomain(Tag.query(), domainId)
    .findById(tagId);
  if (!tag) throw new NotFoundError('Tag not found');
  return tag;
}

export async function createTag(data: any, domainId: number) {
  return Tag.query().insert({ ...data, domain_id: domainId, status: 0 });
}

export async function updateTag(tagId: number, data: any, domainId: number) {
  const tag = await getTag(tagId, domainId);
  return Tag.query().findById(tagId).patch(data);
}

export async function deleteTag(tagId: number, domainId: number) {
  await getTag(tagId, domainId);
  return Tag.query().findById(tagId).patch({ status: 2 });
}
```

### Step 4 — Create the Controller

File: `src/controllers/tag.controller.ts`

```
- Export one async function per endpoint
- Extract params from req.params, req.body, req.query, req.user
- Call the service function
- Return res.json({ status: true, data: result }) on success
- Wrap everything in try/catch(err) { next(err) }
- For creation: return res.status(201).json(...)
- For deletion: return res.json({ status: true, message: 'Deleted' })
```

Example:
```typescript
import { Request, Response, NextFunction } from 'express';
import * as tagService from '../services/tag.service';

export async function listTags(req: Request, res: Response, next: NextFunction) {
  try {
    const domainId = req.user!.domainId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await tagService.listTags(domainId, page, limit);
    res.json({ status: true, data: result });
  } catch (err) { next(err); }
}

export async function getTag(req: Request, res: Response, next: NextFunction) {
  try {
    const tagId = parseInt(req.params.tagId);
    const tag = await tagService.getTag(tagId, req.user!.domainId);
    res.json({ status: true, data: tag });
  } catch (err) { next(err); }
}

export async function createTag(req: Request, res: Response, next: NextFunction) {
  try {
    const tag = await tagService.createTag(req.body, req.user!.domainId);
    res.status(201).json({ status: true, data: tag });
  } catch (err) { next(err); }
}

export async function updateTag(req: Request, res: Response, next: NextFunction) {
  try {
    const tagId = parseInt(req.params.tagId);
    const tag = await tagService.updateTag(tagId, req.body, req.user!.domainId);
    res.json({ status: true, data: tag });
  } catch (err) { next(err); }
}

export async function deleteTag(req: Request, res: Response, next: NextFunction) {
  try {
    const tagId = parseInt(req.params.tagId);
    await tagService.deleteTag(tagId, req.user!.domainId);
    res.json({ status: true, message: 'Tag deleted' });
  } catch (err) { next(err); }
}
```

### Step 5 — Create the Routes

File: `src/routes/tag.routes.ts`

```
- Import controller functions and middleware
- Apply authenticate + requireAuth at router level (applies to all routes)
- Add validate(schema) for routes that accept input
- Add role guards: requireSuperAdmin, requireWebAdmin
- Add rate limiters: apiLimiter for general, authLimiter for auth
```

Example:
```typescript
import { Router } from 'express';
import * as ctrl from '../controllers/tag.controller';
import { authenticate, requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTagSchema, updateTagSchema, tagIdParamSchema } from '../validators/tag.schema';

const router = Router();

router.use(authenticate, requireAuth);

router.get('/', ctrl.listTags);
router.post('/', validate(createTagSchema), ctrl.createTag);
router.get('/:tagId', validate(tagIdParamSchema), ctrl.getTag);
router.put('/:tagId', validate(updateTagSchema), ctrl.updateTag);
router.delete('/:tagId', validate(tagIdParamSchema), ctrl.deleteTag);

export default router;
```

### Step 6 — Register in Route Index

File: `src/routes/index.ts` — add 2 lines:

```typescript
import tagRoutes from './tag.routes';
// ...
router.use('/tags', tagRoutes);
```

---

## Middleware Reference

### Auth guards (apply in routes)

| Middleware | Effect |
|------------|--------|
| `authenticate` | Parses JWT, sets `req.user` |
| `requireAuth` | Blocks if `req.user` is missing |
| `requireSuperAdmin` | Blocks if `userLevel !== -1` |
| `requireWebAdmin` | Blocks if `userLevel > 1` |

### Input validation (apply in routes)

```typescript
validate(schema)   // Validates body + params + query via Zod
```

### Rate limiters (apply in routes)

| Limiter | Use for |
|---------|---------|
| `authLimiter` | Login, signup |
| `apiLimiter` | General API reads |
| `uploadLimiter` | File upload endpoints |
| `publicLimiter` | Public (no-auth) endpoints |

### Caching (apply in routes, public only)

```typescript
cacheMiddleware(300)  // Cache GET response for 300 seconds in Redis
```

---

## req.user Properties

After `authenticate` + `requireAuth`, `req.user` contains:

| Property | Type | Source |
|----------|------|--------|
| `req.user!.userId` | number | JWT `sub` |
| `req.user!.username` | string | JWT |
| `req.user!.domainId` | number | JWT — use for multi-tenant scoping |
| `req.user!.userLevel` | number | -1=SuperAdmin, 1=WebAdmin, 2=Normal |
| `req.user!.sitebuilder` | boolean | JWT |

---

## Response Format

Success:
```json
{ "status": true, "data": { ... }, "message": "Success" }
```

Paginated:
```json
{ "status": true, "data": { "items": [...], "pagination": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 } } }
```

Error (handled by error-handler middleware):
```json
{ "status": false, "message": "Resource not found" }
```

Validation error:
```json
{ "status": false, "message": "Validation failed", "errors": ["body.name: Required"] }
```

---

## Quick Reference: Existing Files to Copy From

| Want to... | Copy from |
|------------|-----------|
| Simple CRUD | `content.controller.ts` + `content.service.ts` |
| Auth endpoints | `auth.controller.ts` + `auth.service.ts` |
| Paginated list | `content.service.ts` → `listContent()` |
| Soft delete | `content.service.ts` → `deleteContent()` (sets `status=2`) |
| File upload | `media.controller.ts` + `media.service.ts` |
| Public cached routes | `website.routes.ts` |
| SuperAdmin-only | `domain.routes.ts` |
| Zod schemas | `content.schema.ts`, `common.schema.ts` |

---

## Full File Tree for Reference

```
src/
  models/          ← Step 1
    BaseModel.ts
    Tag.ts         (new)
  validators/      ← Step 2
    common.schema.ts
    tag.schema.ts  (new)
  services/        ← Step 3
    tag.service.ts (new)
  controllers/     ← Step 4
    tag.controller.ts (new)
  routes/          ← Step 5 + 6
    index.ts       (edit: add router.use('/tags', tagRoutes))
    tag.routes.ts  (new)
  middleware/
    auth.ts         (authenticate, requireAuth, requireSuperAdmin, requireWebAdmin)
    validate.ts     (validate(schema))
    cache.ts        (cacheMiddleware(ttl), invalidateDomainCache)
    rate-limiter.ts (authLimiter, apiLimiter, uploadLimiter, publicLimiter)
    error-handler.ts(global error handler)
  utils/
    errors.ts       (NotFoundError, BadRequestError, ForbiddenError, etc.)
    pagination.ts   (getPagination, buildPaginationMeta)
  types/
    api.ts          (ApiResponse, PaginationMeta, JwtPayload)
    express.d.ts    (Augments Request with user, domain)
```

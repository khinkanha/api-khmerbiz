# Security & Testing Plan: Backend (Node.js API)

## Overview

Protection strategies and test scenarios for the Node.js REST API against abuse, attacks, and malformed requests.

---

## 1. Rate Limiting

### Global Rate Limits

| Tier | Limit | Window | Applies To |
|------|-------|--------|------------|
| Strict | 10 requests | 15 min | `/auth/login`, `/auth/signup`, `/auth/forgot-password` |
| Normal | 100 requests | 15 min | All authenticated `/api/v1/**` endpoints |
| Public | 300 requests | 15 min | `/api/v1/site/**` (no auth) |
| Upload | 20 requests | 15 min | `/media/upload-url` |

### Implementation

```typescript
// middleware/rate-limiter.ts
import rateLimit from 'express-rate-limit'

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 10,                      // 10 attempts
  message: { status: false, message: 'Too many attempts. Try again later.' },
  standardHeaders: true,        // Return rate limit info in headers
  legacyHeaders: false,
  skipSuccessfulRequests: false // Count successful attempts too
})

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: false, message: 'Too many requests.' }
})

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { status: false, message: 'Too many requests.' }
})

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: false, message: 'Upload limit reached.' }
})
```

### Test Scenarios

| # | Scenario | Expected Result |
|---|----------|----------------|
| T1 | Send 11 login requests within 15 min | 11th returns `429 Too Many Requests` |
| T2 | Send 101 API requests within 15 min | 101st returns `429` |
| T3 | Send 301 public requests within 15 min | 301st returns `429` |
| T4 | Wait for window to expire, retry | Request succeeds |
| T5 | Different IP addresses | Each IP gets its own limit |
| T6 | Check response headers | Contains `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` |

---

## 2. Brute Force Protection (Login)

### Strategy

Layered defense beyond rate limiting:

1. **Account lockout** after 5 failed attempts — lock for 30 minutes
2. **Progressive delay** — increase response time: 1s, 2s, 4s, 8s, 16s after each failure
3. **Redis tracking** — key pattern: `auth:failed:{username}` with TTL

### Test Scenarios

| # | Scenario | Expected Result |
|---|----------|----------------|
| T7 | 5 wrong passwords for same username | Account locked for 30 min, returns `423 Locked` |
| T8 | Correct password on locked account | Returns `423 Locked` with remaining time |
| T9 | 5 wrong passwords for different usernames from same IP | IP rate limit kicks in (10 req/15min) |
| T10 | Failed attempt counter resets on successful login | Counter goes back to 0 |
| T11 | Progressive delay applied | 3rd failure takes ~4s, 5th takes ~16s |

---

## 3. Request Size Limits

### Configuration

```typescript
// app.ts
app.use(express.json({ limit: '1mb' }))        // JSON body max 1MB
app.use(express.urlencoded({ limit: '1mb', extended: true }))
```

Per-route overrides:
- `/media/upload-url` — limit to `100kb` (only metadata, not file)
- Content updates with TinyMCE HTML — limit to `500kb`
- Settings updates — limit to `50kb`

### Test Scenarios

| # | Scenario | Expected Result |
|---|----------|----------------|
| T12 | Send JSON body > 1MB | Returns `413 Payload Too Large` |
| T13 | Send URL-encoded body > 1MB | Returns `413` |
| T14 | Send upload-url request > 100KB | Returns `413` |
| T15 | Send 10MB JSON body | Connection rejected before parsing |

---

## 4. Input Validation (Zod Schemas)

### Strategy

Every endpoint validates input with Zod before processing. Reject malformed, oversized, or unexpected fields.

### Key Validation Rules

| Field | Rules |
|-------|-------|
| `username` | 3-50 chars, alphanumeric + underscore only |
| `password` | 6-100 chars |
| `email` | Valid email format, max 100 chars |
| `domain_name` | 3-100 chars, no special chars except `.` and `-` |
| `title` | 1-500 chars |
| `description` (HTML) | Max 500KB, strip `<script>` tags |
| `item_name` | 1-200 chars |
| `phone` | 9-20 chars, digits and `+` only |
| `lang_id` | Positive integer |
| `content_type` | Integer 0-5 only |
| `priority` | Integer 0-4 only |

### Test Scenarios

| # | Scenario | Expected Result |
|---|----------|----------------|
| T16 | Empty body on POST `/auth/login` | Returns `400` with field errors |
| T17 | `username` with SQL injection: `' OR 1=1 --` | Returns `400` — validation rejects special chars |
| T18 | `email` = `invalid` | Returns `400` — not valid email |
| T19 | `title` with 600 chars | Returns `400` — exceeds 500 limit |
| T20 | Extra unexpected fields in body | Fields stripped by Zod `.strict()` |
| T21 | HTML in `description` containing `<script>alert(1)</script>` | Script tags stripped, rest preserved |
| T22 | Negative `content_type` = -1 | Returns `400` — must be 0-5 |
| T23 | `password` = `"a"` | Returns `400` — min 6 chars |

---

## 5. SQL Injection Prevention

### Strategy

- **Knex/Objection.js** uses parameterized queries by default
- **No raw SQL** with string interpolation — always use bindings
- Zod validation rejects special characters in string fields

### Test Scenarios

| # | Scenario | Expected Result |
|---|----------|----------------|
| T24 | Login with `username` = `admin' OR '1'='1` | Returns `400` — validation rejects quotes |
| T25 | Search content with `title` = `'; DROP TABLE tblcontent; --` | Returns `400` — validation rejects |
| T26 | Menu item `item_name` with `UNION SELECT` | Returns `400` — validation rejects |
| T27 | URL param `/content/1 OR 1=1` | Route returns `404` — non-numeric param |
| T28 | Verify Knex uses parameterized queries | Check query logs: should show `?` placeholders, not interpolated values |

---

## 6. XSS (Cross-Site Scripting) Prevention

### Strategy

- **Helmet** sets `X-XSS-Protection`, `X-Content-Type-Options`, `Content-Security-Policy` headers
- **DOMPurify** on server side for HTML content (TinyMCE output)
- Input validation strips `<script>`, `<iframe>`, `onerror=`, `javascript:` from all text fields
- Output encoding: all JSON responses are encoded, never rendered as HTML

### Test Scenarios

| # | Scenario | Expected Result |
|---|----------|----------------|
| T29 | Inject `<script>alert('xss')</script>` in content title | Script tags stripped before DB save |
| T30 | Inject `<img src=x onerror=alert(1)>` in news description | `onerror` attribute stripped |
| T31 | Inject `javascript:alert(1)` in menu URL | Rejected by validation |
| T32 | Set `<iframe src="evil.com">` in TinyMCE HTML | Iframe stripped by DOMPurify |
| T33 | Check response headers | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` |

---

## 7. Authentication & JWT Security

### Strategy

- Short-lived access tokens (1 hour)
- Refresh tokens (7 days) stored with rotation — old refresh token invalidated on use
- JWT ID (`jti`) tracked in Redis for revocation
- Logout adds token to Redis blacklist
- No sensitive data in JWT payload

### Test Scenarios

| # | Scenario | Expected Result |
|---|----------|----------------|
| T34 | Access `/admin/content` without token | Returns `401 Unauthorized` |
| T35 | Access `/admin/content` with expired token | Returns `401`, error message mentions expiry |
| T36 | Access `/admin/content` with tampered token (changed payload) | Returns `401` — signature invalid |
| T37 | Use refresh token to get new access token | Returns new access + new refresh token |
| T38 | Reuse old refresh token after rotation | Returns `401` — token already used, all user tokens revoked |
| T39 | Login → Logout → Use old access token | Returns `401` — token blacklisted in Redis |
| T40 | Access SuperAdmin endpoint with WebAdmin token | Returns `403 Forbidden` |
| T41 | Access WebAdmin endpoint with Normal user token | Returns `403 Forbidden` |
| T42 | Token contains no password or sensitive data | JWT payload only has: userId, username, domainId, userLevel |

---

## 8. CORS Configuration

### Strategy

Only allow requests from known frontend origins. No wildcard `*` in production.

```typescript
const corsOptions = {
  origin: (origin, callback) => {
    const allowed = [
      'https://k-h.biz',
      'https://khmer.biz',
      // Add all managed domains dynamically from database
    ]
    if (!origin || allowed.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Forwarded-Host'],
  credentials: true,
  maxAge: 86400  // Preflight cache 24h
}
```

### Test Scenarios

| # | Scenario | Expected Result |
|---|----------|----------------|
| T43 | Request from `https://k-h.biz` | CORS headers present, request succeeds |
| T44 | Request from `https://evil.com` | Returns `403` — CORS blocked |
| T45 | Request with `Origin: null` | Allowed (same-origin requests) |
| T46 | OPTIONS preflight request | Returns `204` with correct CORS headers |
| T47 | Request with custom header not in allowedHeaders | CORS blocked |

---

## 9. File Upload Security

### Strategy

- **No direct file upload to API** — pre-signed URLs only
- File type whitelist: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `video/mp4`, `application/pdf`
- File size limit enforced client-side AND in pre-signed URL policy (S3 condition)
- Virus scan not needed — files go to S3, never touch the server filesystem
- Filename sanitization — generate random key, never use user's filename

### Test Scenarios

| # | Scenario | Expected Result |
|---|----------|----------------|
| T48 | Request upload URL for `file.exe` | Returns `400` — file type not allowed |
| T49 | Request upload URL for `file.php` | Returns `400` — file type not allowed |
| T50 | Upload file > 10MB to pre-signed URL | S3 rejects — policy enforces size limit |
| T51 | Confirm upload with tampered file key | Returns `400` — key not from pre-signed flow |
| T52 | Upload 501st file for domain (limit=500) | Returns `403` — file limit reached |
| T53 | Upload duplicate file (same MD5 code) | Returns `409 Conflict` or reuses existing |
| T54 | Direct POST file binary to `/media` | Returns `400` — must use pre-signed URL flow |

---

## 10. Helmet Security Headers

### Configuration

```typescript
import helmet from 'helmet'

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.tiny.cloud"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "https://khmer.sgp1.digitaloceanspaces.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'self'", "https://www.youtube.com"],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}))
```

### Test Scenarios

| # | Scenario | Expected Result |
|---|----------|----------------|
| T55 | Check `Strict-Transport-Security` header | Present with `max-age=31536000` |
| T56 | Check `X-Content-Type-Options` header | `nosniff` |
| T57 | Check `X-Frame-Options` header | `DENY` |
| T58 | Check `Content-Security-Policy` header | Present with restricted directives |
| T59 | Check `X-Powered-By` header | Removed (helmet hides it) |

---

## 11. Domain Scoping / Multi-Tenant Isolation

### Strategy

Every authenticated query MUST include `WHERE domain_id = :userDomainId`. A middleware attaches the user's domain scope. No endpoint should return data from another domain.

### Test Scenarios

| # | Scenario | Expected Result |
|---|----------|----------------|
| T60 | WebAdmin for domain A requests content from domain B | Returns empty list or `403` |
| T61 | Modify JWT payload to change domainId | Returns `401` — signature invalid |
| T62 | Request `/content/123` where content belongs to different domain | Returns `404` — not found in user's scope |
| T63 | SuperAdmin requests content without domain scope | Returns all content (expected — SuperAdmin has global access) |
| T64 | Request `/site/config` with spoofed Host header for non-existent domain | Returns `404` — domain not found |

---

## 12. Error Handling — No Information Leakage

### Strategy

- Never expose stack traces in production
- Never expose database error messages to client
- Generic error messages for 500 errors
- Detailed errors only in development mode

### Test Scenarios

| # | Scenario | Expected Result |
|---|----------|----------------|
| T65 | Trigger database connection error | Returns `500` with generic message, no DB details |
| T66 | Trigger unhandled exception | Returns `500` with generic message, no stack trace |
| T67 | Request non-existent endpoint `/api/v1/unknown` | Returns `404` with clean message |
| T68 | Send malformed JSON body | Returns `400` with "Invalid JSON", not parse error details |
| T69 | Check production vs development error detail | Production: minimal info; Development: stack trace |

---

## 13. DDoS Mitigation

### Strategy (infrastructure level, not just application)

| Layer | Protection |
|-------|-----------|
| DNS/CDN | Cloudflare or similar — absorb volumetric attacks |
| Nginx | Connection limit, request limit per IP |
| Express | Rate limiting (above), request timeout |
| App | Keep-alive connections limited, graceful degradation |

### Nginx Configuration

```nginx
# Limit connections per IP
limit_conn_zone $binary_remote_addr zone=connlimit:10m;
limit_conn connlimit 20;

# Limit requests per IP
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req zone=general burst=20 nodelay;

# Timeout
client_body_timeout 10s;
client_header_timeout 10s;
send_timeout 10s;

# Max body size
client_max_body_size 1m;
```

### Test Scenarios

| # | Scenario | Expected Result |
|---|----------|----------------|
| T70 | Send 1000 requests in 1 second from single IP | Nginx/app blocks most with `429`/`503` |
| T71 | Open 100 concurrent connections from single IP | Connections beyond limit rejected |
| T72 | Send request with no complete headers (slow loris) | Timeout after 10s, connection dropped |
| T73 | Send huge request body slowly over 60s | Timeout after 10s |

---

## Summary Checklist

| Category | Protections | Test Count |
|----------|------------|------------|
| Rate Limiting | Per-route limits with Redis counters | 6 tests |
| Brute Force | Account lockout + progressive delay | 5 tests |
| Request Size | Body parser limits + per-route overrides | 4 tests |
| Input Validation | Zod schemas on all endpoints | 8 tests |
| SQL Injection | Parameterized queries + Zod validation | 5 tests |
| XSS | Helmet + DOMPurify + input sanitization | 5 tests |
| JWT Security | Short-lived tokens + rotation + blacklist | 9 tests |
| CORS | Dynamic origin whitelist | 5 tests |
| File Upload | Type whitelist + S3 policy + file limit | 7 tests |
| Security Headers | Helmet with CSP, HSTS, XSS protection | 5 tests |
| Multi-Tenant | Domain-scoped queries enforced by middleware | 5 tests |
| Error Handling | No info leakage in production | 5 tests |
| DDoS | Nginx + rate limit + timeout | 4 tests |
| **Total** | | **73 tests** |

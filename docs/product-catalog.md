# Product / Service Catalog Feature

Adds a new content type **Product/Service (`content_type = 6`)** so a site can
host a catalog. A `Content` record of type 6 acts as the catalog container
(e.g. "Our Products" attached to a menu item), and individual catalog items are
stored in a new `tblproduct` table — the same shape and conventions as
`tblnews`.

## Database — `tblproduct`

> ⚠️ This project has no Knex migrations; tables are managed directly in MySQL.

The `tblproduct` schema mirrors `tblnews` exactly (same column types, charset,
status conventions, no foreign keys):

```sql
CREATE TABLE `tblproduct` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content_id` int NOT NULL DEFAULT '0',
  `description` longtext NOT NULL COMMENT '{"name":"","price":0,"currency":"","shortdes":"","longdes":"","features":[],"photos":[]}',
  `userid` int NOT NULL DEFAULT '0',
  `status` int NOT NULL DEFAULT '0' COMMENT '0: Enable , 1: Disable, 2: Delete',
  `priority` int NOT NULL DEFAULT '0' COMMENT '0: Not, 1: yes',
  `create_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `publish_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='Product/Service catalog items for content_type=6';
```

The table has been created in the local Docker MySQL
(`srv-captain--mysql-db`, database `khmerbiz`). The same DDL must be run against
any other environment (staging/prod) you deploy to.

## Detail fields (JSON in `description`)

```json
{
  "name": "Khmer Coffee 250g",
  "price": 4.5,
  "currency": "USD",
  "shortdes": "Single-origin roast",
  "longdes": "<p>Grown in Mondulkiri...</p>",
  "features": ["100% Arabica", "Roasted weekly"],
  "photos": ["products/coffee-1.jpg", "products/coffee-2.jpg"],
  "publish": "2026-07-13 10:00:00"
}
```

- **photos** is an array of S3 keys. Upload the files first via the existing
  `/media/upload-url` + `/media/confirm` flow, then pass the resulting keys.
- **features** is an array of feature bullet strings.

## API endpoints

All mounted under base path `/api/v1`. Response shape:
`{ status, message?, data?, errors? }`.

### Admin (auth required)

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/content/:contentId/products` | List products (query: `page`, `limit`) |
| POST   | `/content/:contentId/products` | Create a product item |
| GET    | `/content/:contentId/products/:productId` | Get one product |
| PUT    | `/content/:contentId/products/:productId` | Update a product |
| DELETE | `/content/:contentId/products/:productId` | Soft-delete a product |

To create the catalog container itself:

```http
POST /api/v1/content
{ "menu_id": 3, "content_type": 6, "lang_id": 1, "title": "Our Products" }
```

**POST /content/:contentId/products**
```json
{
  "name": "string (1-500, required)",
  "price": "number >= 0 (optional)",
  "currency": "string max 20 (optional)",
  "shortdes": "string max 5000 (optional)",
  "longdes": "string max 500000 (optional)",
  "features": ["string..."] (max 100, optional)",
  "photos": ["string..."] (max 50, optional)",
  "priority": "number 0-4 (default 0)",
  "status": "number (optional)"
}
```

**PUT /content/:contentId/products/:productId** — all fields optional; detail
fields are merged onto the existing JSON (so a photos-only update replaces just
the photo collection, leaving the rest intact).

### Public site (no auth, cached)

| Method | Path | Cache TTL | Description |
|--------|------|-----------|-------------|
| GET    | `/site/products/:productId` | 1200s | Single product detail |
| GET    | `/site/list-products/:contentId` | 120s | Paginated list (query: `page`, `limit`) |

Products also appear in `GET /site/home` sections (under the `products` graph)
when the content is attached to a root menu item.

## Content type reference

| Value | Type |
|-------|------|
| 0 | Article |
| 1 | Photo gallery |
| 2 | Video |
| 3 | Document |
| 4 | News |
| 5 | Map |
| **6** | **Product / Service** (new) |

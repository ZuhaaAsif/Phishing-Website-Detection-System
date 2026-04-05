# Express + PostgreSQL + Prisma — Backend Boilerplate

A modular, production-ready REST API starter using **Express.js**, **PostgreSQL**, and **Prisma ORM**.

---

## Project Structure

```
express-backend/
├── prisma/
│   ├── schema.prisma        # Data models → edit this to define your schema
│   └── seed.js              # Dev seed data
├── src/
│   ├── app.js               # Express app setup, middleware, route mounting
│   ├── index.js             # Legacy route definitions for quick prototyping
│   ├── server.js            # Server startup and database connection
│   ├── routes/              # URL definitions & validators
│   │   ├── analysis.js
│   │   ├── item.routes.js
│   │   ├── reviews.routes.js
│   │   ├── user.routes.js
│   │   └── websites.routes.js
│   ├── controllers/         # HTTP layer — reads req, writes res
│   │   ├── analysis.controller.js
│   │   ├── item.controller.js
│   │   ├── reviews.controller.js
│   │   ├── user.controller.js
│   │   └── websites.controller.js
│   ├── services/            # Business logic (no req/res here)
│   │   ├── analysis.service.js
│   │   ├── db.service.js    # Prisma singleton
│   │   ├── helpers.js
│   │   ├── item.db.service.js
│   │   ├── item.service.js
│   │   ├── reviews.service.js
│   │   ├── user.service.js
│   │   └── websites.service.js
│   ├── middleware/
│   │   ├── error.middleware.js    # 404 + global error handler
│   │   └── validate.middleware.js # express-validator runner
│   └── utils/
│       ├── prisma.js
│       └── response.js
├── .env.example
├── package.json
└── README.md
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# → Edit .env and set DATABASE_URL

# 3. Push schema to database & generate Prisma client
npm run db:migrate   # creates migrations + generates client
# OR for quick prototyping (no migration files):
npx prisma db push

# 4. (Optional) Seed the database
npm run db:seed

# 5. Start dev server with hot-reload
npm run dev

# 6. Open Prisma Studio (visual DB browser)
npm run db:studio
```

Server runs at **http://localhost:3000** by default.

---

## Environment Variables

| Variable       | Example                                               | Required |
|----------------|-------------------------------------------------------|----------|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/mydb?schema=public` | ✅ |
| `PORT`         | `3000`                                                | optional |
| `NODE_ENV`     | `development` / `production`                          | optional |
| `CORS_ORIGINS` | `http://localhost:5173,https://myapp.com`             | optional |

---

## API Reference

All responses follow this envelope:

```json
{ "success": true,  "data": { ... } }
{ "success": false, "message": "Error description" }
```

### Health

| Method | Endpoint  | Description    |
|--------|-----------|----------------|
| GET    | /health   | Liveness check |

---

### Items — `/api/items`

#### `GET /api/items`
List all items (paginated).

**Query params:** `page` (default 1), `limit` (default 20)

**Response 200**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "First Item",
        "description": "Hello world",
        "published": true,
        "createdAt": "2024-04-01T10:00:00.000Z",
        "updatedAt": "2024-04-01T10:00:00.000Z",
        "author": { "id": 1, "name": "Alice", "email": "alice@example.com" }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

#### `GET /api/items/:id`
Get a single item.

**Response 200** — same shape as one item above  
**Response 404** — `{ "success": false, "message": "Item not found" }`

---

#### `POST /api/items`
Create a new item.

**Request body**
```json
{
  "title": "My Item",          // required
  "description": "Details",   // optional
  "published": false,          // optional, default false
  "authorId": 1                // optional
}
```

**Response 201**
```json
{ "success": true, "data": { "id": 2, "title": "My Item", ... } }
```

**Response 422 (validation failure)**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "title", "message": "title is required" }]
}
```

---

#### `PUT /api/items/:id`
Full update of an item.

**Request body** — same fields as POST (all required again for PUT)

**Response 200** — updated item  
**Response 404** — item not found

---

#### `DELETE /api/items/:id`
Delete an item.

**Response 200**
```json
{ "success": true, "message": "Item deleted" }
```

---

### Users — `/api/users`

#### `GET /api/users`
List all users.

**Response 200**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Alice", "email": "alice@example.com", "createdAt": "..." }
  ]
}
```

---

#### `GET /api/users/:id`
Get a single user with their items.

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "items": [ { "id": 1, "title": "First Item", ... } ]
  }
}
```

---

#### `POST /api/users`
Create a user.

**Request body**
```json
{ "email": "bob@example.com", "name": "Bob" }
```

**Response 201** — created user  
**Response 409** — email already in use

---

#### `PUT /api/users/:id`
Update a user.

**Request body** — same as POST

**Response 200** — updated user

---

#### `DELETE /api/users/:id`
Delete a user.

**Response 200**
```json
{ "success": true, "message": "User deleted" }
```

---

### Websites — `/api/websites`

#### `GET /api/websites`
List all websites.

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "website_id": 1,
      "website_name": "Example Site",
      "url": "https://example.com",
      "domain": "example.com",
      "createdAt": "2026-04-05T10:00:00.000Z",
      "lastChecked": "2026-04-05T10:00:00.000Z",
      "riskScore": 85,
      "security_rate": 4,
      "reputation": "Good",
      "analysisDetails": {}
    }
  ]
}
```

---

#### `GET /api/websites/:id`
Get a single website.

**Response 200** — same shape as one website above  
**Response 404** — `{ "success": false, "message": "Website not found" }`

---

#### `POST /api/websites`
Create a new website.

**Request body**
```json
{
  "website_name": "Example Site",
  "url": "https://example.com",
  "domain": "example.com",
  "riskScore": 85,
  "security_rate": 4,
  "reputation": "Good",
  "analysisDetails": {}
}
```

**Response 201**
```json
{ "success": true, "data": { "website_id": 1, "website_name": "Example Site", ... } }
```

**Response 422 (validation failure)**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "url", "message": "url must be a valid URL" }]
}
```

---

#### `PUT /api/websites/:id`
Update a website.

**Request body** — same fields as POST

**Response 200** — updated website  
**Response 404** — website not found

---

#### `DELETE /api/websites/:id`
Delete a website.

**Response 200**
```json
{ "success": true, "message": "Website deleted successfully" }
```

---

### Reviews — `/api/reviews`

#### `GET /api/reviews`
List all reviews with user and website details.

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "review_id": 1,
      "review": "This website is very secure!",
      "rate": 5,
      "users": {
        "user_id": 1,
        "username": "testuser",
        "email": "test@example.com"
      },
      "websites": {
        "website_id": 1,
        "website_name": "Example Site",
        "url": "https://example.com"
      }
    }
  ]
}
```

---

#### `GET /api/reviews/:id`
Get a single review.

**Response 200** — same shape as one review above  
**Response 404** — `{ "success": false, "message": "Review not found" }`

---

#### `POST /api/reviews`
Create a new review.

**Request body**
```json
{
  "review": "This website is very secure!",
  "website_id": 1,
  "user_id": 1,
  "rate": 5
}
```

**Response 201**
```json
{ "success": true, "data": { "review_id": 1, "review": "This website is very secure!", ... } }
```

**Response 422 (validation failure)**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "rate", "message": "rate must be between 1 and 5" }]
}
```

---

#### `PUT /api/reviews/:id`
Update a review.

**Request body** — same fields as POST

**Response 200** — updated review  
**Response 404** — review not found

---

#### `DELETE /api/reviews/:id`
Delete a review.

**Response 200**
```json
{ "success": true, "message": "Review deleted successfully" }
```

---

## Where to Make Changes

### Adding a new resource (e.g. `Product`)

1. **`prisma/schema.prisma`** — add a `model Product { ... }` block, then run `npm run db:migrate`.
2. **`src/services/product.service.js`** — copy `item.service.js`, swap `prisma.item` for `prisma.product`.
3. **`src/controllers/product.controller.js`** — copy `item.controller.js`, import the new service.
4. **`src/routes/product.routes.js`** — copy `item.routes.js`, update validators and controller import.
5. **`src/app.js`** — add `app.use("/api/products", require("./routes/product.routes"))`.

### Adding authentication

Add an `auth.middleware.js` in `src/middleware/` that verifies a JWT, then apply it per-route:
```js
router.post("/", authMiddleware, bodyRules, validate, ctrl.create);
```

### Changing the response format

Edit the `res.json(...)` calls in `src/controllers/` — they're the only place that constructs HTTP responses.

### Adding business rules

Put them in the relevant `src/services/` file. Controllers must stay thin.

---

## npm Scripts

| Script            | What it does                              |
|-------------------|-------------------------------------------|
| `npm run dev`     | Start server with nodemon (hot-reload)    |
| `npm start`       | Start server (production)                 |
| `npm run db:migrate` | Create & apply a new Prisma migration  |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:studio`  | Open Prisma Studio (visual DB browser) |
| `npm run db:seed`    | Populate DB with seed data             |

# Phishing Website Detection System - Backend API

A comprehensive REST API for detecting phishing websites using advanced analysis techniques including URL heuristics, typosquatting detection, and Google Safe Browsing integration. Features user authentication, website reviews, and risk assessment.

---

## Features

### Core Functionality
- **URL Risk Analysis**: Advanced phishing detection using multiple analysis methods
- **User Authentication**: JWT-based authentication with secure password hashing
- **Website Reviews**: Authenticated user reviews and ratings
- **Search & Discovery**: Find websites by domain, URL, or name
- **Risk Persistence**: Store and retrieve website analysis results

### Security Features
- **Rate Limiting**: Protect against abuse (8 auth requests/min, 20 reviews/min)
- **Input Validation**: Comprehensive validation using express-validator
- **CORS & Security Headers**: Helmet and CORS middleware
- **JWT Authentication**: Secure token-based authentication
- **Password Security**: bcrypt hashing with salt rounds

### Analysis Methods
- **URL Heuristics**: Detect suspicious patterns (IP addresses, @ symbols, etc.)
- **Typosquatting Detection**: Identify domain impersonation attempts
- **Google Safe Browsing**: External threat intelligence integration
- **Risk Scoring**: Comprehensive risk assessment (0-100 scale)

---

## Project Structure

```
express-backend/
├── prisma/
│   ├── schema.prisma        # Database schema (users, websites, reviews)
│   ├── seed.js              # Sample data for development
│   └── migrations/          # Database migration files
├── src/
│   ├── app.js               # Express app setup and route mounting
│   ├── server.js            # Server startup and database connection
│   ├── routes/              # API route definitions
│   │   ├── analysis.js      # URL analysis endpoints
│   │   ├── reviews.routes.js # Review CRUD operations
│   │   ├── user.routes.js   # User authentication & management
│   │   └── websites.routes.js # Website search & management
│   ├── controllers/         # HTTP request handlers
│   │   ├── analysis.controller.js # Analysis logic
│   │   ├── reviews.controller.js  # Review operations
│   │   ├── user.controller.js     # User management
│   │   └── websites.controller.js # Website operations
│   ├── services/            # Business logic layer
│   │   ├── analysis.service.js    # Phishing detection algorithms
│   │   ├── reviews.service.js     # Review business logic
│   │   ├── user.service.js        # User authentication & management
│   │   └── websites.service.js    # Website CRUD operations
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.js     # JWT authentication
│   │   ├── error.middleware.js    # Error handling
│   │   ├── rate-limit.middleware.js # Rate limiting
│   │   └── validate.middleware.js # Input validation
│   └── utils/               # Utility functions
│       ├── prisma.js        # Legacy Prisma client
│       └── response.js      # Response helpers
├── .env                     # Environment configuration
├── package.json             # Dependencies and scripts
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation

```bash
# 1. Clone and navigate to backend
cd express-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database URL and other settings

# 4. Set up database
npm run db:migrate   # Create migrations and generate Prisma client
npm run db:seed      # Populate with sample data

# 5. Start development server
npm run dev

# 6. (Optional) Open Prisma Studio for database inspection
npm run db:studio
```

Server runs at **http://localhost:3000** by default.

---

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | - |
| `PORT` | Server port | ❌ | `3000` |
| `NODE_ENV` | Environment mode | ❌ | `development` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | ❌ | `*` |
| `JWT_SECRET` | JWT signing secret | ✅ | - |
| `JWT_EXPIRY` | JWT token expiry | ❌ | `2h` |
| `GOOGLE_SAFE_BROWSING_API_KEY` | Google Safe Browsing API key | ❌ | - |

---

## API Reference

All API responses follow this envelope:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "Error message" }
```

### Authentication

Most endpoints require authentication. Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Analysis Endpoints

### `POST /api/analyze`
Analyze a URL for phishing risks.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response 200:**
```json
{
  "success": true,
  "analysis": {
    "url": "https://example.com",
    "authenticity_score": 85,
    "risk_status": "SAFE",
    "risk_color": "green",
    "risk_icon": "✅",
    "risk_message": "This website appears to be legitimate.",
    "risk_action": "ALLOW",
    "analysis_details": {
      "url_heuristics": {
        "score": 15,
        "issues_found": ["Contains suspicious keyword: login"],
        "issue_count": 1,
        "breakdown": { "basic_heuristics": 15, "typosquatting": 0 },
        "typosquatting_detected": false
      },
      "google_safe_browsing": {
        "status": "clean",
        "message": "URL not found in threat database"
      }
    },
    "recommendations": [
      "Website appears safe to visit",
      "Always keep your browser updated"
    ],
    "analyzed_at": "2026-04-05T10:30:00.000Z"
  },
  "website": {
    "website_id": 1,
    "website_name": "example.com",
    "url": "https://example.com",
    "domain": "example.com",
    "riskScore": 85,
    "security_rate": 5,
    "reputation": "clean"
  }
}
```

---

## User Management

### `POST /api/users`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "johndoe",
    "email": "user@example.com",
    "last_active": "2026-04-05T10:30:00.000Z"
  }
}
```

### `POST /api/users/login`
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "user_id": 1,
      "username": "johndoe",
      "email": "user@example.com",
      "last_active": "2026-04-05T10:30:00.000Z"
    }
  }
}
```

### `GET /api/users/me`
Get current user profile (requires authentication).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "johndoe",
    "email": "user@example.com",
    "last_active": "2026-04-05T10:30:00.000Z",
    "reviews": [
      {
        "review_id": 1,
        "review": "Great website!",
        "rate": 5,
        "websites": {
          "website_name": "example.com",
          "url": "https://example.com"
        }
      }
    ]
  }
}
```

---

## Website Management

### `GET /api/websites`
List all websites (with optional search).

**Query Parameters:**
- `q`: Search query (searches URL, domain, name)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "website_id": 1,
      "website_name": "Google",
      "url": "https://www.google.com",
      "domain": "google.com",
      "riskScore": 95,
      "security_rate": 5,
      "reputation": "clean",
      "lastChecked": "2026-04-05T10:30:00.000Z"
    }
  ]
}
```

### `GET /api/websites/search`
Search websites by query.

**Query Parameters:**
- `q`: Search term (required)

**Response 200:** Same as above.

### `GET /api/websites/domain/:domain`
Get website details by domain (includes reviews).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "website_id": 1,
    "website_name": "Google",
    "url": "https://www.google.com",
    "domain": "google.com",
    "riskScore": 95,
    "security_rate": 5,
    "reputation": "clean",
    "analysisDetails": { ... },
    "reviews": [
      {
        "review_id": 1,
        "review": "Great search engine!",
        "rate": 5,
        "users": {
          "username": "johndoe",
          "email": "user@example.com"
        }
      }
    ]
  }
}
```

---

## Reviews Management

### `GET /api/reviews`
List all reviews.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "review_id": 1,
      "review": "Great website!",
      "rate": 5,
      "website_id": 1,
      "user_id": 1,
      "users": { "username": "johndoe" },
      "websites": { "website_name": "Google" }
    }
  ]
}
```

### `GET /api/reviews/domain/:domain`
Get all reviews for a specific domain.

**Response 200:** Array of reviews as above.

### `POST /api/reviews`
Create a new review (requires authentication).

**Request Body:**
```json
{
  "review": "This website is excellent!",
  "website_id": 1,
  "rate": 5
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Your review has been recorded",
  "data": {
    "review_id": 2,
    "review": "This website is excellent!",
    "rate": 5,
    "user_id": 1
  }
}
```

### `PUT /api/reviews/:id`
Update a review (requires authentication, owner only).

**Request Body:**
```json
{
  "review": "Updated review text",
  "rate": 4
}
```

### `DELETE /api/reviews/:id`
Delete a review (requires authentication, owner only).

---

## Health Check

### `GET /health`
Check server health.

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-05T10:30:00.000Z"
}
```

---

## Security Features

### Rate Limiting
- **Authentication endpoints**: 8 requests per minute
- **Review endpoints**: 20 requests per minute

### Authentication
- JWT tokens with configurable expiry
- Password hashing using bcrypt
- Secure token validation

### Input Validation
- All inputs validated using express-validator
- SQL injection protection via Prisma ORM
- XSS protection via input sanitization

---

## Database Schema

### Users
```sql
- user_id: Primary Key
- username: String (unique)
- email: String (unique)
- password: String (hashed)
- last_active: DateTime
```

### Websites
```sql
- website_id: Primary Key
- website_name: String (unique)
- url: String (unique)
- domain: String
- riskScore: Float
- security_rate: Integer (1-5)
- reputation: String
- analysisDetails: JSON
- createdAt: DateTime
- lastChecked: DateTime
```

### Reviews
```sql
- review_id: Primary Key
- review: String
- website_id: Foreign Key
- user_id: Foreign Key
- rate: Integer (1-5)
```

---

##  Testing

# Manual API testing with curl
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```
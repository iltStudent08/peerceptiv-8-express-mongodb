# peerceptiv-8-express-mongodb

Base Express + MongoDB application scaffold with:
- Mongoose schemas with validation and relationships
- CRUD routes with filter/sort/paginate query features
- JWT authentication and route protection
- Centralized error handling and request validation

## Running the App

### Prerequisites

- Node.js 18 or newer (includes `npm`)
- A running MongoDB instance — either local (`mongod` on port 27017) or a MongoDB Atlas connection string

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and edit the values:

```bash
cp .env.example .env      # PowerShell: Copy-Item .env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | no | Port the server listens on (defaults to `3000`) |
| `MONGODB_URI` | yes | Mongo connection string, e.g. `mongodb://localhost:27017/peerceptiv` |
| `JWT_SECRET` | yes | Secret used to sign JWTs — use a long random value |
| `JWT_EXPIRES_IN` | no | Token lifetime (defaults to `1d`) |

The server fails to start if `MONGODB_URI` is missing.

### 3. Start the server

```bash
npm run dev     # auto-restarts on file changes (nodemon)
npm start       # plain node, for production-style runs
```

You should see `Server running on port 3000`. Confirm it is up:

```bash
curl http://localhost:3000/health
```

### 4. Try the API

Register a user, then use the returned token for protected routes:

```bash
# 1. Register (returns a JWT)
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada","email":"ada@example.com","password":"supersecret"}'

# 2. Create an author (protected)
curl -X POST http://localhost:3000/api/v1/authors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Ursula K. Le Guin","nationality":"American"}'

# 3. Create a book using the returned author id (protected)
curl -X POST http://localhost:3000/api/v1/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"A Wizard of Earthsea","isbn":"9780553262506","genre":"fantasy","author":"<authorId>","publishedYear":1968,"price":9.99}'

# 4. Browse the catalog (public)
curl "http://localhost:3000/api/v1/books?genre=fantasy&sort=-publishedYear&page=1&limit=10"
```

### 5. Run the tests

```bash
npm test
```

Tests use supertest against the Express app directly and do not require a database connection.

### Troubleshooting

- `MONGODB_URI is required` — `.env` is missing or the variable is unset.
- `MongooseServerSelectionError` — MongoDB is not running or the URI/credentials are wrong.
- `401 Not authorized, token missing` — add the `Authorization: Bearer <token>` header.
- `429 Too many requests` — rate limits are 50 auth requests and 200 API requests per 15 minutes.

## Scripts

- `npm run dev` - start server with nodemon
- `npm start` - start server
- `npm test` - run tests

## API Base

- Health: `GET /health`
- Auth: `/api/v1/auth`
- Users: `/api/v1/users` (admin protected)
- Posts: `/api/v1/posts`
- Books: `/api/v1/books`
- Authors: `/api/v1/authors`

## Book Catalog

`Book` references `Author` and `User` (`addedBy`) via ObjectId and both are populated on read.

| Method | Route | Auth |
| --- | --- | --- |
| GET | `/api/v1/books` | public |
| GET | `/api/v1/books/:id` | public |
| POST | `/api/v1/books` | Bearer token |
| PATCH | `/api/v1/books/:id` | Bearer token (owner or admin) |
| DELETE | `/api/v1/books/:id` | Bearer token (owner or admin) |
| GET | `/api/v1/authors` | public |
| GET | `/api/v1/authors/:id` | public (populates the author's books) |
| POST/PATCH/DELETE | `/api/v1/authors[/:id]` | Bearer token |

### Query features on `GET /api/v1/books`

- Filter: `genre`, `author`, `publishedYear`, `tags`
- Sort: `sort=-publishedYear,title`
- Paginate: `page`, `limit`

```
GET /api/v1/books?genre=fantasy&sort=-publishedYear,title&page=2&limit=5
```

### Example create payload

```json
{
  "title": "The Silent Library",
  "isbn": "978-3-16-148410-0",
  "genre": "fiction",
  "author": "665f1b2c9d1e4a0012ab34cd",
  "publishedYear": 2021,
  "price": 18.99,
  "copiesAvailable": 4,
  "tags": ["literary", "award-winner"]
}
```

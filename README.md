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

## Design Notes

### Schema design decisions

The catalog is modeled as three collections: `User`, `Author`, and `Book`.

**Why these fields.** `Book` carries the data a catalog is actually queried and displayed by: `title`, `isbn`, `genre`, `publishedYear`, `price`, `copiesAvailable`, `description`, and `tags`. `isbn` exists because it is the real-world natural key for a book and gives a meaningful uniqueness constraint that a title cannot (many books share a title). `copiesAvailable` is a number rather than a boolean so the same field supports both stock display and an "in stock" check; the derived answer is exposed as an `inStock` virtual so the boolean is never stored and can never drift out of sync with the count. `tags` is a plain string array because tags are small, unbounded, always read with the book, and never queried on their own — exactly the case where embedding beats a separate collection. `Author` is deliberately thin (`name`, `bio`, `nationality`, `birthYear`) since it only needs to identify and describe the person.

**Why these validation rules.** Validation lives in the schema so it applies to every write path, including ones that bypass the HTTP layer. Required fields cover the data the catalog is meaningless without (`title`, `isbn`, `genre`, `publishedYear`, `price`, `author`). String length bounds prevent both junk (a one-character title) and abuse (an unbounded `description` inflating documents). `genre` is an `enum` because a fixed vocabulary is what makes filtering and faceting reliable — free-text genres would fragment into "sci-fi", "scifi", and "Science Fiction". Two custom validators handle rules a built-in cannot express: an ISBN-10/13 format check (paired with a setter that strips hyphens and spaces so `978-3-16-148410-0` and `9783161484100` are stored identically), and a `publishedYear` check that allows at most one year into the future to permit pre-orders while rejecting typos like `9999`. Numeric `min` constraints stop negative prices and stock counts. `Author.birthYear` gets a custom validator rejecting future years.

**Why these relationships.** `Book.author` and `Book.addedBy` are `ObjectId` references rather than embedded documents. An author is a shared entity that many books point to, so embedding would duplicate the bio across every book and require a fan-out write to correct a typo; a reference keeps one authoritative copy. `addedBy` is a reference for the same reason and because it also serves as the ownership check for authorization. Reads use `populate()` with an explicit field projection (`populate('author', 'name nationality birthYear')`) so responses stay useful without dragging in unneeded fields. `Author` exposes a reverse `books` virtual, which keeps the array of book ids out of the author document — important because an author's book list is unbounded and would otherwise grow the document on every new book. Referential integrity is not enforced by MongoDB, so the controllers do it: creates and updates verify the referenced author exists (404 otherwise), and deleting an author with books returns 409 rather than orphaning them.

### Query features and trade-offs

`GET /api/v1/books` composes three chainable steps in [src/utils/queryFeatures.js](src/utils/queryFeatures.js) on top of an unexecuted Mongoose query, so filter, sort, and pagination are translated into a single database round trip instead of being applied in memory.

- **Filtering** passes an allow-list (`genre`, `author`, `publishedYear`, `tags`) and drops every other query parameter. This is the important trade-off: handing user-supplied query objects straight to `find()` invites NoSQL operator injection (`?role[$ne]=x`) and lets clients filter on unindexed fields. The allow-list costs flexibility — there is no range query such as `price[gte]=10` — in exchange for a predictable, safe query surface. Supporting operators would mean explicitly whitelisting them too.
- **Sorting** accepts a comma-separated `sort=-publishedYear,title` with `-createdAt` as the default. Sorts on unindexed fields are permitted, which is convenient but will fall back to an in-memory sort at scale; the fix is an index per supported sort, so a production version would restrict sorting to indexed fields.
- **Pagination** uses `page`/`limit` translated to `skip`/`limit`, which is simple and allows jumping to an arbitrary page. The cost is that `skip` grows linearly — deep pages force the server to walk and discard every preceding document. Cursor (keyset) pagination on a sort key is faster for deep paging but cannot express "page 47". This endpoint also returns `results` (the size of the current page) rather than a total count, since a `countDocuments()` on every request doubles the query cost; that means clients cannot render an exact page count.

### Authentication approach

Passwords are hashed with bcrypt at cost factor 12 in a `pre('save')` hook on the `User` model, so a password is never hashed at a call site and is re-hashed only when actually modified. The field is declared `select: false` so it is excluded from queries by default and cannot leak into a response by accident; login opts back in with `.select('+password')` and compares via `bcrypt.compare`. Login returns the same `401 Invalid email or password` whether the email is unknown or the password is wrong, so the endpoint does not confirm which accounts exist.

`POST /api/v1/auth/register` and `/login` both return a JWT signed with `JWT_SECRET` and expiring per `JWT_EXPIRES_IN` (default `1d`). The token payload holds only the user id — no role or email — so a stale token cannot carry stale privileges.

Route protection is the `protect` middleware: it requires an `Authorization: Bearer <token>` header, verifies the signature and expiry, then re-loads the user from the database and rejects the request if the account no longer exists. That database lookup is the deliberate trade-off — it costs a query per request but means a deleted user's outstanding token stops working immediately and `req.user.role` always reflects current state. A companion `restrictTo(...roles)` middleware handles role checks. Writes to `/books` and `/authors` sit behind `protect`; ownership is then enforced in the controller, where updating or deleting a book requires being its `addedBy` user or an admin (403 otherwise). Rate limiting caps auth attempts at 50 per 15 minutes to slow credential stuffing, and `JsonWebTokenError`/`TokenExpiredError` are normalized to clean 401 responses by the central error handler.

### NoSQL vs. relational

MongoDB fits this project well: a book is a self-contained document that is almost always fetched whole, `tags` is a natural embedded array, and the schema is still moving — adding `copiesAvailable` or a new genre needs no migration and no downtime on a large table.

**Choose MongoDB when** the data is document-shaped and read as a unit; the schema is evolving or genuinely heterogeneous across records (a product catalog where books, e-books, and audiobooks carry different attributes); reads dominate and can be served without multi-collection joins; you need horizontal scale-out, since sharding across nodes is a first-class feature; or you are ingesting semi-structured data such as events, logs, or third-party payloads whose shape you do not control.

**Choose a relational database when** correctness across multiple entities is the hard requirement. Orders, payments, inventory decrements, and ledgers need multi-row ACID transactions and foreign keys enforced by the engine — this project has to hand-roll that integrity in controller code (checking the author exists, blocking deletes that would orphan books), which is exactly the logic a relational schema gets for free and enforces even when a second service writes to the database. Relational also wins for highly interconnected data queried in many directions (reporting and analytics across arbitrary joins), for ad-hoc querying by analysts using SQL, and when the schema is stable and normalization prevents the duplication that makes document stores drift.

In practice the decision is rarely about scale; it is about whether the access pattern is "fetch this document" or "join across these entities and keep them consistent."

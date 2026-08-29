# peerceptiv-8-express-mongodb

Base Express + MongoDB application scaffold with:
- Mongoose schemas with validation and relationships
- CRUD routes with filter/sort/paginate query features
- JWT authentication and route protection
- Centralized error handling and request validation

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

- `npm run dev` - start server with nodemon
- `npm start` - start server
- `npm test` - run tests

## API Base

- Health: `GET /health`
- Auth: `/api/v1/auth`
- Users: `/api/v1/users` (admin protected)
- Posts: `/api/v1/posts`

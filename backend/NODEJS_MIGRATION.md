# FastAPI → Node.js + Express.js migration

The original FastAPI backend has been replaced with a Node.js + Express.js backend.

## Stack
- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT authentication
- bcryptjs password hashing
- CORS + Helmet
- cron-parser for scheduled jobs

## Run

```bash
cd backend
cp .env.example .env
npm install
npm run db:sync
npm run dev
```

API: `http://127.0.0.1:8000`

The React frontend can continue using the same base URL because the API paths were kept compatible.

## PostgreSQL
The default connection is:

`postgres://scheduler_user:scheduler_password@127.0.0.1:5432/distributed_scheduler`

Change `DATABASE_URL` in `.env` if your PostgreSQL credentials differ.

## Important
The existing Python worker remains in `worker/` so the distributed worker process can continue to work against the same PostgreSQL schema. The API layer is now Node.js/Express.js.

For a completely JavaScript-only system, the worker can be migrated separately.

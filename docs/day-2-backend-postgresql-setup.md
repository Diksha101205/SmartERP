# SmartERP Day 2 - Backend And PostgreSQL Setup

## 1. Day 2 Objective

Day 2 establishes the backend foundation for SmartERP and prepares PostgreSQL for the Day 1 database design.

Deliverables:

- Express.js backend project
- Environment configuration
- PostgreSQL connection pool
- Initial database migration
- Health-check endpoint
- Company API foundation
- Local PostgreSQL setup guide

## 2. Backend Folder Structure

```text
backend/
  package.json
  .env.example
  README.md
  src/
    app.js
    server.js
    config/
      env.js
    db/
      pool.js
      migrate.js
    middleware/
      error-handler.js
      not-found-handler.js
    migrations/
      001_initial_schema.sql
    routes/
      company-routes.js
      health-routes.js
```

## 3. Backend Dependencies

Production dependencies:

- `express` for API routes
- `pg` for PostgreSQL connectivity
- `dotenv` for environment variables
- `zod` for request and environment validation
- `cors` for frontend API access
- `helmet` for secure HTTP headers
- `morgan` for request logging

Development dependency:

- `nodemon` for auto-restarting the API during development

## 4. Environment Variables

Create `backend/.env` from `backend/.env.example`.

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smarterp
CORS_ORIGIN=http://localhost:3000
```

## 5. PostgreSQL Local Setup

### Option A: Local PostgreSQL App

1. Install PostgreSQL.
2. Open psql or pgAdmin.
3. Create the database:

   ```sql
   CREATE DATABASE smarterp;
   ```

4. Confirm the connection string:

   ```text
   postgresql://postgres:postgres@localhost:5432/smarterp
   ```

### Option B: Supabase

1. Create a Supabase project.
2. Copy the PostgreSQL connection string from project settings.
3. Paste it into `backend/.env` as `DATABASE_URL`.
4. Run the migration from the backend folder.

## 6. Migration Command

From the backend folder:

```bash
npm run db:migrate
```

This applies:

```text
backend/src/migrations/001_initial_schema.sql
```

The migration creates:

- Users
- Companies
- User-company access
- Financial years
- Ledger groups
- Ledgers
- Units
- Stock items
- Vouchers
- Voucher items
- Ledger entries
- Stock movements

## 7. Run Backend

From the backend folder:

```bash
npm install
npm run dev
```

Expected local API URL:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "smarterp-api",
  "databaseTime": "2026-06-24T..."
}
```

## 8. API Added On Day 2

### Health

`GET /api/health`

Checks:

- API is running
- PostgreSQL connection works

### Companies

`GET /api/companies`

Returns company records.

`POST /api/companies`

Creates a company record.

Example request:

```json
{
  "name": "Demo Traders",
  "gstin": "27ABCDE1234F1Z5",
  "city": "Mumbai",
  "state": "Maharashtra",
  "phone": "9876543210",
  "email": "owner@example.com"
}
```

## 9. Next Build Step

Day 3 should focus on authentication and company selection:

- User registration
- Login
- Password hashing
- JWT issuance
- Company ownership mapping
- Active company selection

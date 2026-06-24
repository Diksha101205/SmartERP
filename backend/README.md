# SmartERP Backend

Express.js backend API for SmartERP.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Update `.env` if your PostgreSQL credentials are different.

3. Run database migration:

   ```bash
   npm run db:migrate
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /api/health` - API and database health check
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Current authenticated user
- `GET /api/companies` - List companies
- `POST /api/companies` - Create company

## Day 2 Scope

- Backend project setup
- Express application structure
- PostgreSQL connection pool
- Initial migration runner
- Health route
- Company route foundation
- Authentication module

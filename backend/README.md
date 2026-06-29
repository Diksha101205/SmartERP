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
- `GET /api/companies/:companyId` - Get company details
- `PATCH /api/companies/:companyId` - Update company details
- `DELETE /api/companies/:companyId` - Delete company
- `GET /api/companies/:companyId/financial-years` - List financial years
- `POST /api/companies/:companyId/financial-years` - Create financial year
- `PATCH /api/companies/:companyId/financial-years/:financialYearId/activate` - Activate financial year

## Day 2 Scope

- Backend project setup
- Express application structure
- PostgreSQL connection pool
- Initial migration runner
- Health route
- Company route foundation
- Authentication module
- Company management module

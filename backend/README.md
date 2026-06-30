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
- `GET /api/companies/:companyId/ledgers` - List customer and supplier ledgers
- `POST /api/companies/:companyId/ledgers` - Create customer or supplier ledger
- `GET /api/companies/:companyId/ledgers/:ledgerId` - Get ledger details
- `PATCH /api/companies/:companyId/ledgers/:ledgerId` - Update ledger details
- `DELETE /api/companies/:companyId/ledgers/:ledgerId` - Deactivate ledger
- `GET /api/companies/:companyId/groups` - List ledger groups
- `POST /api/companies/:companyId/groups` - Create ledger group
- `POST /api/companies/:companyId/groups/seed-defaults` - Create default accounting groups
- `GET /api/companies/:companyId/groups/:groupId` - Get group details
- `PATCH /api/companies/:companyId/groups/:groupId` - Update group details
- `DELETE /api/companies/:companyId/groups/:groupId` - Delete unused custom group
- `GET /api/companies/:companyId/stock/units` - List stock units
- `POST /api/companies/:companyId/stock/units` - Create stock unit
- `GET /api/companies/:companyId/stock/items` - List stock items
- `POST /api/companies/:companyId/stock/items` - Create stock item
- `GET /api/companies/:companyId/stock/items/:itemId` - Get stock item details
- `PATCH /api/companies/:companyId/stock/items/:itemId` - Update stock item
- `DELETE /api/companies/:companyId/stock/items/:itemId` - Deactivate stock item
- `GET /api/companies/:companyId/stock/summary` - Stock summary

## Day 2 Scope

- Backend project setup
- Express application structure
- PostgreSQL connection pool
- Initial migration runner
- Health route
- Company route foundation
- Authentication module
- Company management module
- Ledger management module
- Group management module
- Stock management module

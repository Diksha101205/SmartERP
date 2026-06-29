# SmartERP Day 4 - Company Management

## 1. Day 4 Objective

Day 4 connects authenticated users to company records and makes company data access user-scoped.

Deliverables:

- Authenticated company creation
- Automatic company ownership mapping
- Maximum 5 owned companies per user
- Company list limited to logged-in user's companies
- Company details endpoint
- Company update endpoint
- Company delete endpoint for owners
- Financial year creation, listing, and activation

## 2. Company Rules

- A user must be logged in to manage companies.
- A user can create up to 5 companies as owner.
- New companies automatically create a `user_companies` record with role `owner`.
- New companies automatically get an active financial year.
- Company owners and admins can update company profile details.
- Only owners can delete a company.
- Company queries return only companies the logged-in user can access.

## 3. Endpoints

All endpoints below require:

```text
Authorization: Bearer jwt-token
```

### List Companies

```text
GET /api/companies
```

Returns companies connected to the logged-in user.

### Create Company

```text
POST /api/companies
```

Request:

```json
{
  "name": "Demo Traders",
  "gstin": "27ABCDE1234F1Z5",
  "addressLine1": "Shop 12, Market Road",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "phone": "9876543210",
  "email": "owner@example.com"
}
```

Optional custom financial year:

```json
{
  "name": "Demo Traders",
  "financialYear": {
    "name": "2026-27",
    "startDate": "2026-04-01",
    "endDate": "2027-03-31"
  }
}
```

If `financialYear` is not provided, the backend creates the current Indian financial year automatically.

### Get Company

```text
GET /api/companies/:companyId
```

Returns one accessible company with the user's role and active financial year.

### Update Company

```text
PATCH /api/companies/:companyId
```

Allowed for:

- Owner
- Admin

Request:

```json
{
  "phone": "9000000000",
  "email": "accounts@example.com"
}
```

### Delete Company

```text
DELETE /api/companies/:companyId
```

Allowed for:

- Owner only

## 4. Financial Year Endpoints

### List Financial Years

```text
GET /api/companies/:companyId/financial-years
```

### Create Financial Year

```text
POST /api/companies/:companyId/financial-years
```

Request:

```json
{
  "name": "2027-28",
  "startDate": "2027-04-01",
  "endDate": "2028-03-31",
  "isActive": true
}
```

If `isActive` is true, all other financial years for that company are marked inactive.

### Activate Financial Year

```text
PATCH /api/companies/:companyId/financial-years/:financialYearId/activate
```

This deactivates other financial years for the company and activates the selected one.

## 5. Validation And Security

- Company name must be between 2 and 160 characters.
- GSTIN must be 15 characters when provided.
- Email must be valid when provided.
- Financial year name must be between 4 and 20 characters.
- Financial year date order is enforced by the database.
- Unauthorized company access returns `404` to avoid leaking company existence.

## 6. Recommended Day 5

Day 5 should begin master data management:

- Ledger group defaults
- Customer ledger create/list/update
- Supplier ledger create/list/update
- Company-scoped ledger search
- Keyboard shortcut planning for ledger screens

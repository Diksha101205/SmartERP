# SmartERP Day 6 - Ledger Management

## 1. Day 6 Objective

Day 6 adds customer and supplier ledger management for the MVP.

Deliverables:

- Company-scoped ledger APIs
- Customer ledger creation
- Supplier ledger creation
- Ledger search and filtering
- Ledger update
- Ledger deactivation
- Default Sundry Debtors and Sundry Creditors groups
- Ledger management frontend screen

## 2. Backend Endpoints

All ledger endpoints require:

```text
Authorization: Bearer jwt-token
```

### List Ledgers

```text
GET /api/companies/:companyId/ledgers
```

Optional filters:

```text
?type=customer
?type=supplier
?search=aarav
```

### Create Ledger

```text
POST /api/companies/:companyId/ledgers
```

Request:

```json
{
  "ledgerType": "customer",
  "name": "Aarav Medicals",
  "code": "CUST-001",
  "gstin": "27ABCDE1234F1Z5",
  "phone": "9876543210",
  "email": "accounts@example.com",
  "billingAddress": "Shop 12, Market Road",
  "state": "Maharashtra",
  "openingBalance": 25000,
  "openingBalanceType": "debit",
  "creditLimit": 100000,
  "creditDays": 30
}
```

### Get Ledger

```text
GET /api/companies/:companyId/ledgers/:ledgerId
```

### Update Ledger

```text
PATCH /api/companies/:companyId/ledgers/:ledgerId
```

### Deactivate Ledger

```text
DELETE /api/companies/:companyId/ledgers/:ledgerId
```

This marks the ledger inactive instead of permanently deleting it.

## 3. Access Rules

- Any company member can view ledgers.
- Owners, admins, and accountants can create and update ledgers.
- Viewers cannot mutate ledgers.
- Unknown or inaccessible company IDs return `404`.

## 4. Accounting Rules

- Customer ledgers default to `Sundry Debtors`.
- Supplier ledgers default to `Sundry Creditors`.
- Duplicate ledger names or codes inside the same company return `409`.
- Opening balances are stored with debit or credit type.

## 5. Frontend Screen

Added:

```text
frontend/app/ledgers/page.js
```

The screen includes:

- Customer and supplier summary cards
- Create ledger form
- Search input
- Ledger table
- Contact, GSTIN, balance, and credit-term columns

## 6. Recommended Day 7

Day 7 should focus on item and stock management:

- Unit creation
- Stock item create/list/update
- HSN/SAC and GST rate fields
- Opening stock
- Reorder level
- Stock summary UI

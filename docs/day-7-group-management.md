# SmartERP Day 7 - Group Management

## 1. Day 7 Objective

Day 7 adds accounting group management. Groups classify ledgers for reports such as trial balance, balance sheet, profit and loss, and stock-linked accounting.

Deliverables:

- Company-scoped group APIs
- Default accounting group seeding
- Custom group creation
- Parent group hierarchy
- Group update
- Protected group deletion
- Group management frontend screen

## 2. Backend Endpoints

All group endpoints require:

```text
Authorization: Bearer jwt-token
```

### List Groups

```text
GET /api/companies/:companyId/groups
```

Optional search:

```text
?search=sundry
```

### Create Group

```text
POST /api/companies/:companyId/groups
```

Request:

```json
{
  "name": "Transport Expenses",
  "parentGroupId": "uuid",
  "isSystem": false
}
```

### Seed Default Groups

```text
POST /api/companies/:companyId/groups/seed-defaults
```

Creates missing default groups:

- Sundry Debtors
- Sundry Creditors
- Sales Accounts
- Purchase Accounts
- Duties and Taxes
- Cash-in-Hand
- Bank Accounts
- Indirect Expenses
- Indirect Incomes
- Current Assets
- Current Liabilities

### Get Group

```text
GET /api/companies/:companyId/groups/:groupId
```

### Update Group

```text
PATCH /api/companies/:companyId/groups/:groupId
```

### Delete Group

```text
DELETE /api/companies/:companyId/groups/:groupId
```

Only unused custom groups can be deleted. System groups, groups with ledgers, and parent groups with children are protected.

## 3. Access Rules

- Any company member can view groups.
- Owners, admins, and accountants can create and update groups.
- Viewers cannot mutate groups.
- Unknown or inaccessible company IDs return `404`.

## 4. Frontend Screen

Added:

```text
frontend/app/groups/page.js
```

The screen includes:

- Group summary cards
- Create group form
- Default group chips
- Group search
- Group table with parent, nature, ledger count, and type

## 5. Recommended Day 8

Day 8 should focus on item and stock management:

- Unit creation
- Stock item create/list/update
- HSN/SAC and GST rate fields
- Opening stock
- Reorder level
- Stock summary UI
